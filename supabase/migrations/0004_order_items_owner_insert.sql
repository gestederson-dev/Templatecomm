-- ============================================================
-- Salmar Brindes — Migration 0004: corrige RLS de order_items
-- A 0001 só tinha SELECT pro dono e ALL pro admin em order_items —
-- faltava INSERT pro dono, quebrando checkout (Fase 3) e conversão
-- de orçamento aprovado em pedido (Fase 4). Migration aditiva.
-- ============================================================

create policy "orderitem_owner_insert" on public.order_items
  for insert
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.profile_id = (select auth.uid())
    )
  );
