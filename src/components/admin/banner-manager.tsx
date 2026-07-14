"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ToggleActiveButton } from "@/components/admin/toggle-active-button";
import { adminBtnWine, adminCard, adminInput, adminLabel, adminPanel } from "@/components/admin/ui-styles";
import { createBannerAction, deleteBannerAction, toggleBannerActiveAction } from "@/app/admin/banners/actions";
import type { Banner } from "@/lib/types";

export function BannerManager({ banners }: { banners: Banner[] }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setUploading(true);
    setError(null);
    try {
      const result = await createBannerAction(formData);
      if (result?.error) setError(result.error);
      else formRef.current?.reset();
    } catch {
      setError("Falha ao enviar a imagem. Verifique o tamanho do arquivo e tente de novo.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className={adminPanel}>
        {banners.length === 0 ? <p className="p-4 text-sm text-ink/52">Nenhum banner cadastrado.</p> : null}
        {banners.map((banner, index) => (
          <div key={banner.id} className={`flex items-center gap-4 px-4 py-3.5 ${index > 0 ? "border-t border-line" : ""}`}>
            <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-xl bg-paper">
              <Image src={banner.image_url} alt={banner.title ?? ""} fill sizes="112px" className="object-cover" />
            </div>
            <div className="flex-1 text-sm">
              <p className="font-semibold text-ink">{banner.title || "(sem título)"}</p>
              {banner.link ? <p className="text-ink/52">{banner.link}</p> : null}
            </div>
            <ToggleActiveButton id={banner.id} isActive={banner.is_active} action={toggleBannerActiveAction} label={banner.is_active ? "Desativar" : "Ativar"} />
            <form action={deleteBannerAction}>
              <input type="hidden" name="id" value={banner.id} />
              <button type="submit" className="text-sm font-semibold text-destructive hover:underline">
                Excluir
              </button>
            </form>
          </div>
        ))}
      </div>

      <form ref={formRef} action={handleSubmit} className={`${adminCard} flex flex-wrap items-end gap-3`}>
        <div style={{ width: 200 }}>
          <label className={adminLabel}>Imagem</label>
          <input type="file" name="file" accept="image/*" required className="text-sm text-ink/70 file:mr-3 file:rounded-full file:border-0 file:bg-wine-tint file:px-3.5 file:py-1.5 file:text-[13px] file:font-semibold file:text-wine" />
        </div>
        <div style={{ width: 200 }}>
          <label className={adminLabel}>Título (opcional)</label>
          <input name="title" className={adminInput} />
        </div>
        <div style={{ width: 200 }}>
          <label className={adminLabel}>Link (opcional)</label>
          <input name="link" className={adminInput} placeholder="/produtos" />
        </div>
        <button type="submit" disabled={uploading} className={`${adminBtnWine} disabled:pointer-events-none disabled:opacity-50`}>
          {uploading ? "Enviando..." : "+ Novo banner"}
        </button>
        {error ? <p className="w-full text-sm text-destructive">{error}</p> : null}
      </form>
    </div>
  );
}
