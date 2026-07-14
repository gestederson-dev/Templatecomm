"use client";

import { useActionState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminBtnWine, adminCard, adminInput, adminLabel } from "@/components/admin/ui-styles";
import { updateOrderStatusAction, type ActionState } from "@/app/admin/pedidos/actions";
import type { Order } from "@/lib/types";

const STATUSES = [
  { value: "pending", label: "Aguardando pagamento" },
  { value: "paid", label: "Pago" },
  { value: "processing", label: "Em preparação" },
  { value: "shipped", label: "Enviado" },
  { value: "delivered", label: "Entregue" },
  { value: "canceled", label: "Cancelado" },
];

export function OrderStatusForm({ order }: { order: Order }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(updateOrderStatusAction, undefined);

  return (
    <form action={formAction} className={`${adminCard} flex flex-wrap items-end gap-3`}>
      <input type="hidden" name="id" value={order.id} />
      <div style={{ width: 220 }}>
        <label className={adminLabel}>Status</label>
        <Select name="status" defaultValue={order.status}>
          <SelectTrigger className="w-full rounded-[9px] border-line focus-visible:border-wine focus-visible:ring-wine-tint">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div style={{ width: 200 }}>
        <label className={adminLabel}>Código de rastreio</label>
        <input name="trackingCode" defaultValue={order.tracking_code ?? ""} className={adminInput} />
      </div>
      <button type="submit" disabled={pending} className={`${adminBtnWine} disabled:pointer-events-none disabled:opacity-50`}>
        {pending ? "Salvando..." : "Atualizar"}
      </button>
      {state?.error ? <p className="w-full text-sm text-destructive">{state.error}</p> : null}
    </form>
  );
}
