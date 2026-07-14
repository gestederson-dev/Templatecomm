import Link from "next/link";
import Image from "next/image";
import { Hero } from "@/components/store/hero";
import { CategoryCard } from "@/components/store/category-card";
import { ProductCard } from "@/components/store/product-card";
import { QuoteBand } from "@/components/store/quote-band";
import { Reveal } from "@/components/store/reveal";
import { getActiveBanners, getCategories, getFeaturedProducts } from "@/lib/catalog";

export default async function HomePage() {
  const [banners, categories, featuredProducts] = await Promise.all([getActiveBanners(), getCategories(), getFeaturedProducts(8)]);

  const heroBanner = banners[0] ?? null;

  return (
    <div className="flex flex-col gap-2 pb-20">
      {heroBanner ? (
        <Link href={heroBanner.link ?? "/produtos"} className="relative block aspect-[16/6] w-full overflow-hidden border-b border-ink/10">
          <Image src={heroBanner.image_url} alt={heroBanner.title ?? "Banner"} fill priority className="object-cover" />
        </Link>
      ) : (
        <Hero />
      )}

      {categories.length > 0 ? (
        <section className="mx-auto w-full max-w-6xl py-12 sm:px-7 sm:py-[74px]">
          <Reveal className="mb-6 flex flex-wrap items-end justify-between gap-5 px-4 sm:mb-9 sm:px-0">
            <div>
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-wine">Explore</p>
              <h2 className="font-[family-name:var(--font-display)] text-[clamp(22px,3.4vw,38px)] font-bold leading-[1.08] tracking-[-0.02em]">Categorias</h2>
            </div>
            <Link href="/produtos" className="group inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-wine transition-all hover:gap-2.5">
              Ver catálogo completo →
            </Link>
          </Reveal>

          <Reveal
            stagger
            className="flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-5"
          >
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </Reveal>
        </section>
      ) : null}

      {featuredProducts.length > 0 ? (
        <section className="mx-auto w-full max-w-6xl px-4 py-[20px] sm:px-7">
          <Reveal className="mb-9 flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-wine">Seleção</p>
              <h2 className="font-[family-name:var(--font-display)] text-[clamp(26px,3.4vw,38px)] font-bold leading-[1.08] tracking-[-0.02em]">Produtos em destaque</h2>
            </div>
            <Link href="/produtos" className="group inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-wine transition-all hover:gap-2.5">
              Ver todos →
            </Link>
          </Reveal>

          <Reveal stagger className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {featuredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </Reveal>
        </section>
      ) : null}

      <section className="mx-auto w-full max-w-6xl px-4 py-[20px] sm:px-7">
        <QuoteBand />
      </section>
    </div>
  );
}
