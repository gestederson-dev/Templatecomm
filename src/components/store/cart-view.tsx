"use client";

import Image from "next/image";
import Link from "next/link";
import { cartTotalPrice, useCartStore } from "@/stores/cart";
import { formatBRL } from "@/lib/format";
import { btnOutline, btnWine } from "@/components/store/button-styles";
import { storeInput } from "@/components/store/ui-styles";

export function CartView() {
  const items = useCartStore((state) => state.items);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-ink/15 bg-white p-12 text-center">
        <p className="text-ink/60">Seu carrinho está vazio.</p>
        <Link href="/produtos" className={btnOutline}>
          Ver catálogo
        </Link>
      </div>
    );
  }

  const total = cartTotalPrice(items);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col divide-y divide-ink/8 overflow-hidden rounded-2xl border border-ink/8 bg-white shadow-[var(--shadow-brand)]">
        {items.map((item) => (
          <div key={item.productId} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-paper">
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt={item.name} fill sizes="64px" className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-[10px] text-ink/40">Sem imagem</div>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-1">
                <Link href={`/produto/${item.slug}`} className="text-sm font-semibold text-ink hover:text-wine">
                  {item.name}
                </Link>
                <span className="text-sm text-ink/52 tabular-nums">{formatBRL(item.unitPrice)} / un.</span>
              </div>

              <button
                type="button"
                onClick={() => removeItem(item.productId)}
                aria-label={`Remover ${item.name}`}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink/40 transition-colors hover:bg-destructive/10 hover:text-destructive sm:hidden"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 stroke-current" fill="none" strokeWidth={2}>
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 sm:contents">
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(event) => setQuantity(item.productId, Math.max(1, Number(event.target.value) || 1))}
                className={`${storeInput} w-16 px-2 py-1.5 text-center`}
                aria-label={`Quantidade de ${item.name}`}
              />

              <span className="text-right font-[family-name:var(--font-display)] text-sm font-semibold tabular-nums text-wine sm:w-24">
                {formatBRL(item.unitPrice * item.quantity)}
              </span>

              <button
                type="button"
                onClick={() => removeItem(item.productId)}
                className="hidden text-sm font-semibold text-ink/45 transition-colors hover:text-destructive sm:inline-block"
              >
                Remover
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-ink/8 bg-white p-4 shadow-[var(--shadow-brand)]">
        <span className="text-sm font-semibold text-ink">Subtotal</span>
        <span className="font-[family-name:var(--font-display)] text-xl font-bold tabular-nums text-wine">{formatBRL(total)}</span>
      </div>

      <Link href="/checkout" className={`${btnWine} w-full sm:w-fit sm:self-end`}>
        Finalizar compra
      </Link>
    </div>
  );
}
