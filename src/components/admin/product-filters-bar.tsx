"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Category } from "@/lib/types";

const selectStyle =
  "w-auto cursor-pointer rounded-[9px] border border-line bg-white px-3 py-2.5 text-sm outline-none transition-shadow focus:border-wine focus:ring-[3px] focus:ring-wine-tint";

export function ProductFiltersBar({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(name: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(name, value);
    else params.delete(name);
    router.push(`/admin/produtos?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <select value={searchParams.get("categoria") ?? ""} onChange={(event) => updateParam("categoria", event.target.value)} className={selectStyle}>
        <option value="">Todas as categorias</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <select value={searchParams.get("status") ?? ""} onChange={(event) => updateParam("status", event.target.value)} className={selectStyle}>
        <option value="">Todos os status</option>
        <option value="active">Ativos</option>
        <option value="inactive">Inativos</option>
      </select>
      <select value={searchParams.get("tipo") ?? ""} onChange={(event) => updateParam("tipo", event.target.value)} className={selectStyle}>
        <option value="">Todos os tipos</option>
        <option value="direct">Venda direta</option>
        <option value="quote">Orçamento</option>
      </select>
    </div>
  );
}
