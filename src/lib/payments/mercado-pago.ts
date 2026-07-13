import "server-only";
import { MercadoPagoConfig, Payment, Preference } from "mercadopago";
import type { CreatePaymentPreferenceInput, PaymentPreference, PaymentProvider, PaymentStatus, PaymentStatusResult } from "./types";

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

/** Checkout Pro: gera preferência e redireciona o cliente pro checkout hospedado do MP (PIX/boleto/cartão nativos). */
export const mercadoPagoProvider: PaymentProvider = {
  async createPreference(input: CreatePaymentPreferenceInput): Promise<PaymentPreference> {
    const preference = new Preference(client());
    const base = siteUrl();

    const result = await preference.create({
      body: {
        items: input.items.map((item) => ({
          id: input.orderId,
          title: item.title,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          currency_id: "BRL",
        })),
        shipments: {
          cost: input.shippingCost,
          mode: "not_specified",
        },
        payer: { email: input.payerEmail },
        external_reference: input.orderId,
        back_urls: {
          success: `${base}/pedido/${input.orderNumber}`,
          pending: `${base}/pedido/${input.orderNumber}`,
          failure: `${base}/checkout?erro=pagamento`,
        },
        auto_return: "approved",
        notification_url: `${base}/api/webhooks/mercadopago`,
      },
    });

    if (!result.id || !result.init_point) {
      throw new Error("Mercado Pago não retornou preferência válida.");
    }

    return { preferenceId: result.id, checkoutUrl: result.init_point };
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
