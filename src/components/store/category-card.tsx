import Link from "next/link";
import { CategoryIcon } from "@/components/store/category-icon";
import type { Category } from "@/lib/types";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/categoria/${category.slug}`}
      className="group relative flex min-h-[150px] flex-col gap-4 overflow-hidden rounded-[18px] bg-white p-6 shadow-[var(--shadow-brand)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[var(--shadow-brand-lift)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine focus-visible:ring-offset-2"
    >
      <span className="pointer-events-none absolute inset-0 bg-wine-tint opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true" />
      <div className="relative z-[1] grid h-[46px] w-[46px] place-items-center rounded-xl bg-wine-tint">
        <CategoryIcon slug={category.slug} className="h-6 w-6 stroke-wine" />
      </div>
      <div className="relative z-[1] font-[family-name:var(--font-display)] text-[16.5px] font-semibold">{category.name}</div>
      <div className="relative z-[1] mt-auto text-[12.5px] font-semibold text-amber">Ver →</div>
    </Link>
  );
}
