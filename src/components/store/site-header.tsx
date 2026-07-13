import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getCategories, getSiteSettings } from "@/lib/catalog";

export async function SiteHeader() {
  const [categories, settings] = await Promise.all([getCategories(), getSiteSettings()]);
  const siteName = settings?.site_name ?? "Salmar Brindes";

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            {siteName}
          </Link>

          <form action="/produtos" method="get" className="order-3 w-full sm:order-2 sm:max-w-sm sm:flex-1">
            <Input type="search" name="q" placeholder="Buscar produtos..." aria-label="Buscar produtos" />
          </form>

          <Button render={<Link href="/produtos?quote=1">Peça seu orçamento</Link>} size="sm" className="order-2 sm:order-3" />
        </div>

        {categories.length > 0 ? (
          <nav aria-label="Categorias" className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
            {categories.map((category) => (
              <Link key={category.id} href={`/categoria/${category.slug}`} className="hover:text-foreground">
                {category.name}
              </Link>
            ))}
          </nav>
        ) : null}
      </div>
    </header>
  );
}
