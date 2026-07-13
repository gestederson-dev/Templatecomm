import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} não definida.`);
  }
  return value;
}

/**
 * Client Supabase com `service_role`: ignora RLS. Só para rotas server-side
 * que precisam operar fora do escopo de um usuário autenticado (ex.: webhook
 * do Mercado Pago confirmando pagamento, cron de expiração de orçamento).
 * O import "server-only" faz o build falhar se este módulo for importado por
 * engano em código de Client Component (CLAUDE.md, regra 3).
 */
export function createAdminClient() {
  return createSupabaseClient(requireEnv("NEXT_PUBLIC_SUPABASE_URL"), requireEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
