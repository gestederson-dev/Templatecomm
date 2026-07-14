import type { Metadata } from "next";
import { storeCard } from "@/components/store/ui-styles";
import { getSiteSettings } from "@/lib/catalog";

export const metadata: Metadata = { title: "Sobre" };

export default async function SobrePage() {
  const settings = await getSiteSettings();
  const texto = settings?.policies?.sobre;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 font-[family-name:var(--font-display)] text-[26px] font-bold tracking-[-0.02em]">Sobre {settings?.site_name ?? "a loja"}</h1>
      <div className={storeCard}>
        {texto ? <p className="whitespace-pre-line text-sm leading-relaxed text-ink/70">{texto}</p> : <p className="text-sm text-ink/52">Em breve.</p>}
      </div>
    </div>
  );
}
