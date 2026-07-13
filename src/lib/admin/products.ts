import { createClient } from "@/lib/supabase/server";
import type { ProductWithRelations, Category, Product } from "@/lib/types";

export type AdminProductListItem = Product & { category: Pick<Category, "name"> | null };

export async function getAdminProducts(): Promise<AdminProductListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").select("*, category:categories(name)").order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getAdminProductById(id: string): Promise<ProductWithRelations | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "*, category:categories(id, name, slug), product_images(id, product_id, url, alt, sort_order, is_primary), product_customization_options(id, product_id, name, type, options, required, sort_order), price_tiers(id, product_id, min_quantity, max_quantity, unit_price)",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  type RawProduct = Product & {
    category: { id: string; name: string; slug: string } | null;
    product_images: ProductWithRelations["images"];
    product_customization_options: ProductWithRelations["customization_options"];
    price_tiers: ProductWithRelations["price_tiers"];
  };

  const { product_images, product_customization_options, price_tiers, ...product } = data as RawProduct;

  return {
    ...product,
    images: (product_images ?? []).sort((a, b) => a.sort_order - b.sort_order),
    customization_options: (product_customization_options ?? []).sort((a, b) => a.sort_order - b.sort_order),
    price_tiers: (price_tiers ?? []).sort((a, b) => a.min_quantity - b.min_quantity),
  };
}
