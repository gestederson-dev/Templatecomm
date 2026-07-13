import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPaymentProvider, type PaymentStatus } from "@/lib/payments";
import type { OrderStatus } from "@/lib/types";

const STATUS_TO_ORDER_STATUS: Partial<Record<PaymentStatus, OrderStatus>> = {
  approved: "paid",
  rejected: "canceled",
  cancelled: "canceled",
  refunded: "canceled",
};

/**
 * Valida a assinatura do webhook (x-signature/x-request-id) contra
 * MERCADOPAGO_WEBHOOK_SECRET, conforme documentado pelo Mercado Pago.
 * Sem o segredo configurado, não há como validar — nesse caso a notificação
 * é aceita mas o dado só é usado pra buscar o pagamento de verdade na API
 * (getPaymentStatus), nunca confiando em nada que veio só do payload.
 */
function assinaturaValida(request: NextRequest, dataId: string): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) return true;

  const signatureHeader = request.headers.get("x-signature");
  const requestId = request.headers.get("x-request-id");
  if (!signatureHeader || !requestId) return false;

  const parts = Object.fromEntries(signatureHeader.split(",").map((part) => part.trim().split("=", 2))) as Record<string, string>;
  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) return false;

  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");

  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(v1, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  let type = url.searchParams.get("type") ?? undefined;
  let dataId = url.searchParams.get("data.id") ?? undefined;

  if (!type || !dataId) {
    try {
      const body = await request.json();
      type = type ?? body?.type;
      dataId = dataId ?? body?.data?.id;
    } catch {
      // notificação sem corpo JSON (ex.: alguns eventos de merchant_order) — ignorada abaixo
    }
  }

  if (type !== "payment" || !dataId) {
    return NextResponse.json({ received: true });
  }

  if (!assinaturaValida(request, dataId)) {
    return NextResponse.json({ error: "assinatura inválida" }, { status: 401 });
  }

  const { status, externalReference } = await getPaymentProvider().getPaymentStatus(dataId);
  if (!externalReference) {
    return NextResponse.json({ received: true });
  }

  const orderStatus = STATUS_TO_ORDER_STATUS[status];
  const supabase = createAdminClient();

  await supabase
    .from("orders")
    .update({
      payment_id: dataId,
      payment_status: status,
      ...(orderStatus ? { status: orderStatus } : {}),
    })
    .eq("id", externalReference);

  return NextResponse.json({ received: true });
}
