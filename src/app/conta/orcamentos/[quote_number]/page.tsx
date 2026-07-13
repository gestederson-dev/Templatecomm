import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { QuoteActions } from "@/components/account/quote-actions";
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

export default async function QuoteDetailPage({ params }: { params: Promise<{ quote_number: string }> }) {
  const { quote_number: quoteNumber } = await params;
  const quote = await getQuoteByNumber(quoteNumber);

  if (!quote) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">{quote.quote_number}</h2>
        <Badge variant={quote.status === "converted" ? "default" : "secondary"}>{STATUS_LABEL[quote.status] ?? quote.status}</Badge>
      </div>

      {quote.customer_message ? (
        <div className="text-sm">
          <p className="font-medium">Sua mensagem</p>
          <p className="text-muted-foreground">{quote.customer_message}</p>
        </div>
      ) : null}

      <div className="flex flex-col divide-y rounded-lg border">
        {quote.items.map((item) => (
          <div key={item.id} className="flex flex-col gap-1 p-4 text-sm">
            <div className="flex items-center justify-between">
              <span>
                {item.product_name} <span className="text-muted-foreground">× {item.quantity}</span>
              </span>
              {item.unit_price != null ? <span className="tabular-nums">{formatBRL(item.unit_price * item.quantity)}</span> : <span className="text-muted-foreground">Aguardando preço</span>}
            </div>
            {item.customization ? (
              <p className="text-xs text-muted-foreground">
                {Object.entries(item.customization)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join(" · ")}
              </p>
            ) : null}
          </div>
        ))}
      </div>

      {quote.admin_response ? (
        <div className="rounded-lg border bg-muted/20 p-4 text-sm">
          <p className="font-medium">Resposta da loja</p>
          <p className="text-muted-foreground">{quote.admin_response}</p>
        </div>
      ) : null}

      {quote.quoted_total != null ? (
        <div className="flex items-center justify-between rounded-lg border bg-muted/20 p-4">
          <span className="text-sm font-medium">Total cotado</span>
          <span className="text-xl font-semibold tabular-nums">{formatBRL(quote.quoted_total)}</span>
        </div>
      ) : null}

      {quote.valid_until ? <p className="text-xs text-muted-foreground">Válido até {new Date(quote.valid_until).toLocaleDateString("pt-BR")}</p> : null}

      {quote.status === "quoted" ? <QuoteActions quoteId={quote.id} /> : null}
    </div>
  );
}
