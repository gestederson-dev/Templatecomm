"use client";

import { useActionState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addPriceTierAction, deletePriceTierAction, type ActionState } from "@/app/admin/produtos/actions";
import { formatBRL } from "@/lib/format";
import type { PriceTier } from "@/lib/types";

export function ProductPriceTiers({ productId, tiers }: { productId: string; tiers: PriceTier[] }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(addPriceTierAction, undefined);
  const [deleting, startDelete] = useTransition();

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4">
      <h2 className="text-sm font-semibold">Faixas de preço por quantidade</h2>

      {tiers.length > 0 ? (
        <ul className="flex flex-col gap-1 text-sm">
          {tiers.map((tier) => (
            <li key={tier.id} className="flex items-center justify-between">
              <span>
                {tier.min_quantity}
                {tier.max_quantity ? `–${tier.max_quantity}` : "+"} un. — {formatBRL(tier.unit_price)}
              </span>
              <button type="button" disabled={deleting} className="text-xs text-destructive hover:underline" onClick={() => startDelete(() => deletePriceTierAction(tier.id, productId))}>
                Remover
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <form action={formAction} className="flex flex-wrap items-end gap-2">
        <input type="hidden" name="productId" value={productId} />
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Mín.</label>
          <Input name="minQuantity" type="number" min={1} className="w-20" required />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Máx. (vazio = ou mais)</label>
          <Input name="maxQuantity" type="number" min={1} className="w-24" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Preço unitário (R$)</label>
          <Input name="unitPrice" type="number" step="0.01" min="0" className="w-28" required />
        </div>
        <Button type="submit" size="sm" variant="outline" disabled={pending}>
          {pending ? "Adicionando..." : "+ Adicionar"}
        </Button>
      </form>
      {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
    </div>
  );
}
