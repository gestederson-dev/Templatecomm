"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { error: string } | { success: true } | undefined;

function num(formData: FormData, name: string, fallback = 0): number {
  const raw = formData.get(name);
  if (raw == null || raw === "") return fallback;
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

function numOrNull(formData: FormData, name: string): number | null {
  const raw = formData.get(name);
  if (raw == null || raw === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export async function savePricingSettingsAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  let fixedCosts: { label: string; amount: number }[] = [];
  try {
    fixedCosts = JSON.parse(String(formData.get("fixedCostsJson") ?? "[]"));
  } catch {
    return { error: "Lista de custos fixos inválida." };
  }

  let packagingExtras: { label: string; amount: number; per: "unit" | "order" }[] = [];
  try {
    packagingExtras = JSON.parse(String(formData.get("packagingExtrasJson") ?? "[]"));
  } catch {
    return { error: "Lista de itens de embalagem inválida." };
  }

  const installmentFees: Record<string, number> = {};
  for (let n = 2; n <= 12; n++) {
    const value = num(formData, `installment_${n}`, NaN);
    if (Number.isFinite(value)) installmentFees[String(n)] = value;
  }

  const payload = {
    fixed_costs: fixedCosts.filter((item) => item.label.trim().length > 0),
    das_monthly: num(formData, "dasMonthly", 87.05),
    monthly_volume_estimate: Math.max(0, Math.round(num(formData, "monthlyVolumeEstimate", 0))),
    fixed_cost_allocation_mode: formData.get("fixedCostAllocationMode") === "percent_revenue" ? "percent_revenue" : "per_unit",
    avg_ticket_estimate: numOrNull(formData, "avgTicketEstimate"),
    target_monthly_prolabore: numOrNull(formData, "targetMonthlyProlabore"),
    workable_hours_month: numOrNull(formData, "workableHoursMonth"),
    hourly_rate: num(formData, "hourlyRate", 0),
    pix_fee_pct: num(formData, "pixFeePct", 0.99),
    boleto_fee_fixed: num(formData, "boletoFeeFixed", 3.49),
    card_fee_d0_pct: num(formData, "cardFeeD0Pct", 4.99),
    card_fee_d14_pct: num(formData, "cardFeeD14Pct", 4.49),
    card_fee_d30_pct: num(formData, "cardFeeD30Pct", 3.99),
    card_release_default: ["d0", "d14", "d30"].includes(String(formData.get("cardReleaseDefault"))) ? String(formData.get("cardReleaseDefault")) : "d14",
    installment_fees: installmentFees,
    installment_mode: formData.get("installmentMode") === "buyer_pays" ? "buyer_pays" : "seller_absorbs",
    payment_mix: {
      pix: num(formData, "mixPix", 0),
      card: num(formData, "mixCard", 0),
      boleto: num(formData, "mixBoleto", 0),
    },
    defect_rate_pct: num(formData, "defectRatePct", 0),
    return_rate_pct: num(formData, "returnRatePct", 0),
    minimum_margin_pct: num(formData, "minimumMarginPct", 15),
    mei_annual_ceiling: num(formData, "meiAnnualCeiling", 81000),
    simulated_simples_rate_pct: numOrNull(formData, "simulatedSimplesRatePct"),
    packaging_extras: packagingExtras.filter((item) => item.label.trim().length > 0),
  };

  const supabase = await createClient();
  const { error } = await supabase.from("pricing_settings").update(payload).eq("id", 1);
  if (error) return { error: error.message };

  revalidatePath("/admin/precificacao");
  return { success: true };
}

export async function saveProductCostAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const productId = String(formData.get("productId") ?? "");
  if (!productId) return { error: "Produto não encontrado." };

  const payload = {
    product_id: productId,
    blank_cost: num(formData, "blankCost", 0),
    customization_input_cost: num(formData, "customizationInputCost", 0),
    production_minutes: num(formData, "productionMinutes", 0),
    setup_minutes: num(formData, "setupMinutes", 0),
    machine_minutes: num(formData, "machineMinutes", 0),
    machine_hourly_cost: num(formData, "machineHourlyCost", 0),
    packaging_unit_cost: num(formData, "packagingUnitCost", 0),
    packaging_order_cost: num(formData, "packagingOrderCost", 0),
    complexity_factor: num(formData, "complexityFactor", 1) || 1,
    weight_grams_packed: numOrNull(formData, "weightGramsPacked"),
    packaging_extra_ids: formData.getAll("packagingExtraIds").map(String),
  };

  const supabase = await createClient();
  const { error } = await supabase.from("product_costs").upsert(payload, { onConflict: "product_id" });
  if (error) return { error: error.message };

  revalidatePath(`/admin/produtos/${productId}`);
  revalidatePath("/admin/precificacao");
  return { success: true };
}
