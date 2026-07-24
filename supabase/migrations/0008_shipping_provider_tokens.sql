-- Guarda o token OAuth do Melhor Envio (access + refresh), pra renovar sozinho
-- quando expirar. Credencial de sistema, não dado de usuário — só o
-- service_role toca aqui (sem policy = RLS nega tudo pra anon/authenticated).
create table public.shipping_provider_tokens (
  provider      text primary key,
  access_token  text not null,
  refresh_token text not null,
  expires_at    timestamptz not null,
  updated_at    timestamptz not null default now()
);

alter table public.shipping_provider_tokens enable row level security;

-- admin só enxerga status (usado pra mostrar "conectado" nas Configurações);
-- o token em si só é lido/gravado pelo service_role (melhor-envio-token.ts).
create policy "shipping_tokens_admin_read" on public.shipping_provider_tokens for select using (public.is_admin());
