import "server-only";
import { mercadoPagoProvider } from "./mercado-pago";
import type { PaymentProvider } from "./types";

export type { PaymentProvider, PaymentStatus, PaymentStatusResult, ProcessPaymentInput, ProcessPaymentResult } from "./types";

/** Ponto único de troca de provedor de pagamento (CLAUDE.md regra 4). */
export function getPaymentProvider(): PaymentProvider {
  return mercadoPagoProvider;
}
