import Link from "next/link";
import { CategoryIcon } from "@/components/store/category-icon";
import type { Category } from "@/lib/types";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/categoria/${category.slug}`}
      className="group relative flex w-[110px] shrink-0 flex-col gap-2.5 overflow-hidden rounded-2xl bg-white p-3.5 shadow-[var(--shadow-brand)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[var(--shadow-brand-lift)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine focus-visible:ring-offset-2 sm:min-h-[150px] sm:w-auto sm:gap-4 sm:rounded-[18px] sm:p-6"
    >
      <span className="pointer-events-none absolute inset-0 bg-wine-tint opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true" />
      <div className="relative z-[1] grid h-[38px] w-[38px] place-items-center rounded-[10px] bg-wine-tint sm:h-[46px] sm:w-[46px] sm:rounded-xl">
        <CategoryIcon slug={category.slug} className="h-5 w-5 stroke-wine sm:h-6 sm:w-6" />
      </div>
      <div className="relative z-[1] font-[family-name:var(--font-display)] text-[13.5px] font-semibold leading-tight sm:text-[16.5px]">{category.name}</div>
      <div className="relative z-[1] mt-auto hidden text-[12.5px] font-semibold text-amber sm:block">Ver →</div>
    </Link>
  );
}
