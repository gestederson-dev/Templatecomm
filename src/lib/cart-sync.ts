"use server";

import { createClient } from "@/lib/supabase/server";
import type { CartItem } from "@/stores/cart";

async function getOrCreateCartId(userId: string): Promise<string> {
  const supabase = await createClient();

  const { data: existing } = await supabase.from("carts").select("id").eq("profile_id", userId).maybeSingle();
  if (existing) return existing.id;

  const { data: created, error } = await supabase.from("carts").insert({ profile_id: userId }).select("id").single();
  if (error) throw error;
  return created.id;
}

/** Carrinho salvo no banco pro usuário logado, com nome/slug/imagem atuais do produto (não snapshot). */
export async function getServerCartItems(): Promise<CartItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: cart } = await supabase.from("carts").select("id").eq("profile_id", user.id).maybeSingle();
  if (!cart) return [];

  const { data, error } = await supabase
    .from("cart_items")
    .select("product_id, quantity, unit_price, products(name, slug, product_images(url, is_primary, sort_order))")
    .eq("cart_id", cart.id);

  if (error) throw error;

  type Row = {
    product_id: string;
    quantity: number;
    unit_price: number;
    products: { name: string; slug: string; product_images: { url: string; is_primary: boolean; sort_order: number }[] } | null;
  };

  return ((data ?? []) as unknown as Row[])
    .filter((row) => row.products)
    .map((row) => {
      const images = row.products!.product_images ?? [];
      const primary = images.find((img) => img.is_primary) ?? images[0] ?? null;
      return {
        productId: row.product_id,
        name: row.products!.name,
        slug: row.products!.slug,
        unitPrice: row.unit_price,
        quantity: row.quantity,
        imageUrl: primary?.url ?? null,
      };
    });
}

/** Substitui o carrinho salvo do usuário logado pelo estado atual do client (Zustand). No-op se não estiver logado. */
export async function replaceServerCart(items: CartItem[]): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const cartId = await getOrCreateCartId(user.id);

  await supabase.from("cart_items").delete().eq("cart_id", cartId);

  if (items.length === 0) return;

  const rows = items.map((item) => ({
    cart_id: cartId,
    product_id: item.productId,
    quantity: item.quantity,
    unit_price: item.unitPrice,
  }));

  const { error } = await supabase.from("cart_items").insert(rows);
  if (error) throw error;
}
