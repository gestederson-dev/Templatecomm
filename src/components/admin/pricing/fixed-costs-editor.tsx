"use client";

import { useState } from "react";
import { adminInput } from "@/components/admin/ui-styles";

export function FixedCostsEditor({ initial }: { initial: { label: string; amount: number }[] }) {
  const [items, setItems] = useState(initial.length > 0 ? initial : [{ label: "", amount: 0 }]);

  function updateItem(index: number, patch: Partial<{ label: string; amount: number }>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function addItem() {
    setItems((prev) => [...prev, { label: "", amount: 0 }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name="fixedCostsJson" value={JSON.stringify(items)} />
      <div className="grid grid-cols-[1fr_140px_32px] gap-2 text-[11px] font-semibold uppercase tracking-wide text-ink/52">
        <span>Custo fixo mensal</span>
        <span>Valor (R$)</span>
        <span />
      </div>
      {items.map((item, index) => (
        <div key={index} className="grid grid-cols-[1fr_140px_32px] items-center gap-2">
          <input value={item.label} onChange={(e) => updateItem(index, { label: e.target.value })} placeholder="Ex: Hospedagem, assinaturas..." className={adminInput} />
          <input type="number" step="0.01" min="0" value={item.amount} onChange={(e) => updateItem(index, { amount: Number(e.target.value) || 0 })} className={adminInput} />
          <button type="button" onClick={() => removeItem(index)} aria-label="Remover custo" className="grid h-8 w-8 place-items-center rounded-lg border border-line text-ink/52 hover:border-wine hover:text-wine">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} className="h-3.5 w-3.5 stroke-current">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      ))}
      <button type="button" onClick={addItem} className="self-start text-[12.5px] font-semibold text-wine hover:underline">
        + Adicionar custo fixo
      </button>
    </div>
  );
}
