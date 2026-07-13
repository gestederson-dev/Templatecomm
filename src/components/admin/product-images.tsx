"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { deleteProductImageAction, setPrimaryImageAction, uploadProductImageAction } from "@/app/admin/produtos/actions";
import type { ProductImage } from "@/lib/types";

export function ProductImages({ productId, images }: { productId: string; images: ProductImage[] }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(file: File) {
    setError(null);
    const formData = new FormData();
    formData.set("file", file);
    const result = await uploadProductImageAction(productId, formData);
    if (result?.error) setError(result.error);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4">
      <h2 className="text-sm font-semibold">Imagens</h2>

      <div className="flex flex-wrap gap-3">
        {images.map((image) => (
          <div key={image.id} className="flex flex-col gap-1">
            <div className="relative h-24 w-24 overflow-hidden rounded-md border bg-muted">
              <Image src={image.url} alt={image.alt ?? ""} fill sizes="96px" className="object-cover" />
            </div>
            <div className="flex gap-1 text-xs">
              {image.is_primary ? (
                <span className="text-primary">Principal</span>
              ) : (
                <button type="button" className="text-muted-foreground hover:underline" onClick={() => startTransition(() => setPrimaryImageAction(image.id, productId))}>
                  Tornar principal
                </button>
              )}
              <button
                type="button"
                className="text-destructive hover:underline"
                onClick={() => startTransition(() => deleteProductImageAction(image.id, productId))}
              >
                Remover
              </button>
            </div>
          </div>
        ))}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) handleUpload(file);
        }}
        className="text-sm"
      />
      {pending ? <span className="text-xs text-muted-foreground">Atualizando...</span> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
