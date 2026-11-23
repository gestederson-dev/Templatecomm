import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusPill } from "@/components/store/status-pill";
import { OrderStatusTimeline } from "@/components/store/order-status-timeline";
import { storeCard } from "@/components/store/ui-styles";
import { getOrderByNumber } from "@/lib/orders";
import { getOrCreateConfirmationForOwnedOrder, type OrderConfirmationSummary } from "@/lib/confirmations";
import { createClient } from "@/lib/supabase/server";
import { MAX_ARTS } from "@/lib/validators/confirmacao";
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

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  pending: "Aguardando confirmação",
  approved: "Aprovado",
  rejected: "Recusado",
  refunded: "Reembolsado",
  cancelled: "Cancelado",
  unknown: "—",
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

/** Mesmo passo de toda venda da Salmar: arte(s) e dados da nota fiscal, pelo link da confirmação. */
function ArteENota({ c }: { c: OrderConfirmationSummary }) {
  const href = `/confirmar/${c.token}`;
  if (c.status === "pendente") {
    return (
      <div className="mt-6 flex flex-col gap-3 rounded-2xl border-2 border-wine/25 bg-wine-tint/40 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-[family-name:var(--font-display)] text-lg font-semibold text-ink">Falta pouco: envie sua arte</p>
          <p className="mt-0.5 text-sm text-ink/65">Mande a logo para a personalização e diga se precisa de nota fiscal. Leva 1 minuto.</p>
        </div>
        <Link
          href={href}
          className="inline-flex shrink-0 items-center justify-center rounded-xl bg-wine px-5 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-px"
        >
          Enviar arte e dados
        </Link>
      </div>
    );
  }
  if (c.status !== "respondido") return null;
  return (
    <div className={`${storeCard} mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between`}>
      <p className="text-sm text-ink/70">
        {c.artCount > 0 ? (
          <>
            <span className="font-semibold text-ok">✓ Recebemos {c.artCount > 1 ? `${c.artCount} artes` : "sua arte"}</span> e os dados do pedido.
          </>
        ) : (
          <>
            <span className="font-semibold text-wine">Falta a arte.</span> Seus dados já chegaram.
          </>
        )}
      </p>
      {c.artCount < MAX_ARTS ? (
        <Link href={href} className="text-sm font-semibold text-wine underline-offset-2 hover:underline">
          {c.artCount > 0 ? "Enviar outra arte" : "Enviar a arte"} →
        </Link>
      ) : null}
    </div>
  );
}

export default async function PedidoPage({ params }: { params: Promise<{ order_number: string }> }) {
  const { order_number: orderNumber } = await params;
  const order = await getOrderByNumber(orderNumber);

  if (!order) notFound();

  const paymentInstructions = await getPendingPaymentInstructions(order);
  const {
    data: { user },
  } = await (await createClient()).auth.getUser();
  const confirmation = await getOrCreateConfirmationForOwnedOrder(order, user?.email ?? null);

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

      {confirmation && order.status !== "canceled" ? <ArteENota c={confirmation} /> : null}

      <div className={`${storeCard} mt-6`}>
        <OrderStatusTimeline status={order.status} />
      </div>

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

      <div className="mt-4 flex flex-col divide-y divide-ink/8 overflow-hidden rounded-2xl border border-ink/8 bg-white shadow-[var(--shadow-brand)]">
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

      {order.payment_method || order.payment_status ? (
        <div className={`${storeCard} mt-4 flex flex-col gap-1.5 text-sm`}>
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.04em] text-ink/52">Pagamento</p>
          {order.payment_method ? (
            <div className="flex justify-between">
              <span className="text-ink/70">Forma de pagamento</span>
              <span className="font-medium text-ink">{order.payment_method}</span>
            </div>
          ) : null}
          {order.payment_status ? (
            <div className="flex justify-between">
              <span className="text-ink/70">Status do pagamento</span>
              <span className="font-medium text-ink">{PAYMENT_STATUS_LABEL[order.payment_status] ?? order.payment_status}</span>
            </div>
          ) : null}
        </div>
      ) : null}

      {order.shipping_address ? (
        <div className={`${storeCard} mt-4 flex flex-col gap-1 text-sm`}>
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.04em] text-ink/52">Endereço de entrega</p>
          <p className="text-ink/70">
            {order.shipping_address.street}
            {order.shipping_address.number ? `, ${order.shipping_address.number}` : ""} — {order.shipping_address.city}/{order.shipping_address.state} — CEP{" "}
            {order.shipping_address.cep}
          </p>
        </div>
      ) : null}

      <div className={`${storeCard} mt-4 flex items-center justify-between text-sm`}>
        <span className="text-ink/70">Precisa de ajuda com esse pedido?</span>
        <Link href="/contato" className="font-semibold text-wine hover:underline">
          Falar com a gente
        </Link>
      </div>
    </div>
  );
}
