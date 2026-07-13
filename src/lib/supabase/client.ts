import { createBrowserClient } from "@supabase/ssr";

/**
 * Acesso literal (`process.env.NEXT_PUBLIC_X`), não dinâmico (`process.env[name]`):
 * o bundler do Next só consegue inlinar `NEXT_PUBLIC_*` no bundle do browser
 * quando a expressão é estaticamente analisável. `process.env[name]` com `name`
 * variável passa despercebido do inlining e vira `undefined` em runtime no browser.
 */
function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`${name} não definida.`);
  }
  return value;
}

/** Client Supabase para Client Components (carrinho, checkout, formulários). */
export function createClient() {
  return createBrowserClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  );
}
