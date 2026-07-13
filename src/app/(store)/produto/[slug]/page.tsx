import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ProductGallery } from "@/components/store/product-gallery";
import { PriceTiersTable } from "@/components/store/price-tiers-table";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { getProductBySlug } from "@/lib/catalog";
import { formatBRL } from "@/lib/format";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return { title: product?.name ?? "Produto" };
}

export default async function ProdutoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {product.category ? (
        <Link href={`/categoria/${product.category.slug}`} className="text-sm text-muted-foreground hover:text-foreground">
          ← {product.category.name}
        </Link>
      ) : null}

      <div className="mt-4 grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} productName={product.name} />

        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{product.name}</h1>
            {product.sku ? <p className="mt-1 text-xs text-muted-foreground">SKU: {product.sku}</p> : null}
          </div>

          {product.description ? <p className="text-sm text-muted-foreground">{product.description}</p> : null}

          {product.allow_direct_sale ? (
            <div className="flex flex-col gap-3 rounded-lg border p-4">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium">Compra direta</span>
                {product.base_price != null ? <span className="text-xl font-semibold tabular-nums">{formatBRL(product.base_price)}</span> : null}
              </div>
              {product.base_price != null ? (
                <AddToCartButton
                  productId={product.id}
                  name={product.name}
                  slug={product.slug}
                  unitPrice={product.base_price}
                  imageUrl={product.images[0]?.url ?? null}
                />
              ) : (
                <Button disabled className="w-full">
                  Preço sob consulta
                </Button>
              )}
            </div>
          ) : null}

          {product.allow_quote ? (
            <div className="flex flex-col gap-3 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Orçamento sob medida</span>
                <Badge variant="secondary">mín. {product.min_quote_quantity} un.</Badge>
              </div>

              {product.price_tiers.length > 0 ? <PriceTiersTable tiers={product.price_tiers} /> : null}

              {product.customization_options.length > 0 ? (
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-medium text-muted-foreground">Personalização disponível</span>
                  <ul className="flex flex-wrap gap-2">
                    {product.customization_options.map((option) => (
                      <li key={option.id}>
                        <Badge variant="outline">
                          {option.name}
                          {option.required ? " *" : ""}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <Button disabled variant="secondary" className="w-full">
                Solicitar orçamento
              </Button>
              <p className="text-xs text-muted-foreground">Fluxo de orçamento chega em fase futura.</p>
            </div>
          ) : null}

          {product.weight_grams > 0 ? (
            <>
              <Separator />
              <p className="text-xs text-muted-foreground">Peso aproximado: {product.weight_grams}g</p>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
