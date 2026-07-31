import { describe, expect, it } from "vitest";
import {
  calcBreakEven,
  calcMarginFromPrice,
  calcMeiCeilingUsage,
  calcPriceFloor,
  calcUnitCost,
  markupFromMargin,
  marginFromMarkup,
  resolvePaymentFee,
  validatePriceTiers,
  type PriceTier,
  type PricingSettings,
  type ProductCost,
} from "./pricing";

const settings: PricingSettings = {
  fixedCosts: [{ label: "Hospedagem", amount: 100 }, { label: "Assinaturas", amount: 200 }],
  dasMonthly: 87.05,
  monthlyVolumeEstimate: 250,
  fixedCostAllocationMode: "per_unit",
  avgTicketEstimate: null,
  targetMonthlyProlabore: 4000,
  workableHoursMonth: 160,
  hourlyRate: 50,
  pixFeePct: 0.99,
  boletoFeeFixed: 3.49,
  cardFeeD0Pct: 4.99,
  cardFeeD14Pct: 4.49,
  cardFeeD30Pct: 3.99,
  cardReleaseDefault: "d14",
  installmentFees: { "2": 2.03, "3": 4.06, "6": 8.92, "12": 14.8 },
  installmentMode: "seller_absorbs",
  paymentMix: { pix: 45, card: 40, boleto: 15 },
  defectRatePct: 5,
  returnRatePct: 0,
  minimumMarginPct: 15,
  meiAnnualCeiling: 81000,
  simulatedSimplesRatePct: null,
  packagingExtras: [],
};

const productCost: ProductCost = {
  blankCost: 12,
  customizationInputCost: 1.5,
  productionMinutes: 6,
  setupMinutes: 20,
  machineMinutes: 6,
  machineHourlyCost: 15,
  packagingUnitCost: 3.5,
  packagingOrderCost: 0,
  complexityFactor: 1,
};

describe("calcUnitCost", () => {
  it("soma das linhas do breakdown bate com o total, ao centavo", () => {
    const result = calcUnitCost({ productCost, settings, quantityInOrder: 1 });
    const sumOfParts = result.blank + result.customization + result.labor + result.machine + result.packagingUnit + result.setupPerUnit + result.defectAdjustment + result.fixedAllocated;
    expect(Math.round(sumOfParts * 100)).toBe(Math.round(result.total * 100));
  });

  it("refugo 0% não altera o custo (sem ajuste)", () => {
    const semRefugo = calcUnitCost({ productCost, settings: { ...settings, defectRatePct: 0 }, quantityInOrder: 1 });
    expect(semRefugo.defectAdjustment).toBe(0);
  });

  it("mais unidades no pedido dilui o setup por unidade", () => {
    const poucaQtd = calcUnitCost({ productCost: { ...productCost, setupMinutes: 60 }, settings, quantityInOrder: 1 });
    const muitaQtd = calcUnitCost({ productCost: { ...productCost, setupMinutes: 60 }, settings, quantityInOrder: 100 });
    expect(muitaQtd.setupPerUnit).toBeLessThan(poucaQtd.setupPerUnit);
  });

  it("extra de embalagem por unidade (cartão) soma igual em qualquer quantidade", () => {
    const comExtras: PricingSettings = { ...settings, packagingExtras: [{ label: "Cartão", amount: 0.5, per: "unit" }] };
    const qty1 = calcUnitCost({ productCost, settings: comExtras, quantityInOrder: 1 });
    const qty10 = calcUnitCost({ productCost, settings: comExtras, quantityInOrder: 10 });
    expect(qty1.packagingExtras).toBeCloseTo(0.5, 2);
    expect(qty10.packagingExtras).toBeCloseTo(0.5, 2);
  });

  it("extra de embalagem por pedido (lembrancinha) dilui com a quantidade", () => {
    const comExtras: PricingSettings = { ...settings, packagingExtras: [{ label: "Lembrancinha", amount: 5, per: "order" }] };
    const qty1 = calcUnitCost({ productCost, settings: comExtras, quantityInOrder: 1 });
    const qty10 = calcUnitCost({ productCost, settings: comExtras, quantityInOrder: 10 });
    expect(qty1.packagingExtras).toBeCloseTo(5, 2);
    expect(qty10.packagingExtras).toBeCloseTo(0.5, 2);
  });
});

