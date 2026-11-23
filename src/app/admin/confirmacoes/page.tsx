import Link from "next/link";
import { ConfirmationRow } from "@/components/admin/confirmation-card";
import { adminBtnAmber, adminCard } from "@/components/admin/ui-styles";
import { artFiles, listConfirmations, type ArtFile, type ConfirmationWithLinks } from "@/lib/confirmations";

const FILTROS = [
  { id: "todas", label: "Todas", test: (c: ConfirmationWithLinks) => c.status !== "cancelado" },
  { id: "aguardando", label: "Aguardando", test: (c: ConfirmationWithLinks) => c.status === "pendente" },
  { id: "respondidas", label: "Respondidas", test: (c: ConfirmationWithLinks) => c.status === "respondido" },
  { id: "sem-pedido", label: "Sem pedido", test: (c: ConfirmationWithLinks) => c.status === "respondido" && !c.order_id },
  { id: "falta-arte", label: "Falta arte", test: (c: ConfirmationWithLinks) => c.status === "respondido" && c.logo_paths.length === 0 },
  { id: "canceladas", label: "Canceladas", test: (c: ConfirmationWithLinks) => c.status === "cancelado" },
] as const;

export default async function AdminConfirmacoesPage({ searchParams }: { searchParams: Promise<{ criada?: string; editada?: string; filtro?: string }> }) {
  const { criada, editada, filtro = "todas" } = await searchParams;
  const confirmations = await listConfirmations();
  const destaque = criada ?? editada;
  const ativo = FILTROS.find((f) => f.id === filtro) ?? FILTROS[0];
  const visiveis = confirmations.filter(ativo.test);

  // links das artes só para as respondidas que estão na tela (assinados por 1 h)
  const arts = new Map<string, ArtFile[]>(
    await Promise.all(visiveis.filter((c) => c.logo_paths.length > 0).map(async (c) => [c.id, await artFiles(c.logo_paths)] as const)),
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-[26px] font-bold tracking-[-0.02em]">Confirmações de pedido</h1>
          <p className="mt-0.5 text-[13px] text-ink/52">Toda venda passa por aqui: link para o cliente, ficha com pagamento, nota fiscal e artes.</p>
        </div>
        <Link href="/admin/confirmacoes/nova" className={`${adminBtnAmber} w-full sm:w-auto`}>
          + Nova confirmação
        </Link>
      </div>

      {destaque ? (
        <p className="rounded-xl border border-wine/25 bg-wine-tint/50 px-4 py-3 text-sm text-wine">
          {criada ? "Confirmação criada. Copie o link ou envie direto no WhatsApp." : "Alterações salvas. O link continua o mesmo."}
        </p>
      ) : null}

      <nav className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" aria-label="Filtrar confirmações">
        {FILTROS.map((f) => {
          const total = confirmations.filter(f.test).length;
          const on = f.id === ativo.id;
          return (
            <Link
              key={f.id}
              href={f.id === "todas" ? "/admin/confirmacoes" : `/admin/confirmacoes?filtro=${f.id}`}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-semibold transition-colors ${
                on ? "border-wine bg-wine text-white" : "border-line bg-white text-ink/65 hover:border-wine hover:text-wine"
              }`}
            >
              {f.label}
              <span className={`rounded-full px-1.5 text-[11px] ${on ? "bg-white/20" : "bg-ink/6"}`}>{total}</span>
            </Link>
          );
        })}
      </nav>

      {visiveis.length === 0 ? <p className={`${adminCard} text-sm text-ink/52`}>Nada por aqui.</p> : null}

      <div className="flex flex-col gap-2">
        {visiveis.map((c) => (
          <ConfirmationRow key={c.id} c={c} arts={arts.get(c.id) ?? []} open={c.id === destaque} />
        ))}
      </div>
    </div>
  );
}
