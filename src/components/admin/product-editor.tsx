"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ProductImages } from "@/components/admin/product-images";
import { ProductPriceTiers } from "@/components/admin/product-price-tiers";
import { ProductCustomization } from "@/components/admin/product-customization";
import { adminBtnAmber, adminBtnSoft, adminCard, adminInput, adminLabel } from "@/components/admin/ui-styles";
import { saveProductAction, type ActionState } from "@/app/admin/produtos/actions";
import type { Category, ProductWithRelations } from "@/lib/types";

const FORM_ID = "product-form";

function dimensionsToText(dimensions: ProductWithRelations["dimensions"]): string {
  if (!dimensions?.altura || !dimensions?.largura || !dimensions?.comprimento) return "";
  return `${dimensions.altura}×${dimensions.largura}×${dimensions.comprimento}`;
}

function ToggleField({ name, defaultChecked, label, hint }: { name: string; defaultChecked: boolean; label: string; hint: string }) {
  return (
    <label className="flex items-center justify-between border-b border-line py-[11px] last:border-0">
      <span>
        <span className="text-[13.5px] font-semibold">{label}</span>
        <small className="mt-0.5 block text-[11.5px] font-normal text-ink/52">{hint}</small>
      </span>
      <span className="relative inline-flex h-[22px] w-[38px] shrink-0 items-center">
        <input type="checkbox" name={name} form={FORM_ID} defaultChecked={defaultChecked} className="peer sr-only" />
        <span className="absolute inset-0 rounded-full bg-ink/18 transition-colors peer-checked:bg-ok" aria-hidden="true" />
        <span className="absolute left-0.5 top-0.5 h-[18px] w-[18px] translate-x-0 rounded-full bg-white transition-transform peer-checked:translate-x-4" aria-hidden="true" />
      </span>
    </label>
  );
}

