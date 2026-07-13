-- ============================================================
-- Salmar Brindes — Migration 0003: bucket de Storage para anexos
-- de orçamento (logo/arte enviados pelo cliente ao solicitar cotação).
-- Bucket privado: dono do arquivo (pasta = seu user_id) e admin leem;
-- só o dono escreve/apaga. Migration aditiva.
-- ============================================================

insert into storage.buckets (id, name, public)
values ('quote-attachments', 'quote-attachments', false)
on conflict (id) do nothing;

create policy "quote_attachments_owner_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'quote-attachments' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "quote_attachments_owner_read" on storage.objects
  for select to authenticated
  using (bucket_id = 'quote-attachments' and ((storage.foldername(name))[1] = (select auth.uid())::text or public.is_admin()));

create policy "quote_attachments_owner_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'quote-attachments' and (storage.foldername(name))[1] = (select auth.uid())::text);
