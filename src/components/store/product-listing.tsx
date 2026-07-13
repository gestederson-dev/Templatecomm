import { ProductCard } from "@/components/store/product-card";
import { ProductFilters } from "@/components/store/product-filters";
import { CatalogPagination } from "@/components/store/pagination";
import { getProducts, type ProductFilters as CatalogFilters } from "@/lib/catalog";
import type { Category } from "@/lib/types";

export async function ProductListing({
  filters,
  categories,
  basePath,
  rawParams,
  title,
}: {
  filters: CatalogFilters;
  categories?: Category[];
  basePath: string;
  rawParams: URLSearchParams;
  title?: string;
}) {
  const { items, total, page, pageSize } = await getProducts(filters);

  return (
    <div className="flex flex-col gap-6">
      {title ? <h1 className="text-2xl font-semibold tracking-tight">{title}</h1> : null}

      <ProductFilters categories={categories} />

      <p className="text-sm text-muted-foreground">{total === 0 ? "Nenhum produto encontrado." : `${total} produto${total === 1 ? "" : "s"} encontrado${total === 1 ? "" : "s"}.`}</p>

      {items.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : null}

      <CatalogPagination basePath={basePath} currentParams={rawParams} page={page} pageSize={pageSize} total={total} />
    </div>
  );
}
