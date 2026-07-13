-- ============================================================
-- Salmar Brindes — Migration 0005: buckets públicos de imagens
-- product-images (Fase 5, upload de produto), banners e site-assets
-- (Fase 7, banners da home e logo). Todos públicos pra leitura
-- (imagens de vitrine), escrita só admin. Migration aditiva.
-- ============================================================

insert into storage.buckets (id, name, public)
values
  ('product-images', 'product-images', true),
  ('banners', 'banners', true),
  ('site-assets', 'site-assets', true)
on conflict (id) do nothing;

create policy "product_images_public_read" on storage.objects
  for select
  using (bucket_id = 'product-images');

create policy "product_images_admin_write" on storage.objects
  for all to authenticated
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "banners_public_read" on storage.objects
  for select
  using (bucket_id = 'banners');

create policy "banners_admin_write" on storage.objects
  for all to authenticated
  using (bucket_id = 'banners' and public.is_admin())
  with check (bucket_id = 'banners' and public.is_admin());

create policy "site_assets_public_read" on storage.objects
  for select
  using (bucket_id = 'site-assets');

create policy "site_assets_admin_write" on storage.objects
  for all to authenticated
  using (bucket_id = 'site-assets' and public.is_admin())
  with check (bucket_id = 'site-assets' and public.is_admin());
