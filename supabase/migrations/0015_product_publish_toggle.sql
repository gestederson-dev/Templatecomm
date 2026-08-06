-- Desacopla "produto ativo" (usável no sistema, inclusive pedido manual do
-- admin) de "publicado no site" (visível/comprável pelo cliente na loja).
-- Antes, is_active controlava as duas coisas ao mesmo tempo — um produto
-- desativado sumia até do seletor de pedido manual, sem jeito de vender ele
-- só por fora do site.
alter table public.products add column is_published boolean not null default true;
update public.products set is_published = is_active;

alter policy "prod_public_read" on public.products using (is_published or public.is_admin());
