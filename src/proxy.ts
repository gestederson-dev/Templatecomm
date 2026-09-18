import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} não definida.`);
  }
  return value;
}

/** pathname === prefix ou começa com "prefix/" — evita "/contato" casar com prefixo "/conta". */
function matchesRoute(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/**
 * Roda em toda request: refresca a sessão (troca token expirado por um novo,
 * grava cookie atualizado) e protege /conta (autenticado) e /admin (role
 * admin). Padrão recomendado do @supabase/ssr — Server Components sozinhos
 * não conseguem escrever cookie de forma confiável a cada request, só o
 * proxy consegue.
 */
// domínio antigo da Vercel — mantido vivo pela própria Vercel, então
// redirecionamos pro domínio próprio em vez de deixar acessível em paralelo.
const OLD_HOST = "salmar-brindes.vercel.app";
const CANONICAL_HOST = "salmarbrindes.com.br";

export async function proxy(request: NextRequest) {
  if (request.nextUrl.hostname === OLD_HOST) {
    const url = request.nextUrl.clone();
    url.hostname = CANONICAL_HOST;
    url.port = "";
    url.protocol = "https";
    return NextResponse.redirect(url, 308);
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(requireEnv("NEXT_PUBLIC_SUPABASE_URL"), requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const precisaAuth = matchesRoute(pathname, "/conta") || matchesRoute(pathname, "/checkout");
  // /admin/login é a própria tela de login do admin — nunca pode exigir auth,
  // senão vira loop de redirecionamento.
  const precisaAdmin = matchesRoute(pathname, "/admin") && pathname !== "/admin/login";

  if (precisaAuth && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (precisaAdmin && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (precisaAdmin && user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

// api/cron fica de fora: o Cron da Vercel não segue o redirect do domínio antigo e não tem sessão.
export const config = {
  matcher: ["/((?!_next/static|_next/image|api/cron|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
