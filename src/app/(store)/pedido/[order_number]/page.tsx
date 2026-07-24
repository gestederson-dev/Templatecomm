import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StatusPill } from "@/components/store/status-pill";
import { storeCard } from "@/components/store/ui-styles";
import { getOrderByNumber } from "@/lib/orders";
import { formatBRL } from "@/lib/format";
import { getPaymentProvider } from "@/lib/payments";
import { PixInstructions, BoletoInstructions } from "@/components/checkout/payment-instructions";

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

const STATUS_TONE: Record<string, "warn" | "ok" | "info" | "wine" | "critical"> = {
  pending: "warn",
  paid: "ok",
  processing: "warn",
  shipped: "info",
  delivered: "wine",
  canceled: "critical",
};

async function getPendingPaymentInstructions(order: { status: string; payment_id: string | null }) {
  if (order.status !== "pending" || !order.payment_id) return null;

  try {
    const details = await getPaymentProvider().getPaymentDetails(order.payment_id);
    if (details.status !== "pending") return null;
    if (details.qrCode) return { type: "pix" as const, qrCode: details.qrCode, qrCodeBase64: details.qrCodeBase64 };
    if (details.ticketUrl) return { type: "boleto" as const, ticketUrl: details.ticketUrl };
    return null;
  } catch {
    // Mercado Pago fora do ar ou pagamento não encontrado — a página continua funcionando sem o QR/link.
    return null;
  }
}

export default async function PedidoPage({ params }: { params: Promise<{ order_number: string }> }) {
  const { order_number: orderNumber } = await params;
  const order = await getOrderByNumber(orderNumber);

  if (!order) notFound();

  const paymentInstructions = await getPendingPaymentInstructions(order);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-display)] text-[26px] font-bold tracking-[-0.02em]">Pedido {order.order_number}</h1>
        <StatusPill tone={STATUS_TONE[order.status] ?? "wine"}>{STATUS_LABEL[order.status] ?? order.status}</StatusPill>
      </div>

      {order.status === "pending" ? (
        <p className="mt-2 text-sm text-ink/60">
          Assim que o Mercado Pago confirmar o pagamento (PIX é quase instantâneo; boleto pode levar até 3 dias úteis), o status muda automaticamente.
        </p>
      ) : null}

      {paymentInstructions ? (
        <div className={`${storeCard} mt-4 flex flex-col items-center gap-4 py-6 text-center`}>
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-ink">
            {paymentInstructions.type === "pix" ? "Pague com Pix pra concluir" : "Boleto gerado"}
          </h2>
          {paymentInstructions.type === "pix" ? (
            <PixInstructions qrCode={paymentInstructions.qrCode} qrCodeBase64={paymentInstructions.qrCodeBase64} />
          ) : (
            <BoletoInstructions ticketUrl={paymentInstructions.ticketUrl} />
          )}
        </div>
      ) : null}

      <div className="mt-6 flex flex-col divide-y divide-ink/8 overflow-hidden rounded-2xl border border-ink/8 bg-white shadow-[var(--shadow-brand)]">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-4 text-sm">
            <span className="text-ink">
              {item.product_name} <span className="text-ink/52">× {item.quantity}</span>
            </span>
            <span className="font-[family-name:var(--font-display)] font-semibold tabular-nums text-wine">{formatBRL(item.total)}</span>
          </div>
        ))}
      </div>

      <div className={`${storeCard} mt-4 flex flex-col gap-1.5 text-sm`}>
        <div className="flex justify-between text-ink/70">
          <span>Subtotal</span>
          <span className="tabular-nums">{formatBRL(order.subtotal)}</span>
        </div>
        <div className="flex justify-between text-ink/70">
          <span>Frete</span>
          <span className="tabular-nums">{formatBRL(order.shipping_cost)}</span>
        </div>
        <div className="flex justify-between border-t border-ink/10 pt-2.5 text-base font-semibold text-ink">
          <span>Total</span>
          <span className="font-[family-name:var(--font-display)] tabular-nums text-wine">{formatBRL(order.total)}</span>
        </div>
      </div>

      {order.shipping_address ? (
        <div className="mt-4 text-sm text-ink/62">
          <p className="font-semibold text-ink">Endereço de entrega</p>
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
