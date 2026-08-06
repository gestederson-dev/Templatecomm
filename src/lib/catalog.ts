import { createClient } from "@/lib/supabase/server";
import type { Banner, Category, PriceTier, Product, ProductCustomizationOption, ProductImage, ProductListItem, ProductWithRelations, SiteSettings } from "@/lib/types";

const PAGE_SIZE_PADRAO = 12;

export type ProductSort = "relevance" | "price_asc" | "price_desc";

export type ProductFilters = {
  categorySlug?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  quoteOnly?: boolean;
  sort?: ProductSort;
  page?: number;
  pageSize?: number;
};

function primaryImageOf(images: ProductImage[]): ProductImage | null {
  if (images.length === 0) return null;
  return images.find((img) => img.is_primary) ?? images[0];
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .is("parent_id", null)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").select("*").eq("slug", slug).eq("is_active", true).maybeSingle();

  if (error) throw error;
  return data;
}

export async function getFeaturedProducts(limit = 8): Promise<ProductListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(name, slug), product_images(id, product_id, url, alt, sort_order, is_primary)")
    .eq("is_published", true)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((row) => {
    const { product_images, ...product } = row as typeof row & { product_images: ProductImage[] };
    return { ...product, primary_image: primaryImageOf(product_images ?? []) };
  });
}

export async function getActiveBanners(): Promise<Banner[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("banners").select("*").eq("is_active", true).order("sort_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();

  if (error) throw error;
  return data;
}

export async function getProducts(filters: ProductFilters): Promise<{
  items: ProductListItem[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const supabase = await createClient();
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = filters.pageSize ?? PAGE_SIZE_PADRAO;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("products")
    .select("*, category:categories!inner(name, slug), product_images(id, product_id, url, alt, sort_order, is_primary)", { count: "exact" })
    .eq("is_published", true);

  if (filters.categorySlug) {
    query = query.eq("category.slug", filters.categorySlug);
  }
  if (filters.search) {
    query = query.ilike("name", `%${filters.search}%`);
  }
  if (filters.minPrice != null) {
    query = query.gte("base_price", filters.minPrice);
  }
  if (filters.maxPrice != null) {
    query = query.lte("base_price", filters.maxPrice);
  }
  if (filters.quoteOnly) {
    query = query.eq("allow_quote", true);
  }

  if (filters.sort === "price_asc") {
    query = query.order("base_price", { ascending: true, nullsFirst: false });
  } else if (filters.sort === "price_desc") {
    query = query.order("base_price", { ascending: false, nullsFirst: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;

  const items = (data ?? []).map((row) => {
    const { product_images, ...product } = row as typeof row & { product_images: ProductImage[] };
    return { ...product, primary_image: primaryImageOf(product_images ?? []) };
  });

  return { items, total: count ?? 0, page, pageSize };
}

export async function getProductBySlug(slug: string): Promise<ProductWithRelations | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "*, category:categories(id, name, slug), product_images(id, product_id, url, alt, sort_order, is_primary), product_customization_options(id, product_id, name, type, options, required, sort_order), price_tiers(id, product_id, min_quantity, max_quantity, unit_price)",
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  type RawProduct = Product & {
    category: { id: string; name: string; slug: string } | null;
    product_images: ProductImage[];
    product_customization_options: ProductCustomizationOption[];
    price_tiers: PriceTier[];
  };

  const { product_images, product_customization_options, price_tiers, ...product } = data as RawProduct;

  return {
    ...product,
    images: (product_images ?? []).sort((a, b) => a.sort_order - b.sort_order),
    customization_options: (product_customization_options ?? []).sort((a, b) => a.sort_order - b.sort_order),
    price_tiers: (price_tiers ?? []).sort((a, b) => a.min_quantity - b.min_quantity),
  };
}
