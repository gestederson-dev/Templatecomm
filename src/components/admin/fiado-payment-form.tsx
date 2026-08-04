"use client";

import { useActionState } from "react";
import { addFiadoPaymentAction, type ActionState } from "@/app/admin/fiado/actions";
import { adminBtnSoft, adminInput, adminLabel } from "@/components/admin/ui-styles";

export function FiadoPaymentForm({ customerId }: { customerId: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(addFiadoPaymentAction, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-xl border border-line bg-paper p-3.5">
      <input type="hidden" name="customerId" value={customerId} />
      <div className="grid grid-cols-[120px_120px] gap-2.5">
        <div>
          <label className={adminLabel}>Valor (R$)</label>
          <input name="amount" type="number" min="0" step="0.01" required className={adminInput} />
        </div>
        <div>
          <label className={adminLabel}>Data</label>
          <input name="paidAt" type="date" className={adminInput} />
        </div>
      </div>
      <div>
        <label className={adminLabel}>Observação (opcional)</label>
        <input name="notes" className={adminInput} placeholder="Ex: pagou via Pix" />
      </div>
      {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      <button type="submit" disabled={pending} className={`${adminBtnSoft} w-fit disabled:pointer-events-none disabled:opacity-50`}>
        {pending ? "Adicionando..." : "+ Registrar pagamento"}
      </button>
    </form>
  );
}
