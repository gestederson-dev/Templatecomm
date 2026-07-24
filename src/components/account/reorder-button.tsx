"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cart";
import { btnOutline } from "@/components/store/button-styles";
import { reorderAction } from "@/app/(store)/conta/pedidos/actions";

export function ReorderButton({ orderId }: { orderId: string }) {
  const addItem = useCartStore((state) => state.addItem);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);

    const result = await reorderAction(orderId);

    setLoading(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }

    for (const item of result.items) {
      addItem(
        { productId: item.productId, name: item.name, slug: item.slug, unitPrice: item.unitPrice, imageUrl: item.imageUrl, customization: item.customization },
        item.quantity,
      );
    }
    router.push("/carrinho");
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button type="button" className={`${btnOutline} px-4 py-1.5 text-xs`} disabled={loading} onClick={handleClick}>
        {loading ? "Adicionando..." : "Comprar novamente"}
      </button>
      {error ? <p className="max-w-[160px] text-right text-[11px] text-destructive">{error}</p> : null}
    </div>
  );
}
