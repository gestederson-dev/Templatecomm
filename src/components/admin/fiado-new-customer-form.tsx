"use client";

import { useActionState } from "react";
import { createFiadoCustomerAction, type ActionState } from "@/app/admin/fiado/actions";
import { adminBtnWine, adminCard, adminInput, adminLabel } from "@/components/admin/ui-styles";

export function FiadoNewCustomerForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(createFiadoCustomerAction, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className={`${adminCard} flex flex-col gap-3.5`}>
        <h2 className="font-[family-name:var(--font-display)] text-[15px] font-semibold">Cliente</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={adminLabel}>Nome</label>
            <input name="name" required className={adminInput} />
          </div>
          <div>
            <label className={adminLabel}>Telefone</label>
            <input name="phone" placeholder="(00) 00000-0000" className={adminInput} />
          </div>
        </div>
        <div>
          <label className={adminLabel}>Observações</label>
          <textarea name="notes" rows={2} className={adminInput} placeholder="Ex: paga sempre no fim do mês" />
        </div>
      </div>

      <div className={`${adminCard} flex flex-col gap-3.5`}>
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-[15px] font-semibold">Cobrança inicial</h2>
          <p className="mt-0.5 text-[11.5px] text-ink/52">Opcional — pode deixar em branco e lançar depois na página do cliente.</p>
        </div>
        <div>
          <label className={adminLabel}>O que foi vendido</label>
          <input name="description" className={adminInput} placeholder="Ex: 3 canecas + 1 chaveiro" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={adminLabel}>Valor (R$)</label>
            <input name="amount" type="number" min="0" step="0.01" className={adminInput} />
          </div>
          <label className="mt-6 flex items-center gap-2 text-sm text-ink/70">
            <input type="checkbox" name="delivered" className="h-4 w-4 accent-wine" />
            Já entregue
          </label>
        </div>
      </div>

      {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}

      <button type="submit" disabled={pending} className={`${adminBtnWine} w-fit disabled:pointer-events-none disabled:opacity-50`}>
        {pending ? "Criando..." : "Criar fiado"}
      </button>
    </form>
  );
}
