"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cartTotalPrice, useCartStore } from "@/stores/cart";
import { formatBRL } from "@/lib/format";

export function CartView() {
  const items = useCartStore((state) => state.items);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">Seu carrinho está vazio.</p>
        <Button render={<Link href="/produtos">Ver catálogo</Link>} />
      </div>
    );
  }

  const total = cartTotalPrice(items);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col divide-y rounded-lg border">
        {items.map((item) => (
          <div key={item.productId} className="flex items-center gap-4 p-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
              {item.imageUrl ? (
                <Image src={item.imageUrl} alt={item.name} fill sizes="64px" className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">Sem imagem</div>
              )}
            </div>

            <div className="flex flex-1 flex-col gap-1">
              <Link href={`/produto/${item.slug}`} className="text-sm font-medium hover:underline">
                {item.name}
              </Link>
              <span className="text-sm text-muted-foreground tabular-nums">{formatBRL(item.unitPrice)} / un.</span>
            </div>

            <Input
              type="number"
              min={1}
              value={item.quantity}
              onChange={(event) => setQuantity(item.productId, Math.max(1, Number(event.target.value) || 1))}
              className="w-16"
              aria-label={`Quantidade de ${item.name}`}
            />

            <span className="w-24 text-right text-sm font-medium tabular-nums">{formatBRL(item.unitPrice * item.quantity)}</span>

            <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(item.productId)}>
              Remover
            </Button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-lg border bg-muted/20 p-4">
        <span className="text-sm font-medium">Subtotal</span>
        <span className="text-xl font-semibold tabular-nums">{formatBRL(total)}</span>
      </div>

      <Button render={<Link href="/checkout">Finalizar compra</Link>} size="lg" className="w-full sm:w-fit sm:self-end" />
    </div>
  );
}
