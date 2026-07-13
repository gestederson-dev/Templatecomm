export type PersonType = "pf" | "pj";
export type UserRole = "admin" | "customer";

export type Profile = {
  id: string;
  role: UserRole;
  full_name: string | null;
  phone: string | null;
  person_type: PersonType | null;
  cpf: string | null;
  cnpj: string | null;
  company_name: string | null;
  created_at: string;
};

export type Address = {
  id: string;
  profile_id: string;
  label: string | null;
  cep: string;
  street: string;
  number: string | null;
  complement: string | null;
  district: string | null;
  city: string;
  state: string;
  is_default: boolean;
  created_at: string;
};

export type OrderStatus = "pending" | "paid" | "processing" | "shipped" | "delivered" | "canceled";
export type OrderOrigin = "direct" | "quote";

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  customization: Record<string, string> | null;
  total: number;
};

export type Order = {
  id: string;
  order_number: string;
  profile_id: string | null;
  status: OrderStatus;
  origin: OrderOrigin;
  subtotal: number;
  shipping_cost: number;
  discount: number;
  total: number;
  shipping_address: Record<string, string> | null;
  payment_method: string | null;
  payment_id: string | null;
  payment_status: string | null;
  tracking_code: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderWithItems = Order & { items: OrderItem[] };

export type QuoteStatus = "requested" | "quoted" | "approved" | "rejected" | "expired" | "converted";

export type QuoteItem = {
  id: string;
  quote_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  customization: Record<string, string> | null;
  requested_notes: string | null;
  unit_price: number | null;
};

export type Quote = {
  id: string;
  quote_number: string;
  profile_id: string | null;
  status: QuoteStatus;
  customer_message: string | null;
  admin_response: string | null;
  quoted_total: number | null;
  valid_until: string | null;
  converted_order_id: string | null;
  created_at: string;
  updated_at: string;
};

export type QuoteWithItems = Quote & { items: QuoteItem[] };

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
