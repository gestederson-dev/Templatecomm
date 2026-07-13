import Link from "next/link";
import { Badge } from "@/components/ui/badge";
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

export default async function MeusPedidosPage() {
  const orders = await getMyOrders();

  if (orders.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        Você ainda não tem pedidos.
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y rounded-lg border">
      {orders.map((order) => (
        <Link key={order.id} href={`/pedido/${order.order_number}`} className="flex items-center justify-between p-4 text-sm hover:bg-muted/30">
          <div>
            <p className="font-medium">{order.order_number}</p>
            <p className="text-muted-foreground">{new Date(order.created_at).toLocaleDateString("pt-BR")}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="tabular-nums">{formatBRL(order.total)}</span>
            <Badge variant={order.status === "paid" ? "default" : "secondary"}>{STATUS_LABEL[order.status] ?? order.status}</Badge>
          </div>
        </Link>
      ))}
    </div>
  );
}
