-- Confirmação de pedido: link único que o admin manda pro cliente que já fechou
-- o orçamento. A página mostra o que foi combinado e coleta forma de pagamento,
-- logo, se quer nota fiscal e os dados. O cliente não tem login: a página pública
-- só lê e grava pelo service_role, depois de conferir o token. Sem policy
-- pública, o RLS nega tudo pra anon/authenticated que não seja admin.
create table public.order_confirmations (
  id               uuid primary key default gen_random_uuid(),
  token            text not null unique default replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
  customer_label   text not null,                -- como o cliente aparece na página ("Compec")
  items            jsonb not null,               -- [{name, description, quantity, unit_price}]
  payment_options  jsonb not null,               -- [{id, label, amount, note}]
  notes            text,                         -- observação exibida no resumo (frete, prazo...)
  status           text not null default 'pendente' check (status in ('pendente', 'respondido', 'cancelado')),
  -- resposta do cliente
  payment_choice   text,
  wants_invoice    boolean,
  contact_name     text,
  contact_phone    text,
  contact_email    text,
  document         text,                         -- CPF ou CNPJ, só dígitos (quando pede nota)
  cep              text,
  street           text,
  number           text,
  complement       text,
  district         text,
  city             text,
  state            text,
  logo_path        text,                         -- caminho no bucket order-confirmation-logos
  customer_message text,
  responded_at     timestamptz,
  created_at       timestamptz not null default now()
);

alter table public.order_confirmations enable row level security;

create policy "order_confirmations_admin_all" on public.order_confirmations
  for all using (public.is_admin()) with check (public.is_admin());

-- Logos enviadas pelo cliente. Bucket privado: quem grava é o service_role
-- (o cliente não tem login); só admin lê.
insert into storage.buckets (id, name, public)
values ('order-confirmation-logos', 'order-confirmation-logos', false)
on conflict (id) do nothing;

create policy "order_confirmation_logos_admin_read" on storage.objects
  for select to authenticated
  using (bucket_id = 'order-confirmation-logos' and public.is_admin());
