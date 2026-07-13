import { createClient } from "@/lib/supabase/server";
import type { Coupon } from "@/lib/types";

export async function getAdminCoupons(): Promise<Coupon[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("coupons").select("*").order("code", { ascending: true });
  if (error) throw error;
  return data ?? [];
}
