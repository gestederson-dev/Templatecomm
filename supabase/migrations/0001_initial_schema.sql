-- ============================================================
-- Salmar Brindes — Migration 0001: Schema inicial
-- E-commerce híbrido (venda direta B2C + orçamento B2B)
-- Postgres / Supabase
-- ============================================================
-- Rodar em: supabase/migrations/0001_initial_schema.sql
-- Ou colar direto no SQL Editor do Supabase.
-- ============================================================

-- ==================== EXTENSIONS ====================
create extension if not exists "pgcrypto";       -- gen_random_uuid()

-- ==================== ENUMS ====================
create type user_role          as enum ('admin', 'customer');
create type person_type        as enum ('pf', 'pj');
create type customization_type as enum ('select', 'text', 'color', 'logo_upload');
create type order_status       as enum ('pending', 'paid', 'processing', 'shipped', 'delivered', 'canceled');
create type order_origin       as enum ('direct', 'quote');
create type quote_status       as enum ('requested', 'quoted', 'approved', 'rejected', 'expired', 'converted');
create type coupon_type        as enum ('percent', 'fixed');

-- ============================================================
-- TABELAS
-- ============================================================

-- ---------- profiles (estende auth.users) ----------
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  role          user_role   not null default 'customer',
  full_name     text,
  phone         text,
  person_type   person_type default 'pf',
  cpf           text,
  cnpj          text,
  company_name  text,
  created_at    timestamptz not null default now()
);

-- ---------- categories ----------
create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  parent_id   uuid references public.categories(id) on delete set null,
  image_url   text,
  sort_order  int  not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ---------- products ----------
create table public.products (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null,
  slug               text not null unique,
  description        text,
  category_id        uuid references public.categories(id) on delete set null,
  base_price         numeric(10,2),                       -- preço venda direta (null se só orçamento)
  sku                text unique,
  stock_quantity     int not null default 0,
  weight_grams       int not null default 0,              -- p/ cálculo de frete
  dimensions         jsonb,                               -- {altura, largura, comprimento} em cm
  allow_direct_sale  boolean not null default true,
  allow_quote        boolean not null default false,
  min_quote_quantity int not null default 1,
  is_active          boolean not null default true,
  is_featured        boolean not null default false,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ---------- product_images ----------
create table public.product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  url         text not null,
  alt         text,
  sort_order  int  not null default 0,
  is_primary  boolean not null default false
);

-- ---------- product_customization_options ----------
create table public.product_customization_options (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  name        text not null,                              -- ex: "Cor", "Tipo de gravação"
  type        customization_type not null,
  options     jsonb,                                      -- valores possíveis (p/ select/color)
  required    boolean not null default false,
  sort_order  int not null default 0
);

-- ---------- price_tiers (preço por quantidade — B2B) ----------
create table public.price_tiers (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null references public.products(id) on delete cascade,
  min_quantity int  not null,
  max_quantity int,                                       -- null = "ou mais"
  unit_price   numeric(10,2) not null
);

