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

export type OrderPreview = Order & {
  itemCount: number;
  firstItemName: string;
  extraItemCount: number;
  thumbnailUrl: string | null;
};

/** Pedidos do cliente com um resumo dos itens — usado na lista "Meus pedidos". */
export async function getMyOrdersWithPreview(): Promise<OrderPreview[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(product_id, product_name, quantity)")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;

  const orders = (data ?? []) as (Order & { order_items: { product_id: string | null; product_name: string; quantity: number }[] })[];

  const productIds = Array.from(new Set(orders.flatMap((o) => o.order_items.map((i) => i.product_id)).filter((id): id is string => Boolean(id))));

  const imageByProduct = new Map<string, string>();
  if (productIds.length > 0) {
    const { data: images } = await supabase.from("product_images").select("product_id, url, is_primary, sort_order").in("product_id", productIds).order("sort_order", { ascending: true });
    for (const img of images ?? []) {
      if (!imageByProduct.has(img.product_id) || img.is_primary) imageByProduct.set(img.product_id, img.url);
    }
  }

  return orders.map(({ order_items, ...order }) => {
    const firstItem = order_items[0];
    return {
      ...order,
      itemCount: order_items.reduce((sum, i) => sum + i.quantity, 0),
      firstItemName: firstItem?.product_name ?? "",
      extraItemCount: order_items.length - 1,
      thumbnailUrl: firstItem?.product_id ? (imageByProduct.get(firstItem.product_id) ?? null) : null,
    };
  });
}
