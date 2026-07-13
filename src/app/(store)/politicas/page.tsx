import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/catalog";

export const metadata: Metadata = { title: "Políticas" };

export default async function PoliticasPage() {
  const settings = await getSiteSettings();
  const policies = settings?.policies ?? {};

  const secoes = [
    { titulo: "Trocas e devoluções", texto: policies.trocas },
    { titulo: "Privacidade", texto: policies.privacidade },
    { titulo: "Termos de uso", texto: policies.termos },
  ].filter((s) => s.texto);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Políticas</h1>
      {secoes.length === 0 ? <p className="text-sm text-muted-foreground">Em breve.</p> : null}
      <div className="flex flex-col gap-8">
        {secoes.map((secao) => (
          <section key={secao.titulo}>
            <h2 className="mb-2 text-lg font-semibold">{secao.titulo}</h2>
            <p className="whitespace-pre-line text-sm text-muted-foreground">{secao.texto}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
