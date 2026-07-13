export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
};

export type ProductImage = {
  id: string;
  product_id: string;
  url: string;
  alt: string | null;
  sort_order: number;
  is_primary: boolean;
};

export type CustomizationType = "select" | "text" | "color" | "logo_upload";

export type ProductCustomizationOption = {
  id: string;
  product_id: string;
  name: string;
  type: CustomizationType;
  options: string[] | null;
  required: boolean;
  sort_order: number;
};

export type PriceTier = {
  id: string;
  product_id: string;
  min_quantity: number;
  max_quantity: number | null;
  unit_price: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  base_price: number | null;
  sku: string | null;
  stock_quantity: number;
  weight_grams: number;
  dimensions: { altura?: number; largura?: number; comprimento?: number } | null;
  allow_direct_sale: boolean;
  allow_quote: boolean;
  min_quote_quantity: number;
  is_active: boolean;
  is_featured: boolean;
};

export type ProductWithRelations = Product & {
  category: Pick<Category, "id" | "name" | "slug"> | null;
  images: ProductImage[];
  customization_options: ProductCustomizationOption[];
  price_tiers: PriceTier[];
};

export type ProductListItem = Product & {
  category: Pick<Category, "name" | "slug"> | null;
  primary_image: ProductImage | null;
};

export type Banner = {
  id: string;
  title: string | null;
  image_url: string;
  link: string | null;
  sort_order: number;
  is_active: boolean;
};

export type SiteSettings = {
  id: number;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  site_name: string;
  contact_email: string | null;
  contact_phone: string | null;
  whatsapp: string | null;
  social_links: Record<string, string> | null;
  policies: Record<string, string> | null;
  store_cnpj: string | null;
  store_address: Record<string, string> | null;
};
