"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveProductAction, type ActionState } from "@/app/admin/produtos/actions";
import type { Category, Product } from "@/lib/types";

export function ProductForm({ product, categories }: { product?: Product; categories: Category[] }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(saveProductAction, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-lg border p-4">
      {product ? <input type="hidden" name="id" value={product.id} /> : null}

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Nome</label>
          <Input name="name" defaultValue={product?.name} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Slug (opcional)</label>
          <Input name="slug" defaultValue={product?.slug} placeholder="gerado automaticamente" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Descrição</label>
        <Textarea name="description" defaultValue={product?.description ?? ""} rows={3} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Categoria</label>
          <Select name="categoryId" defaultValue={product?.category_id ?? undefined}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">SKU</label>
          <Input name="sku" defaultValue={product?.sku ?? ""} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Preço venda direta (R$)</label>
          <Input name="basePrice" type="number" step="0.01" min="0" defaultValue={product?.base_price ?? ""} placeholder="vazio = só orçamento" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Estoque</label>
          <Input name="stockQuantity" type="number" min="0" defaultValue={product?.stock_quantity ?? 0} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Peso (g)</label>
          <Input name="weightGrams" type="number" min="0" defaultValue={product?.weight_grams ?? 0} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Qtd. mínima orçamento</label>
          <Input name="minQuoteQuantity" type="number" min="1" defaultValue={product?.min_quote_quantity ?? 1} />
        </div>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="allowDirectSale" defaultChecked={product?.allow_direct_sale ?? true} className="h-4 w-4 rounded border-input" />
          Venda direta
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="allowQuote" defaultChecked={product?.allow_quote ?? false} className="h-4 w-4 rounded border-input" />
          Aceita orçamento
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isFeatured" defaultChecked={product?.is_featured ?? false} className="h-4 w-4 rounded border-input" />
          Destaque na home
        </label>
      </div>

      {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Salvando..." : "Salvar"}
      </Button>
    </form>
  );
}
