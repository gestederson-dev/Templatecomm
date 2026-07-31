import { createClient } from "@/lib/supabase/server";
import { calcMarginFromPrice, calcPriceFloor, calcUnitCost, calcWeightedFeePct, type PricingSettings, type ProductCost } from "@/lib/pricing";
import type { PriceTier } from "@/lib/types";

type PricingSettingsRow = {
  id: number;
  fixed_costs: { label: string; amount: number }[];
  das_monthly: number;
  monthly_volume_estimate: number;
  fixed_cost_allocation_mode: "per_unit" | "percent_revenue";
  avg_ticket_estimate: number | null;
  target_monthly_prolabore: number | null;
  workable_hours_month: number | null;
  hourly_rate: number;
  pix_fee_pct: number;
  boleto_fee_fixed: number;
  card_fee_d0_pct: number;
  card_fee_d14_pct: number;
  card_fee_d30_pct: number;
  card_release_default: "d0" | "d14" | "d30";
  installment_fees: Record<string, number>;
  installment_mode: "seller_absorbs" | "buyer_pays";
  payment_mix: { pix: number; card: number; boleto: number };
  defect_rate_pct: number;
  return_rate_pct: number;
  minimum_margin_pct: number;
  mei_annual_ceiling: number;
  simulated_simples_rate_pct: number | null;
  packaging_extras: { id: string; label: string; amount: number; per: "unit" | "order" }[];
};

type ProductCostRow = {
  id: string;
  product_id: string;
  blank_cost: number;
  customization_input_cost: number;
  production_minutes: number;
  setup_minutes: number;
  machine_minutes: number;
  machine_hourly_cost: number;
  packaging_unit_cost: number;
  packaging_order_cost: number;
  complexity_factor: number;
  weight_grams_packed: number | null;
  packaging_extra_ids: string[];
};

export function rowToPricingSettings(row: PricingSettingsRow): PricingSettings {
  return {
    fixedCosts: row.fixed_costs ?? [],
    dasMonthly: row.das_monthly,
    monthlyVolumeEstimate: row.monthly_volume_estimate,
    fixedCostAllocationMode: row.fixed_cost_allocation_mode,
    avgTicketEstimate: row.avg_ticket_estimate,
    targetMonthlyProlabore: row.target_monthly_prolabore,
    workableHoursMonth: row.workable_hours_month,
    hourlyRate: row.hourly_rate,
    pixFeePct: row.pix_fee_pct,
    boletoFeeFixed: row.boleto_fee_fixed,
    cardFeeD0Pct: row.card_fee_d0_pct,
    cardFeeD14Pct: row.card_fee_d14_pct,
    cardFeeD30Pct: row.card_fee_d30_pct,
    cardReleaseDefault: row.card_release_default,
    installmentFees: row.installment_fees ?? {},
    installmentMode: row.installment_mode,
    paymentMix: row.payment_mix ?? { pix: 0, card: 0, boleto: 0 },
    defectRatePct: row.defect_rate_pct,
    returnRatePct: row.return_rate_pct,
    minimumMarginPct: row.minimum_margin_pct,
    meiAnnualCeiling: row.mei_annual_ceiling,
    simulatedSimplesRatePct: row.simulated_simples_rate_pct,
    packagingExtras: row.packaging_extras ?? [],
  };
}

const EMPTY_PRODUCT_COST: ProductCost = {
  blankCost: 0,
  customizationInputCost: 0,
  productionMinutes: 0,
  setupMinutes: 0,
  machineMinutes: 0,
  machineHourlyCost: 0,
  packagingUnitCost: 0,
  packagingOrderCost: 0,
  complexityFactor: 1,
  packagingExtraIds: [],
};

export function rowToProductCost(row: ProductCostRow | null): ProductCost {
  if (!row) return EMPTY_PRODUCT_COST;
  return {
    blankCost: row.blank_cost,
    customizationInputCost: row.customization_input_cost,
    productionMinutes: row.production_minutes,
    setupMinutes: row.setup_minutes,
    machineMinutes: row.machine_minutes,
    machineHourlyCost: row.machine_hourly_cost,
    packagingUnitCost: row.packaging_unit_cost,
    packagingOrderCost: row.packaging_order_cost,
    complexityFactor: row.complexity_factor || 1,
    packagingExtraIds: row.packaging_extra_ids ?? [],
  };
}

