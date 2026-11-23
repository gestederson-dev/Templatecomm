import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { DeleteOrderButton } from "@/components/admin/delete-order-button";
import { StatusPill } from "@/components/admin/status-pill";
import { adminBtnSoft, adminCard, adminPanel } from "@/components/admin/ui-styles";
import { getAdminOrderById } from "@/lib/admin/orders";
import { LinkedConfirmationPanel } from "@/components/admin/confirmation-card";
import { artFiles, getConfirmationByOrderId } from "@/lib/confirmations";
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

const ORIGIN_LABEL: Record<string, string> = {
  direct: "Compra direta pelo site",
  quote: "Convertido de orçamento",
  manual: "Registrado manualmente (WhatsApp)",
};

export default async function AdminPedidoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getAdminOrderById(id);

  if (!order) notFound();
  const confirmation = await getConfirmationByOrderId(order.id);
  const arts = confirmation ? await artFiles(confirmation.logo_paths) : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-[family-name:var(--font-display)] text-[26px] font-bold tracking-[-0.02em]">{order.order_number}</h1>
          <StatusPill tone={STATUS_TONE[order.status] ?? "wine"}>{STATUS_LABEL[order.status] ?? order.status}</StatusPill>
        </div>
        <div className="flex items-center gap-2.5">
          <Link href={`/admin/pedidos/${order.id}/editar`} className={adminBtnSoft}>
            Editar pedido
          </Link>
          <DeleteOrderButton orderId={order.id} orderNumber={order.order_number} />
        </div>
      </div>

      <div className={`${adminCard} flex flex-col gap-1 text-sm`}>
        <p className="text-ink/52">{ORIGIN_LABEL[order.origin] ?? order.origin}</p>
        <p className="font-semibold text-ink">{order.profileName || order.customer_name || "Cliente não identificado"}</p>
        {order.customer_phone ? <p className="text-ink/62">{order.customer_phone}</p> : null}
      </div>

      <LinkedConfirmationPanel
        confirmation={confirmation}
        arts={arts}
        createHref={order.status === "canceled" ? null : `/admin/confirmacoes/nova?pedido=${order.id}`}
        emptyText="Mande o link para o cliente escolher o pagamento, enviar as artes e os dados da nota fiscal."
      />

      <div className={adminPanel}>
        {order.items.map((item, index) => (
          <div key={item.id} className={`flex items-center justify-between gap-3 px-4 py-3.5 text-sm ${index > 0 ? "border-t border-line" : ""}`}>
            <div className="text-ink">
              <span>
                {item.product_name} <span className="text-ink/52">× {item.quantity}</span>
              </span>
              {item.customization && Object.keys(item.customization).length > 0 ? (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {Object.entries(item.customization).map(([key, val]) => (
                    <span key={key} className="rounded-md bg-ink/5 px-2 py-0.5 text-[11px] font-medium text-ink/60">
                      {key}: {val}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
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
        {order.discount > 0 ? (
          <div className="flex justify-between text-ink/70">
            <span>Desconto</span>
            <span className="tabular-nums">- {formatBRL(order.discount)}</span>
          </div>
        ) : null}
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
      {order.payment_method ? <p className="text-sm text-ink/52">Forma de pagamento: {order.payment_method}</p> : null}
      {order.notes ? (
        <div className="text-sm text-ink/62">
          <p className="font-semibold text-ink">Observações</p>
          <p>{order.notes}</p>
        </div>
      ) : null}

      <OrderStatusForm order={order} />
    </div>
  );
}
