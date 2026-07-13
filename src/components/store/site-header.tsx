import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/store/logo";
import { getCategories, getSiteSettings } from "@/lib/catalog";
import { createClient } from "@/lib/supabase/server";
import { CartLink } from "@/components/store/cart-link";
import { btnGhost, btnOutline } from "@/components/store/button-styles";

export async function SiteHeader() {
  const supabase = await createClient();
  const [categories, settings, userResult] = await Promise.all([getCategories(), getSiteSettings(), supabase.auth.getUser()]);
  const siteName = settings?.site_name ?? "Salmar Personalizados";
  const user = userResult.data.user;

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-paper/82 backdrop-saturate-150 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3 sm:px-7 sm:py-0 sm:h-[78px]">
        <Logo siteName={siteName} />

        <form action="/produtos" method="get" className="order-3 w-full sm:order-2 sm:ml-2 sm:max-w-sm sm:flex-1">
          <Input
            type="search"
            name="q"
            placeholder="Buscar produtos..."
            aria-label="Buscar produtos"
            className="rounded-full border-ink/15 bg-white focus-visible:border-wine focus-visible:ring-wine/40"
          />
        </form>

        <div className="order-2 ml-auto flex items-center gap-2 sm:order-3 sm:ml-0">
          {user ? (
            <>
              <Link href="/conta" className={btnGhost}>
                Minha conta
              </Link>
              <form action="/auth/logout" method="post">
                <button type="submit" className={btnGhost}>
                  Sair
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" className={btnGhost}>
              Entrar
            </Link>
          )}
          <Link href="/produtos?quote=1" className={`${btnOutline} hidden sm:inline-flex`}>
            Peça seu orçamento
          </Link>
          <CartLink />
        </div>
      </div>

      {categories.length > 0 ? (
        <div className="border-t border-ink/10">
          <nav aria-label="Categorias" className="mx-auto flex h-[46px] max-w-6xl items-center gap-6 overflow-x-auto px-4 sm:px-7">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categoria/${category.slug}`}
                className="shrink-0 text-[13.5px] font-medium text-ink/62 transition-colors hover:text-wine"
              >
                {category.name}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
