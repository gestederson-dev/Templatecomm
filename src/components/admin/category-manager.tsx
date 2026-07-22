"use client";

import { useActionState, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleActiveButton } from "@/components/admin/toggle-active-button";
import { adminBtnSoft, adminBtnWine, adminCard, adminInput, adminLabel, adminPanel } from "@/components/admin/ui-styles";
import { deleteCategoryAction, saveCategoryAction, toggleCategoryActiveAction, type ActionState } from "@/app/admin/categorias/actions";
import type { Category } from "@/lib/types";

function CategoryForm({ category, categories, onDone }: { category?: Category; categories: Category[]; onDone?: () => void }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(saveCategoryAction, undefined);

  return (
    <form action={formAction} className={`${adminCard} flex flex-wrap items-end gap-3`}>
      {category ? <input type="hidden" name="id" value={category.id} /> : null}
      <div style={{ width: 180 }}>
        <label className={adminLabel}>Nome</label>
        <input name="name" defaultValue={category?.name} className={adminInput} required />
      </div>
      <div style={{ width: 180 }}>
        <label className={adminLabel}>Slug</label>
        <input name="slug" defaultValue={category?.slug} className={adminInput} placeholder="automático" />
      </div>
      <div style={{ width: 180 }}>
        <label className={adminLabel}>Categoria pai</label>
        <Select
          name="parentId"
          defaultValue={category?.parent_id ?? undefined}
          items={categories.filter((c) => c.id !== category?.id).map((c) => ({ value: c.id, label: c.name }))}
        >
          <SelectTrigger className="w-full rounded-[9px] border-line focus-visible:border-wine focus-visible:ring-wine-tint">
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
      <div style={{ width: 96 }}>
        <label className={adminLabel}>Ordem</label>
        <input name="sortOrder" type="number" defaultValue={category?.sort_order ?? 0} className={adminInput} />
      </div>
      <button type="submit" disabled={pending} className={`${adminBtnWine} disabled:pointer-events-none disabled:opacity-50`}>
        {pending ? "Salvando..." : "Salvar"}
      </button>
      {onDone ? (
        <button type="button" onClick={onDone} className={adminBtnSoft}>
          Cancelar
        </button>
      ) : null}
      {state?.error ? <p className="w-full text-sm text-destructive">{state.error}</p> : null}
    </form>
  );
}

export function CategoryManager({ categories }: { categories: Category[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className={adminPanel}>
        {categories.map((category, index) =>
          editingId === category.id ? (
            <div key={category.id} className={index > 0 ? "border-t border-line" : ""}>
              <CategoryForm category={category} categories={categories} onDone={() => setEditingId(null)} />
            </div>
          ) : (
            <div key={category.id} className={`flex items-center justify-between gap-3 px-4 py-3.5 text-sm ${index > 0 ? "border-t border-line" : ""}`}>
              <div>
                <span className="font-semibold text-ink">{category.name}</span>{" "}
                {category.parent_id ? (
                  <span className="text-ink/45">({categories.find((c) => c.id === category.parent_id)?.name})</span>
                ) : null}
                <span className="ml-2 text-ink/45">/{category.slug}</span>
              </div>
              <div className="flex items-center gap-3">
                <ToggleActiveButton
                  id={category.id}
                  isActive={category.is_active}
                  action={toggleCategoryActiveAction}
                  label={category.is_active ? "Desativar" : "Ativar"}
                />
                <button type="button" onClick={() => setEditingId(category.id)} className="text-sm font-semibold text-wine hover:underline">
                  Editar
                </button>
                <form
                  action={deleteCategoryAction}
                  onSubmit={(event) => {
                    if (!confirm(`Excluir "${category.name}"? Produtos dessa categoria ficam sem categoria.`)) event.preventDefault();
                  }}
                >
                  <input type="hidden" name="id" value={category.id} />
                  <button type="submit" className="text-sm font-semibold text-destructive hover:underline">
                    Excluir
                  </button>
                </form>
              </div>
            </div>
          ),
        )}
      </div>

      {addingNew ? (
        <CategoryForm categories={categories} onDone={() => setAddingNew(false)} />
      ) : (
        <button type="button" onClick={() => setAddingNew(true)} className={`${adminBtnSoft} w-fit`}>
          + Nova categoria
        </button>
      )}
    </div>
  );
}
