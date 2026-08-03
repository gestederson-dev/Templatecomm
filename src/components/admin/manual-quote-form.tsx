"use client";

import { useActionState, useMemo, useState } from "react";
import { createManualQuoteAction, type ActionState } from "@/app/admin/orcamentos/novo/actions";
import { adminBtnSoft, adminBtnWine, adminCard, adminInput, adminLabel } from "@/components/admin/ui-styles";
import { CustomizationFields } from "@/components/store/customization-fields";
import { formatBRL } from "@/lib/format";
import type { ProductCustomizationOption } from "@/lib/types";

type Customer = { id: string; name: string; phone: string | null };
type ProductOption = { id: string; name: string; sku: string | null; basePrice: number | null; customizationOptions: ProductCustomizationOption[] };
type LineItem = { productId: string; productName: string; quantity: number; unitPrice: number | null; customization?: Record<string, string> | null };

function lineKey(item: Pick<LineItem, "productId" | "customization">): string {
  if (!item.customization || Object.keys(item.customization).length === 0) return item.productId;
  const sorted = Object.keys(item.customization)
    .sort()
    .map((key) => `${key}=${item.customization?.[key]}`)
    .join("&");
  return `${item.productId}::${sorted}`;
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

export function ManualQuoteForm({ customers, products }: { customers: Customer[]; products: ProductOption[] }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(createManualQuoteAction, undefined);

  const [customerMode, setCustomerMode] = useState<"cadastrado" | "avulso">("cadastrado");
  const [customerSearch, setCustomerSearch] = useState("");
  const [profileId, setProfileId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const [items, setItems] = useState<LineItem[]>([]);
  const [pickProductId, setPickProductId] = useState("");
  const [pendingCustomization, setPendingCustomization] = useState<Record<string, string>>({});
  const [customizationError, setCustomizationError] = useState<string | null>(null);

  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return customers;
    const term = customerSearch.trim().toLowerCase();
    return customers.filter((c) => c.name.toLowerCase().includes(term));
  }, [customerSearch, customers]);

  const pickedProduct = products.find((p) => p.id === pickProductId);
  const pickedProductOptions = (pickedProduct?.customizationOptions ?? []).filter((o) => o.type !== "logo_upload");

  function addItem() {
    const product = products.find((p) => p.id === pickProductId);
    if (!product) return;

    const missing = pickedProductOptions.find((option) => option.required && !pendingCustomization[option.name]);
    if (missing) {
      setCustomizationError(`Selecione "${missing.name}".`);
      return;
    }
    setCustomizationError(null);

    const customization = Object.keys(pendingCustomization).length > 0 ? pendingCustomization : null;
    const key = lineKey({ productId: product.id, customization });

    setItems((prev) => {
      const existing = prev.find((i) => lineKey(i) === key);
      if (existing) {
        return prev.map((i) => (lineKey(i) === key ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { productId: product.id, productName: product.name, quantity: 1, unitPrice: product.basePrice, customization }];
    });
    setPickProductId("");
    setPendingCustomization({});
  }

  function updateItem(item: LineItem, patch: Partial<LineItem>) {
    const key = lineKey(item);
    setItems((prev) => prev.map((i) => (lineKey(i) === key ? { ...i, ...patch } : i)));
  }

  function removeItem(item: LineItem) {
    const key = lineKey(item);
    setItems((prev) => prev.filter((i) => lineKey(i) !== key));
  }

  const hasAllPrices = items.length > 0 && items.every((i) => i.unitPrice != null);
  const total = items.reduce((sum, i) => sum + i.quantity * (i.unitPrice ?? 0), 0);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="profileId" value={customerMode === "cadastrado" ? profileId : ""} />
      <input type="hidden" name="customerName" value={customerMode === "avulso" ? customerName : ""} />
      <input type="hidden" name="customerPhone" value={customerMode === "avulso" ? customerPhone : ""} />
      <input type="hidden" name="items" value={JSON.stringify(items)} />

      <div className={`${adminCard} flex flex-col gap-3.5`}>
        <h2 className="font-[family-name:var(--font-display)] text-[15px] font-semibold">Cliente</h2>
        <div className="flex w-fit gap-1.5 rounded-[10px] border border-line bg-paper p-1">
          <button
            type="button"
            onClick={() => setCustomerMode("cadastrado")}
            className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors ${customerMode === "cadastrado" ? "bg-wine text-white" : "text-ink/55 hover:text-wine"}`}
          >
            Cliente cadastrado
          </button>
          <button
            type="button"
            onClick={() => setCustomerMode("avulso")}
            className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors ${customerMode === "avulso" ? "bg-wine text-white" : "text-ink/55 hover:text-wine"}`}
          >
            Cliente avulso
          </button>
        </div>

        {customerMode === "cadastrado" ? (
          <div className="flex flex-col gap-2.5">
            <input placeholder="Buscar cliente por nome..." value={customerSearch} onChange={(event) => setCustomerSearch(event.target.value)} className={adminInput} />
            <div className="max-h-56 overflow-y-auto rounded-[9px] border border-line">
              {filteredCustomers.length === 0 ? (
                <p className="p-3 text-sm text-ink/45">Nenhum cliente encontrado.</p>
              ) : (
                filteredCustomers.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setProfileId(c.id)}
                    className={`flex w-full items-center gap-3 border-b border-line px-3 py-2.5 text-left text-sm transition-colors last:border-b-0 ${
                      profileId === c.id ? "bg-wine-tint" : "hover:bg-paper"
                    }`}
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-wine-tint font-[family-name:var(--font-display)] text-[11px] font-bold text-wine">
                      {initialsOf(c.name)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-ink">{c.name}</span>
                      {c.phone ? <span className="block text-xs text-ink/52">{c.phone}</span> : null}
                    </span>
                    {profileId === c.id ? (
                      <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 stroke-wine" fill="none" strokeWidth={2.5}>
                        <path d="M5 12l5 5L20 7" />
                      </svg>
                    ) : null}
                  </button>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={adminLabel}>Nome</label>
              <input value={customerName} onChange={(event) => setCustomerName(event.target.value)} className={adminInput} />
            </div>
            <div>
              <label className={adminLabel}>Telefone</label>
              <input value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} placeholder="(00) 00000-0000" className={adminInput} />
            </div>
          </div>
        )}
      </div>

      <div className={`${adminCard} flex flex-col gap-3.5`}>
        <h2 className="font-[family-name:var(--font-display)] text-[15px] font-semibold">Produtos</h2>
        <div className="flex gap-2.5">
          <select
            value={pickProductId}
            onChange={(event) => {
              setPickProductId(event.target.value);
              setPendingCustomization({});
              setCustomizationError(null);
            }}
            className={`${adminInput} flex-1`}
          >
            <option value="">Selecione um produto...</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
                {p.sku ? ` (${p.sku})` : ""}
              </option>
            ))}
          </select>
          <button type="button" onClick={addItem} disabled={!pickProductId} className={`${adminBtnSoft} disabled:opacity-40`}>
            Adicionar
          </button>
        </div>

        {pickedProductOptions.length > 0 ? (
          <div className="flex flex-col gap-3 rounded-xl border border-line bg-paper p-3.5">
            <CustomizationFields
              options={pickedProductOptions}
              values={pendingCustomization}
              onChange={(name, value) => setPendingCustomization((prev) => ({ ...prev, [name]: value }))}
            />
            {customizationError ? <p className="text-sm text-destructive">{customizationError}</p> : null}
          </div>
        ) : null}

        {items.length > 0 ? (
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-[1fr_72px_110px_96px_32px] gap-2.5 px-2.5 text-[11px] font-semibold uppercase tracking-wide text-ink/52">
              <span>Produto</span>
              <span>Qtd.</span>
              <span>Preço un. (opcional)</span>
              <span>Total</span>
              <span />
            </div>
            {items.map((item) => (
              <div key={lineKey(item)} className="grid grid-cols-[1fr_72px_110px_96px_32px] items-center gap-2.5 rounded-xl border border-line p-2.5 text-sm">
                <div>
                  <span className="font-medium text-ink">{item.productName}</span>
                  {item.customization && Object.keys(item.customization).length > 0 ? (
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {Object.entries(item.customization).map(([key, val]) => (
                        <span key={key} className="rounded-md bg-ink/5 px-2 py-0.5 text-[11px] font-medium text-ink/60">
                          {key}: {val}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(event) => updateItem(item, { quantity: Math.max(1, Number(event.target.value) || 1) })}
                  className={`${adminInput} px-2 py-1.5 text-center`}
                />
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={item.unitPrice ?? ""}
                  placeholder="a cotar"
                  onChange={(event) => updateItem(item, { unitPrice: event.target.value === "" ? null : Math.max(0, Number(event.target.value) || 0) })}
                  className={`${adminInput} px-2 py-1.5`}
                />
                <span className="text-right font-semibold tabular-nums text-wine">{item.unitPrice != null ? formatBRL(item.quantity * item.unitPrice) : "—"}</span>
                <button
                  type="button"
                  onClick={() => removeItem(item)}
                  aria-label="Remover produto"
                  className="grid h-8 w-8 place-items-center rounded-lg text-ink/45 hover:bg-destructive/10 hover:text-destructive"
                >
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} className="h-3.5 w-3.5 stroke-current">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink/45">Nenhum produto adicionado.</p>
        )}
      </div>

      <div className={`${adminCard} flex flex-col gap-3.5`}>
        <label className={adminLabel}>Mensagem do cliente / observações</label>
        <textarea name="customerMessage" rows={3} className={adminInput} placeholder="Ex: pediu orçamento via WhatsApp em 22/07, quer 200 canecas com logo" />
      </div>

      {items.length > 0 ? (
        <div className={`${adminCard} flex items-center justify-between text-sm`}>
          <span className="text-ink/70">{hasAllPrices ? "Total cotado" : "Total (defina o preço de todos os itens pra fechar o valor)"}</span>
          <span className="font-[family-name:var(--font-display)] text-base font-semibold tabular-nums text-wine">{hasAllPrices ? formatBRL(total) : "A cotar"}</span>
        </div>
      ) : null}

      {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}

      <button type="submit" disabled={pending || items.length === 0} className={`${adminBtnWine} w-fit disabled:pointer-events-none disabled:opacity-50`}>
        {pending ? "Criando..." : "Criar orçamento"}
      </button>
    </form>
  );
}
