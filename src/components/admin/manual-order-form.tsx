"use client";

import { useActionState, useMemo, useState } from "react";
import { createManualOrderAction, type ActionState } from "@/app/admin/pedidos/novo/actions";
import { updateManualOrderAction } from "@/app/admin/pedidos/[id]/editar/actions";
import { adminBtnSoft, adminBtnWine, adminCard, adminInput, adminLabel } from "@/components/admin/ui-styles";
import { CustomizationFields } from "@/components/store/customization-fields";
import { formatBRL } from "@/lib/format";
import type { OrderStatus, ProductCustomizationOption } from "@/lib/types";

type Customer = { id: string; name: string; phone: string | null };
type ProductOption = { id: string; name: string; sku: string | null; basePrice: number | null; customizationOptions: ProductCustomizationOption[] };
type LineItem = { productId: string; productName: string; quantity: number; unitPrice: number; customization?: Record<string, string> | null };

export type ExistingOrderForEdit = {
  id: string;
  profileId: string | null;
  customerName: string | null;
  customerPhone: string | null;
  status: OrderStatus;
  paymentMethod: string | null;
  notes: string | null;
  discount: number;
  shippingCost: number;
  shippingAddress: Record<string, string> | null;
  items: LineItem[];
};

function lineKey(item: Pick<LineItem, "productId" | "customization">): string {
  if (!item.customization || Object.keys(item.customization).length === 0) return item.productId;
  const sorted = Object.keys(item.customization)
    .sort()
    .map((key) => `${key}=${item.customization?.[key]}`)
    .join("&");
  return `${item.productId}::${sorted}`;
}

const STATUSES = [
  { value: "paid", label: "Pago" },
  { value: "pending", label: "Aguardando pagamento" },
  { value: "processing", label: "Em preparação" },
  { value: "shipped", label: "Enviado" },
  { value: "delivered", label: "Entregue" },
  { value: "canceled", label: "Cancelado" },
];

const PAYMENT_METHODS = ["Pix", "Dinheiro", "Cartão de crédito", "Cartão de débito", "Transferência"];

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

