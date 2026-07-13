export type PaymentPreferenceItem = {
  title: string;
  quantity: number;
  unitPrice: number;
};

export type CreatePaymentPreferenceInput = {
  orderId: string;
  orderNumber: string;
  items: PaymentPreferenceItem[];
  shippingCost: number;
  payerEmail: string;
};

export type PaymentPreference = {
  preferenceId: string;
  /** URL do checkout hospedado pelo provedor — para onde o cliente é redirecionado pra pagar. */
  checkoutUrl: string;
};

export type PaymentStatus = "pending" | "approved" | "rejected" | "refunded" | "cancelled" | "unknown";

export type PaymentStatusResult = {
  status: PaymentStatus;
  /** orderId que veio de volta na notificação — usado pra encontrar o pedido. */
  externalReference: string | null;
};

/**
 * Interface genérica de pagamento (CLAUDE.md regra 4: isolar atrás de
 * interface pra trocar de provedor sem reescrever o checkout).
 */
export interface PaymentProvider {
  createPreference(input: CreatePaymentPreferenceInput): Promise<PaymentPreference>;
  getPaymentStatus(paymentId: string): Promise<PaymentStatusResult>;
}
