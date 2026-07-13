import { createClient } from "@/lib/supabase/server";
import type { Order, Profile, Quote } from "@/lib/types";

export async function getAdminCustomers(): Promise<Profile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("profiles").select("*").eq("role", "customer").order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getAdminCustomerDetail(id: string): Promise<{ profile: Profile; orders: Order[]; quotes: Quote[] } | null> {
  const supabase = await createClient();

  const { data: profile, error: profileError } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  if (profileError || !profile) return null;

  const [{ data: orders }, { data: quotes }] = await Promise.all([
    supabase.from("orders").select("*").eq("profile_id", id).order("created_at", { ascending: false }),
    supabase.from("quotes").select("*").eq("profile_id", id).order("created_at", { ascending: false }),
  ]);

  return { profile, orders: orders ?? [], quotes: quotes ?? [] };
}