export function ProductEditor({ product, categories }: { product?: ProductWithRelations; categories: Category[] }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(saveProductAction, undefined);
  const isNew = !product;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-4">
        <div>
          {!isNew ? (
            <p className="mb-1 flex items-center gap-1.5 text-[13px] text-ink/52">
              <Link href="/admin/produtos" className="font-semibold text-wine">
                Produtos
              </Link>
              › {product.name}
            </p>
          ) : (
            <p className="mb-1 flex items-center gap-1.5 text-[13px] text-ink/52">
              <Link href="/admin/produtos" className="font-semibold text-wine">
                Produtos
              </Link>
              › Novo produto
            </p>
          )}
          <h1 className="font-[family-name:var(--font-display)] text-[26px] font-bold tracking-[-0.02em]">{isNew ? "Novo produto" : product.name}</h1>
          <p className="mt-0.5 text-[13px] text-ink/52">Preencha as informações e defina o modelo de venda</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Link href="/admin/produtos" className={adminBtnSoft}>
            Cancelar
          </Link>
          <button type="submit" form={FORM_ID} disabled={pending} className={adminBtnAmber}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} className="h-[17px] w-[17px] stroke-current">
              <path d="M5 12l5 5L20 7" />
            </svg>
            {pending ? "Salvando..." : "Salvar produto"}
          </button>
        </div>
      </div>

      {state?.error ? <p className="rounded-lg bg-destructive/10 px-4 py-2.5 text-sm text-destructive">{state.error}</p> : null}

      <div className="grid items-start gap-[18px] lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-[18px]">
          <form id={FORM_ID} action={formAction} className={adminCard}>
            <h3 className="mb-4 font-[family-name:var(--font-display)] text-[15px] font-semibold">Informações</h3>
            {product ? <input type="hidden" name="id" value={product.id} /> : null}
            <div className="mb-4">
              <label className={adminLabel}>Nome do produto</label>
              <input name="name" defaultValue={product?.name} placeholder="Ex: Caneca Personalizada 325ml" className={adminInput} required />
            </div>
            <div className="mb-4">
              <label className={adminLabel}>Descrição</label>
              <textarea
                name="description"
                defaultValue={product?.description ?? ""}
                rows={4}
                placeholder="Descreva o produto, materiais, opções de gravação…"
                className={adminInput}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={adminLabel}>Categoria</label>
                <select name="categoryId" defaultValue={product?.category_id ?? ""} className={adminInput}>
                  <option value="">Selecione</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={adminLabel}>SKU</label>
                <input name="sku" defaultValue={product?.sku ?? ""} placeholder="CAN-325" className={adminInput} />
              </div>
            </div>
          </form>

          {product ? (
            <>
              <ProductImages productId={product.id} images={product.images} />
              <ProductPriceTiers productId={product.id} tiers={product.price_tiers} />
              <ProductCustomization productId={product.id} options={product.customization_options} />
            </>
          ) : (
            <p className="rounded-2xl border border-dashed border-line p-6 text-center text-sm text-ink/52">
              Salve o produto para adicionar imagens, faixas de preço e opções de personalização.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-[18px]">
          <div className={`${adminCard} bg-gradient-to-b from-white to-[#fdf6ee]`} style={{ borderColor: "var(--amber-tint)" }}>
            <h3 className="mb-1 flex items-center gap-2 font-[family-name:var(--font-display)] text-[15px] font-semibold">
              <svg viewBox="0 0 24 24" width={17} height={17} className="stroke-warn" fill="none" strokeWidth={2}>
                <path d="M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" />
              </svg>
              Modelo de venda
            </h3>
            <ToggleField name="allowDirectSale" defaultChecked={product?.allow_direct_sale ?? true} label="Venda direta" hint="Compra pelo carrinho" />
            <ToggleField name="allowQuote" defaultChecked={product?.allow_quote ?? false} label="Orçamento" hint="Solicitação de cotação B2B" />
          </div>

          <div className={adminCard}>
            <h3 className="mb-4 font-[family-name:var(--font-display)] text-[15px] font-semibold">Venda direta</h3>
            <div className="mb-4">
              <label className={adminLabel}>Preço base (R$)</label>
              <input name="basePrice" form={FORM_ID} type="number" step="0.01" min="0" defaultValue={product?.base_price ?? ""} placeholder="24.90" className={adminInput} />
            </div>
            <div>
              <label className={adminLabel}>Estoque</label>
              <input name="stockQuantity" form={FORM_ID} type="number" min="0" defaultValue={product?.stock_quantity ?? 0} className={adminInput} />
            </div>
          </div>

          <div className={adminCard}>
            <h3 className="mb-4 font-[family-name:var(--font-display)] text-[15px] font-semibold">Orçamento</h3>
            <label className={adminLabel}>Quantidade mínima</label>
            <input name="minQuoteQuantity" form={FORM_ID} type="number" min="1" defaultValue={product?.min_quote_quantity ?? 1} className={adminInput} />
            <p className="mt-1.5 text-[11.5px] text-ink/52">Pedido mínimo para solicitar cotação</p>
          </div>

          <div className={adminCard}>
            <h3 className="mb-1 font-[family-name:var(--font-display)] text-[15px] font-semibold">Publicação</h3>
            <ToggleField name="isActive" defaultChecked={product?.is_active ?? true} label="Ativo" hint="Visível na loja" />
            <ToggleField name="isFeatured" defaultChecked={product?.is_featured ?? false} label="Destaque" hint="Aparece na home" />
          </div>

          <div className={adminCard}>
            <h3 className="mb-4 font-[family-name:var(--font-display)] text-[15px] font-semibold">Frete</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={adminLabel}>Peso (g)</label>
                <input name="weightGrams" form={FORM_ID} type="number" min="0" defaultValue={product?.weight_grams ?? 0} className={adminInput} />
              </div>
              <div>
                <label className={adminLabel}>Dim. (cm)</label>
                <input name="dimensions" form={FORM_ID} defaultValue={dimensionsToText(product?.dimensions ?? null)} placeholder="10×8×12" className={adminInput} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
