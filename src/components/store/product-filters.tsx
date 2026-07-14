"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { btnOutline } from "@/components/store/button-styles";
import { storeInput } from "@/components/store/ui-styles";
import type { Category } from "@/lib/types";

const filterLabel = "text-[11.5px] font-semibold uppercase tracking-[0.04em] text-ink/52";

export function ProductFilters({ categories }: { categories?: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(searchParams.get("min") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max") ?? "");

  function updateParam(name: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === "") {
      params.delete(name);
    } else {
      params.set(name, value);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function applyPriceRange() {
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set("min", minPrice);
    else params.delete("min");
    if (maxPrice) params.set("max", maxPrice);
    else params.delete("max");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-end gap-4 rounded-2xl border border-ink/8 bg-white p-4 shadow-[var(--shadow-brand)]">
      {categories && categories.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          <span className={filterLabel}>Categoria</span>
          <Select value={searchParams.get("categoria") ?? "todas"} onValueChange={(value) => updateParam("categoria", value === "todas" ? null : value)}>
            <SelectTrigger className="w-40 rounded-xl border-ink/12 focus-visible:border-wine focus-visible:ring-wine/40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.slug}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <span className={filterLabel}>Preço mín.</span>
        <input
          type="number"
          min={0}
          step="0.01"
          className={`${storeInput} w-24`}
          value={minPrice}
          onChange={(event) => setMinPrice(event.target.value)}
          onBlur={applyPriceRange}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className={filterLabel}>Preço máx.</span>
        <input
          type="number"
          min={0}
          step="0.01"
          className={`${storeInput} w-24`}
          value={maxPrice}
          onChange={(event) => setMaxPrice(event.target.value)}
          onBlur={applyPriceRange}
        />
      </div>

      <label className="flex items-center gap-2 pb-2.5 text-sm text-ink/78">
        <input
          type="checkbox"
          checked={searchParams.get("quote") === "1"}
          onChange={(event) => updateParam("quote", event.target.checked ? "1" : null)}
          className="h-4 w-4 rounded border-ink/25 accent-wine"
        />
        Somente personalizáveis
      </label>

      <div className="ml-auto flex flex-col gap-1.5">
        <span className={filterLabel}>Ordenar por</span>
        <Select value={searchParams.get("sort") ?? "relevance"} onValueChange={(value) => updateParam("sort", value === "relevance" ? null : value)}>
          <SelectTrigger className="w-40 rounded-xl border-ink/12 focus-visible:border-wine focus-visible:ring-wine/40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Mais recentes</SelectItem>
            <SelectItem value="price_asc">Menor preço</SelectItem>
            <SelectItem value="price_desc">Maior preço</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <button type="button" onClick={applyPriceRange} className={`${btnOutline} px-4 py-2 text-[13px]`}>
        Aplicar
      </button>
    </div>
  );
}
