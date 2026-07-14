import type { Metadata } from "next";
import { storeCard, storeSectionTitle } from "@/components/store/ui-styles";
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
      <h1 className="mb-6 font-[family-name:var(--font-display)] text-[26px] font-bold tracking-[-0.02em]">Políticas</h1>
      {secoes.length === 0 ? (
        <div className={storeCard}>
          <p className="text-sm text-ink/52">Em breve.</p>
        </div>
      ) : null}
      <div className="flex flex-col gap-5">
        {secoes.map((secao) => (
          <section key={secao.titulo} className={storeCard}>
            <h2 className={`${storeSectionTitle} mb-2`}>{secao.titulo}</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-ink/70">{secao.texto}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
