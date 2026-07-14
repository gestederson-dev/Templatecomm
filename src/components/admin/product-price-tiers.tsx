"use client";

import { useActionState, useTransition } from "react";
import { addPriceTierAction, deletePriceTierAction, type ActionState } from "@/app/admin/produtos/actions";
import { adminCard, adminInput } from "@/components/admin/ui-styles";
import { formatBRL } from "@/lib/format";
import type { PriceTier } from "@/lib/types";

export function ProductPriceTiers({ productId, tiers }: { productId: string; tiers: PriceTier[] }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(addPriceTierAction, undefined);
  const [deleting, startDelete] = useTransition();

  return (
    <div className={adminCard}>
      <h3 className="mb-4 flex items-center gap-2 font-[family-name:var(--font-display)] text-[15px] font-semibold">
        Preço por quantidade <span className="rounded-md bg-wine-tint px-2 py-0.5 text-[11px] font-semibold text-wine">B2B</span>
      </h3>

      {tiers.length > 0 ? (
        <div className="mb-3 flex flex-col gap-2">
          <div className="grid grid-cols-[1fr_1fr_1fr_32px] gap-2 text-[11px] font-semibold uppercase tracking-wide text-ink/52">
            <span>Qtd. mínima</span>
            <span>Qtd. máxima</span>
            <span>Preço unitário</span>
            <span />
          </div>
          {tiers.map((tier) => (
            <div key={tier.id} className="grid grid-cols-[1fr_1fr_1fr_32px] items-center gap-2">
              <span className={`${adminInput} bg-ink/[0.02] text-[13px]`}>{tier.min_quantity}</span>
              <span className={`${adminInput} bg-ink/[0.02] text-[13px]`}>{tier.max_quantity ?? "ou mais"}</span>
              <span className={`${adminInput} bg-ink/[0.02] text-[13px]`}>{formatBRL(tier.unit_price)}</span>
              <button
                type="button"
                disabled={deleting}
                aria-label="Remover faixa"
                onClick={() => startDelete(() => deletePriceTierAction(tier.id, productId))}
                className="grid h-8 w-8 place-items-center rounded-lg border border-line text-ink/52 hover:border-wine hover:text-wine"
              >
                <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} className="h-3.5 w-3.5 stroke-current">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <form action={formAction} className="grid grid-cols-[1fr_1fr_1fr_32px] items-end gap-2">
        <input type="hidden" name="productId" value={productId} />
        <div>
          <label className="mb-1 block text-[11px] text-ink/52">Qtd. mínima</label>
          <input name="minQuantity" type="number" min={1} required className={adminInput} />
        </div>
        <div>
          <label className="mb-1 block text-[11px] text-ink/52">Qtd. máxima</label>
          <input name="maxQuantity" type="number" min={1} placeholder="ou mais" className={adminInput} />
        </div>
        <div>
          <label className="mb-1 block text-[11px] text-ink/52">Preço unitário</label>
          <input name="unitPrice" type="number" step="0.01" min="0" required className={adminInput} />
        </div>
        <button type="submit" disabled={pending} aria-label="Adicionar faixa" className="grid h-8 w-8 place-items-center rounded-lg border border-line text-wine hover:border-wine">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} className="h-3.5 w-3.5 stroke-current">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </form>
      {pending ? <p className="mt-2 text-xs text-ink/52">Adicionando...</p> : null}
      {state?.error ? <p className="mt-2 text-sm text-destructive">{state.error}</p> : null}
      {tiers.length === 0 ? <p className="mt-2 text-[11.5px] text-ink/40">Nenhuma faixa cadastrada ainda.</p> : null}
    </div>
  );
}
