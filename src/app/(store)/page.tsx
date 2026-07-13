import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/store/product-card";
import { getActiveBanners, getCategories, getFeaturedProducts } from "@/lib/catalog";

export default async function HomePage() {
  const [banners, categories, featuredProducts] = await Promise.all([getActiveBanners(), getCategories(), getFeaturedProducts(8)]);

  const heroBanner = banners[0] ?? null;

  return (
    <div className="flex flex-col gap-16 pb-16">
      <section className="relative overflow-hidden border-b bg-muted/30">
        {heroBanner ? (
          <Link href={heroBanner.link ?? "/produtos"} className="relative block aspect-[16/6] w-full">
            <Image src={heroBanner.image_url} alt={heroBanner.title ?? "Banner"} fill priority className="object-cover" />
          </Link>
        ) : (
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-4 py-20 sm:px-6">
            <h1 className="max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">Brindes corporativos com a cara da sua empresa</h1>
            <p className="max-w-lg text-muted-foreground">
              Compre pronto ou personalize com sua marca: canecas, ecobags, kits executivos e muito mais.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button render={<Link href="/produtos">Ver catálogo</Link>} size="lg" />
              <Button render={<Link href="/produtos?quote=1">Peça seu orçamento</Link>} size="lg" variant="outline" />
            </div>
          </div>
        )}
      </section>

      {categories.length > 0 ? (
        <section className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <h2 className="mb-4 text-lg font-semibold">Categorias</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categoria/${category.slug}`}
                className="flex items-center justify-center rounded-lg border px-4 py-6 text-center text-sm font-medium transition-colors hover:border-foreground/30 hover:bg-muted/40"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {featuredProducts.length > 0 ? (
        <section className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Produtos em destaque</h2>
            <Link href="/produtos" className="text-sm text-muted-foreground hover:text-foreground">
              Ver todos
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-start gap-4 rounded-lg border bg-muted/30 p-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Precisa de uma quantidade grande ou personalização?</h2>
            <p className="text-muted-foreground">Solicite um orçamento sob medida para sua empresa.</p>
          </div>
          <Button render={<Link href="/produtos?quote=1">Peça seu orçamento</Link>} size="lg" />
        </div>
      </section>
    </div>
  );
}
