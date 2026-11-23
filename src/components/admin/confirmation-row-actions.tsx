"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { cancelConfirmationAction, createOrderFromConfirmationAction } from "@/app/admin/confirmacoes/actions";
import { adminBtnSoft, adminBtnWine } from "@/components/admin/ui-styles";
import { whatsappLink } from "@/lib/format";

const smallBtn = "px-3.5 py-2 text-[13px]";

function Icon({ d, className = "h-4 w-4" }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d={d} />
    </svg>
  );
}

const ICON = {
  copy: "M9 9h10v10H9zM5 15V5h10",
  check: "M5 12l5 5L20 7",
  open: "M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5",
  chat: "M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.9A8 8 0 1 1 21 12z",
};

function useCopy() {
  const [copied, setCopied] = useState(false);
  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // navegador sem permissão de área de transferência: cai no método antigo
      const area = document.createElement("textarea");
      area.value = text;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }
  return { copied, copy };
}

/** Botãozinho de copiar ao lado de um dado (CNPJ, endereço...). */
export function CopyValue({ value, label = "Copiar" }: { value: string; label?: string }) {
  const { copied, copy } = useCopy();
  return (
    <button
      type="button"
      onClick={() => copy(value)}
      title={label}
      aria-label={label}
      className={`grid h-7 w-7 shrink-0 place-items-center rounded-md transition-colors ${copied ? "text-ok" : "text-ink/35 hover:bg-wine-tint hover:text-wine"}`}
    >
      <Icon d={copied ? ICON.check : ICON.copy} className="h-3.5 w-3.5" />
    </button>
  );
}

/** Link do cliente com copiar, abrir e mandar no WhatsApp em um clique. */
export function ConfirmationLinkActions({ id, url, customer, highlight = false }: { id: string; url: string; customer: string; highlight?: boolean }) {
  const { copied, copy } = useCopy();
  const [canceling, startCancel] = useTransition();
  const message = `Olá, ${customer}! Segue o link para conferir e confirmar o seu pedido com a Salmar Personalizados: ${url}`;

  return (
    <div className={`flex flex-col gap-3 rounded-xl border p-3.5 ${highlight ? "border-wine/30 bg-wine-tint/40" : "border-line bg-paper"}`}>
      <button
        type="button"
        onClick={() => copy(url)}
        title="Clique para copiar"
        className="truncate rounded-lg border border-line bg-white px-3 py-2 text-left font-mono [contain:inline-size] text-[12.5px] text-ink/70 transition-colors hover:border-wine"
      >
        {url}
      </button>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => copy(url)} className={`${copied ? adminBtnWine.replace("bg-wine", "bg-ok") : adminBtnWine} ${smallBtn}`}>
          <Icon d={copied ? ICON.check : ICON.copy} />
          {copied ? "Link copiado!" : "Copiar link"}
        </button>
        <a href={url} target="_blank" rel="noopener" className={`${adminBtnSoft} ${smallBtn}`}>
          <Icon d={ICON.open} />
          Abrir
        </a>
        <a href={whatsappLink(null, message)} target="_blank" rel="noopener" className={`${adminBtnSoft} ${smallBtn}`}>
          <Icon d={ICON.chat} />
          Enviar no WhatsApp
        </a>
        <span className="hidden flex-1 sm:block" />
        <Link href={`/admin/confirmacoes/${id}/editar`} className={`${adminBtnSoft} ${smallBtn}`}>
          Editar
        </Link>
        <button
          type="button"
          disabled={canceling}
          onClick={() => {
            if (!window.confirm("Cancelar esta confirmação? O link deixa de funcionar para o cliente.")) return;
            startCancel(() => cancelConfirmationAction(id));
          }}
          className={`${adminBtnSoft} ${smallBtn} hover:border-destructive hover:text-destructive`}
        >
          {canceling ? "Cancelando…" : "Cancelar"}
        </button>
      </div>
    </div>
  );
}

/** Copiar o link direto da linha fechada da lista, sem abrir a confirmação. */
export function CopyLinkIcon({ url }: { url: string }) {
  const { copied, copy } = useCopy();
  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault(); // não abre/fecha a linha
        copy(url);
      }}
      title="Copiar link"
      aria-label="Copiar link"
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border transition-colors ${
        copied ? "border-ok bg-ok-bg text-ok" : "border-line bg-white text-wine hover:border-wine"
      }`}
    >
      <Icon d={copied ? ICON.check : ICON.copy} />
    </button>
  );
}

export function RegisterOrderButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const result = await createOrderFromConfirmationAction(id);
            if (result?.error) setError(result.error);
          })
        }
        className={`${adminBtnWine} ${smallBtn}`}
      >
        {pending ? "Registrando…" : "Registrar pedido"}
      </button>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
