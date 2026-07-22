import Link from "next/link";
import { StatusPill } from "@/components/admin/status-pill";
import { adminPanel } from "@/components/admin/ui-styles";
import { getAdminOrders } from "@/lib/admin/orders";
import { formatBRL } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";

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

const STATUSES: OrderStatus[] = ["pending", "paid", "processing", "shipped", "delivered", "canceled"];

const ORIGIN_LABEL: Record<string, string> = {
  direct: "Direta",
  quote: "Orçamento",
  manual: "WhatsApp/Manual",
};

export default async function AdminPedidosPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const orders = await getAdminOrders(status as OrderStatus | undefined);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-[26px] font-bold tracking-[-0.02em]">Pedidos</h1>
          <p className="mt-0.5 text-[13px] text-ink/52">
            {orders.length} pedido{orders.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link href="/admin/pedidos/novo" className="inline-flex items-center gap-2 rounded-[10px] bg-wine px-[18px] py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-px">
          + Novo pedido
        </Link>
      </div>

      <div className="flex flex-wrap gap-1.5 rounded-[10px] border border-line bg-white p-1">
        <Link
          href="/admin/pedidos"
          className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors ${!status ? "bg-wine text-white" : "text-ink/55 hover:bg-wine-tint hover:text-wine"}`}
        >
          Todos
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/pedidos?status=${s}`}
            className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors ${status === s ? "bg-wine text-white" : "text-ink/55 hover:bg-wine-tint hover:text-wine"}`}
          >
            {STATUS_LABEL[s]}
          </Link>
        ))}
      </div>

      <div className={adminPanel}>
        <table className="w-full border-collapse text-[13.5px]">
          <thead>
            <tr className="bg-ink/[0.015] text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-ink/52">
              <th className="px-4 py-3.5">Pedido</th>
              <th className="px-4 py-3.5">Data</th>
              <th className="px-4 py-3.5">Origem</th>
              <th className="px-4 py-3.5">Total</th>
              <th className="px-4 py-3.5">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-ink/52">
                  Nenhum pedido encontrado.
                </td>
              </tr>
            ) : null}
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-line">
                <td className="px-4 py-3.5">
                  <Link href={`/admin/pedidos/${order.id}`} className="font-semibold text-ink hover:text-wine">
                    {order.order_number}
                  </Link>
                </td>
                <td className="px-4 py-3.5 text-ink/62">{new Date(order.created_at).toLocaleDateString("pt-BR")}</td>
                <td className="px-4 py-3.5 text-ink/62">{ORIGIN_LABEL[order.origin] ?? order.origin}</td>
                <td className="px-4 py-3.5 font-[family-name:var(--font-display)] font-semibold tabular-nums text-wine">{formatBRL(order.total)}</td>
                <td className="px-4 py-3.5">
                  <StatusPill tone={STATUS_TONE[order.status] ?? "wine"}>{STATUS_LABEL[order.status] ?? order.status}</StatusPill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
