"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useRef, useState, useTransition } from "react";
import { createConfirmationAction, updateConfirmationAction, uploadConfirmationImageAction, type EditorState } from "@/app/admin/confirmacoes/actions";
import { adminBtnSoft, adminBtnWine, adminCard, adminInput, adminLabel } from "@/components/admin/ui-styles";
import { buildPaymentOptions, DEFAULT_CARD_INSTALLMENTS, DEFAULT_CARD_RATE, DEFAULT_NOTES, type DraftItem, type PaymentConfig } from "@/lib/confirmation-draft";
import type { ConfirmationProductOption } from "@/lib/confirmations";
import { formatBRL } from "@/lib/format";

type ItemRow = {
  key: number;
  name: string;
  description: string;
  quantity: string;
  unitPrice: string;
  imageUrl: string;
};

export type ConfirmationEditorInitial = {
  id: string;
  customerLabel: string;
  items: DraftItem[];
  payment: PaymentConfig;
  notes: string;
};

/** Aceita "25,90", "25.90" e "1.234,56". */
function parseMoney(value: string): number {
  const clean = value.trim().replace(/\s|R\$/g, "");
  const normalized = clean.includes(",") ? clean.replace(/\./g, "").replace(",", ".") : clean;
  return Number(normalized);
}

const moneyText = (value: number | null | undefined) => (value ? value.toFixed(2).replace(".", ",") : "");

let nextKey = 1;
const newRow = (patch: Partial<ItemRow> = {}): ItemRow => ({
  key: nextKey++,
  name: "",
  description: "",
  quantity: "",
  unitPrice: "",
  imageUrl: "",
  ...patch,
});

function Check({ checked, onChange, children }: { checked: boolean; onChange: (value: boolean) => void; children: React.ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line p-3.5 transition-colors has-[:checked]:border-wine has-[:checked]:bg-wine-tint/40">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[#860531]" />
      <div className="min-w-0 flex-1">{children}</div>
    </label>
  );
}

