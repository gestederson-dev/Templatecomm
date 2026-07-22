import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ProductGallery } from "@/components/store/product-gallery";
import { PriceTiersTable } from "@/components/store/price-tiers-table";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { QuoteRequestForm } from "@/components/store/quote-request-form";
import { btnOutline } from "@/components/store/button-styles";
import { storeCard } from "@/components/store/ui-styles";
import { getProductBySlug } from "@/lib/catalog";
import { formatBRL } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Produto" };

  const description = product.description ?? `${product.name} — Salmar Brindes.`;
  const image = product.images[0]?.url;

  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
      description,
      type: "website",
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function ProdutoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {product.category ? (
        <Link href={`/categoria/${product.category.slug}`} className="text-sm font-medium text-ink/55 transition-colors hover:text-wine">
          ← {product.category.name}
        </Link>
      ) : null}

      <div className="mt-4 grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} productName={product.name} />

        <div className="flex flex-col gap-6">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-[26px] font-bold tracking-[-0.02em]">{product.name}</h1>
            {product.sku ? <p className="mt-1 text-xs text-ink/45">SKU: {product.sku}</p> : null}
          </div>

          {product.description ? <p className="text-sm leading-relaxed text-ink/65">{product.description}</p> : null}

          {product.allow_direct_sale ? (
            <div className={`${storeCard} flex flex-col gap-3.5`}>
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-semibold text-ink">Compra direta</span>
                {product.base_price != null ? (
                  <span className="font-[family-name:var(--font-display)] text-xl font-bold tabular-nums text-wine">{formatBRL(product.base_price)}</span>
                ) : null}
              </div>
              {product.base_price != null ? (
                <AddToCartButton
                  productId={product.id}
                  name={product.name}
                  slug={product.slug}
                  unitPrice={product.base_price}
                  imageUrl={product.images[0]?.url ?? null}
                  customizationOptions={product.customization_options}
                />
              ) : (
                <span className="rounded-full border border-ink/12 px-5 py-3 text-center text-sm font-semibold text-ink/45">Preço sob consulta</span>
              )}
            </div>
          ) : null}

          {product.allow_quote ? (
            <div className={`${storeCard} flex flex-col gap-3.5`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-ink">Orçamento sob medida</span>
                <span className="rounded-full bg-amber-tint px-2.5 py-1 text-[11.5px] font-semibold text-warn">mín. {product.min_quote_quantity} un.</span>
              </div>

              {product.price_tiers.length > 0 ? <PriceTiersTable tiers={product.price_tiers} /> : null}

              {user ? (
                <QuoteRequestForm productId={product.id} minQuantity={product.min_quote_quantity} options={product.customization_options} userId={user.id} />
              ) : (
                <>
                  {product.customization_options.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      <span className="text-[11.5px] font-semibold uppercase tracking-[0.04em] text-ink/52">Personalização disponível</span>
                      <ul className="flex flex-wrap gap-2">
                        {product.customization_options.map((option) => (
                          <li key={option.id} className="rounded-full border border-ink/15 px-3 py-1 text-[12.5px] font-medium text-ink/70">
                            {option.name}
                            {option.required ? " *" : ""}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  <Link href={`/login?next=/produto/${product.slug}`} className={`${btnOutline} w-full`}>
                    Entrar para solicitar orçamento
                  </Link>
                </>
              )}
            </div>
          ) : null}

          {product.weight_grams > 0 ? (
            <>
              <div className="border-t border-ink/10" />
              <p className="text-xs text-ink/45">Peso aproximado: {product.weight_grams}g</p>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
