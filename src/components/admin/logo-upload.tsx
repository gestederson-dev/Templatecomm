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

    const formData = new FormData();
    formData.set("file", file);
    const result = await uploadLogoAction(formData);

    setUploading(false);
    if ("error" in result) setError(result.error);
    else setUrl(result.url);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="flex items-center gap-4">
      {url ? (
        <div className="relative h-16 w-16 overflow-hidden rounded-md border bg-muted">
          <Image src={url} alt="Logo" fill sizes="64px" className="object-contain" />
        </div>
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded-md border text-xs text-muted-foreground">Sem logo</div>
      )}
      <div className="flex flex-col gap-1">
        <input ref={inputRef} type="file" accept="image/*" onChange={(event) => handleChange(event.target.files?.[0] ?? null)} className="text-sm" />
        {uploading ? <span className="text-xs text-muted-foreground">Enviando...</span> : null}
        {error ? <span className="text-xs text-destructive">{error}</span> : null}
      </div>
    </div>
  );
}
