import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} não definida.`);
  }
  return value;
}

/**
 * Client Supabase para Server Components/Actions/Route Handlers — lê/escreve
 * sessão via cookies do Next.js. Escrever cookie de um Server Component puro
 * (sem ser Route Handler/Server Action) lança; o catch abaixo é esperado
 * nesse caso — o middleware já cuida do refresh de sessão a cada request.
 * Roda sob RLS com a chave anon: respeita as policies do usuário autenticado.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(requireEnv("NEXT_PUBLIC_SUPABASE_URL"), requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // esperado quando chamado de um Server Component sem permissão de escrita
        }
      },
    },
  });
}
