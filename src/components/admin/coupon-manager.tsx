"use client";

import { useActionState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleActiveButton } from "@/components/admin/toggle-active-button";
import { adminBtnWine, adminCard, adminInput, adminLabel, adminPanel } from "@/components/admin/ui-styles";
import { saveCouponAction, toggleCouponActiveAction, type ActionState } from "@/app/admin/cupons/actions";
import { formatBRL } from "@/lib/format";
import type { Coupon } from "@/lib/types";

export function CouponManager({ coupons }: { coupons: Coupon[] }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(saveCouponAction, undefined);

  return (
    <div className="flex flex-col gap-6">
      <div className={adminPanel}>
        {coupons.length === 0 ? <p className="p-4 text-sm text-ink/52">Nenhum cupom cadastrado.</p> : null}
        {coupons.map((coupon, index) => (
          <div key={coupon.id} className={`flex items-center justify-between gap-3 px-4 py-3.5 text-sm ${index > 0 ? "border-t border-line" : ""}`}>
            <div>
              <span className="font-[family-name:var(--font-display)] font-semibold text-wine">{coupon.code}</span>{" "}
              <span className="text-ink/52">
                — {coupon.type === "percent" ? `${coupon.value}%` : formatBRL(coupon.value)}
                {coupon.min_order > 0 ? ` · mín. ${formatBRL(coupon.min_order)}` : ""}
                {coupon.usage_limit ? ` · ${coupon.used_count}/${coupon.usage_limit} usos` : ` · ${coupon.used_count} usos`}
              </span>
            </div>
            <ToggleActiveButton id={coupon.id} isActive={coupon.is_active} action={toggleCouponActiveAction} label={coupon.is_active ? "Desativar" : "Ativar"} />
          </div>
        ))}
      </div>

      <form action={formAction} className={`${adminCard} flex flex-wrap items-end gap-3`}>
        <div style={{ width: 140 }}>
          <label className={adminLabel}>Código</label>
          <input name="code" className={`${adminInput} font-mono uppercase`} required />
        </div>
        <div style={{ width: 140 }}>
          <label className={adminLabel}>Tipo</label>
          <Select name="type" defaultValue="percent">
            <SelectTrigger className="w-full rounded-[9px] border-line focus-visible:border-wine focus-visible:ring-wine-tint">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percent">% percentual</SelectItem>
              <SelectItem value="fixed">R$ fixo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div style={{ width: 110 }}>
          <label className={adminLabel}>Valor</label>
          <input name="value" type="number" step="0.01" min="0" className={adminInput} required />
        </div>
        <div style={{ width: 130 }}>
          <label className={adminLabel}>Pedido mín. (R$)</label>
          <input name="minOrder" type="number" step="0.01" min="0" className={adminInput} />
        </div>
        <div style={{ width: 110 }}>
          <label className={adminLabel}>Limite de usos</label>
          <input name="usageLimit" type="number" min="1" className={adminInput} />
        </div>
        <div style={{ width: 170 }}>
          <label className={adminLabel}>Válido até</label>
          <input name="validUntil" type="date" className={adminInput} />
        </div>
        <button type="submit" disabled={pending} className={`${adminBtnWine} disabled:pointer-events-none disabled:opacity-50`}>
          {pending ? "Salvando..." : "+ Criar cupom"}
        </button>
        {state?.error ? <p className="w-full text-sm text-destructive">{state.error}</p> : null}
      </form>
    </div>
  );
}