export async function getPricingSettings(): Promise<PricingSettings> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("pricing_settings").select("*").eq("id", 1).single();
  if (error) throw error;
  return rowToPricingSettings(data as PricingSettingsRow);
}

export async function getProductCost(productId: string): Promise<{ cost: ProductCost; hasCost: boolean; weightGramsPacked: number | null }> {
  const supabase = await createClient();
  const { data } = await supabase.from("product_costs").select("*").eq("product_id", productId).maybeSingle();
  const row = data as ProductCostRow | null;
  return { cost: rowToProductCost(row), hasCost: Boolean(row), weightGramsPacked: row?.weight_grams_packed ?? null };
}

export type PricingProduct = {
  id: string;
  name: string;
  slug: string;
  base_price: number | null;
  price_tiers: PriceTier[];
  cost: ProductCost;
  hasCost: boolean;
};

/** Soma da receita de pedidos já pagos/em andamento neste ano — usada pra mostrar quanto do teto do MEI já foi consumido. */
export async function getAnnualRevenueSoFar(): Promise<number> {
  const supabase = await createClient();
  const yearStart = `${new Date().getFullYear()}-01-01`;

  const { data, error } = await supabase.from("orders").select("total").in("status", ["paid", "processing", "shipped", "delivered"]).gte("created_at", yearStart);
  if (error) throw error;

  return (data ?? []).reduce((sum, row) => sum + Number(row.total), 0);
}

/** Todos os produtos ativos com o custo cadastrado (ou zerado, se ainda não cadastrou) — base do simulador e dos alertas do dashboard. */
export async function getAllProductsWithCosts(): Promise<PricingProduct[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, base_price, is_active, price_tiers(id, product_id, min_quantity, max_quantity, unit_price), product_costs(*)")
    .eq("is_active", true)
    .order("name");
  if (error) throw error;

  return (data ?? []).map((row) => {
    const { product_costs, price_tiers, ...product } = row as typeof row & { product_costs: ProductCostRow[]; price_tiers: PriceTier[] };
    const costRow = product_costs?.[0] ?? null;
    return { ...product, price_tiers: price_tiers ?? [], cost: rowToProductCost(costRow), hasCost: Boolean(costRow) };
  });
}

export type PricingAlert = {
  productId: string;
  name: string;
  basePrice: number;
  floor: number;
  marginPct: number;
  status: "loss" | "warning";
};

/** Produtos vendendo abaixo do preço mínimo (prejuízo) ou com margem abaixo do mínimo aceitável — pro card de alerta do dashboard. */
export async function getPricingAlerts(): Promise<{ alerts: PricingAlert[]; missingCostCount: number }> {
  const [settings, products] = await Promise.all([getPricingSettings(), getAllProductsWithCosts()]);
  const feePct = calcWeightedFeePct(settings);

  const alerts: PricingAlert[] = [];
  let missingCostCount = 0;

  for (const product of products) {
    if (!product.hasCost) {
      missingCostCount += 1;
      continue;
    }
    if (product.base_price == null) continue;

    const unitCost = calcUnitCost({ productCost: product.cost, settings, quantityInOrder: 1, referencePrice: product.base_price });
    const floor = calcPriceFloor(unitCost.total, feePct);
    const margin = calcMarginFromPrice(product.base_price, unitCost.total, feePct);

    if (product.base_price < floor) {
      alerts.push({ productId: product.id, name: product.name, basePrice: product.base_price, floor, marginPct: margin.marginPct, status: "loss" });
    } else if (margin.marginPct < settings.minimumMarginPct) {
      alerts.push({ productId: product.id, name: product.name, basePrice: product.base_price, floor, marginPct: margin.marginPct, status: "warning" });
    }
  }

  alerts.sort((a, b) => {
    if (a.status !== b.status) return a.status === "loss" ? -1 : 1;
    return a.marginPct - b.marginPct;
  });

  return { alerts, missingCostCount };
}
