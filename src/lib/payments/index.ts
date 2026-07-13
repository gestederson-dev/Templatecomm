import "server-only";
import { mercadoPagoProvider } from "./mercado-pago";
import type { PaymentProvider } from "./types";

export type { CreatePaymentPreferenceInput, PaymentPreference, PaymentProvider, PaymentStatus, PaymentStatusResult } from "./types";

/** Ponto único de troca de provedor de pagamento (CLAUDE.md regra 4). */
export function getPaymentProvider(): PaymentProvider {
  return mercadoPagoProvider;
}
