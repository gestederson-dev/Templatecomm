"use client";

import { useActionState } from "react";
import { addFiadoChargeAction, type ActionState } from "@/app/admin/fiado/actions";
import { adminBtnSoft, adminInput, adminLabel } from "@/components/admin/ui-styles";

export function FiadoChargeForm({ customerId }: { customerId: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(addFiadoChargeAction, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-xl border border-line bg-paper p-3.5">
      <input type="hidden" name="customerId" value={customerId} />
      <div className="grid grid-cols-[1fr_120px] gap-2.5">
        <div>
          <label className={adminLabel}>O que foi vendido</label>
          <input name="description" required className={adminInput} placeholder="Ex: 2 canecas personalizadas" />
        </div>
        <div>
          <label className={adminLabel}>Valor (R$)</label>
          <input name="amount" type="number" min="0" step="0.01" required className={adminInput} />
        </div>
      </div>
      <div className="grid grid-cols-[120px_1fr] items-end gap-2.5">
        <div>
          <label className={adminLabel}>Data</label>
          <input name="occurredAt" type="date" className={adminInput} />
        </div>
        <label className="mb-2.5 flex items-center gap-2 text-sm text-ink/70">
          <input type="checkbox" name="delivered" className="h-4 w-4 accent-wine" />
          Já entregue
        </label>
      </div>
      {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      <button type="submit" disabled={pending} className={`${adminBtnSoft} w-fit disabled:pointer-events-none disabled:opacity-50`}>
        {pending ? "Adicionando..." : "+ Adicionar cobrança"}
      </button>
    </form>
  );
}
