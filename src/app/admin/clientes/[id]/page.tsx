import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { getAdminCustomerDetail } from "@/lib/admin/customers";
import { formatBRL } from "@/lib/format";
import { formatarCNPJ, formatarCPF } from "@/lib/validators/documento";

export default async function AdminClienteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getAdminCustomerDetail(id);

  if (!detail) notFound();
  const { profile, orders, quotes } = detail;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{profile.full_name || "(sem nome)"}</h1>
        <p className="text-sm text-muted-foreground">
          {profile.person_type === "pj" ? `PJ — ${profile.company_name ?? ""} — ${formatarCNPJ(profile.cnpj ?? "")}` : `PF — ${formatarCPF(profile.cpf ?? "")}`}
        </p>
        {profile.phone ? <p className="text-sm text-muted-foreground">Tel: {profile.phone}</p> : null}
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-muted-foreground">Pedidos ({orders.length})</h2>
        <div className="flex flex-col divide-y rounded-lg border">
          {orders.length === 0 ? <p className="p-4 text-sm text-muted-foreground">Nenhum pedido ainda.</p> : null}
          {orders.map((order) => (
            <Link key={order.id} href={`/admin/pedidos/${order.id}`} className="flex items-center justify-between p-4 text-sm hover:bg-muted/30">
              <span>{order.order_number}</span>
              <span className="tabular-nums">{formatBRL(order.total)}</span>
              <Badge variant="secondary">{order.status}</Badge>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-muted-foreground">Orçamentos ({quotes.length})</h2>
        <div className="flex flex-col divide-y rounded-lg border">
          {quotes.length === 0 ? <p className="p-4 text-sm text-muted-foreground">Nenhum orçamento ainda.</p> : null}
          {quotes.map((quote) => (
            <Link key={quote.id} href={`/admin/orcamentos/${quote.id}`} className="flex items-center justify-between p-4 text-sm hover:bg-muted/30">
              <span>{quote.quote_number}</span>
              <Badge variant="secondary">{quote.status}</Badge>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
