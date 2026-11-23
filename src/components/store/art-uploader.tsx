"use client";

import { useRef, useState } from "react";
import { addArtsAction, prepareArtUploadsAction } from "@/app/(store)/confirmar/[token]/actions";
import { btnWine } from "@/components/store/button-styles";
import { createClient } from "@/lib/supabase/client";
import { LOGO_BUCKET, LOGO_EXTENSIONS, LOGO_MAX_BYTES, validateLogo } from "@/lib/validators/confirmacao";

type Entry = { key: string; name: string; size: number; status: "enviando" | "ok" | "erro"; path?: string; error?: string };

const kb = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

/**
 * Escolher uma ou várias artes. Cada arquivo sobe na hora, direto do navegador para o
 * Storage (link assinado), e o formulário só leva os caminhos. Assim arquivo grande de
 * gráfica não esbarra no limite de 4,5 MB da Vercel.
 */
export function ArtUploader({ token, max, onChange }: { token: string; max: number; onChange: (state: { paths: string[]; busy: boolean }) => void }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function publish(next: Entry[]) {
    setEntries(next);
    onChange({ paths: next.filter((e) => e.status === "ok").map((e) => e.path!), busy: next.some((e) => e.status === "enviando") });
  }

  async function onFiles(list: FileList | null) {
    setError(null);
    const files = Array.from(list ?? []);
    if (files.length === 0) return;
    const active = entries.filter((e) => e.status !== "erro");
    if (active.length + files.length > max) {
      setError(`Você pode enviar até ${max} arte${max > 1 ? "s" : ""}.`);
      return;
    }
    const invalid = files.map((file) => [file.name, validateLogo(file.name, file.size)] as const).find(([, problem]) => problem);
    if (invalid) {
      setError(`${invalid[0]}: ${invalid[1]}`);
      return;
    }

    const stamp = Date.now();
    const fresh: Entry[] = files.map((file, i) => ({ key: `${stamp}-${i}`, name: file.name, size: file.size, status: "enviando" }));
    let current = [...active, ...fresh];
    publish(current);

    const prepared = await prepareArtUploadsAction(
      token,
      files.map((file) => ({ name: file.name, size: file.size })),
    );
    if ("error" in prepared) {
      current = current.map((e) => (fresh.some((f) => f.key === e.key) ? { ...e, status: "erro", error: prepared.error } : e));
      publish(current);
      return;
    }

    const storage = createClient().storage.from(LOGO_BUCKET);
    await Promise.all(
      files.map(async (file, i) => {
        const { path, token: uploadToken } = prepared.uploads[i];
        const { error: uploadError } = await storage.uploadToSignedUrl(path, uploadToken, file, { contentType: file.type || undefined });
        current = current.map((e) =>
          e.key === fresh[i].key ? (uploadError ? { ...e, status: "erro", error: "Falhou. Tente de novo." } : { ...e, status: "ok", path }) : e,
        );
        publish(current);
      }),
    );
  }

  const remaining = max - entries.filter((e) => e.status !== "erro").length;

  return (
    <div className="flex flex-col gap-3">
      {entries.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {entries.map((entry) => (
            <li key={entry.key} className="flex items-center gap-3 rounded-xl border border-ink/10 bg-white px-3.5 py-2.5">
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[10px] font-bold uppercase ${
                  entry.status === "ok" ? "bg-ok-bg text-ok" : entry.status === "erro" ? "bg-destructive/10 text-destructive" : "bg-wine-tint text-wine"
                }`}
              >
                {entry.status === "enviando" ? (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-wine border-t-transparent" />
                ) : (
                  entry.name.split(".").pop()
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-ink">{entry.name}</span>
                <span className={`block text-xs ${entry.status === "erro" ? "text-destructive" : "text-ink/50"}`}>
                  {entry.status === "enviando" ? "Enviando…" : entry.status === "erro" ? entry.error : `${kb(entry.size)} · enviada`}
                </span>
              </span>
              {entry.status !== "enviando" ? (
                <button
                  type="button"
                  onClick={() => publish(entries.filter((e) => e.key !== entry.key))}
                  aria-label={`Tirar ${entry.name}`}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-ink/40 hover:bg-destructive/10 hover:text-destructive"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden>
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {remaining > 0 ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center gap-1 rounded-xl border-2 border-dashed border-ink/15 bg-paper/60 px-4 py-6 text-center transition-colors hover:border-wine/50 active:bg-wine-tint/40"
        >
          <span className="text-sm font-semibold text-wine">{entries.length ? "+ Adicionar outra arte" : "Escolher arquivo da arte"}</span>
          <span className="text-[12.5px] text-ink/55">
            Pode escolher vários de uma vez · até {max} · {Math.round(LOGO_MAX_BYTES / 1024 / 1024)} MB cada
          </span>
        </button>
      ) : null}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={LOGO_EXTENSIONS.map((ext) => `.${ext}`).join(",")}
        onChange={(event) => {
          void onFiles(event.target.files);
          event.target.value = "";
        }}
        className="sr-only"
        tabIndex={-1}
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

/** Depois de confirmado: mandar mais uma arte pela mesma página. */
export function AddArtsPanel({ token, max }: { token: string; max: number }) {
  const [state, setState] = useState<{ paths: string[]; busy: boolean }>({ paths: [], busy: false });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [round, setRound] = useState(0);

  if (max <= 0) return <p className="text-sm text-ink/60">Você já enviou o máximo de artes. Se precisar trocar alguma, fale com a gente.</p>;

  return (
    <div className="flex flex-col gap-3">
      <ArtUploader key={round} token={token} max={max} onChange={setState} />
      {state.paths.length > 0 ? (
        <button
          type="button"
          disabled={saving || state.busy}
          onClick={async () => {
            setSaving(true);
            const result = await addArtsAction(token, state.paths);
            setSaving(false);
            if ("error" in result) setMessage({ ok: false, text: result.error });
            else {
              setMessage({ ok: true, text: "Recebemos as novas artes. Obrigado!" });
              setRound((n) => n + 1);
              setState({ paths: [], busy: false });
            }
          }}
          className={`${btnWine} w-full disabled:opacity-50 sm:w-auto sm:self-end`}
        >
          {saving ? "Enviando…" : `Enviar ${state.paths.length > 1 ? `${state.paths.length} artes` : "arte"}`}
        </button>
      ) : null}
      {message ? <p className={`text-sm font-medium ${message.ok ? "text-ok" : "text-destructive"}`}>{message.text}</p> : null}
    </div>
  );
}
