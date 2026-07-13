-- ============================================================
-- Salmar Brindes — Migration 0006: admin também precisa inserir
-- order_items ao converter um orçamento aprovado em pedido em nome
-- do cliente (Fase 5). A 0004 só cobriu o dono do pedido. Migration
-- aditiva — policies permissivas do mesmo comando se somam (OR).
-- ============================================================

create policy "orderitem_admin_insert" on public.order_items
  for insert
  with check (public.is_admin());
