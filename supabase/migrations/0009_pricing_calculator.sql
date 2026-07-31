-- Calculadora de precificação: configuração global + custo por produto.
-- Dado sensível de negócio (custo, margem) — nunca público, só admin.
-- Valores-padrão são ESTIMATIVAS de mercado (ver docs/plano-calculadora-precificacao.md);
-- o admin precisa confirmar/ajustar as taxas reais da própria conta Mercado Pago.

-- ---------- pricing_settings (linha única) ----------
create table public.pricing_settings (
  id                          int primary key default 1,

  -- custos fixos mensais e rateio
  fixed_costs                 jsonb not null default '[]',         -- [{label, amount}]
  das_monthly                 numeric(10,2) not null default 87.05,
  monthly_volume_estimate     int not null default 0,               -- unidades/mês, base do rateio
  fixed_cost_allocation_mode  text not null default 'per_unit',     -- per_unit | percent_revenue
  avg_ticket_estimate         numeric(10,2),                        -- só usado no modo percent_revenue

  -- mão de obra
  target_monthly_prolabore    numeric(10,2),
  workable_hours_month        int,
  hourly_rate                 numeric(10,2) not null default 0,

  -- taxas do Mercado Pago (Payment Brick — cartão, Pix, boleto)
  pix_fee_pct                 numeric(5,2) not null default 0.99,
  boleto_fee_fixed            numeric(10,2) not null default 3.49,
  card_fee_d0_pct             numeric(5,2) not null default 4.99,
  card_fee_d14_pct            numeric(5,2) not null default 4.49,
  card_fee_d30_pct            numeric(5,2) not null default 3.99,
  card_release_default        text not null default 'd14',          -- d0 | d14 | d30
  installment_fees            jsonb not null default '{"2":2.03,"3":4.06,"4":5.50,"5":7.00,"6":8.92,"7":10.50,"8":11.80,"9":13.00,"10":13.90,"11":14.40,"12":14.80}',
  installment_mode            text not null default 'seller_absorbs', -- seller_absorbs | buyer_pays

  -- mix de pagamento (taxa efetiva ponderada)
  payment_mix                 jsonb not null default '{"pix":45,"card":40,"boleto":15}',

  -- perdas e riscos
  defect_rate_pct             numeric(5,2) not null default 3,
  return_rate_pct             numeric(5,2) not null default 0,

  -- frete
  shipping_policy              text not null default 'passed_through', -- passed_through | free_above | subsidized
  free_shipping_threshold      numeric(10,2),
  avg_shipping_cost            numeric(10,2),

  -- fiscal (MEI)
  mei_annual_ceiling          numeric(10,2) not null default 81000,
  simulated_simples_rate_pct  numeric(5,2),

  -- comercial
  minimum_margin_pct          numeric(5,2) not null default 15,

  updated_at                   timestamptz not null default now(),
  constraint single_row check (id = 1)
);

insert into public.pricing_settings (id) values (1);

-- ---------- product_costs (1:1 com products) ----------
create table public.product_costs (
  id                        uuid primary key default gen_random_uuid(),
  product_id                uuid not null unique references public.products(id) on delete cascade,

  blank_cost                numeric(10,2) not null default 0,   -- produto em branco (com frete de entrada rateado)
  customization_input_cost  numeric(10,2) not null default 0,   -- insumo de personalização por unidade

  production_minutes        numeric(6,2) not null default 0,    -- mão de obra, por unidade
  setup_minutes              numeric(6,2) not null default 0,    -- mão de obra, por pedido (arte, calibração, prova)

  machine_minutes           numeric(6,2) not null default 0,    -- por unidade
  machine_hourly_cost       numeric(10,2) not null default 0,

  packaging_unit_cost       numeric(10,2) not null default 0,
  packaging_order_cost      numeric(10,2) not null default 0,

  complexity_factor         numeric(3,2) not null default 1.0,  -- 1.0 simples / 1.3 média / 1.6 complexa
  weight_grams_packed       int,                                 -- peso já embalado; null = usa weight_grams do produto

  updated_at                timestamptz not null default now()
);

create index product_costs_product_id_idx on public.product_costs (product_id);

-- ---------- RLS ----------
alter table public.pricing_settings enable row level security;
alter table public.product_costs    enable row level security;

create policy "pricing_settings_admin_all" on public.pricing_settings for all using (public.is_admin()) with check (public.is_admin());
create policy "product_costs_admin_all"    on public.product_costs    for all using (public.is_admin()) with check (public.is_admin());

-- ---------- updated_at automático ----------
create trigger trg_pricing_settings_updated before update on public.pricing_settings for each row execute function public.set_updated_at();
create trigger trg_product_costs_updated    before update on public.product_costs    for each row execute function public.set_updated_at();
