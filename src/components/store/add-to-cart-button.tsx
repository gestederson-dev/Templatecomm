"use client";

import { useState } from "react";
import { useCartStore } from "@/stores/cart";
import { btnWine } from "@/components/store/button-styles";
import { storeInput } from "@/components/store/ui-styles";

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
    <div className="flex items-center gap-2.5">
      <input
        type="number"
        min={1}
        value={quantity}
        onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
        className={`${storeInput} w-16 px-2 py-2.5 text-center`}
        aria-label="Quantidade"
      />
      <button type="button" onClick={handleAdd} className={`${btnWine} flex-1 whitespace-nowrap`}>
        {added ? "Adicionado ✓" : "Adicionar ao carrinho"}
      </button>
    </div>
  );
}
