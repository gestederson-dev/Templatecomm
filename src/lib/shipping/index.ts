import "server-only";
import { melhorEnvioProvider } from "./melhor-envio";
import type { ShippingProvider } from "./types";

export type { ShippingItem, ShippingOption, ShippingProvider, ShippingQuoteInput } from "./types";

/** Ponto único de troca de provedor de frete (CLAUDE.md regra 4). */
export function getShippingProvider(): ShippingProvider {
  return melhorEnvioProvider;
}
