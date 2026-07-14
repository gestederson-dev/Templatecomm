import Link from "next/link";
import { StatusPill } from "@/components/store/status-pill";
import { getMyQuotes } from "@/lib/quotes";
import { formatBRL } from "@/lib/format";

const STATUS_LABEL: Record<string, string> = {
  requested: "Aguardando cotação",
  quoted: "Cotado — aguardando sua resposta",
  approved: "Aprovado",
  rejected: "Rejeitado",
  expired: "Expirado",
  converted: "Convertido em pedido",
};

const STATUS_TONE: Record<string, "warn" | "ok" | "info" | "wine" | "critical"> = {
  requested: "warn",
  quoted: "info",
  approved: "ok",
  rejected: "critical",
  expired: "critical",
  converted: "wine",
};

export default async function MeusOrcamentosPage() {
  const quotes = await getMyQuotes();

  if (quotes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-ink/15 bg-white p-8 text-center text-sm text-ink/60">
        Você ainda não tem orçamentos. Peça um a partir da página de um produto personalizável.
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-ink/8 overflow-hidden rounded-2xl border border-ink/8 bg-white shadow-[var(--shadow-brand)]">
      {quotes.map((quote) => (
        <Link
          key={quote.id}
          href={`/conta/orcamentos/${quote.quote_number}`}
          className="flex items-center justify-between gap-3 p-4 text-sm transition-colors hover:bg-wine-tint"
        >
          <div>
            <p className="font-[family-name:var(--font-display)] font-semibold text-wine">{quote.quote_number}</p>
            <p className="text-ink/52">{new Date(quote.created_at).toLocaleDateString("pt-BR")}</p>
          </div>
          <div className="flex items-center gap-3">
            {quote.quoted_total != null ? (
              <span className="font-[family-name:var(--font-display)] font-semibold tabular-nums text-ink">{formatBRL(quote.quoted_total)}</span>
            ) : null}
            <StatusPill tone={STATUS_TONE[quote.status] ?? "wine"}>{STATUS_LABEL[quote.status] ?? quote.status}</StatusPill>
          </div>
        </Link>
      ))}
    </div>
  );
}
