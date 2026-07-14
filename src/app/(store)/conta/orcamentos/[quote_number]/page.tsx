import { notFound } from "next/navigation";
import { QuoteActions } from "@/components/account/quote-actions";
import { StatusPill } from "@/components/store/status-pill";
import { storeCard } from "@/components/store/ui-styles";
import { getQuoteByNumber } from "@/lib/quotes";
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

export default async function QuoteDetailPage({ params }: { params: Promise<{ quote_number: string }> }) {
  const { quote_number: quoteNumber } = await params;
  const quote = await getQuoteByNumber(quoteNumber);

  if (!quote) notFound();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-[-0.01em]">{quote.quote_number}</h2>
        <StatusPill tone={STATUS_TONE[quote.status] ?? "wine"}>{STATUS_LABEL[quote.status] ?? quote.status}</StatusPill>
      </div>

      {quote.customer_message ? (
        <div className={`${storeCard} text-sm`}>
          <p className="mb-1 font-semibold text-ink">Sua mensagem</p>
          <p className="text-ink/62">{quote.customer_message}</p>
        </div>
      ) : null}

      <div className="flex flex-col divide-y divide-ink/8 overflow-hidden rounded-2xl border border-ink/8 bg-white shadow-[var(--shadow-brand)]">
        {quote.items.map((item) => (
          <div key={item.id} className="flex flex-col gap-1 p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-ink">
                {item.product_name} <span className="text-ink/52">× {item.quantity}</span>
              </span>
              {item.unit_price != null ? (
                <span className="font-[family-name:var(--font-display)] font-semibold tabular-nums text-wine">{formatBRL(item.unit_price * item.quantity)}</span>
              ) : (
                <span className="text-ink/52">Aguardando preço</span>
              )}
            </div>
            {item.customization ? (
              <p className="text-xs text-ink/50">
                {Object.entries(item.customization)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join(" · ")}
              </p>
            ) : null}
          </div>
        ))}
      </div>

      {quote.admin_response ? (
        <div className={`${storeCard} text-sm`}>
          <p className="mb-1 font-semibold text-ink">Resposta da loja</p>
          <p className="text-ink/62">{quote.admin_response}</p>
        </div>
      ) : null}

      {quote.quoted_total != null ? (
        <div className={`${storeCard} flex items-center justify-between`}>
          <span className="text-sm font-semibold text-ink">Total cotado</span>
          <span className="font-[family-name:var(--font-display)] text-xl font-bold tabular-nums text-wine">{formatBRL(quote.quoted_total)}</span>
        </div>
      ) : null}

      {quote.valid_until ? <p className="text-xs text-ink/50">Válido até {new Date(quote.valid_until).toLocaleDateString("pt-BR")}</p> : null}

      {quote.status === "quoted" ? <QuoteActions quoteId={quote.id} /> : null}
    </div>
  );
}
