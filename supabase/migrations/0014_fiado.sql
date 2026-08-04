-- Controle de fiado (venda a prazo/confiança) — área separada do fluxo normal
-- de pedidos do site. Clientes são informais (só nome/telefone, sem conta),
-- e o saldo pendente é sempre calculado (soma de cobranças - soma de
-- pagamentos), nunca digitado à mão — elimina o erro de digitar o total
-- errado que acontecia na planilha.

create table public.fiado_customers (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  phone       text,
  notes       text,
  is_archived boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------- fiado_charges (compras fiado — o que o cliente deve) ----------
create table public.fiado_charges (
  id          uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.fiado_customers(id) on delete cascade,
  description text not null,                            -- ex: "3 canecas + 1 chaveiro"
  amount      numeric(10,2) not null,
  delivered   boolean not null default false,
  occurred_at date not null default current_date,
  notes       text,
  created_at  timestamptz not null default now()
);

-- ---------- fiado_payments (pagamentos recebidos) ----------
create table public.fiado_payments (
  id          uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.fiado_customers(id) on delete cascade,
  amount      numeric(10,2) not null,
  paid_at     date not null default current_date,
  notes       text,
  created_at  timestamptz not null default now()
);

create index fiado_charges_customer_id_idx  on public.fiado_charges (customer_id);
create index fiado_payments_customer_id_idx on public.fiado_payments (customer_id);

-- ---------- RLS: dado sensível de negócio, só admin ----------
alter table public.fiado_customers enable row level security;
alter table public.fiado_charges   enable row level security;
alter table public.fiado_payments  enable row level security;

create policy "fiado_customers_admin_all" on public.fiado_customers for all using (public.is_admin()) with check (public.is_admin());
create policy "fiado_charges_admin_all"   on public.fiado_charges   for all using (public.is_admin()) with check (public.is_admin());
create policy "fiado_payments_admin_all"  on public.fiado_payments  for all using (public.is_admin()) with check (public.is_admin());

create trigger trg_fiado_customers_updated before update on public.fiado_customers for each row execute function public.set_updated_at();
