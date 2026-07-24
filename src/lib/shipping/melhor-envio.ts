import "server-only";
import type { ShippingOption, ShippingProvider, ShippingQuoteInput } from "./types";
import { getValidAccessToken, melhorEnvioBaseUrl } from "./melhor-envio-token";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} não definida.`);
  }
  return value;
}

// Caixa padrão usada quando o produto não tem `dimensions` cadastrada (cm).
const DIMENSAO_PADRAO = { width: 16, height: 8, length: 20 };

type MelhorEnvioQuoteResponse = {
  id?: number;
  name?: string;
  price?: string;
  delivery_time?: number;
  error?: string;
}[];

export const melhorEnvioProvider: ShippingProvider = {
  async quote(input: ShippingQuoteInput): Promise<ShippingOption[]> {
    const accessToken = await getValidAccessToken();
    const response = await fetch(`${melhorEnvioBaseUrl()}/api/v2/me/shipment/calculate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": `Salmar Brindes (${process.env.NEXT_PUBLIC_SITE_URL ?? "contato@salmarbrindes.com.br"})`,
      },
      body: JSON.stringify({
        from: { postal_code: requireEnv("MELHOR_ENVIO_ORIGIN_CEP") },
        to: { postal_code: input.toCep.replace(/\D/g, "") },
        products: input.items.map((item, index) => ({
          id: String(index),
          quantity: item.quantity,
          weight: Math.max(item.weightGrams, 1) / 1000,
          ...DIMENSAO_PADRAO,
        })),
      }),
    });

    if (!response.ok) {
      throw new Error(`Melhor Envio respondeu ${response.status}`);
    }

    const data = (await response.json()) as MelhorEnvioQuoteResponse;

    return data
      .filter((option) => !option.error && option.price)
      .map((option) => ({
        service: option.name ?? "Frete",
        price: Number(option.price),
        deliveryDays: option.delivery_time ?? null,
      }));
  },
};
