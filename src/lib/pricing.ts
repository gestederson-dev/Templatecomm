/**
 * Motor de cálculo da calculadora de precificação. Funções puras, sem I/O —
 * quem busca dados no banco (settings, custo do produto) fica nas actions/
 * server components; este módulo só recebe números e devolve números.
 *
 * Convenção de dinheiro deste projeto: `number` em reais (numeric(10,2) no
 * banco), não centavos — segue o padrão já usado em todo o resto do
 * salmar-brindes. Arredondamento (`round2`) é aplicado só no valor final de
 * cada linha do breakdown, nunca em passos intermediários.
 */

export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export type CardRelease = "d0" | "d14" | "d30";

export type PaymentMethodScenario = { kind: "pix" } | { kind: "boleto" } | { kind: "card"; release: CardRelease; installments: number };

export type PricingSettings = {
  fixedCosts: { label: string; amount: number }[];
  dasMonthly: number;
  monthlyVolumeEstimate: number;
  fixedCostAllocationMode: "per_unit" | "percent_revenue";
  avgTicketEstimate: number | null;
  targetMonthlyProlabore: number | null;
  workableHoursMonth: number | null;
  hourlyRate: number;
  pixFeePct: number;
  boletoFeeFixed: number;
  cardFeeD0Pct: number;
  cardFeeD14Pct: number;
  cardFeeD30Pct: number;
  cardReleaseDefault: CardRelease;
  /** chave = número de parcelas ("2".."12"), valor = acréscimo em pontos percentuais */
  installmentFees: Record<string, number>;
  installmentMode: "seller_absorbs" | "buyer_pays";
  paymentMix: { pix: number; card: number; boleto: number };
  defectRatePct: number;
  returnRatePct: number;
  minimumMarginPct: number;
  meiAnnualCeiling: number;
  /** alíquota do Simples Nacional simulada pro cenário "e se eu desenquadrar do MEI" — informativo, não entra nas fórmulas do módulo */
  simulatedSimplesRatePct: number | null;
};

export type ProductCost = {
  blankCost: number;
  customizationInputCost: number;
  productionMinutes: number;
  setupMinutes: number;
  machineMinutes: number;
  machineHourlyCost: number;
  packagingUnitCost: number;
  packagingOrderCost: number;
  complexityFactor: number;
};

export type UnitCostBreakdown = {
  blank: number;
  customization: number;
  labor: number;
  machine: number;
  packagingUnit: number;
  setupPerUnit: number;
  defectAdjustment: number;
  fixedAllocated: number;
  /** soma das linhas acima, já arredondadas — nunca é um total arredondado "à parte" */
  total: number;
};

/** Deriva valor-hora a partir de uma meta de pró-labore, pra tela de configuração sugerir em vez de pedir um número solto. */
export function deriveHourlyRate(targetMonthlyProlabore: number | null, workableHoursMonth: number | null): number | null {
  if (!targetMonthlyProlabore || !workableHoursMonth || workableHoursMonth <= 0) return null;
  return round2(targetMonthlyProlabore / workableHoursMonth);
}

function sumFixedCosts(items: { label: string; amount: number }[]): number {
  return items.reduce((sum, item) => sum + (item.amount || 0), 0);
}

function calcFixedAllocation(totalFixedMonthly: number, settings: PricingSettings, referencePrice: number | undefined): number {
  const volume = settings.monthlyVolumeEstimate;
  if (volume <= 0) return 0;

  if (settings.fixedCostAllocationMode === "percent_revenue" && settings.avgTicketEstimate && settings.avgTicketEstimate > 0 && referencePrice) {
    const pctOfRevenue = totalFixedMonthly / (volume * settings.avgTicketEstimate);
    return referencePrice * pctOfRevenue;
  }

  // per_unit (padrão) — e também o fallback do modo percent_revenue quando falta avgTicketEstimate ou referencePrice
  return totalFixedMonthly / volume;
}

/**
 * Monta o custo total por unidade — o "waterfall" que a tela mostra: produto
 * branco, personalização, mão de obra, máquina, embalagem, diluição do setup
 * do pedido, ajuste de refugo e rateio de custo fixo.
 */
export function calcUnitCost(params: { productCost: ProductCost; settings: PricingSettings; quantityInOrder: number; referencePrice?: number }): UnitCostBreakdown {
  const { productCost, settings } = params;
  const qty = Math.max(params.quantityInOrder, 1);
  const cf = productCost.complexityFactor || 1;

  const blank = round2(productCost.blankCost);
  const customization = round2(productCost.customizationInputCost * cf);
  const labor = round2((productCost.productionMinutes / 60) * settings.hourlyRate * cf);
  const machine = round2((productCost.machineMinutes / 60) * productCost.machineHourlyCost * cf);
  const packagingUnit = round2(productCost.packagingUnitCost);

  const setupTotal = (productCost.setupMinutes / 60) * settings.hourlyRate + productCost.packagingOrderCost;
  const setupPerUnit = round2(setupTotal / qty);

  const subtotal = blank + customization + labor + machine + packagingUnit + setupPerUnit;

  const defectRate = Math.min(Math.max(settings.defectRatePct, 0), 99.99);
  const afterDefect = round2(subtotal / (1 - defectRate / 100));
  const defectAdjustment = round2(afterDefect - subtotal);

  const totalFixedMonthly = sumFixedCosts(settings.fixedCosts) + settings.dasMonthly;
  const fixedAllocated = round2(calcFixedAllocation(totalFixedMonthly, settings, params.referencePrice));

  const total = round2(blank + customization + labor + machine + packagingUnit + setupPerUnit + defectAdjustment + fixedAllocated);

  return { blank, customization, labor, machine, packagingUnit, setupPerUnit, defectAdjustment, fixedAllocated, total };
}

