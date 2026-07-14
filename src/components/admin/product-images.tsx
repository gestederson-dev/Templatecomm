"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { deleteProductImageAction, setPrimaryImageAction, uploadProductImageAction } from "@/app/admin/produtos/actions";
import { adminCard } from "@/components/admin/ui-styles";
import type { ProductImage } from "@/lib/types";

export function ProductImages({ productId, images }: { productId: string; images: ProductImage[] }) {
  const [, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(file: File) {
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const result = await uploadProductImageAction(productId, formData);
      if (result?.error) setError(result.error);
    } catch {
      setError("Falha ao enviar a imagem. Verifique o tamanho do arquivo e tente de novo.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className={adminCard}>
      <h3 className="mb-4 font-[family-name:var(--font-display)] text-[15px] font-semibold">Imagens</h3>

      <label
        htmlFor="product-image-input"
        className="flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border-[1.5px] border-dashed border-wine/30 bg-wine-tint p-[22px] text-center text-sm text-ink/60 transition-colors hover:border-wine hover:bg-wine/[0.09]"
      >
        <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.5} className="mb-1 h-[26px] w-[26px] stroke-wine">
          <path d="M12 16V4M8 8l4-4 4 4" />
          <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
        </svg>
        <span>
          {uploading ? "Enviando..." : (
            <>
              Arraste imagens ou <b className="text-wine">clique para enviar</b>
            </>
          )}
        </span>
        <span className="text-[11.5px]">PNG, JPG até 5MB · a primeira vira a principal</span>
      </label>
      <input
        id="product-image-input"
        ref={fileInputRef}
        type="file"
        accept="image/*"
        disabled={uploading}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) handleUpload(file);
        }}
        className="hidden"
      />

      {images.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2.5">
          {images.map((image) => (
            <div key={image.id} className="relative h-[70px] w-[70px] overflow-hidden rounded-[10px] bg-muted">
              <Image src={image.url} alt={image.alt ?? ""} fill sizes="70px" className="object-cover" />
              {image.is_primary ? (
                <span className="absolute left-1 top-1 grid h-5 w-5 place-items-center rounded-[6px] bg-amber" title="Principal">
                  <svg viewBox="0 0 24 24" className="h-[11px] w-[11px] fill-ink">
                    <path d="M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" />
                  </svg>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => startTransition(() => setPrimaryImageAction(image.id, productId))}
                  className="absolute left-1 top-1 rounded-[6px] bg-black/45 px-1 text-[9px] font-semibold text-white hover:bg-black/65"
                >
                  Tornar principal
                </button>
              )}
              <button
                type="button"
                onClick={() => startTransition(() => deleteProductImageAction(image.id, productId))}
                aria-label="Remover imagem"
                className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-[6px] bg-black/55 text-xs text-white hover:bg-black/75"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
