"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { cartTotalItems, useCartStore } from "@/stores/cart";

export function CartLink() {
  const totalItems = useCartStore((state) => cartTotalItems(state.items));

  return (
    <Link
      href="/carrinho"
      className="relative inline-flex h-[42px] w-[42px] items-center justify-center rounded-full bg-white shadow-[var(--shadow-brand)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
      aria-label="Carrinho"
    >
      <ShoppingCart className="size-[19px] stroke-ink" />
      {totalItems > 0 ? (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber px-1 text-[10px] font-semibold text-ink">
          {totalItems}
        </span>
      ) : null}
    </Link>
  );
}
