"use client";

import { useActionState } from "react";
import { updateFiadoCustomerAction, type ActionState } from "@/app/admin/fiado/actions";
import { adminBtnSoft, adminCard, adminInput, adminLabel } from "@/components/admin/ui-styles";
import type { FiadoCustomer } from "@/lib/types";

export function FiadoCustomerInfoForm({ customer }: { customer: FiadoCustomer }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(updateFiadoCustomerAction, undefined);

  return (
    <form action={formAction} className={`${adminCard} flex flex-col gap-3.5`}>
      <input type="hidden" name="id" value={customer.id} />
      <h2 className="font-[family-name:var(--font-display)] text-[15px] font-semibold">Dados do cliente</h2>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={adminLabel}>Nome</label>
          <input name="name" defaultValue={customer.name} required className={adminInput} />
        </div>
        <div>
          <label className={adminLabel}>Telefone</label>
          <input name="phone" defaultValue={customer.phone ?? ""} className={adminInput} />
        </div>
      </div>
      <div>
        <label className={adminLabel}>Observações</label>
        <textarea name="notes" rows={2} defaultValue={customer.notes ?? ""} className={adminInput} />
      </div>
      {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      <button type="submit" disabled={pending} className={`${adminBtnSoft} w-fit disabled:pointer-events-none disabled:opacity-50`}>
        {pending ? "Salvando..." : "Salvar dados"}
      </button>
    </form>
  );
}
