import Link from "next/link";
import { StatusPill } from "@/components/admin/status-pill";
import { ChartEmptyState } from "@/components/admin/dashboard/chart-empty-state";
import { formatBRL } from "@/lib/format";

const STATUS_LABEL: Record<string, string> = {
  pending: "Aguardando pgto",
  paid: "Pago",
  processing: "Processando",
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

const ORIGIN_LABEL: Record<string, string> = {
  direct: "Direto",
  quote: "Orçamento",
  manual: "WhatsApp",
};

export function RecentOrdersTable({
  orders,
}: {
  orders: { id: string; orderNumber: string; customerName: string; origin: string; total: number; status: string; createdAt: string }[];
}) {
  if (orders.length === 0) {
    return <ChartEmptyState message="Sem pedidos ainda." />;
  }

  return (
    <table className="w-full border-collapse text-[13.5px]">
      <thead>
        <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-ink/52">
          <th className="pb-3">Pedido</th>
          <th className="pb-3">Cliente</th>
          <th className="pb-3">Origem</th>
          <th className="pb-3">Valor</th>
          <th className="pb-3">Status</th>
          <th className="pb-3">Data</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => (
          <tr key={order.id} className="border-t border-line">
            <td className="py-3">
              <Link href={`/admin/pedidos/${order.id}`} className="font-[family-name:var(--font-display)] font-semibold text-wine hover:underline">
                {order.orderNumber}
              </Link>
            </td>
            <td className="py-3 text-ink/78">{order.customerName}</td>
            <td className="py-3 text-ink/62">{ORIGIN_LABEL[order.origin] ?? order.origin}</td>
            <td className="py-3 font-[family-name:var(--font-display)] font-semibold text-ink">{formatBRL(order.total)}</td>
            <td className="py-3">
              <StatusPill tone={STATUS_TONE[order.status] ?? "wine"}>{STATUS_LABEL[order.status] ?? order.status}</StatusPill>
            </td>
            <td className="py-3 text-ink/62">{new Date(order.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