/** Taxa (percentual + fixa) do Mercado Pago pro cenário de pagamento escolhido. */
export function resolvePaymentFee(settings: PricingSettings, scenario: PaymentMethodScenario): { pct: number; fixedFee: number } {
  if (scenario.kind === "pix") return { pct: settings.pixFeePct, fixedFee: 0 };
  if (scenario.kind === "boleto") return { pct: 0, fixedFee: settings.boletoFeeFixed };

  const releasePct = { d0: settings.cardFeeD0Pct, d14: settings.cardFeeD14Pct, d30: settings.cardFeeD30Pct }[scenario.release];

  if (scenario.installments <= 1) return { pct: releasePct, fixedFee: 0 };

  // parcelado comprador: o acréscimo do parcelamento é pago pelo cliente, não sai da margem da loja.
  if (settings.installmentMode === "buyer_pays") return { pct: releasePct, fixedFee: 0 };

  const installmentPct = settings.installmentFees[String(scenario.installments)] ?? 0;
  return { pct: releasePct + installmentPct, fixedFee: 0 };
}

/** Preço mínimo pra lucro zero. Divide pelo complemento da taxa — nunca soma a taxa ao custo. */
export function calcPriceFloor(unitCost: number, feePct: number, fixedFee = 0): number {
  const feeFraction = feePct / 100;
  if (feeFraction >= 1) return Infinity;
  return round2((unitCost + fixedFee) / (1 - feeFraction));
}

/** Preço pra atingir uma margem líquida desejada (sobre o preço, não markup sobre custo). */
export function calcTargetPrice(unitCost: number, feePct: number, fixedFee: number, marginPct: number): number {
  const denom = 1 - feePct / 100 - marginPct / 100;
  if (denom <= 0) return Infinity;
  return round2((unitCost + fixedFee) / denom);
}

export type MarginResult = { feeAmount: number; profit: number; marginPct: number; markupPct: number };

/** Dado o preço praticado, quanto sobra de lucro e qual a margem/markup real. */
export function calcMarginFromPrice(price: number, unitCost: number, feePct: number, fixedFee = 0): MarginResult {
  const feeAmount = round2(price * (feePct / 100) + fixedFee);
  const profit = round2(price - unitCost - feeAmount);
  const marginPct = price > 0 ? round2((profit / price) * 100) : 0;
  const markupPct = unitCost > 0 ? round2((profit / unitCost) * 100) : 0;
  return { feeAmount, profit, marginPct, markupPct };
}

/** markup e margem confundem — conversão explícita entre os dois. */
export function marginFromMarkup(markupPct: number): number {
  const m = markupPct / 100;
  return round2((m / (1 + m)) * 100);
}

export function markupFromMargin(marginPct: number): number {
  const m = marginPct / 100;
  if (m >= 1) return Infinity;
  return round2((m / (1 - m)) * 100);
}

/** Ponto de equilíbrio mensal, em unidades e em faturamento, pro preço avaliado. */
export function calcBreakEven(fixedCostsMonthly: number, contributionMarginUnit: number, price: number): { units: number; revenue: number } {
  if (contributionMarginUnit <= 0) return { units: Infinity, revenue: Infinity };
  const units = Math.ceil(fixedCostsMonthly / contributionMarginUnit);
  return { units, revenue: round2(units * price) };
}

/** Quanto um pedido/a receita acumulada consome do teto anual do MEI. */
export function calcMeiCeilingUsage(params: { orderRevenue: number; annualRevenueSoFar: number; ceiling: number }): { orderPctOfCeiling: number; accumulatedPctOfCeiling: number; remaining: number } {
  const { orderRevenue, annualRevenueSoFar, ceiling } = params;
  return {
    orderPctOfCeiling: ceiling > 0 ? round2((orderRevenue / ceiling) * 100) : 0,
    accumulatedPctOfCeiling: ceiling > 0 ? round2((annualRevenueSoFar / ceiling) * 100) : 0,
    remaining: round2(ceiling - annualRevenueSoFar),
  };
}

export type PriceTier = { minQuantity: number; maxQuantity: number | null; unitPrice: number };

export type TierValidationResult = {
  minQuantity: number;
  maxQuantity: number | null;
  unitPrice: number;
  floorAtMinQuantity: number;
  marginAtMinQuantity: number;
  status: "ok" | "warning" | "loss";
};

