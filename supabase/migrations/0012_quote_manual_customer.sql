-- Permite criar orçamento manualmente pra um lead sem cadastro (WhatsApp etc.),
-- mesma ideia já usada em orders.customer_name/customer_phone.
alter table public.quotes
  add column customer_name  text,
  add column customer_phone text;
