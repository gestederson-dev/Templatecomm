"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { error: string } | undefined;

export async function saveCouponAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const type = String(formData.get("type") ?? "percent");
  const value = Number(formData.get("value") ?? 0);
  const minOrderRaw = String(formData.get("minOrder") ?? "").trim();
  const usageLimitRaw = String(formData.get("usageLimit") ?? "").trim();
  const validUntil = String(formData.get("validUntil") ?? "").trim();

  if (!code) return { error: "Informe o código do cupom." };
  if (!value || value <= 0) return { error: "Informe um valor válido." };

  const supabase = await createClient();
  const { error } = await supabase.from("coupons").insert({
    code,
    type,
    value,
    min_order: minOrderRaw ? Number(minOrderRaw) : 0,
    usage_limit: usageLimitRaw ? Number(usageLimitRaw) : null,
    valid_until: validUntil || null,
  });

  if (error) return { error: error.message.includes("duplicate") ? "Já existe um cupom com esse código." : error.message };

  revalidatePath("/admin/cupons");
  return undefined;
}

export async function toggleCouponActiveAction(id: string, isActive: boolean): Promise<void> {
  const supabase = await createClient();
  await supabase.from("coupons").update({ is_active: isActive }).eq("id", id);
  revalidatePath("/admin/cupons");
}
