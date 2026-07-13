"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { cartTotalItems, useCartStore } from "@/stores/cart";

export function CartLink() {
  const totalItems = useCartStore((state) => cartTotalItems(state.items));

  return (
    <Link href="/carrinho" className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted" aria-label="Carrinho">
      <ShoppingCart className="size-4" />
      {totalItems > 0 ? (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
          {totalItems}
        </span>
      ) : null}
    </Link>
  );
}
