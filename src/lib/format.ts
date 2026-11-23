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

/** 45991348838 → (45) 99134-8838. Devolve como veio se não tiver 10 ou 11 dígitos. */
export function formatPhoneBR(value: string | null | undefined): string {
  const digits = (value ?? "").replace(/\D/g, "");
  if (digits.length === 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  if (digits.length === 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return value ?? "";
}

/** 85825000 → 85825-000 */
export function formatCEP(value: string | null | undefined): string {
  const digits = (value ?? "").replace(/\D/g, "");
  return digits.length === 8 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : (value ?? "");
}

/** Link do WhatsApp para um celular brasileiro (adiciona o 55). */
export function whatsappLink(phone: string | null | undefined, text?: string): string {
  const digits = (phone ?? "").replace(/\D/g, "");
  const number = digits.length === 10 || digits.length === 11 ? `55${digits}` : digits;
  return `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
