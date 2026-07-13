import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAdminQuotes } from "@/lib/admin/quotes";
import { formatBRL } from "@/lib/format";

const STATUS_LABEL: Record<string, string> = {
  requested: "Aguardando cotação",
  quoted: "Cotado",
  approved: "Aprovado",
  rejected: "Rejeitado",
  expired: "Expirado",
  converted: "Convertido",
};

export default async function AdminOrcamentosPage() {
  const quotes = await getAdminQuotes();
  const pending = quotes.filter((q) => q.status === "requested");
  const others = quotes.filter((q) => q.status !== "requested");

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Orçamentos</h1>
        {pending.length > 0 ? <p className="text-sm text-muted-foreground">{pending.length} aguardando cotação</p> : null}
      </div>

      <QuoteTable title="Fila de cotação" quotes={pending} />
      <QuoteTable title="Histórico" quotes={others} />
    </div>
  );
}

function QuoteTable({ title, quotes }: { title: string; quotes: Awaited<ReturnType<typeof getAdminQuotes>> }) {
  if (quotes.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-muted-foreground">{title}</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Orçamento</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotes.map((quote) => (
            <TableRow key={quote.id}>
              <TableCell>
                <Link href={`/admin/orcamentos/${quote.id}`} className="font-medium hover:underline">
                  {quote.quote_number}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">{new Date(quote.created_at).toLocaleDateString("pt-BR")}</TableCell>
              <TableCell className="tabular-nums">{quote.quoted_total != null ? formatBRL(quote.quoted_total) : "—"}</TableCell>
              <TableCell>
                <Badge variant={quote.status === "converted" ? "default" : "secondary"}>{STATUS_LABEL[quote.status] ?? quote.status}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
