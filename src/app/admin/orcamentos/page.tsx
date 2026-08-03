import Link from "next/link";
import { StatusPill, type PillTone } from "@/components/admin/status-pill";
import { adminPanel } from "@/components/admin/ui-styles";
import { getAdminQuotes } from "@/lib/admin/quotes";
import { formatBRL } from "@/lib/format";
import type { QuoteStatus } from "@/lib/types";

const STATUS_LABEL: Record<QuoteStatus, string> = {
  requested: "Solicitado",
  quoted: "Cotado",
  approved: "Aprovado",
  rejected: "Rejeitado",
  expired: "Expirado",
  converted: "Convertido",
};

const STATUS_TONE: Record<QuoteStatus, PillTone> = {
  requested: "warn",
  quoted: "info",
  approved: "ok",
  rejected: "critical",
  expired: "critical",
  converted: "wine",
};

const TABS: { key: string; label: string; filter: (status: QuoteStatus) => boolean }[] = [
  { key: "pendentes", label: "Pendentes", filter: (s) => s === "requested" },
  { key: "cotados", label: "Cotados", filter: (s) => s === "quoted" },
  { key: "aprovados", label: "Aprovados", filter: (s) => s === "approved" || s === "converted" },
  { key: "todos", label: "Todos", filter: () => true },
];

export default async function AdminOrcamentosPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab = "pendentes" } = await searchParams;
  const quotes = await getAdminQuotes();

  const activeTab = TABS.find((t) => t.key === tab) ?? TABS[0];
  const filtered = quotes.filter((q) => activeTab.filter(q.status));
  const pendingCount = quotes.filter((q) => q.status === "requested").length;
  const inProgressCount = quotes.filter((q) => q.status === "quoted" || q.status === "approved").length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-[26px] font-bold tracking-[-0.02em]">Orçamentos</h1>
          <p className="mt-0.5 text-[13px] text-ink/52">
            {pendingCount} aguardando resposta · {inProgressCount} em andamento
          </p>
        </div>
        <Link href="/admin/orcamentos/novo" className="inline-flex items-center gap-2 rounded-[10px] bg-wine px-[18px] py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-px">
          + Novo orçamento
        </Link>
      </div>

      <div className="flex w-fit gap-1 rounded-[10px] border border-line bg-white p-1">
        {TABS.map((t) => {
          const count = quotes.filter((q) => t.filter(q.status)).length;
          const isOn = t.key === activeTab.key;
          return (
            <Link
              key={t.key}
              href={`/admin/orcamentos?tab=${t.key}`}
              className={`flex items-center gap-1.5 rounded-[7px] px-4 py-2 text-[13px] font-semibold transition-colors ${isOn ? "bg-wine text-white" : "text-ink/52 hover:text-ink"}`}
            >
              {t.label}
              {t.key !== "todos" ? (
                <span className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold ${isOn ? "bg-white/90 text-ink" : "bg-amber text-ink"}`}>{count}</span>
              ) : null}
            </Link>
          );
        })}
      </div>

      <div className={adminPanel}>
        <table className="w-full border-collapse text-[13.5px]">
          <thead>
            <tr className="bg-ink/[0.015] text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-ink/52">
              <th className="px-4 py-3.5">Orçamento</th>
              <th className="px-4 py-3.5">Cliente</th>
              <th className="px-4 py-3.5">Itens</th>
              <th className="px-4 py-3.5">Valor cotado</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5">Recebido</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-ink/52">
                  Nenhum orçamento nesta aba.
                </td>
              </tr>
            ) : null}
            {filtered.map((quote) => (
              <tr key={quote.id} className="cursor-pointer border-t border-line transition-colors hover:bg-wine-tint">
                <td className="px-4 py-3.5">
                  <Link href={`/admin/orcamentos/${quote.id}`} className="font-[family-name:var(--font-display)] font-semibold text-wine">
                    {quote.quote_number}
                  </Link>
                </td>
                <td className="px-4 py-3.5">
                  <Link href={`/admin/orcamentos/${quote.id}`} className="block">
                    <span className="font-semibold">{quote.profile?.company_name || quote.profile?.full_name || quote.customer_name || "—"}</span>
                    <small className="block text-xs font-normal text-ink/52">
                      {quote.profile?.person_type === "pj" ? `CNPJ ${quote.profile.cnpj ?? "—"}` : "Pessoa física"}
                    </small>
                  </Link>
                </td>
                <td className="px-4 py-3.5 text-ink/70">
                  <Link href={`/admin/orcamentos/${quote.id}`} className="block">
                    {quote.itemCount} {quote.itemCount === 1 ? "item" : "itens"} · {quote.totalUnits} un
                  </Link>
                </td>
                <td className="px-4 py-3.5">
                  <Link href={`/admin/orcamentos/${quote.id}`} className={quote.quoted_total != null ? "font-[family-name:var(--font-display)] font-semibold" : "text-ink/52"}>
                    {quote.quoted_total != null ? formatBRL(quote.quoted_total) : "A cotar"}
                  </Link>
                </td>
                <td className="px-4 py-3.5">
                  <StatusPill tone={STATUS_TONE[quote.status]}>{STATUS_LABEL[quote.status]}</StatusPill>
                </td>
                <td className="px-4 py-3.5 text-ink/52">
                  <Link href={`/admin/orcamentos/${quote.id}`} className="block">
                    {new Date(quote.created_at).toLocaleDateString("pt-BR")}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