/**
 * Avalia cada faixa de price_tiers na quantidade MÍNIMA (onde o setup está
 * menos diluído e a margem é pior) e sinaliza faixas fora de ordem ou com
 * "cliff" de lucro (comprar mais dá menos lucro total pra loja que comprar
 * menos).
 */
export function validatePriceTiers(params: { tiers: PriceTier[]; productCost: ProductCost; settings: PricingSettings; feePct: number; fixedFee?: number; minimumMarginPct?: number }): {
  results: TierValidationResult[];
  monotonic: boolean;
  profitCliff: boolean;
} {
  const { tiers, productCost, settings, feePct, fixedFee = 0 } = params;
  const minimumMarginPct = params.minimumMarginPct ?? settings.minimumMarginPct;

  const results: TierValidationResult[] = tiers.map((tier) => {
    const unitCost = calcUnitCost({ productCost, settings, quantityInOrder: tier.minQuantity, referencePrice: tier.unitPrice }).total;
    const floor = calcPriceFloor(unitCost, feePct, fixedFee);
    const margin = calcMarginFromPrice(tier.unitPrice, unitCost, feePct, fixedFee);
    const status: TierValidationResult["status"] = tier.unitPrice < floor ? "loss" : margin.marginPct < minimumMarginPct ? "warning" : "ok";
    return { minQuantity: tier.minQuantity, maxQuantity: tier.maxQuantity, unitPrice: tier.unitPrice, floorAtMinQuantity: floor, marginAtMinQuantity: margin.marginPct, status };
  });

  const monotonic = tiers.every((tier, i) => i === 0 || tier.unitPrice <= tiers[i - 1].unitPrice);

  let profitCliff = false;
  for (let i = 0; i < tiers.length - 1; i++) {
    const current = tiers[i];
    const next = tiers[i + 1];
    if (current.maxQuantity == null) continue;

    const profitAtMaxOfCurrent =
      calcMarginFromPrice(current.unitPrice, calcUnitCost({ productCost, settings, quantityInOrder: current.maxQuantity, referencePrice: current.unitPrice }).total, feePct, fixedFee).profit *
      current.maxQuantity;
    const profitAtMinOfNext =
      calcMarginFromPrice(next.unitPrice, calcUnitCost({ productCost, settings, quantityInOrder: next.minQuantity, referencePrice: next.unitPrice }).total, feePct, fixedFee).profit * next.minQuantity;

    if (profitAtMaxOfCurrent > profitAtMinOfNext) profitCliff = true;
  }

  return { results, monotonic, profitCliff };
}

export const STANDARD_PAYMENT_SCENARIOS: { label: string; scenario: PaymentMethodScenario }[] = [
  { label: "Pix", scenario: { kind: "pix" } },
  { label: "Cartão à vista", scenario: { kind: "card", release: "d14", installments: 1 } },
  { label: "Cartão 3x sem juros", scenario: { kind: "card", release: "d14", installments: 3 } },
  { label: "Cartão 6x sem juros", scenario: { kind: "card", release: "d14", installments: 6 } },
  { label: "Cartão 12x sem juros", scenario: { kind: "card", release: "d14", installments: 12 } },
  { label: "Boleto", scenario: { kind: "boleto" } },
];

export type PaymentScenarioComparison = MarginResult & { label: string; feePct: number; fixedFee: number; floor: number; belowFloor: boolean };

/** Tabela comparativa: mesmo produto, mesmo preço, piso e margem por meio de pagamento. */
export function comparePaymentScenarios(params: { unitCost: number; price: number; settings: PricingSettings }): PaymentScenarioComparison[] {
  return STANDARD_PAYMENT_SCENARIOS.map(({ label, scenario }) => {
    const fee = resolvePaymentFee(params.settings, scenario);
    const floor = calcPriceFloor(params.unitCost, fee.pct, fee.fixedFee);
    const margin = calcMarginFromPrice(params.price, params.unitCost, fee.pct, fee.fixedFee);
    return { label, feePct: fee.pct, fixedFee: fee.fixedFee, floor, belowFloor: params.price < floor, ...margin };
  });
}

/**
 * Taxa efetiva ponderada pelo mix de pagamento configurado — aproximação
 * (cartão usa a taxa à vista no prazo padrão; boleto tem taxa fixa, não
 * percentual, e por isso pesa como 0% aqui). Serve como um "custo médio de
 * taxa" pra visão geral, não substitui o comparativo por cenário.
 */
export function calcWeightedFeePct(settings: PricingSettings): number {
  const { pix, card, boleto } = settings.paymentMix;
  const totalWeight = (pix || 0) + (card || 0) + (boleto || 0);
  if (totalWeight <= 0) return 0;

  const cardFee = resolvePaymentFee(settings, { kind: "card", release: settings.cardReleaseDefault, installments: 1 }).pct;
  const weighted = ((pix || 0) * settings.pixFeePct + (card || 0) * cardFee) / totalWeight;
  return round2(weighted);
}
