import Image from "next/image";
import Link from "next/link";
import { CategoryIcon } from "@/components/store/category-icon";
import { formatBRL } from "@/lib/format";
import type { ProductListItem } from "@/lib/types";

const THUMB_GRADIENTS = [
  "bg-[linear-gradient(150deg,#fbeef2,#f0cdd8)]",
  "bg-[linear-gradient(150deg,#fff2dc,#ffe1b0)]",
  "bg-[linear-gradient(150deg,#efe6ea,#ddd0d6)]",
];

export function ProductCard({ product, index = 0 }: { product: ProductListItem; index?: number }) {
  const gradient = THUMB_GRADIENTS[index % THUMB_GRADIENTS.length];
  const showBrandMotif = product.allow_quote;

  return (
    <Link
      href={`/produto/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-[20px] bg-white shadow-[var(--shadow-brand)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[var(--shadow-brand-lift)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine focus-visible:ring-offset-2"
    >
      <div className={`relative flex aspect-square items-center justify-center overflow-hidden ${product.primary_image ? "bg-muted" : gradient}`}>
        {product.primary_image ? (
          <Image
            src={product.primary_image.url}
            alt={product.primary_image.alt ?? product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <CategoryIcon
            slug={product.category?.slug ?? ""}
            className="relative z-[1] h-24 w-24 stroke-wine opacity-90 transition-transform duration-500 group-hover:scale-[1.07] group-hover:-rotate-2"
          />
        )}

        {showBrandMotif ? (
          <span className="absolute left-3.5 top-3.5 z-[2] rounded-full bg-amber px-3 py-1.5 text-[11.5px] font-semibold text-ink">Personalizável</span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-5">
        {product.category ? <span className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-ink/42">{product.category.name}</span> : null}
        <span className="font-[family-name:var(--font-display)] text-[18px] font-semibold leading-snug tracking-[-0.01em]">{product.name}</span>

        <div className="mt-auto flex items-center justify-between pt-3.5">
          {product.base_price != null ? (
            <span className="font-[family-name:var(--font-display)] text-xl font-bold tabular-nums text-wine">
              <small className="mb-[-2px] block font-[family-name:var(--font-body)] text-xs font-medium text-ink/50">a partir de</small>
              {formatBRL(product.base_price)}
            </span>
          ) : (
            <span className="text-sm font-semibold text-amber">Sob orçamento</span>
          )}

          <span
            aria-hidden="true"
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-full transition-transform group-hover:scale-110 ${product.base_price != null ? "bg-wine" : "bg-amber"}`}
          >
            {product.base_price != null ? (
              <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} className="h-[18px] w-[18px] stroke-white">
                <path d="M12 5v14M5 12h14" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} className="h-[18px] w-[18px] stroke-ink">
                <path d="M4 4h16v4H4zM4 12h10" />
              </svg>
            )}
          </span>
        </div>
      </div>
    </Link>
  );
}
