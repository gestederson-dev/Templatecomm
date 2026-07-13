import { createClient } from "@/lib/supabase/server";
import type { Order, OrderWithItems } from "@/lib/types";

export async function getOrderByNumber(orderNumber: string): Promise<OrderWithItems | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("orders").select("*, order_items(*)").eq("order_number", orderNumber).maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const { order_items, ...order } = data as Order & { order_items: OrderWithItems["items"] };
  return { ...order, items: order_items ?? [] };
}

export async function getMyOrders(): Promise<Order[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase.from("orders").select("*").eq("profile_id", user.id).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
