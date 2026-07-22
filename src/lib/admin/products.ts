import { createClient } from "@/lib/supabase/server";
import type { ProductWithRelations, Category, Product, ProductImage, ProductCustomizationOption } from "@/lib/types";

export type AdminProductListItem = Product & { category: Pick<Category, "name" | "slug"> | null; primary_image: ProductImage | null };

export type AdminProductFilters = {
  search?: string;
  categoryId?: string;
  status?: "active" | "inactive";
  type?: "direct" | "quote";
};

export async function getAdminProducts(filters: AdminProductFilters = {}): Promise<AdminProductListItem[]> {
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select("*, category:categories(name, slug), product_images(id, product_id, url, alt, sort_order, is_primary)")
    .order("created_at", { ascending: false });

  if (filters.search) query = query.ilike("name", `%${filters.search}%`);
  if (filters.categoryId) query = query.eq("category_id", filters.categoryId);
  if (filters.status) query = query.eq("is_active", filters.status === "active");
  if (filters.type === "direct") query = query.eq("allow_direct_sale", true);
  if (filters.type === "quote") query = query.eq("allow_quote", true);

  const { data, error } = await query;
  if (error) throw error;

  type RawRow = Product & { category: { name: string; slug: string } | null; product_images: ProductImage[] };

  return (data as unknown as RawRow[]).map((row) => {
    const { product_images, ...product } = row;
    const primary = (product_images ?? []).find((img) => img.is_primary) ?? product_images?.[0] ?? null;
    return { ...product, primary_image: primary };
  });
}

export type AdminProductPickerItem = Pick<Product, "id" | "name" | "sku" | "base_price"> & { customization_options: ProductCustomizationOption[] };

/** Lista enxuta pro seletor de produtos do pedido manual — inclui as opções de personalização (cor, etc.) de cada produto. */
export async function getAdminProductsForOrderPicker(): Promise<AdminProductPickerItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, sku, base_price, product_customization_options(id, product_id, name, type, options, required, sort_order)")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) throw error;

  type RawRow = Pick<Product, "id" | "name" | "sku" | "base_price"> & { product_customization_options: ProductCustomizationOption[] };

  return (data as unknown as RawRow[]).map((row) => {
    const { product_customization_options, ...product } = row;
    return { ...product, customization_options: (product_customization_options ?? []).sort((a, b) => a.sort_order - b.sort_order) };
  });
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
