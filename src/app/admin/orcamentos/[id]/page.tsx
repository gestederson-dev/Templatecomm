import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { QuotePricing } from "@/components/admin/quote-pricing";
import { getAdminQuoteById } from "@/lib/admin/quotes";

const STATUS_LABEL: Record<string, string> = {
  requested: "Aguardando cotação",
  quoted: "Cotado",
  approved: "Aprovado",
  rejected: "Rejeitado",
  expired: "Expirado",
  converted: "Convertido",
};

export default async function AdminOrcamentoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quote = await getAdminQuoteById(id);

  if (!quote) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">{quote.quote_number}</h1>
        <Badge variant={quote.status === "converted" ? "default" : "secondary"}>{STATUS_LABEL[quote.status] ?? quote.status}</Badge>
      </div>

      {quote.customer_message ? (
        <div className="text-sm">
          <p className="font-medium">Mensagem do cliente</p>
          <p className="text-muted-foreground">{quote.customer_message}</p>
        </div>
      ) : null}

      <QuotePricing quoteId={quote.id} status={quote.status} items={quote.items} adminResponse={quote.admin_response} validUntil={quote.valid_until} />
    </div>
  );
}
