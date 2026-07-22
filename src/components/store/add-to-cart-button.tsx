"use client";

import { useState } from "react";
import { useCartStore } from "@/stores/cart";
import { btnWine } from "@/components/store/button-styles";
import { storeInput } from "@/components/store/ui-styles";
import { CustomizationFields } from "@/components/store/customization-fields";
import type { ProductCustomizationOption } from "@/lib/types";

export function AddToCartButton({
  productId,
  name,
  slug,
  unitPrice,
  imageUrl,
  customizationOptions = [],
}: {
  productId: string;
  name: string;
  slug: string;
  unitPrice: number;
  imageUrl: string | null;
  customizationOptions?: ProductCustomizationOption[];
}) {
  // upload de logo pede sessão (bucket é por usuário) — compra direta é
  // aberta pra visitante, então essa opção só existe no fluxo de orçamento.
  const options = customizationOptions.filter((option) => option.type !== "logo_upload");

  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);
  const [values, setValues] = useState<Record<string, string>>({});
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleAdd() {
    const missing = options.find((option) => option.required && !values[option.name]);
    if (missing) {
      setError(`Selecione "${missing.name}".`);
      return;
    }
    setError(null);

    addItem({ productId, name, slug, unitPrice, imageUrl, customization: Object.keys(values).length > 0 ? values : undefined }, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="flex flex-col gap-3">
      {options.length > 0 ? (
        <div className="flex flex-col gap-3">
          <CustomizationFields options={options} values={values} onChange={(fieldName, value) => setValues((prev) => ({ ...prev, [fieldName]: value }))} />
        </div>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

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
    </div>
  );
}
