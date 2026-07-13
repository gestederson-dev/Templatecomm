import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatBRL } from "@/lib/format";
import type { ProductListItem } from "@/lib/types";

export function ProductCard({ product }: { product: ProductListItem }) {
  return (
    <Link
      href={`/produto/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border transition-colors hover:border-foreground/30"
    >
      <div className="relative aspect-square bg-muted">
        {product.primary_image ? (
          <Image
            src={product.primary_image.url}
            alt={product.primary_image.alt ?? product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">Sem imagem</div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        {product.category ? <span className="text-xs text-muted-foreground">{product.category.name}</span> : null}
        <span className="text-sm font-medium leading-snug">{product.name}</span>

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-sm font-semibold tabular-nums">{product.base_price != null ? formatBRL(product.base_price) : "Sob orçamento"}</span>
          {product.allow_quote ? (
            <Badge variant="secondary" className="text-xs">
              Personalizável
            </Badge>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
