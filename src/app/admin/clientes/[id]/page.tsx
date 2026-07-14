import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusPill } from "@/components/admin/status-pill";
import { adminCard, adminPanel } from "@/components/admin/ui-styles";
import { getAdminCustomerDetail } from "@/lib/admin/customers";
import { formatBRL } from "@/lib/format";
import { formatarCNPJ, formatarCPF } from "@/lib/validators/documento";

const ORDER_TONE: Record<string, "warn" | "ok" | "info" | "wine" | "critical"> = {
  pending: "warn",
  paid: "ok",
  processing: "warn",
  shipped: "info",
  delivered: "wine",
  canceled: "critical",
};

const QUOTE_TONE: Record<string, "warn" | "ok" | "info" | "wine" | "critical"> = {
  requested: "warn",
  quoted: "info",
  approved: "ok",
  rejected: "critical",
  expired: "critical",
  converted: "wine",
};

export default async function AdminClienteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getAdminCustomerDetail(id);

  if (!detail) notFound();
  const { profile, orders, quotes } = detail;

  return (
    <div className="flex flex-col gap-6">
      <div className={adminCard}>
        <h1 className="font-[family-name:var(--font-display)] text-[22px] font-bold tracking-[-0.01em]">{profile.full_name || "(sem nome)"}</h1>
        <p className="mt-1 text-sm text-ink/62">
          {profile.person_type === "pj" ? `PJ — ${profile.company_name ?? ""} — ${formatarCNPJ(profile.cnpj ?? "")}` : `PF — ${formatarCPF(profile.cpf ?? "")}`}
        </p>
        {profile.phone ? <p className="text-sm text-ink/62">Tel: {profile.phone}</p> : null}
      </div>

      <div>
        <h2 className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink/52">Pedidos ({orders.length})</h2>
        <div className={adminPanel}>
          {orders.length === 0 ? <p className="p-4 text-sm text-ink/52">Nenhum pedido ainda.</p> : null}
          {orders.map((order, index) => (
            <Link
              key={order.id}
              href={`/admin/pedidos/${order.id}`}
              className={`flex items-center justify-between gap-3 px-4 py-3.5 text-sm transition-colors hover:bg-wine-tint ${index > 0 ? "border-t border-line" : ""}`}
            >
              <span className="font-[family-name:var(--font-display)] font-semibold text-wine">{order.order_number}</span>
              <span className="font-[family-name:var(--font-display)] font-semibold tabular-nums text-ink">{formatBRL(order.total)}</span>
              <StatusPill tone={ORDER_TONE[order.status] ?? "wine"}>{order.status}</StatusPill>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink/52">Orçamentos ({quotes.length})</h2>
        <div className={adminPanel}>
          {quotes.length === 0 ? <p className="p-4 text-sm text-ink/52">Nenhum orçamento ainda.</p> : null}
          {quotes.map((quote, index) => (
            <Link
              key={quote.id}
              href={`/admin/orcamentos/${quote.id}`}
              className={`flex items-center justify-between gap-3 px-4 py-3.5 text-sm transition-colors hover:bg-wine-tint ${index > 0 ? "border-t border-line" : ""}`}
            >
              <span className="font-[family-name:var(--font-display)] font-semibold text-wine">{quote.quote_number}</span>
              <StatusPill tone={QUOTE_TONE[quote.status] ?? "wine"}>{quote.status}</StatusPill>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
