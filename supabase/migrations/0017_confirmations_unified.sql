-- Confirmação de pedido como peça única de toda venda (site, manual, orçamento):
--  * várias artes por confirmação (logo_paths), enviadas direto do navegador
--    para o Storage com link assinado (a Vercel limita o corpo da requisição a 4,5 MB);
--  * ligação com o pedido e com o orçamento de origem;
--  * arte pode ficar para depois (art_later) e ser enviada pela mesma página.
-- Migration aditiva: logo_path continua existindo e é copiado para logo_paths.

alter table public.order_confirmations
  add column if not exists logo_paths text[] not null default '{}',
  add column if not exists art_later  boolean not null default false,
  add column if not exists order_id   uuid references public.orders(id) on delete set null,
  add column if not exists quote_id   uuid references public.quotes(id) on delete set null;

update public.order_confirmations
set logo_paths = array[logo_path]
where logo_path is not null and cardinality(logo_paths) = 0;

-- um pedido tem no máximo uma confirmação
create unique index if not exists order_confirmations_order_id_key on public.order_confirmations (order_id) where order_id is not null;
create index if not exists order_confirmations_quote_id_idx on public.order_confirmations (quote_id);

-- arquivos de gráfica podem ser grandes; o upload direto aceita até 25 MB por arte
update storage.buckets set file_size_limit = 26214400 where id = 'order-confirmation-logos';