describe("calcPriceFloor + calcMarginFromPrice", () => {
  it("preço mínimo aplicado de volta na fórmula resulta em lucro ~zero", () => {
    const unitCost = 28.27;
    const feePct = 13.41;
    const floor = calcPriceFloor(unitCost, feePct);
    const margin = calcMarginFromPrice(floor, unitCost, feePct);
    expect(Math.abs(margin.profit)).toBeLessThanOrEqual(0.01);
  });

  it("taxa fixa de boleto entra no piso mesmo sem taxa percentual", () => {
    const floor = calcPriceFloor(20, 0, 3.49);
    expect(floor).toBe(23.49);
  });

  it("dividir pelo complemento da taxa (não somar) — regressão do erro mais comum de precificação", () => {
    const unitCost = 100;
    const feePct = 20;
    const floorErrado = round2ForTest(unitCost * 1.2); // erro comum: somar a taxa
    const floorCerto = calcPriceFloor(unitCost, feePct);
    expect(floorCerto).not.toBe(floorErrado);
    expect(floorCerto).toBe(125);
  });
});

describe("margem vs markup", () => {
  it("markup de 30% não é o mesmo que margem de 30%", () => {
    const unitCost = 100;
    const price = unitCost * 1.3; // markup 30%
    const margin = calcMarginFromPrice(price, unitCost, 0, 0);
    expect(margin.marginPct).toBeCloseTo(23.08, 1);
  });

  it("margem <-> markup convertem um no outro sem drift", () => {
    for (const markup of [10, 30, 50, 100, 200]) {
      const margin = marginFromMarkup(markup);
      const backToMarkup = markupFromMargin(margin);
      expect(backToMarkup).toBeCloseTo(markup, 1);
    }
  });
});

describe("resolvePaymentFee", () => {
  it("parcelado vendedor soma taxa de prazo + taxa de parcelamento", () => {
    const fee = resolvePaymentFee(settings, { kind: "card", release: "d14", installments: 6 });
    expect(fee.pct).toBeCloseTo(settings.cardFeeD14Pct + settings.installmentFees["6"], 2);
  });

  it("parcelado comprador não soma o acréscimo de parcelamento (cliente paga)", () => {
    const buyerPaysSettings: PricingSettings = { ...settings, installmentMode: "buyer_pays" };
    const fee = resolvePaymentFee(buyerPaysSettings, { kind: "card", release: "d14", installments: 6 });
    expect(fee.pct).toBe(settings.cardFeeD14Pct);
  });

  it("Pix e boleto têm naturezas de taxa diferentes (percentual vs. fixa)", () => {
    expect(resolvePaymentFee(settings, { kind: "pix" })).toEqual({ pct: settings.pixFeePct, fixedFee: 0 });
    expect(resolvePaymentFee(settings, { kind: "boleto" })).toEqual({ pct: 0, fixedFee: settings.boletoFeeFixed });
  });
});

describe("calcBreakEven", () => {
  it("margem de contribuição zero ou negativa nunca atinge o equilíbrio", () => {
    expect(calcBreakEven(1000, 0, 50).units).toBe(Infinity);
    expect(calcBreakEven(1000, -5, 50).units).toBe(Infinity);
  });

  it("break-even cobre exatamente os custos fixos", () => {
    const { units } = calcBreakEven(900, 15, 45.9);
    expect(units * 15).toBeGreaterThanOrEqual(900);
    expect((units - 1) * 15).toBeLessThan(900);
  });
});

describe("calcMeiCeilingUsage", () => {
  it("um pedido grande consome uma fatia visível do teto anual", () => {
    const usage = calcMeiCeilingUsage({ orderRevenue: 17500, annualRevenueSoFar: 0, ceiling: 81000 });
    expect(usage.orderPctOfCeiling).toBeCloseTo(21.6, 1);
  });
});

describe("validatePriceTiers", () => {
  const tiers: PriceTier[] = [
    { minQuantity: 50, maxQuantity: 99, unitPrice: 40 },
    { minQuantity: 100, maxQuantity: 299, unitPrice: 35 },
    { minQuantity: 300, maxQuantity: null, unitPrice: 30 },
  ];

  it("detecta faixa fora de ordem (preço subindo com o volume)", () => {
    const tiersQuebrados: PriceTier[] = [
      { minQuantity: 50, maxQuantity: 99, unitPrice: 30 },
      { minQuantity: 100, maxQuantity: null, unitPrice: 35 },
    ];
    const { monotonic } = validatePriceTiers({ tiers: tiersQuebrados, productCost, settings, feePct: 5 });
    expect(monotonic).toBe(false);
  });

  it("faixas em ordem decrescente de preço passam na checagem de monotonicidade", () => {
    const { monotonic } = validatePriceTiers({ tiers, productCost, settings, feePct: 5 });
    expect(monotonic).toBe(true);
  });

  it("marca como prejuízo uma faixa com preço abaixo do piso", () => {
    const tiersCaros: PriceTier[] = [{ minQuantity: 50, maxQuantity: null, unitPrice: 1 }];
    const { results } = validatePriceTiers({ tiers: tiersCaros, productCost, settings, feePct: 5 });
    expect(results[0].status).toBe("loss");
  });
});

function round2ForTest(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
