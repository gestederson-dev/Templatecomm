"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    <form action={formAction} className="flex flex-wrap items-end gap-3 rounded-lg border p-4">
      <input type="hidden" name="id" value={order.id} />
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Status</label>
        <Select name="status" defaultValue={order.status}>
          <SelectTrigger className="w-48">
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
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Código de rastreio</label>
        <Input name="trackingCode" defaultValue={order.tracking_code ?? ""} className="w-48" />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Atualizar"}
      </Button>
      {state?.error ? <p className="w-full text-sm text-destructive">{state.error}</p> : null}
    </form>
  );
}
