import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { getOrderByNumber } from "@/lib/orders";
import { formatBRL } from "@/lib/format";

export const metadata: Metadata = {
  title: "Confirmação do pedido",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Aguardando confirmação do pagamento",
  paid: "Pagamento confirmado",
  processing: "Em preparação",
  shipped: "Enviado",
  delivered: "Entregue",
  canceled: "Cancelado",
};

export default async function PedidoPage({ params }: { params: Promise<{ order_number: string }> }) {
  const { order_number: orderNumber } = await params;
  const order = await getOrderByNumber(orderNumber);

  if (!order) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Pedido {order.order_number}</h1>
        <Badge variant={order.status === "paid" ? "default" : "secondary"}>{STATUS_LABEL[order.status] ?? order.status}</Badge>
      </div>

      {order.status === "pending" ? (
        <p className="mt-2 text-sm text-muted-foreground">
          Assim que o Mercado Pago confirmar o pagamento (PIX é quase instantâneo; boleto pode levar até 3 dias úteis), o status muda automaticamente.
        </p>
      ) : null}

      <div className="mt-6 flex flex-col divide-y rounded-lg border">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-4 text-sm">
            <span>
              {item.product_name} <span className="text-muted-foreground">× {item.quantity}</span>
            </span>
            <span className="tabular-nums">{formatBRL(item.total)}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-1 rounded-lg border bg-muted/20 p-4 text-sm">
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
        <div className="mt-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Endereço de entrega</p>
          <p>
            {order.shipping_address.street}
            {order.shipping_address.number ? `, ${order.shipping_address.number}` : ""} — {order.shipping_address.city}/{order.shipping_address.state} — CEP{" "}
            {order.shipping_address.cep}
          </p>
        </div>
      ) : null}
    </div>
  );
}
