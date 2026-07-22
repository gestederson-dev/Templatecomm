"use client";

import { useActionState, useMemo, useState } from "react";
import { createManualOrderAction, type ActionState } from "@/app/admin/pedidos/novo/actions";
import { adminBtnSoft, adminBtnWine, adminCard, adminInput, adminLabel } from "@/components/admin/ui-styles";
import { formatBRL } from "@/lib/format";

type Customer = { id: string; name: string; phone: string | null };
type ProductOption = { id: string; name: string; sku: string | null; basePrice: number | null };
type LineItem = { productId: string; productName: string; quantity: number; unitPrice: number };

const STATUSES = [
  { value: "paid", label: "Pago" },
  { value: "pending", label: "Aguardando pagamento" },
  { value: "processing", label: "Em preparação" },
  { value: "shipped", label: "Enviado" },
  { value: "delivered", label: "Entregue" },
  { value: "canceled", label: "Cancelado" },
];

const PAYMENT_METHODS = ["Pix", "Dinheiro", "Cartão de crédito", "Cartão de débito", "Transferência"];

export function ManualOrderForm({ customers, products }: { customers: Customer[]; products: ProductOption[] }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(createManualOrderAction, undefined);

  const [customerMode, setCustomerMode] = useState<"cadastrado" | "avulso">("cadastrado");
  const [customerSearch, setCustomerSearch] = useState("");
  const [profileId, setProfileId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const [items, setItems] = useState<LineItem[]>([]);
  const [pickProductId, setPickProductId] = useState("");

  const [includeShipping, setIncludeShipping] = useState(false);
  const [shippingCost, setShippingCost] = useState("0");
  const [discount, setDiscount] = useState("0");

  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return customers;
    const term = customerSearch.trim().toLowerCase();
    return customers.filter((c) => c.name.toLowerCase().includes(term));
  }, [customerSearch, customers]);

  function addItem() {
    const product = products.find((p) => p.id === pickProductId);
    if (!product) return;
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) => (i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { productId: product.id, productName: product.name, quantity: 1, unitPrice: product.basePrice ?? 0 }];
    });
    setPickProductId("");
  }

  function updateItem(productId: string, patch: Partial<LineItem>) {
    setItems((prev) => prev.map((i) => (i.productId === productId ? { ...i, ...patch } : i)));
  }

  function removeItem(productId: string) {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }

  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const shippingNum = includeShipping ? Number(shippingCost) || 0 : 0;
  const discountNum = Number(discount) || 0;
  const total = Math.max(0, subtotal + shippingNum - discountNum);

  return (
    <form action={formAction} className="flex flex-col gap-5">
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
            <select value={profileId} onChange={(event) => setProfileId(event.target.value)} className={adminInput} size={Math.min(6, Math.max(3, filteredCustomers.length || 1))}>
              <option value="">Selecione um cliente...</option>
              {filteredCustomers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.phone ? ` — ${c.phone}` : ""}
                </option>
              ))}
            </select>
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
          <select value={pickProductId} onChange={(event) => setPickProductId(event.target.value)} className={`${adminInput} flex-1`}>
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

        {items.length > 0 ? (
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <div key={item.productId} className="grid grid-cols-[1fr_72px_110px_96px_32px] items-center gap-2.5 rounded-xl border border-line p-2.5 text-sm">
                <span className="font-medium text-ink">{item.productName}</span>
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(event) => updateItem(item.productId, { quantity: Math.max(1, Number(event.target.value) || 1) })}
                  className={`${adminInput} px-2 py-1.5 text-center`}
                />
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={item.unitPrice}
                  onChange={(event) => updateItem(item.productId, { unitPrice: Math.max(0, Number(event.target.value) || 0) })}
                  className={`${adminInput} px-2 py-1.5`}
                />
                <span className="text-right font-semibold tabular-nums text-wine">{formatBRL(item.quantity * item.unitPrice)}</span>
                <button
                  type="button"
                  onClick={() => removeItem(item.productId)}
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
        <label className="flex items-center gap-2.5 text-sm font-semibold text-ink">
          <input type="checkbox" checked={includeShipping} onChange={(event) => setIncludeShipping(event.target.checked)} className="h-4 w-4 rounded border-line" />
          Incluir frete e endereço de entrega
        </label>

        {includeShipping ? (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={adminLabel}>CEP</label>
              <input name="cep" className={adminInput} />
            </div>
            <div>
              <label className={adminLabel}>Valor do frete (R$)</label>
              <input type="number" min={0} step="0.01" name="shippingCost" value={shippingCost} onChange={(event) => setShippingCost(event.target.value)} className={adminInput} />
            </div>
            <div className="col-span-2">
              <label className={adminLabel}>Rua</label>
              <input name="street" className={adminInput} />
            </div>
            <div>
              <label className={adminLabel}>Número</label>
              <input name="number" className={adminInput} />
            </div>
            <div>
              <label className={adminLabel}>Complemento</label>
              <input name="complement" className={adminInput} />
            </div>
            <div>
              <label className={adminLabel}>Bairro</label>
              <input name="district" className={adminInput} />
            </div>
            <div>
              <label className={adminLabel}>Cidade</label>
              <input name="city" className={adminInput} />
            </div>
            <div>
              <label className={adminLabel}>Estado</label>
              <input name="state" maxLength={2} className={adminInput} />
            </div>
          </div>
        ) : null}
      </div>

      <div className={`${adminCard} grid grid-cols-3 gap-3`}>
        <div>
          <label className={adminLabel}>Status</label>
          <select name="status" defaultValue="paid" className={adminInput}>
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={adminLabel}>Forma de pagamento</label>
          <select name="paymentMethod" defaultValue="" className={adminInput}>
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
          <textarea name="notes" rows={2} className={adminInput} placeholder="Ex: venda combinada via WhatsApp em 22/07" />
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
        {pending ? "Criando..." : "Criar pedido"}
      </button>
    </form>
  );
}
