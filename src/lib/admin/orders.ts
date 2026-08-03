import { createClient } from "@/lib/supabase/server";
import type { Order, OrderStatus, OrderWithItems } from "@/lib/types";

export type AdminOrderListItem = Order & {
  customerName: string;
  firstItemName: string;
  extraItemCount: number;
};

export async function getAdminOrders(status?: OrderStatus): Promise<AdminOrderListItem[]> {
  const supabase = await createClient();
  let query = supabase
    .from("orders")
    .select("*, profile:profiles(full_name, company_name), order_items(product_name, quantity)")
    .order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((row) => {
    const { profile, order_items, ...order } = row as Order & {
      profile: { full_name: string | null; company_name: string | null } | null;
      order_items: { product_name: string; quantity: number }[];
    };
    const firstItem = order_items[0];
    return {
      ...order,
      customerName: profile?.company_name || profile?.full_name || order.customer_name || "Cliente",
      firstItemName: firstItem?.product_name ?? "",
      extraItemCount: Math.max(order_items.length - 1, 0),
    };
  });
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
