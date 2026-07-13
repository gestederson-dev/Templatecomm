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

export async function getAdminOrderById(id: string): Promise<OrderWithItems | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("orders").select("*, order_items(*)").eq("id", id).maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const { order_items, ...order } = data as Order & { order_items: OrderWithItems["items"] };
  return { ...order, items: order_items ?? [] };
}
