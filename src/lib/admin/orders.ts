import { createClient } from "@/lib/supabase/server";
import type { Order, OrderStatus, OrderWithItems } from "@/lib/types";

export async function getAdminOrders(status?: OrderStatus): Promise<Order[]> {
  const supabase = await createClient();
  let query = supabase.from("orders").select("*").order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getAdminOrderById(id: string): Promise<(OrderWithItems & { profileName: string | null }) | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*), profile:profiles(full_name, company_name)")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const { order_items, profile, ...order } = data as Order & {
    order_items: OrderWithItems["items"];
    profile: { full_name: string | null; company_name: string | null } | null;
  };
  return { ...order, items: order_items ?? [], profileName: profile?.company_name || profile?.full_name || null };
}
