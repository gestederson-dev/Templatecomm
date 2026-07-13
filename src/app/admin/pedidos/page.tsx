import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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

const STATUSES: OrderStatus[] = ["pending", "paid", "processing", "shipped", "delivered", "canceled"];

export default async function AdminPedidosPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const orders = await getAdminOrders(status as OrderStatus | undefined);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Pedidos</h1>

      <div className="flex flex-wrap gap-2">
        <Link href="/admin/pedidos" className={`rounded-md px-3 py-1 text-sm ${!status ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted"}`}>
          Todos
        </Link>
        {STATUSES.map((s) => (
          <Link key={s} href={`/admin/pedidos?status=${s}`} className={`rounded-md px-3 py-1 text-sm ${status === s ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted"}`}>
            {STATUS_LABEL[s]}
          </Link>
        ))}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pedido</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Origem</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>
                <Link href={`/admin/pedidos/${order.id}`} className="font-medium hover:underline">
                  {order.order_number}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">{new Date(order.created_at).toLocaleDateString("pt-BR")}</TableCell>
              <TableCell className="text-muted-foreground">{order.origin === "quote" ? "Orçamento" : "Direta"}</TableCell>
              <TableCell className="tabular-nums">{formatBRL(order.total)}</TableCell>
              <TableCell>
                <Badge variant={order.status === "paid" || order.status === "delivered" ? "default" : "secondary"}>{STATUS_LABEL[order.status] ?? order.status}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
