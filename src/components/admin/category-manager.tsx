"use client";

import { useActionState, useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveCategoryAction, toggleCategoryActiveAction, type ActionState } from "@/app/admin/categorias/actions";
import type { Category } from "@/lib/types";

function CategoryForm({ category, categories, onDone }: { category?: Category; categories: Category[]; onDone?: () => void }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(saveCategoryAction, undefined);

  return (
    <form
      action={(formData) => {
        formAction(formData);
      }}
      className="flex flex-wrap items-end gap-2 rounded-md border p-3"
    >
      {category ? <input type="hidden" name="id" value={category.id} /> : null}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Nome</label>
        <Input name="name" defaultValue={category?.name} className="w-40" required />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Slug</label>
        <Input name="slug" defaultValue={category?.slug} className="w-40" placeholder="automático" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Categoria pai</label>
        <Select name="parentId" defaultValue={category?.parent_id ?? undefined}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Nenhuma" />
          </SelectTrigger>
          <SelectContent>
            {categories
              .filter((c) => c.id !== category?.id)
              .map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Ordem</label>
        <Input name="sortOrder" type="number" defaultValue={category?.sort_order ?? 0} className="w-20" />
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Salvando..." : "Salvar"}
      </Button>
      {onDone ? (
        <Button type="button" size="sm" variant="ghost" onClick={onDone}>
          Cancelar
        </Button>
      ) : null}
      {state?.error ? <p className="w-full text-sm text-destructive">{state.error}</p> : null}
    </form>
  );
}

export function CategoryManager({ categories }: { categories: Category[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [togglePending, startToggle] = useTransition();

  return (
    <div className="flex flex-col gap-4">
      {categories.map((category) =>
        editingId === category.id ? (
          <CategoryForm key={category.id} category={category} categories={categories} onDone={() => setEditingId(null)} />
        ) : (
          <div key={category.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
            <div>
              <span className="font-medium">{category.name}</span>{" "}
              {category.parent_id ? <span className="text-muted-foreground">({categories.find((c) => c.id === category.parent_id)?.name})</span> : null}
              <span className="ml-2 text-muted-foreground">/{category.slug}</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={category.is_active ? "default" : "secondary"}>{category.is_active ? "Ativa" : "Inativa"}</Badge>
              <Button type="button" size="sm" variant="ghost" onClick={() => setEditingId(category.id)}>
                Editar
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={togglePending}
                onClick={() => startToggle(() => toggleCategoryActiveAction(category.id, !category.is_active))}
              >
                {category.is_active ? "Desativar" : "Ativar"}
              </Button>
            </div>
          </div>
        ),
      )}

      {addingNew ? (
        <CategoryForm categories={categories} onDone={() => setAddingNew(false)} />
      ) : (
        <Button type="button" variant="outline" className="w-fit" onClick={() => setAddingNew(true)}>
          + Nova categoria
        </Button>
      )}
    </div>
  );
}
