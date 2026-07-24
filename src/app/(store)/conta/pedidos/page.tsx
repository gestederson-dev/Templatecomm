import Link from "next/link";
import { StatusPill } from "@/components/store/status-pill";
import { ReorderButton } from "@/components/account/reorder-button";
import { getMyOrdersWithPreview } from "@/lib/orders";
import { formatBRL } from "@/lib/format";
import { btnOutline } from "@/components/store/button-styles";

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
  const orders = await getMyOrdersWithPreview();

  if (orders.length === 0) {
    return <div className="rounded-2xl border border-dashed border-ink/15 bg-white p-8 text-center text-sm text-ink/60">Você ainda não tem pedidos.</div>;
  }

  return (
    <div className="flex flex-col divide-y divide-ink/8 overflow-hidden rounded-2xl border border-ink/8 bg-white shadow-[var(--shadow-brand)]">
      {orders.map((order) => (
        <div key={order.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href={`/pedido/${order.order_number}`} className="flex flex-1 items-center gap-3 text-sm">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-wine-tint">
              {order.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={order.thumbnailUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-lg text-wine/40">🎁</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-[family-name:var(--font-display)] font-semibold text-wine">{order.order_number}</p>
              <p className="truncate text-ink/70">
                {order.firstItemName}
                {order.extraItemCount > 0 ? ` e mais ${order.extraItemCount} ${order.extraItemCount === 1 ? "item" : "itens"}` : ""}
              </p>
              <p className="text-ink/52">{new Date(order.created_at).toLocaleDateString("pt-BR")}</p>
            </div>
          </Link>

          <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:gap-2">
            <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1.5">
              <span className="font-[family-name:var(--font-display)] font-semibold tabular-nums text-ink">{formatBRL(order.total)}</span>
              <StatusPill tone={STATUS_TONE[order.status] ?? "wine"}>{STATUS_LABEL[order.status] ?? order.status}</StatusPill>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/pedido/${order.order_number}`} className={`${btnOutline} px-4 py-1.5 text-xs`}>
                Ver pedido
              </Link>
              <ReorderButton orderId={order.id} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