-- ---------- addresses ----------
create table public.addresses (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  label       text,
  cep         text not null,
  street      text not null,
  number      text,
  complement  text,
  district    text,
  city        text not null,
  state       text not null,
  is_default  boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ---------- carts ----------
create table public.carts (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid references public.profiles(id) on delete cascade,
  session_id  text,                                       -- p/ convidado
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------- cart_items ----------
create table public.cart_items (
  id            uuid primary key default gen_random_uuid(),
  cart_id       uuid not null references public.carts(id) on delete cascade,
  product_id    uuid not null references public.products(id) on delete cascade,
  quantity      int not null default 1,
  unit_price    numeric(10,2) not null,
  customization jsonb
);

-- ---------- orders ----------
create table public.orders (
  id               uuid primary key default gen_random_uuid(),
  order_number     text unique,                           -- gerado por trigger (PED-000001)
  profile_id       uuid references public.profiles(id) on delete set null,
  status           order_status not null default 'pending',
  origin           order_origin not null default 'direct',
  subtotal         numeric(10,2) not null default 0,
  shipping_cost    numeric(10,2) not null default 0,
  discount         numeric(10,2) not null default 0,
  total            numeric(10,2) not null default 0,
  shipping_address jsonb,                                 -- snapshot
  payment_method   text,
  payment_id       text,                                  -- id no Mercado Pago
  payment_status   text,
  tracking_code    text,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ---------- order_items ----------
create table public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders(id) on delete cascade,
  product_id    uuid references public.products(id) on delete set null,
  product_name  text not null,                            -- snapshot
  quantity      int not null,
  unit_price    numeric(10,2) not null,
  customization jsonb,
  total         numeric(10,2) not null
);

-- ---------- quotes (orçamentos) ----------
create table public.quotes (
  id                 uuid primary key default gen_random_uuid(),
  quote_number       text unique,                         -- gerado por trigger (ORC-000001)
  profile_id         uuid references public.profiles(id) on delete set null,
  status             quote_status not null default 'requested',
  customer_message   text,
  admin_response     text,
  quoted_total       numeric(10,2),
  valid_until        date,
  converted_order_id uuid references public.orders(id) on delete set null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ---------- quote_items ----------
create table public.quote_items (
  id             uuid primary key default gen_random_uuid(),
  quote_id       uuid not null references public.quotes(id) on delete cascade,
  product_id     uuid references public.products(id) on delete set null,
  product_name   text not null,
  quantity       int not null,
  customization  jsonb,                                   -- inclui logo/arte
  requested_notes text,
  unit_price     numeric(10,2)                            -- preenchido pelo admin ao cotar
);

-- ---------- site_settings (linha única) ----------
create table public.site_settings (
  id              int primary key default 1,
  logo_url        text,
  primary_color   text default '#1e40af',
  secondary_color text default '#f59e0b',
  site_name       text default 'Salmar Brindes',
  contact_email   text,
  contact_phone   text,
  whatsapp        text,
  social_links    jsonb,
  policies        jsonb,                                  -- {troca, privacidade, ...}
  store_cnpj      text,
  store_address   jsonb,
  updated_at      timestamptz not null default now(),
  constraint single_row check (id = 1)
);

-- ---------- banners ----------
create table public.banners (
  id         uuid primary key default gen_random_uuid(),
  title      text,
  image_url  text not null,
  link       text,
  sort_order int not null default 0,
  is_active  boolean not null default true
);

-- ---------- coupons ----------
create table public.coupons (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  type        coupon_type not null,
  value       numeric(10,2) not null,
  min_order   numeric(10,2) default 0,
  usage_limit int,
  used_count  int not null default 0,
  valid_until date,
  is_active   boolean not null default true
);

-- ============================================================
-- ÍNDICES
-- ============================================================
create index idx_products_category   on public.products(category_id);
create index idx_products_active      on public.products(is_active);
create index idx_product_images_prod  on public.product_images(product_id);
create index idx_orders_profile        on public.orders(profile_id);
create index idx_orders_status         on public.orders(status);
create index idx_quotes_profile        on public.quotes(profile_id);
create index idx_quotes_status         on public.quotes(status);
create index idx_cart_items_cart       on public.cart_items(cart_id);

-- ============================================================
-- FUNÇÕES + TRIGGERS
-- ============================================================

-- updated_at automático
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger trg_products_updated  before update on public.products for each row execute function public.set_updated_at();
create trigger trg_orders_updated     before update on public.orders   for each row execute function public.set_updated_at();
create trigger trg_quotes_updated     before update on public.quotes   for each row execute function public.set_updated_at();
create trigger trg_carts_updated      before update on public.carts    for each row execute function public.set_updated_at();

-- numeração legível de pedidos e orçamentos
create sequence if not exists public.order_number_seq start 1;
create sequence if not exists public.quote_number_seq start 1;

create or replace function public.set_order_number()
returns trigger language plpgsql as $$
begin
  if new.order_number is null then
    new.order_number := 'PED-' || lpad(nextval('public.order_number_seq')::text, 6, '0');
  end if;
  return new;
end;
$$;
create trigger trg_order_number before insert on public.orders
  for each row execute function public.set_order_number();

create or replace function public.set_quote_number()
returns trigger language plpgsql as $$
begin
  if new.quote_number is null then
    new.quote_number := 'ORC-' || lpad(nextval('public.quote_number_seq')::text, 6, '0');
  end if;
  return new;
end;
$$;
create trigger trg_quote_number before insert on public.quotes
  for each row execute function public.set_quote_number();

-- cria profile automaticamente no signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), 'customer');
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- helper de admin (security definer evita recursão de RLS)
create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles                      enable row level security;
alter table public.categories                    enable row level security;
alter table public.products                      enable row level security;
alter table public.product_images               enable row level security;
alter table public.product_customization_options enable row level security;
alter table public.price_tiers                   enable row level security;
alter table public.addresses                     enable row level security;
alter table public.carts                         enable row level security;
alter table public.cart_items                    enable row level security;
alter table public.orders                        enable row level security;
alter table public.order_items                   enable row level security;
alter table public.quotes                        enable row level security;
alter table public.quote_items                   enable row level security;
alter table public.site_settings                 enable row level security;
alter table public.banners                       enable row level security;
alter table public.coupons                       enable row level security;

-- ---------- Conteúdo público (leitura livre, escrita só admin) ----------
create policy "cat_public_read"   on public.categories    for select using (is_active or public.is_admin());
create policy "cat_admin_all"     on public.categories    for all    using (public.is_admin()) with check (public.is_admin());

create policy "prod_public_read"  on public.products      for select using (is_active or public.is_admin());
create policy "prod_admin_all"    on public.products      for all    using (public.is_admin()) with check (public.is_admin());

create policy "img_public_read"   on public.product_images for select using (true);
create policy "img_admin_all"     on public.product_images for all    using (public.is_admin()) with check (public.is_admin());

create policy "cust_public_read"  on public.product_customization_options for select using (true);
create policy "cust_admin_all"    on public.product_customization_options for all using (public.is_admin()) with check (public.is_admin());

create policy "tier_public_read"  on public.price_tiers   for select using (true);
create policy "tier_admin_all"    on public.price_tiers   for all    using (public.is_admin()) with check (public.is_admin());

create policy "banner_public_read" on public.banners      for select using (is_active or public.is_admin());
create policy "banner_admin_all"   on public.banners      for all    using (public.is_admin()) with check (public.is_admin());

create policy "settings_public_read" on public.site_settings for select using (true);
create policy "settings_admin_all"   on public.site_settings for all using (public.is_admin()) with check (public.is_admin());

create policy "coupon_admin_all"  on public.coupons       for all    using (public.is_admin()) with check (public.is_admin());
-- (validação de cupom pelo cliente é feita server-side com service role)

-- ---------- Dados do usuário (dono vê os próprios; admin vê tudo) ----------
create policy "profile_self_read"  on public.profiles  for select using (id = auth.uid() or public.is_admin());
create policy "profile_self_upd"   on public.profiles  for update using (id = auth.uid()) with check (id = auth.uid());
create policy "profile_admin_all"  on public.profiles  for all    using (public.is_admin()) with check (public.is_admin());

create policy "addr_owner_all"     on public.addresses for all using (profile_id = auth.uid() or public.is_admin())
                                                       with check (profile_id = auth.uid() or public.is_admin());

create policy "cart_owner_all"     on public.carts      for all using (profile_id = auth.uid() or public.is_admin())
                                                        with check (profile_id = auth.uid() or public.is_admin());

create policy "cartitem_owner_all" on public.cart_items for all using (
  exists (select 1 from public.carts c where c.id = cart_id and (c.profile_id = auth.uid() or public.is_admin()))
) with check (
  exists (select 1 from public.carts c where c.id = cart_id and (c.profile_id = auth.uid() or public.is_admin()))
);

create policy "order_owner_read"   on public.orders for select using (profile_id = auth.uid() or public.is_admin());
create policy "order_owner_insert" on public.orders for insert with check (profile_id = auth.uid() or public.is_admin());
create policy "order_admin_upd"    on public.orders for update using (public.is_admin()) with check (public.is_admin());

create policy "orderitem_read"     on public.order_items for select using (
  exists (select 1 from public.orders o where o.id = order_id and (o.profile_id = auth.uid() or public.is_admin()))
);
create policy "orderitem_admin_all" on public.order_items for all using (public.is_admin()) with check (public.is_admin());

create policy "quote_owner_read"   on public.quotes for select using (profile_id = auth.uid() or public.is_admin());
create policy "quote_owner_insert" on public.quotes for insert with check (profile_id = auth.uid() or public.is_admin());
create policy "quote_owner_upd"    on public.quotes for update using (profile_id = auth.uid() or public.is_admin())
                                                    with check (profile_id = auth.uid() or public.is_admin());

create policy "quoteitem_owner_all" on public.quote_items for all using (
  exists (select 1 from public.quotes q where q.id = quote_id and (q.profile_id = auth.uid() or public.is_admin()))
) with check (
  exists (select 1 from public.quotes q where q.id = quote_id and (q.profile_id = auth.uid() or public.is_admin()))
);

-- ============================================================
-- SEED (dados de exemplo)
-- ============================================================
insert into public.site_settings (id, site_name, contact_email)
values (1, 'Salmar Brindes', 'contato@salmarbrindes.com.br')
on conflict (id) do nothing;

insert into public.categories (name, slug, sort_order) values
  ('Canetas',  'canetas',  1),
  ('Cadernos', 'cadernos', 2),
  ('Canecas',  'canecas',  3),
  ('Ecobags',  'ecobags',  4),
  ('Kits Corporativos', 'kits-corporativos', 5);

insert into public.products (name, slug, description, category_id, base_price, sku, stock_quantity, weight_grams, allow_direct_sale, allow_quote, min_quote_quantity, is_featured)
values
  ('Caneca Personalizada 325ml', 'caneca-personalizada-325ml',
   'Caneca de porcelana para gravação de logo. Ideal para brindes corporativos.',
   (select id from public.categories where slug = 'canecas'),
   24.90, 'CAN-325', 500, 350, true, true, 50, true),
  ('Ecobag de Algodão', 'ecobag-algodao',
   'Sacola ecológica personalizável com sua marca.',
   (select id from public.categories where slug = 'ecobags'),
   14.90, 'ECO-001', 800, 120, true, true, 100, true),
  ('Kit Executivo Premium', 'kit-executivo-premium',
   'Caderno + caneta + necessaire. Somente sob orçamento.',
   (select id from public.categories where slug = 'kits-corporativos'),
   null, 'KIT-EXE', 0, 600, false, true, 25, true);

-- ============================================================
-- PÓS-DEPLOY: criar o primeiro admin
-- ============================================================
-- 1) Cadastre-se normalmente pela loja (signup).
-- 2) Rode este UPDATE trocando pelo seu e-mail:
--
-- update public.profiles set role = 'admin'
-- where id = (select id from auth.users where email = 'SEU-EMAIL@exemplo.com');
-- ============================================================
