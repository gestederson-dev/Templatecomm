import Link from "next/link";
import { StatusPill } from "@/components/store/status-pill";
import { getMyOrders } from "@/lib/orders";
import { formatBRL } from "@/lib/format";

const STATUS_LABEL: Record<string, string> = {
  pending: "Aguardando pagamento",
  paid: "Pago",
  processing: "Em preparação",
  shipped: "Enviado",
  delivered: "Entregue",
  canceled: "Cancelado",
};

const STATUS_TONE: Record<string, "warn" | "ok" | "info" | "wine" | "critical"> = {
  pending: "warn",
  paid: "ok",
  processing: "warn",
  shipped: "info",
  delivered: "wine",
  canceled: "critical",
};

export default async function MeusPedidosPage() {
  const orders = await getMyOrders();

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-ink/15 bg-white p-8 text-center text-sm text-ink/60">
        Você ainda não tem pedidos.
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-ink/8 overflow-hidden rounded-2xl border border-ink/8 bg-white shadow-[var(--shadow-brand)]">
      {orders.map((order) => (
        <Link key={order.id} href={`/pedido/${order.order_number}`} className="flex items-center justify-between gap-3 p-4 text-sm transition-colors hover:bg-wine-tint">
          <div>
            <p className="font-[family-name:var(--font-display)] font-semibold text-wine">{order.order_number}</p>
            <p className="text-ink/52">{new Date(order.created_at).toLocaleDateString("pt-BR")}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-[family-name:var(--font-display)] font-semibold tabular-nums text-ink">{formatBRL(order.total)}</span>
            <StatusPill tone={STATUS_TONE[order.status] ?? "wine"}>{STATUS_LABEL[order.status] ?? order.status}</StatusPill>
          </div>
        </Link>
      ))}
    </div>
  );
}
