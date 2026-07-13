-- ============================================================
-- Salmar Brindes — Migration 0002: metadados de cadastro
-- Estende handle_new_user() pra capturar phone/person_type/cpf/cnpj/
-- company_name enviados em auth.signUp({ options: { data: {...} } }).
-- Migration aditiva: não altera dado existente, só troca a função.
-- ============================================================

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role, phone, person_type, cpf, cnpj, company_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'customer',
    new.raw_user_meta_data->>'phone',
    coalesce((new.raw_user_meta_data->>'person_type')::person_type, 'pf'),
    new.raw_user_meta_data->>'cpf',
    new.raw_user_meta_data->>'cnpj',
    new.raw_user_meta_data->>'company_name'
  );
  return new;
end;
$$;
