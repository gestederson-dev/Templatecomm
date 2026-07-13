import Link from "next/link";
import { Badge } from "@/components/ui/badge";
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

export default async function MeusOrcamentosPage() {
  const quotes = await getMyQuotes();

  if (quotes.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        Você ainda não tem orçamentos. Peça um a partir da página de um produto personalizável.
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y rounded-lg border">
      {quotes.map((quote) => (
        <Link key={quote.id} href={`/conta/orcamentos/${quote.quote_number}`} className="flex items-center justify-between p-4 text-sm hover:bg-muted/30">
          <div>
            <p className="font-medium">{quote.quote_number}</p>
            <p className="text-muted-foreground">{new Date(quote.created_at).toLocaleDateString("pt-BR")}</p>
          </div>
          <div className="flex items-center gap-3">
            {quote.quoted_total != null ? <span className="tabular-nums">{formatBRL(quote.quoted_total)}</span> : null}
            <Badge variant={quote.status === "converted" ? "default" : "secondary"}>{STATUS_LABEL[quote.status] ?? quote.status}</Badge>
          </div>
        </Link>
      ))}
    </div>
  );
}
