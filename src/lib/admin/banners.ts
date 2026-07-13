import { createClient } from "@/lib/supabase/server";
import type { Banner } from "@/lib/types";

export async function getAdminBanners(): Promise<Banner[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("banners").select("*").order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}
