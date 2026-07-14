import { notFound } from "next/navigation";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { StatusPill } from "@/components/admin/status-pill";
import { adminCard, adminPanel } from "@/components/admin/ui-styles";
import { getAdminOrderById } from "@/lib/admin/orders";
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

export default async function AdminPedidoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getAdminOrderById(id);

  if (!order) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <h1 className="font-[family-name:var(--font-display)] text-[26px] font-bold tracking-[-0.02em]">{order.order_number}</h1>
        <StatusPill tone={STATUS_TONE[order.status] ?? "wine"}>{STATUS_LABEL[order.status] ?? order.status}</StatusPill>
      </div>

      <div className={adminPanel}>
        {order.items.map((item, index) => (
          <div key={item.id} className={`flex items-center justify-between gap-3 px-4 py-3.5 text-sm ${index > 0 ? "border-t border-line" : ""}`}>
            <span className="text-ink">
              {item.product_name} <span className="text-ink/52">× {item.quantity}</span>
            </span>
            <span className="font-[family-name:var(--font-display)] font-semibold tabular-nums text-wine">{formatBRL(item.total)}</span>
          </div>
        ))}
      </div>

      <div className={`${adminCard} flex flex-col gap-1.5 text-sm`}>
        <div className="flex justify-between text-ink/70">
          <span>Subtotal</span>
          <span className="tabular-nums">{formatBRL(order.subtotal)}</span>
        </div>
        <div className="flex justify-between text-ink/70">
          <span>Frete</span>
          <span className="tabular-nums">{formatBRL(order.shipping_cost)}</span>
        </div>
        <div className="flex justify-between border-t border-line pt-2.5 text-base font-semibold text-ink">
          <span>Total</span>
          <span className="font-[family-name:var(--font-display)] tabular-nums text-wine">{formatBRL(order.total)}</span>
        </div>
      </div>

      {order.shipping_address ? (
        <div className="text-sm text-ink/62">
          <p className="font-semibold text-ink">Endereço de entrega</p>
          <p>
            {order.shipping_address.street}
            {order.shipping_address.number ? `, ${order.shipping_address.number}` : ""} — {order.shipping_address.city}/{order.shipping_address.state} — CEP{" "}
            {order.shipping_address.cep}
          </p>
        </div>
      ) : null}

      {order.payment_status ? <p className="text-sm text-ink/52">Pagamento: {order.payment_status}</p> : null}

      <OrderStatusForm order={order} />
    </div>
  );
}
