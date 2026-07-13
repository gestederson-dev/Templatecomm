"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createBannerAction, deleteBannerAction, toggleBannerActiveAction } from "@/app/admin/banners/actions";
import type { Banner } from "@/lib/types";

export function BannerManager({ banners }: { banners: Banner[] }) {
  const [toggling, startToggle] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setUploading(true);
    setError(null);
    const result = await createBannerAction(formData);
    setUploading(false);
    if (result?.error) setError(result.error);
    else formRef.current?.reset();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        {banners.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum banner cadastrado.</p> : null}
        {banners.map((banner) => (
          <div key={banner.id} className="flex items-center gap-4 rounded-lg border p-3">
            <div className="relative h-16 w-28 overflow-hidden rounded-md bg-muted">
              <Image src={banner.image_url} alt={banner.title ?? ""} fill sizes="112px" className="object-cover" />
            </div>
            <div className="flex-1 text-sm">
              <p className="font-medium">{banner.title || "(sem título)"}</p>
              {banner.link ? <p className="text-muted-foreground">{banner.link}</p> : null}
            </div>
            <Badge variant={banner.is_active ? "default" : "secondary"}>{banner.is_active ? "Ativo" : "Inativo"}</Badge>
            <Button type="button" size="sm" variant="ghost" disabled={toggling} onClick={() => startToggle(() => toggleBannerActiveAction(banner.id, !banner.is_active))}>
              {banner.is_active ? "Desativar" : "Ativar"}
            </Button>
            <form action={deleteBannerAction}>
              <input type="hidden" name="id" value={banner.id} />
              <Button type="submit" size="sm" variant="ghost" className="text-destructive">
                Excluir
              </Button>
            </form>
          </div>
        ))}
      </div>

      <form ref={formRef} action={handleSubmit} className="flex flex-wrap items-end gap-3 rounded-lg border p-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Imagem</label>
          <input type="file" name="file" accept="image/*" required className="text-sm" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Título (opcional)</label>
          <Input name="title" className="w-48" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Link (opcional)</label>
          <Input name="link" className="w-48" placeholder="/produtos" />
        </div>
        <Button type="submit" disabled={uploading}>
          {uploading ? "Enviando..." : "+ Novo banner"}
        </Button>
        {error ? <p className="w-full text-sm text-destructive">{error}</p> : null}
      </form>
    </div>
  );
}