export function ManualOrderForm({ customers, products, order }: { customers: Customer[]; products: ProductOption[]; order?: ExistingOrderForEdit }) {
  const isEditing = Boolean(order);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(isEditing ? updateManualOrderAction : createManualOrderAction, undefined);

  const [customerMode, setCustomerMode] = useState<"cadastrado" | "avulso">(order?.profileId ? "cadastrado" : order ? "avulso" : "cadastrado");
  const [customerSearch, setCustomerSearch] = useState("");
  const [profileId, setProfileId] = useState(order?.profileId ?? "");
  const [customerName, setCustomerName] = useState(order?.customerName ?? "");
  const [customerPhone, setCustomerPhone] = useState(order?.customerPhone ?? "");

  const [items, setItems] = useState<LineItem[]>(order?.items ?? []);
  const [pickProductId, setPickProductId] = useState("");
  const [pendingCustomization, setPendingCustomization] = useState<Record<string, string>>({});
  const [customizationError, setCustomizationError] = useState<string | null>(null);

  const [includeShipping, setIncludeShipping] = useState(Boolean(order?.shippingAddress));
  const [shippingCost, setShippingCost] = useState(String(order?.shippingCost ?? 0));
  const [discount, setDiscount] = useState(String(order?.discount ?? 0));

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
      return [...prev, { productId: product.id, productName: product.name, quantity: 1, unitPrice: product.basePrice ?? 0, customization }];
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

  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const shippingNum = includeShipping ? Number(shippingCost) || 0 : 0;
  const discountNum = Number(discount) || 0;
  const total = Math.max(0, subtotal + shippingNum - discountNum);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {order ? <input type="hidden" name="orderId" value={order.id} /> : null}
      <input type="hidden" name="profileId" value={customerMode === "cadastrado" ? profileId : ""} />
      <input type="hidden" name="customerName" value={customerMode === "avulso" ? customerName : ""} />
      <input type="hidden" name="customerPhone" value={customerMode === "avulso" ? customerPhone : ""} />
      <input type="hidden" name="items" value={JSON.stringify(items)} />
      <input type="hidden" name="includeShipping" value={includeShipping ? "on" : ""} />

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
                  value={item.unitPrice}
                  onChange={(event) => updateItem(item, { unitPrice: Math.max(0, Number(event.target.value) || 0) })}
                  className={`${adminInput} px-2 py-1.5`}
                />
                <span className="text-right font-semibold tabular-nums text-wine">{formatBRL(item.quantity * item.unitPrice)}</span>
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
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            role="switch"
            aria-checked={includeShipping}
            aria-label="Incluir frete e endereço de entrega"
            onClick={() => setIncludeShipping((prev) => !prev)}
            className={`relative h-[22px] w-[38px] shrink-0 rounded-full transition-colors ${includeShipping ? "bg-ok" : "bg-ink/18"}`}
          >
            <span className={`absolute left-0.5 top-0.5 h-[18px] w-[18px] rounded-full bg-white transition-transform ${includeShipping ? "translate-x-4" : "translate-x-0"}`} />
          </button>
          <span className="text-sm font-semibold text-ink">Incluir frete e endereço de entrega</span>
        </div>

        {includeShipping ? (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={adminLabel}>CEP</label>
              <input name="cep" defaultValue={order?.shippingAddress?.cep ?? ""} className={adminInput} />
            </div>
            <div>
              <label className={adminLabel}>Valor do frete (R$)</label>
              <input type="number" min={0} step="0.01" name="shippingCost" value={shippingCost} onChange={(event) => setShippingCost(event.target.value)} className={adminInput} />
            </div>
            <div className="col-span-2">
              <label className={adminLabel}>Rua</label>
              <input name="street" defaultValue={order?.shippingAddress?.street ?? ""} className={adminInput} />
            </div>
            <div>
              <label className={adminLabel}>Número</label>
              <input name="number" defaultValue={order?.shippingAddress?.number ?? ""} className={adminInput} />
            </div>
            <div>
              <label className={adminLabel}>Complemento</label>
              <input name="complement" defaultValue={order?.shippingAddress?.complement ?? ""} className={adminInput} />
            </div>
            <div>
              <label className={adminLabel}>Bairro</label>
              <input name="district" defaultValue={order?.shippingAddress?.district ?? ""} className={adminInput} />
            </div>
            <div>
              <label className={adminLabel}>Cidade</label>
              <input name="city" defaultValue={order?.shippingAddress?.city ?? ""} className={adminInput} />
            </div>
            <div>
              <label className={adminLabel}>Estado</label>
              <input name="state" maxLength={2} defaultValue={order?.shippingAddress?.state ?? ""} className={adminInput} />
            </div>
          </div>
        ) : null}
      </div>

      <div className={`${adminCard} grid grid-cols-3 gap-3`}>
        <div>
          <label className={adminLabel}>Status</label>
          <select name="status" defaultValue={order?.status ?? "paid"} className={adminInput}>
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={adminLabel}>Forma de pagamento</label>
          <select name="paymentMethod" defaultValue={order?.paymentMethod ?? ""} className={adminInput}>
            <option value="">Não informado</option>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={adminLabel}>Desconto (R$)</label>
          <input type="number" min={0} step="0.01" value={discount} onChange={(event) => setDiscount(event.target.value)} name="discount" className={adminInput} />
        </div>
        <div className="col-span-3">
          <label className={adminLabel}>Observações</label>
          <textarea name="notes" rows={2} defaultValue={order?.notes ?? ""} className={adminInput} placeholder="Ex: venda combinada via WhatsApp em 22/07" />
        </div>
      </div>

      <div className={`${adminCard} flex flex-col gap-1.5 text-sm`}>
        <div className="flex justify-between text-ink/70">
          <span>Subtotal</span>
          <span className="tabular-nums">{formatBRL(subtotal)}</span>
        </div>
        <div className="flex justify-between text-ink/70">
          <span>Frete</span>
          <span className="tabular-nums">{formatBRL(shippingNum)}</span>
        </div>
        <div className="flex justify-between text-ink/70">
          <span>Desconto</span>
          <span className="tabular-nums">- {formatBRL(discountNum)}</span>
        </div>
        <div className="flex justify-between border-t border-line pt-2.5 text-base font-semibold text-ink">
          <span>Total</span>
          <span className="font-[family-name:var(--font-display)] tabular-nums text-wine">{formatBRL(total)}</span>
        </div>
      </div>

      {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}

      <button type="submit" disabled={pending || items.length === 0} className={`${adminBtnWine} w-fit disabled:pointer-events-none disabled:opacity-50`}>
        {pending ? "Salvando..." : isEditing ? "Salvar alterações" : "Criar pedido"}
      </button>
    </form>
  );
}
