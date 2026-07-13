import { notFound } from "next/navigation";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { getAdminOrderById } from "@/lib/admin/orders";
import { formatBRL } from "@/lib/format";

export default async function AdminPedidoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getAdminOrderById(id);

  if (!order) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">{order.order_number}</h1>

      <div className="flex flex-col divide-y rounded-lg border">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-4 text-sm">
            <span>
              {item.product_name} <span className="text-muted-foreground">× {item.quantity}</span>
            </span>
            <span className="tabular-nums">{formatBRL(item.total)}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-1 rounded-lg border bg-muted/20 p-4 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="tabular-nums">{formatBRL(order.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Frete</span>
          <span className="tabular-nums">{formatBRL(order.shipping_cost)}</span>
        </div>
        <div className="flex justify-between border-t pt-2 text-base font-semibold">
          <span>Total</span>
          <span className="tabular-nums">{formatBRL(order.total)}</span>
        </div>
      </div>

      {order.shipping_address ? (
        <div className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Endereço de entrega</p>
          <p>
            {order.shipping_address.street}
            {order.shipping_address.number ? `, ${order.shipping_address.number}` : ""} — {order.shipping_address.city}/{order.shipping_address.state} — CEP{" "}
            {order.shipping_address.cep}
          </p>
        </div>
      ) : null}

      {order.payment_status ? <p className="text-sm text-muted-foreground">Pagamento: {order.payment_status}</p> : null}

      <OrderStatusForm order={order} />
    </div>
  );
}
