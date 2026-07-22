-- Nova origem de pedido: venda registrada manualmente pelo admin (ex: WhatsApp)
alter type order_origin add value if not exists 'manual';

-- Cliente sem conta no site: nome/telefone digitados na hora
alter table public.orders
  add column customer_name text,
  add column customer_phone text;
