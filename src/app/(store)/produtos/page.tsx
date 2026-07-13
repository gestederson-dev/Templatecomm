import type { Metadata } from "next";
import { ProductListing } from "@/components/store/product-listing";
import { getCategories, type ProductSort } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Catálogo",
};

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function toSearchParams(params: SearchParams): URLSearchParams {
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    const v = firstValue(value);
    if (v) usp.set(key, v);
  }
  return usp;
}

export default async function ProdutosPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const resolved = await searchParams;
  const categories = await getCategories();

  const page = Number(firstValue(resolved.page) ?? "1") || 1;
  const minPrice = firstValue(resolved.min) ? Number(firstValue(resolved.min)) : undefined;
  const maxPrice = firstValue(resolved.max) ? Number(firstValue(resolved.max)) : undefined;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <ProductListing
        title="Catálogo"
        basePath="/produtos"
        rawParams={toSearchParams(resolved)}
        categories={categories}
        filters={{
          categorySlug: firstValue(resolved.categoria),
          search: firstValue(resolved.q),
          minPrice,
          maxPrice,
          quoteOnly: firstValue(resolved.quote) === "1",
          sort: (firstValue(resolved.sort) as ProductSort | undefined) ?? "relevance",
          page,
        }}
      />
    </div>
  );
}
