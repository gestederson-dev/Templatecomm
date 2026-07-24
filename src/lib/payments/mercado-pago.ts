import "server-only";
import { MercadoPagoConfig, Payment } from "mercadopago";
import type { PaymentProvider, PaymentStatus, PaymentStatusResult, ProcessPaymentInput, ProcessPaymentResult } from "./types";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} não definida.`);
  }
  return value;
}

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

function client(): MercadoPagoConfig {
  return new MercadoPagoConfig({ accessToken: requireEnv("MERCADOPAGO_ACCESS_TOKEN") });
}

const STATUS_MAP: Record<string, PaymentStatus> = {
  approved: "approved",
  pending: "pending",
  in_process: "pending",
  rejected: "rejected",
  refunded: "refunded",
  cancelled: "cancelled",
  charged_back: "refunded",
};

/** Checkout embutido (Payment Brick): o cliente nunca sai do site — cartão, Pix e boleto processados direto pela API de Pagamentos. */
export const mercadoPagoProvider: PaymentProvider = {
  async processPayment(input: ProcessPaymentInput): Promise<ProcessPaymentResult> {
    const payment = new Payment(client());

    let result;
    try {
      result = await payment.create({
        body: {
          ...input.formData,
          transaction_amount: input.amount,
          description: `Pedido ${input.orderId}`,
          external_reference: input.orderId,
          notification_url: `${siteUrl()}/api/webhooks/mercadopago`,
        },
      });
    } catch (e) {
      const details = e && typeof e === "object" && "cause" in e ? JSON.stringify((e as { cause: unknown }).cause) : undefined;
      console.error(`[mercadopago] processPayment falhou (orderId=${input.orderId}):`, e instanceof Error ? e.message : e, details);
      throw e;
    }

    const transactionData = result.point_of_interaction?.transaction_data;

    return {
      status: STATUS_MAP[result.status ?? ""] ?? "unknown",
      paymentId: String(result.id ?? ""),
      paymentTypeId: result.payment_type_id ?? "",
      qrCode: transactionData?.qr_code ?? undefined,
      qrCodeBase64: transactionData?.qr_code_base64 ?? undefined,
      ticketUrl: result.transaction_details?.external_resource_url ?? undefined,
    };
  },

  async getPaymentStatus(paymentId: string): Promise<PaymentStatusResult> {
    const payment = new Payment(client());
    const result = await payment.get({ id: paymentId });

    return {
      status: STATUS_MAP[result.status ?? ""] ?? "unknown",
      externalReference: result.external_reference ?? null,
    };
  },
};
