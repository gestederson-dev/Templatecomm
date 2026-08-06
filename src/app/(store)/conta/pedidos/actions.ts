"use server";

import { createClient } from "@/lib/supabase/server";

export type ReorderItem = {
  productId: string;
  name: string;
  slug: string;
  unitPrice: number;
  imageUrl: string | null;
  customization: Record<string, string> | null;
  quantity: number;
};

export type ReorderState = { items: ReorderItem[]; skipped: number } | { error: string };

type ProductJoin = {
  id: string;
  name: string;
  slug: string;
  base_price: number | null;
  is_active: boolean;
  is_published: boolean;
  allow_direct_sale: boolean;
  product_images: { url: string; is_primary: boolean; sort_order: number }[];
};

/** Recoloca no carrinho os produtos ainda disponíveis de um pedido antigo (repreçados no valor atual). */
export async function reorderAction(orderId: string): Promise<ReorderState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const { data: order } = await supabase.from("orders").select("id, profile_id").eq("id", orderId).maybeSingle();
  if (!order || order.profile_id !== user.id) return { error: "Pedido não encontrado." };

  const { data: items, error } = await supabase
    .from("order_items")
    .select("quantity, customization, product:products(id, name, slug, base_price, is_active, is_published, allow_direct_sale, product_images(url, is_primary, sort_order))")
    .eq("order_id", orderId);
  if (error) return { error: error.message };

  const reorderItems: ReorderItem[] = [];
  let skipped = 0;

  for (const item of items ?? []) {
    const product = item.product as unknown as ProductJoin | null;
    if (!product || !product.is_active || !product.is_published || !product.allow_direct_sale || product.base_price == null) {
      skipped += 1;
      continue;
    }

    const images = [...(product.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
    const primary = images.find((img) => img.is_primary) ?? images[0];

    reorderItems.push({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      unitPrice: product.base_price,
      imageUrl: primary?.url ?? null,
      customization: (item.customization as Record<string, string> | null) ?? null,
      quantity: item.quantity,
    });
  }

  if (reorderItems.length === 0) return { error: "Nenhum produto desse pedido está disponível pra compra direta no momento." };

  return { items: reorderItems, skipped };
}
