"use client";

import { useActionState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addCustomizationOptionAction, deleteCustomizationOptionAction, type ActionState } from "@/app/admin/produtos/actions";
import type { ProductCustomizationOption } from "@/lib/types";

export function ProductCustomization({ productId, options }: { productId: string; options: ProductCustomizationOption[] }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(addCustomizationOptionAction, undefined);
  const [deleting, startDelete] = useTransition();

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4">
      <h2 className="text-sm font-semibold">Opções de personalização</h2>

      {options.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {options.map((option) => (
            <li key={option.id} className="flex items-center justify-between text-sm">
              <span>
                {option.name} <span className="text-muted-foreground">({option.type}{option.required ? ", obrigatório" : ""})</span>
                {option.options ? <span className="text-muted-foreground"> — {option.options.join(", ")}</span> : null}
              </span>
              <button
                type="button"
                disabled={deleting}
                className="text-xs text-destructive hover:underline"
                onClick={() => startDelete(() => deleteCustomizationOptionAction(option.id, productId))}
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <form action={formAction} className="flex flex-wrap items-end gap-2">
        <input type="hidden" name="productId" value={productId} />
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Nome</label>
          <Input name="name" placeholder="Cor, Gravação..." className="w-40" required />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Tipo</label>
          <Select name="type" defaultValue="text">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Texto</SelectItem>
              <SelectItem value="select">Lista</SelectItem>
              <SelectItem value="color">Cor</SelectItem>
              <SelectItem value="logo_upload">Upload de logo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Valores (separados por vírgula)</label>
          <Input name="options" placeholder="Azul, Vermelho, Preto" className="w-56" />
        </div>
        <label className="flex items-center gap-1.5 pb-2 text-sm">
          <input type="checkbox" name="required" className="h-4 w-4 rounded border-input" />
          Obrigatório
        </label>
        <Button type="submit" size="sm" variant="outline" disabled={pending}>
          {pending ? "Adicionando..." : "+ Adicionar"}
        </Button>
      </form>
      {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
    </div>
  );
}
