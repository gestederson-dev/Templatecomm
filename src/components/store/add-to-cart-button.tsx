"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/stores/cart";

export function AddToCartButton({
  productId,
  name,
  slug,
  unitPrice,
  imageUrl,
}: {
  productId: string;
  name: string;
  slug: string;
  unitPrice: number;
  imageUrl: string | null;
}) {
  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem({ productId, name, slug, unitPrice, imageUrl }, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        min={1}
        value={quantity}
        onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
        className="w-16"
        aria-label="Quantidade"
      />
      <Button onClick={handleAdd} className="flex-1">
        {added ? "Adicionado ✓" : "Adicionar ao carrinho"}
      </Button>
    </div>
  );
}
