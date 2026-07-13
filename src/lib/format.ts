const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatBRL(value: number): string {
  return currencyFormatter.format(value);
}

export function formatPriceRange(basePrice: number | null, priceTiersMinPrice?: number | null): string {
  if (basePrice !== null) return formatBRL(basePrice);
  if (priceTiersMinPrice != null) return `a partir de ${formatBRL(priceTiersMinPrice)}`;
  return "Sob consulta";
}
