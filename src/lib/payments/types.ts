export type PaymentStatus = "pending" | "approved" | "rejected" | "refunded" | "cancelled" | "unknown";

export type PaymentStatusResult = {
  status: PaymentStatus;
  /** orderId que veio de volta na notificação — usado pra encontrar o pedido. */
  externalReference: string | null;
};

export type ProcessPaymentInput = {
  orderId: string;
  amount: number;
  payerEmail: string;
  /** Dados que o Payment Brick devolve em onSubmit — já no formato que a API de pagamentos espera. */
  formData: Record<string, unknown>;
};

export type ProcessPaymentResult = {
  status: PaymentStatus;
  paymentId: string;
  paymentTypeId: string;
  /** Pix: código copia-e-cola. */
  qrCode?: string;
  /** Pix: QR code em base64, pronto pra <img src="data:image/png;base64,...">. */
  qrCodeBase64?: string;
  /** Boleto: URL pra visualizar/imprimir. */
  ticketUrl?: string;
};

/**
 * Interface genérica de pagamento (CLAUDE.md regra 4: isolar atrás de
 * interface pra trocar de provedor sem reescrever o checkout).
 */
export interface PaymentProvider {
  processPayment(input: ProcessPaymentInput): Promise<ProcessPaymentResult>;
  getPaymentStatus(paymentId: string): Promise<PaymentStatusResult>;
  /** Re-busca os dados de um pagamento já criado (QR do Pix, link do boleto) — pra reexibir na página do pedido. */
  getPaymentDetails(paymentId: string): Promise<ProcessPaymentResult>;
}
