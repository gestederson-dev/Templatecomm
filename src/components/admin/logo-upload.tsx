"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { uploadLogoAction } from "@/app/admin/configuracoes/actions";

export function LogoUpload({ currentUrl }: { currentUrl: string | null }) {
  const [url, setUrl] = useState(currentUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleChange(file: File | null) {
    if (!file) return;
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.set("file", file);
      const result = await uploadLogoAction(formData);
      if ("error" in result) setError(result.error);
      else setUrl(result.url);
    } catch {
      setError("Falha ao enviar a imagem. Verifique o tamanho do arquivo e tente de novo.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-4">
      {url ? (
        <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-line bg-paper">
          <Image src={url} alt="Logo" fill sizes="64px" className="object-contain" />
        </div>
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-line text-xs text-ink/45">Sem logo</div>
      )}
      <div className="flex flex-col gap-1">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(event) => handleChange(event.target.files?.[0] ?? null)}
          className="text-sm text-ink/70 file:mr-3 file:rounded-full file:border-0 file:bg-wine-tint file:px-3.5 file:py-1.5 file:text-[13px] file:font-semibold file:text-wine"
        />
        {uploading ? <span className="text-xs text-ink/50">Enviando...</span> : null}
        {error ? <span className="text-xs text-destructive">{error}</span> : null}
      </div>
    </div>
  );
}
