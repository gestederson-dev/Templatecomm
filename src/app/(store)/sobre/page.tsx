import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/catalog";

export const metadata: Metadata = { title: "Sobre" };

export default async function SobrePage() {
  const settings = await getSiteSettings();
  const texto = settings?.policies?.sobre;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Sobre {settings?.site_name ?? "a loja"}</h1>
      {texto ? <p className="whitespace-pre-line text-sm text-muted-foreground">{texto}</p> : <p className="text-sm text-muted-foreground">Em breve.</p>}
    </div>
  );
}
