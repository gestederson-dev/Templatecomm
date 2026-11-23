// Montagem de uma confirmação de pedido no admin: valida o que veio do formulário e
// calcula as formas de pagamento no servidor (o valor do cartão nunca vem pronto do navegador).
import { formatBRL } from "@/lib/format";

export type DraftItem = {
  name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  image_url?: string;
};
export type DraftPaymentOption = {
  id: string;
  label: string;
  amount: number;
  note?: string;
};

export type PaymentConfig = {
  pix: boolean;
  card: boolean;
  cardInstallments: number;
  /** taxa da maquininha em %, ex.: 7.57 */
  cardRate: number;
  entrada: boolean;
};

export type ConfirmationDraft = {
  customer_label: string;
  items: DraftItem[];
  payment: PaymentConfig;
  notes: string;
};

export const DEFAULT_CARD_RATE = 7.57;
export const DEFAULT_CARD_INSTALLMENTS = 5;
export const DEFAULT_NOTES = "Frete e prazo de entrega: a combinar.";

const round2 = (value: number) => Math.round(value * 100) / 100;

export function draftTotal(items: Pick<DraftItem, "quantity" | "unit_price">[]): number {
  return round2(items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0));
}

/** Mesma conta da maquininha: total ÷ (1 − taxa). R$ 1.995,00 a 7,57% vira R$ 2.158,39. */
export function cardTotal(total: number, ratePercent: number): number {
  return round2(total / (1 - ratePercent / 100));
}

export function buildPaymentOptions(total: number, config: PaymentConfig): DraftPaymentOption[] {
  const options: DraftPaymentOption[] = [];
  if (config.pix) options.push({ id: "pix", label: "Pix à vista", amount: round2(total) });
  if (config.card) {
    const amount = cardTotal(total, config.cardRate);
    const n = config.cardInstallments;
    options.push(
      n > 1
        ? {
            id: "cartao",
            label: `Cartão de crédito em até ${n}x`,
            amount,
            note: `${n}x de ${formatBRL(round2(amount / n))}`,
          }
        : { id: "cartao", label: "Cartão de crédito à vista", amount },
    );
  }
  if (config.entrada) {
    const half = round2(total / 2);
    const rest = round2(total - half);
    options.push({
      id: "entrada",
      label: "50% de entrada",
      amount: half,
      note: `${formatBRL(half)} agora e ${formatBRL(rest)} na entrega`,
    });
  }
  return options;
}

/** Caminho que a página pública consegue exibir: arquivo em /public ou imagem pública do Storage do projeto. */
export function isAllowedImageUrl(url: string, supabaseUrl: string | undefined): boolean {
  if (/^\/[\w\-./]+\.(jpe?g|png|webp)$/i.test(url) && !url.includes("..")) return true;
  if (!supabaseUrl) return false;
  return url.startsWith(`${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/`);
}

/** Lê a configuração de pagamento de uma confirmação já salva (para editar). */
export function paymentConfigFromOptions(total: number, options: DraftPaymentOption[]): PaymentConfig {
  const card = options.find((o) => o.id === "cartao");
  const installments = card ? Number(card.label.match(/(\d+)x/)?.[1] ?? 1) : DEFAULT_CARD_INSTALLMENTS;
  const rate = card && card.amount > 0 && total > 0 ? Math.round((1 - total / card.amount) * 10000) / 100 : DEFAULT_CARD_RATE;
  return {
    pix: options.some((o) => o.id === "pix"),
    card: Boolean(card),
    cardInstallments: installments,
    cardRate: rate,
    entrada: options.some((o) => o.id === "entrada"),
  };
}

export type DraftResult =
  | {
      ok: true;
      value: {
        customer_label: string;
        items: DraftItem[];
        payment_options: DraftPaymentOption[];
        notes: string | null;
      };
    }
  | { ok: false; error: string };

export function validateDraft(raw: unknown, supabaseUrl: string | undefined): DraftResult {
  const draft = raw as Partial<ConfirmationDraft> | null;
  if (!draft || typeof draft !== "object") return { ok: false, error: "Dados inválidos." };

  const label = String(draft.customer_label ?? "").trim();
  if (!label) return { ok: false, error: "Informe o nome do cliente." };
  if (label.length > 120) return { ok: false, error: "Nome do cliente muito longo." };

  if (!Array.isArray(draft.items) || draft.items.length === 0) return { ok: false, error: "Adicione ao menos um produto." };
  if (draft.items.length > 30) return { ok: false, error: "Itens demais." };

  const items: DraftItem[] = [];
  for (const [index, rawItem] of draft.items.entries()) {
    const n = index + 1;
    const name = String(rawItem?.name ?? "").trim();
    const description = String(rawItem?.description ?? "").trim();
    const quantity = Number(rawItem?.quantity);
    const unitPrice = Number(rawItem?.unit_price);
    const imageUrl = String(rawItem?.image_url ?? "").trim();
    if (!name) return { ok: false, error: `Informe o nome do produto ${n}.` };
    if (!Number.isInteger(quantity) || quantity <= 0)
      return {
        ok: false,
        error: `Quantidade do produto ${n} precisa ser um número inteiro maior que zero.`,
      };
    if (!Number.isFinite(unitPrice) || unitPrice <= 0)
      return {
        ok: false,
        error: `Preço do produto ${n} precisa ser maior que zero.`,
      };
    if (imageUrl && !isAllowedImageUrl(imageUrl, supabaseUrl))
      return {
        ok: false,
        error: `A foto do produto ${n} não é válida. Envie a foto de novo.`,
      };
    items.push({
      name,
      ...(description ? { description } : {}),
      quantity,
      unit_price: round2(unitPrice),
      ...(imageUrl ? { image_url: imageUrl } : {}),
    });
  }

  const p = draft.payment;
  if (!p || (!p.pix && !p.card && !p.entrada)) return { ok: false, error: "Marque ao menos uma forma de pagamento." };
  const installments = Number(p.cardInstallments);
  const rate = Number(p.cardRate);
  if (p.card) {
    if (!Number.isInteger(installments) || installments < 1 || installments > 12) return { ok: false, error: "Parcelas do cartão: de 1 a 12." };
    if (!Number.isFinite(rate) || rate < 0 || rate >= 50) return { ok: false, error: "Taxa da maquininha inválida." };
  }

  const total = draftTotal(items);
  const payment_options = buildPaymentOptions(total, {
    pix: Boolean(p.pix),
    card: Boolean(p.card),
    cardInstallments: installments,
    cardRate: rate,
    entrada: Boolean(p.entrada),
  });

  const notes = String(draft.notes ?? "").trim();
  return {
    ok: true,
    value: {
      customer_label: label,
      items,
      payment_options,
      notes: notes || null,
    },
  };
}
