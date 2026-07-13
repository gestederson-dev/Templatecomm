import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductListing } from "@/components/store/product-listing";
import { getCategoryBySlug, type ProductSort } from "@/lib/catalog";

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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  return { title: category?.name ?? "Categoria" };
}

export default async function CategoriaPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug } = await params;
  const resolved = await searchParams;
  const category = await getCategoryBySlug(slug);

  if (!category) notFound();

  const page = Number(firstValue(resolved.page) ?? "1") || 1;
  const minPrice = firstValue(resolved.min) ? Number(firstValue(resolved.min)) : undefined;
  const maxPrice = firstValue(resolved.max) ? Number(firstValue(resolved.max)) : undefined;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <ProductListing
        title={category.name}
        basePath={`/categoria/${slug}`}
        rawParams={toSearchParams(resolved)}
        filters={{
          categorySlug: slug,
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
