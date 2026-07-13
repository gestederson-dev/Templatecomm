export type ShippingItem = {
  weightGrams: number;
  quantity: number;
};

export type ShippingQuoteInput = {
  toCep: string;
  items: ShippingItem[];
};

export type ShippingOption = {
  service: string;
  price: number;
  deliveryDays: number | null;
};

/**
 * Interface genérica de frete (CLAUDE.md regra 4: isolar atrás de interface
 * pra trocar de provedor sem reescrever o checkout).
 */
export interface ShippingProvider {
  quote(input: ShippingQuoteInput): Promise<ShippingOption[]>;
}
