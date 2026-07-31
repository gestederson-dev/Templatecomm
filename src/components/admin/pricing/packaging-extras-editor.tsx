"use client";

import { useState } from "react";
import { adminInput } from "@/components/admin/ui-styles";

type PackagingExtra = { id: string; label: string; amount: number; per: "unit" | "order" };

function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `extra-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function PackagingExtrasEditor({ initial }: { initial: PackagingExtra[] }) {
  const [items, setItems] = useState<PackagingExtra[]>(initial.length > 0 ? initial : [{ id: newId(), label: "", amount: 0, per: "unit" }]);

  function updateItem(index: number, patch: Partial<PackagingExtra>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function addItem() {
    setItems((prev) => [...prev, { id: newId(), label: "", amount: 0, per: "unit" }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name="packagingExtrasJson" value={JSON.stringify(items)} />
      <div className="grid grid-cols-[1fr_110px_130px_32px] gap-2 text-[11px] font-semibold uppercase tracking-wide text-ink/52">
        <span>Item (cartão, doce, lembrancinha...)</span>
        <span>Valor (R$)</span>
        <span>Cobra por</span>
        <span />
      </div>
      {items.map((item, index) => (
        <div key={item.id} className="grid grid-cols-[1fr_110px_130px_32px] items-center gap-2">
          <input value={item.label} onChange={(e) => updateItem(index, { label: e.target.value })} placeholder="Ex: Cartão de agradecimento" className={adminInput} />
          <input type="number" step="0.01" min="0" value={item.amount} onChange={(e) => updateItem(index, { amount: Number(e.target.value) || 0 })} className={adminInput} />
          <select value={item.per} onChange={(e) => updateItem(index, { per: e.target.value as PackagingExtra["per"] })} className={adminInput}>
            <option value="unit">Unidade</option>
            <option value="order">Pedido</option>
          </select>
          <button type="button" onClick={() => removeItem(index)} aria-label="Remover item" className="grid h-8 w-8 place-items-center rounded-lg border border-line text-ink/52 hover:border-wine hover:text-wine">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} className="h-3.5 w-3.5 stroke-current">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      ))}
      <button type="button" onClick={addItem} className="self-start text-[12.5px] font-semibold text-wine hover:underline">
        + Adicionar item de embalagem
      </button>
      <p className="text-[11.5px] text-ink/52">
        <strong>Por unidade</strong>: cobra em toda peça vendida (ex.: adesivo). <strong>Por pedido</strong>: cobra uma vez e dilui pela quantidade (ex.: uma lembrancinha por caixa, não por peça).
      </p>
    </div>
  );
}
