"use client";

import { useActionState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveCouponAction, toggleCouponActiveAction, type ActionState } from "@/app/admin/cupons/actions";
import { formatBRL } from "@/lib/format";
import type { Coupon } from "@/lib/types";

export function CouponManager({ coupons }: { coupons: Coupon[] }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(saveCouponAction, undefined);
  const [toggling, startToggle] = useTransition();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col divide-y rounded-lg border">
        {coupons.length === 0 ? <p className="p-4 text-sm text-muted-foreground">Nenhum cupom cadastrado.</p> : null}
        {coupons.map((coupon) => (
          <div key={coupon.id} className="flex items-center justify-between p-4 text-sm">
            <div>
              <span className="font-mono font-medium">{coupon.code}</span>{" "}
              <span className="text-muted-foreground">
                — {coupon.type === "percent" ? `${coupon.value}%` : formatBRL(coupon.value)}
                {coupon.min_order > 0 ? ` · mín. ${formatBRL(coupon.min_order)}` : ""}
                {coupon.usage_limit ? ` · ${coupon.used_count}/${coupon.usage_limit} usos` : ` · ${coupon.used_count} usos`}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={coupon.is_active ? "default" : "secondary"}>{coupon.is_active ? "Ativo" : "Inativo"}</Badge>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={toggling}
                onClick={() => startToggle(() => toggleCouponActiveAction(coupon.id, !coupon.is_active))}
              >
                {coupon.is_active ? "Desativar" : "Ativar"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <form action={formAction} className="flex flex-wrap items-end gap-3 rounded-lg border p-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Código</label>
          <Input name="code" className="w-32 font-mono uppercase" required />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Tipo</label>
          <Select name="type" defaultValue="percent">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percent">% percentual</SelectItem>
              <SelectItem value="fixed">R$ fixo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Valor</label>
          <Input name="value" type="number" step="0.01" min="0" className="w-24" required />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Pedido mín. (R$)</label>
          <Input name="minOrder" type="number" step="0.01" min="0" className="w-28" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Limite de usos</label>
          <Input name="usageLimit" type="number" min="1" className="w-24" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Válido até</label>
          <Input name="validUntil" type="date" className="w-40" />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "+ Criar cupom"}
        </Button>
        {state?.error ? <p className="w-full text-sm text-destructive">{state.error}</p> : null}
      </form>
    </div>
  );
}