export function ConfirmationEditor({ products, initial }: { products: ConfirmationProductOption[]; initial?: ConfirmationEditorInitial }) {
  const action = initial ? updateConfirmationAction.bind(null, initial.id) : createConfirmationAction;
  const [state, formAction, saving] = useActionState<EditorState, FormData>(action, undefined);

  const [customerLabel, setCustomerLabel] = useState(initial?.customerLabel ?? "");
  const [rows, setRows] = useState<ItemRow[]>(() =>
    initial
      ? initial.items.map((item) =>
          newRow({
            name: item.name,
            description: item.description ?? "",
            quantity: String(item.quantity),
            unitPrice: moneyText(item.unit_price),
            imageUrl: item.image_url ?? "",
          }),
        )
      : [],
  );
  const [payment, setPayment] = useState<PaymentConfig>(
    initial?.payment ?? {
      pix: true,
      card: true,
      cardInstallments: DEFAULT_CARD_INSTALLMENTS,
      cardRate: DEFAULT_CARD_RATE,
      entrada: true,
    },
  );
  const [rateText, setRateText] = useState(String(payment.cardRate).replace(".", ","));
  const [notes, setNotes] = useState(initial?.notes ?? DEFAULT_NOTES);
  const [pickerOpen, setPickerOpen] = useState(!initial);
  const [pickSearch, setPickSearch] = useState("");

  const [uploadingKey, setUploadingKey] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<{
    key: number;
    message: string;
  } | null>(null);
  const [, startUpload] = useTransition();
  const fileInputs = useRef(new Map<number, HTMLInputElement>());

  function update(key: number, patch: Partial<ItemRow>) {
    setRows((prev) => prev.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  const term = pickSearch.trim().toLowerCase();
  const filteredProducts = term ? products.filter((p) => p.name.toLowerCase().includes(term)) : products;

  function addFromCatalog(product: ConfirmationProductOption) {
    setRows((prev) => [
      ...prev,
      newRow({
        name: product.name,
        unitPrice: moneyText(product.basePrice),
        imageUrl: product.imageUrl ?? "",
      }),
    ]);
    setPickerOpen(false);
    setPickSearch("");
  }

  function uploadImage(key: number, file: File) {
    setUploadError(null);
    setUploadingKey(key);
    const data = new FormData();
    data.set("file", file);
    startUpload(async () => {
      const result = await uploadConfirmationImageAction(data);
      if ("url" in result) update(key, { imageUrl: result.url });
      else setUploadError({ key, message: result.error });
      setUploadingKey(null);
    });
  }

  const items = rows.map((row) => ({
    quantity: Number(row.quantity) || 0,
    unit_price: parseMoney(row.unitPrice) || 0,
  }));
  const total = Math.round(items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0) * 100) / 100;
  const preview = total > 0 ? buildPaymentOptions(total, payment) : [];
  const previewOf = (id: string) => preview.find((option) => option.id === id);

  const draft = {
    customer_label: customerLabel,
    items: rows.map((row) => ({
      name: row.name,
      description: row.description,
      quantity: Number(row.quantity),
      unit_price: parseMoney(row.unitPrice),
      image_url: row.imageUrl,
    })),
    payment,
    notes,
  };

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="draft" value={JSON.stringify(draft)} />

      <div className={`${adminCard} flex flex-col gap-3`}>
        <h2 className="font-[family-name:var(--font-display)] text-[15px] font-semibold">Cliente</h2>
        <div>
          <label className={adminLabel} htmlFor="customer-label">
            Nome do cliente
          </label>
          <input
            id="customer-label"
            value={customerLabel}
            onChange={(event) => setCustomerLabel(event.target.value)}
            placeholder="Ex.: Compec"
            className={adminInput}
            maxLength={120}
          />
          <p className="mt-1.5 text-xs text-ink/52">Aparece no topo da página: “Olá, {customerLabel.trim() || "Compec"}”.</p>
        </div>
      </div>

      <div className={`${adminCard} flex flex-col gap-3.5`}>
        <h2 className="font-[family-name:var(--font-display)] text-[15px] font-semibold">Produtos</h2>
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <button
            type="button"
            onClick={() => setPickerOpen((open) => !open)}
            aria-expanded={pickerOpen}
            className={`${adminBtnSoft} flex-1 justify-between ${pickerOpen ? "border-wine text-wine" : ""}`}
          >
            <span>Escolher do catálogo ({products.length})</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className={`h-4 w-4 transition-transform ${pickerOpen ? "rotate-180" : ""}`}
              aria-hidden
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          <button type="button" onClick={() => setRows((prev) => [...prev, newRow()])} className={`${adminBtnSoft} whitespace-nowrap`}>
            + Item avulso
          </button>
        </div>

        {pickerOpen ? (
          <div className="flex flex-col gap-2.5 rounded-xl border border-line bg-paper p-3">
            <input
              autoFocus
              value={pickSearch}
              onChange={(event) => setPickSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") setPickerOpen(false);
                if (event.key === "Enter") event.preventDefault();
              }}
              placeholder="Buscar produto..."
              className={`${adminInput} bg-white`}
            />
            <div className="grid max-h-80 grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
              {filteredProducts.length === 0 ? <p className="p-2 text-sm text-ink/45">Nenhum produto encontrado.</p> : null}
              {filteredProducts.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => addFromCatalog(p)}
                  className="flex items-center gap-3 rounded-lg border border-line bg-white p-2 text-left transition-colors hover:border-wine hover:bg-wine-tint/30"
                >
                  <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-line bg-paper">
                    {p.imageUrl ? (
                      <Image src={p.imageUrl} alt="" fill sizes="56px" className="object-cover" />
                    ) : (
                      <span className="grid h-full place-items-center text-[10px] text-ink/40">Sem foto</span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink">{p.name}</span>
                    <span className="block text-xs tabular-nums text-ink/55">{p.basePrice ? formatBRL(p.basePrice) : "Preço a definir"}</span>
                  </span>
                  <span className="shrink-0 text-lg font-semibold text-wine" aria-hidden>
                    +
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {rows.length === 0 ? <p className="text-sm text-ink/45">Nenhum produto adicionado.</p> : null}

        {rows.map((row, index) => {
          const lineTotal = (Number(row.quantity) || 0) * (parseMoney(row.unitPrice) || 0);
          return (
            <div key={row.key} className="flex flex-col gap-3 rounded-xl border border-line p-3.5 sm:flex-row">
              <div className="flex shrink-0 flex-row items-center gap-3 sm:w-28 sm:flex-col sm:items-stretch">
                <div className="relative aspect-square w-24 overflow-hidden rounded-lg border border-line bg-paper sm:w-28">
                  {row.imageUrl ? (
                    <Image src={row.imageUrl} alt={row.name || "Foto do produto"} fill sizes="112px" className="object-cover" />
                  ) : (
                    <span className="grid h-full place-items-center px-2 text-center text-[11px] text-ink/40">Sem foto</span>
                  )}
                  {uploadingKey === row.key ? (
                    <span className="absolute inset-0 grid place-items-center bg-white/75 text-[11px] font-semibold text-wine">Enviando…</span>
                  ) : null}
                </div>
                <div className="flex flex-col gap-1.5">
                  <input
                    ref={(el) => {
                      if (el) fileInputs.current.set(row.key, el);
                      else fileInputs.current.delete(row.key);
                    }}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) uploadImage(row.key, file);
                      event.target.value = "";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputs.current.get(row.key)?.click()}
                    className="text-left text-[12.5px] font-semibold text-wine hover:underline sm:text-center"
                  >
                    {row.imageUrl ? "Trocar foto" : "Enviar foto"}
                  </button>
                  {row.imageUrl ? (
                    <button
                      type="button"
                      onClick={() => update(row.key, { imageUrl: "" })}
                      className="text-left text-[12.5px] text-ink/52 hover:text-destructive sm:text-center"
                    >
                      Tirar foto
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="grid flex-1 grid-cols-2 gap-2.5">
                <div className="col-span-2">
                  <label className={adminLabel}>Produto {index + 1}</label>
                  <input
                    value={row.name}
                    onChange={(event) => update(row.key, { name: event.target.value })}
                    placeholder="Ex.: Copo Térmico 473 ml"
                    className={adminInput}
                  />
                </div>
                <div className="col-span-2">
                  <label className={adminLabel}>Descrição (opcional)</label>
                  <input
                    value={row.description}
                    onChange={(event) => update(row.key, { description: event.target.value })}
                    placeholder="Ex.: Com tampa e abridor, personalizado com a logo"
                    className={adminInput}
                  />
                </div>
                <div>
                  <label className={adminLabel}>Quantidade</label>
                  <input
                    inputMode="numeric"
                    value={row.quantity}
                    onChange={(event) =>
                      update(row.key, {
                        quantity: event.target.value.replace(/\D/g, ""),
                      })
                    }
                    className={adminInput}
                  />
                </div>
                <div>
                  <label className={adminLabel}>Preço unitário (R$)</label>
                  <input
                    inputMode="decimal"
                    value={row.unitPrice}
                    onChange={(event) => update(row.key, { unitPrice: event.target.value })}
                    placeholder="25,90"
                    className={adminInput}
                  />
                </div>
                <div className="col-span-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setRows((prev) => prev.filter((r) => r.key !== row.key))}
                    className="text-[12.5px] font-semibold text-ink/52 hover:text-destructive"
                  >
                    Remover produto
                  </button>
                  <span className="text-sm font-semibold tabular-nums text-wine">{formatBRL(lineTotal)}</span>
                </div>
                {uploadError?.key === row.key ? <p className="col-span-2 text-sm text-destructive">{uploadError.message}</p> : null}
              </div>
            </div>
          );
        })}

        <div className="flex items-center justify-between rounded-xl bg-wine px-5 py-3.5 text-white">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-white/85">Total</span>
          <span className="font-[family-name:var(--font-display)] text-xl font-bold tabular-nums">{formatBRL(total)}</span>
        </div>
      </div>

      <div className={`${adminCard} flex flex-col gap-2.5`}>
        <h2 className="font-[family-name:var(--font-display)] text-[15px] font-semibold">Formas de pagamento</h2>
        <p className="-mt-1 text-xs text-ink/52">Os valores são calculados sozinhos a partir do total.</p>

        <Check checked={payment.pix} onChange={(pix) => setPayment((p) => ({ ...p, pix }))}>
          <p className="text-sm font-semibold">Pix à vista</p>
          <p className="text-sm tabular-nums text-ink/62">{previewOf("pix") ? formatBRL(previewOf("pix")!.amount) : "—"}</p>
        </Check>

        <Check checked={payment.card} onChange={(card) => setPayment((p) => ({ ...p, card }))}>
          <p className="text-sm font-semibold">Cartão de crédito</p>
          <p className="text-sm tabular-nums text-ink/62">
            {previewOf("cartao") ? `${formatBRL(previewOf("cartao")!.amount)}${previewOf("cartao")!.note ? ` (${previewOf("cartao")!.note})` : ""}` : "—"}
          </p>
        </Check>
        {payment.card ? (
          <div className="-mt-1 ml-7 grid max-w-sm grid-cols-2 gap-2.5">
            <div>
              <span className={adminLabel}>Parcelas</span>
              <select
                value={payment.cardInstallments}
                onChange={(event) =>
                  setPayment((p) => ({
                    ...p,
                    cardInstallments: Number(event.target.value),
                  }))
                }
                className={`${adminInput} py-2`}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n === 1 ? "À vista" : `Até ${n}x`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <span className={adminLabel}>Taxa da maquininha (%)</span>
              <input
                inputMode="decimal"
                value={rateText}
                onChange={(event) => {
                  setRateText(event.target.value);
                  const rate = parseMoney(event.target.value);
                  if (Number.isFinite(rate) && rate >= 0 && rate < 50) setPayment((p) => ({ ...p, cardRate: rate }));
                }}
                className={`${adminInput} py-2`}
              />
            </div>
          </div>
        ) : null}

        <Check checked={payment.entrada} onChange={(entrada) => setPayment((p) => ({ ...p, entrada }))}>
          <p className="text-sm font-semibold">50% de entrada</p>
          <p className="text-sm tabular-nums text-ink/62">{previewOf("entrada")?.note ?? "—"}</p>
        </Check>
      </div>

      <div className={`${adminCard} flex flex-col gap-2`}>
        <label className="font-[family-name:var(--font-display)] text-[15px] font-semibold" htmlFor="notes">
          Observações para o cliente
        </label>
        <textarea id="notes" rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} className={adminInput} />
        <p className="text-xs text-ink/52">Aparece embaixo do total. Ex.: frete, prazo de entrega, cor do produto.</p>
      </div>

      {state?.error ? <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{state.error}</p> : null}

      <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
        <Link href="/admin/confirmacoes" className={adminBtnSoft}>
          Voltar
        </Link>
        <button type="submit" disabled={saving || uploadingKey !== null} className={adminBtnWine}>
          {saving ? "Salvando…" : initial ? "Salvar alterações" : "Criar e gerar link"}
        </button>
      </div>
    </form>
  );
}
