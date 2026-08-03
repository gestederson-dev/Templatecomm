-- orders tinha policy de select/insert/update pro admin, mas nenhuma de delete —
-- sem policy explícita o RLS bloqueia por padrão, então o botão "Excluir pedido"
-- não apagava nada (nem dava erro, só filtrava a linha).
create policy "order_admin_delete" on public.orders for delete using (public.is_admin());
