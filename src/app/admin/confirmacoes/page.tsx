import Link from "next/link";
import { Cabecalho, FichaCliente, Secao, type Logo } from "@/components/admin/confirmation-card";
import { ConfirmationLinkActions } from "@/components/admin/confirmation-row-actions";
import { adminBtnAmber, adminCard } from "@/components/admin/ui-styles";
import { confirmationUrl, listConfirmations, logoDownloadUrl, logoPreviewUrl } from "@/lib/confirmations";

export default async function AdminConfirmacoesPage({ searchParams }: { searchParams: Promise<{ criada?: string; editada?: string }> }) {
  const { criada, editada } = await searchParams;
  const confirmations = await listConfirmations();
  const destaque = criada ?? editada;

  const pendentes = confirmations.filter((c) => c.status === "pendente");
  const respondidas = confirmations.filter((c) => c.status === "respondido");
  const canceladas = confirmations.filter((c) => c.status === "cancelado");

  const logos = new Map<string, Logo>(
    await Promise.all(
      respondidas
        .filter((c) => c.logo_path)
        .map(async (c) => [c.id, { download: await logoDownloadUrl(c.logo_path!), preview: await logoPreviewUrl(c.logo_path!) }] as const),
    ),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-[26px] font-bold tracking-[-0.02em]">Confirmações de pedido</h1>
          <p className="mt-0.5 text-[13px] text-ink/52">Links enviados aos clientes que fecharam, com a ficha de cada um depois que responde.</p>
        </div>
        <Link href="/admin/confirmacoes/nova" className={adminBtnAmber}>
          + Nova confirmação
        </Link>
      </div>

      {destaque ? (
        <p className="rounded-xl border border-wine/25 bg-wine-tint/50 px-4 py-3 text-sm text-wine">
          {criada ? "Confirmação criada. Agora é só copiar o link ou enviar direto no WhatsApp." : "Alterações salvas. O link continua o mesmo."}
        </p>
      ) : null}

      {confirmations.length === 0 ? <p className={`${adminCard} text-sm text-ink/52`}>Nenhuma confirmação criada ainda.</p> : null}

      <Secao titulo="Aguardando o cliente" total={pendentes.length}>
        {pendentes.map((c) => (
          <article key={c.id} className={`${adminCard} flex flex-col gap-3.5 ${c.id === destaque ? "ring-2 ring-wine/40" : ""}`}>
            <Cabecalho c={c} />
            <ConfirmationLinkActions id={c.id} url={confirmationUrl(c.token)} customer={c.customer_label} highlight={c.id === destaque} />
          </article>
        ))}
      </Secao>

      <Secao titulo="Respondidas" total={respondidas.length}>
        {respondidas.map((c) => (
          <article key={c.id} className={`${adminCard} flex flex-col gap-4`}>
            <Cabecalho c={c} />
            <FichaCliente c={c} logo={logos.get(c.id) ?? { download: null, preview: null }} />
          </article>
        ))}
      </Secao>

      {canceladas.length > 0 ? (
        <details className="group">
          <summary className="cursor-pointer text-sm font-semibold text-ink/55 hover:text-wine">Canceladas ({canceladas.length})</summary>
          <div className="mt-3 flex flex-col gap-3">
            {canceladas.map((c) => (
              <article key={c.id} className={`${adminCard} opacity-70`}>
                <Cabecalho c={c} />
              </article>
            ))}
          </div>
        </details>
      ) : null}
    </div>
  );
}
