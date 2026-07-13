"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Category } from "@/lib/types";

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
    <div className="flex flex-wrap items-end gap-4 rounded-lg border bg-muted/20 p-4">
      {categories && categories.length > 0 ? (
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">Categoria</span>
          <Select value={searchParams.get("categoria") ?? "todas"} onValueChange={(value) => updateParam("categoria", value === "todas" ? null : value)}>
            <SelectTrigger className="w-40">
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

      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">Preço mín.</span>
        <Input
          type="number"
          min={0}
          step="0.01"
          className="w-24"
          value={minPrice}
          onChange={(event) => setMinPrice(event.target.value)}
          onBlur={applyPriceRange}
        />
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">Preço máx.</span>
        <Input
          type="number"
          min={0}
          step="0.01"
          className="w-24"
          value={maxPrice}
          onChange={(event) => setMaxPrice(event.target.value)}
          onBlur={applyPriceRange}
        />
      </div>

      <label className="flex items-center gap-2 pb-2 text-sm">
        <input
          type="checkbox"
          checked={searchParams.get("quote") === "1"}
          onChange={(event) => updateParam("quote", event.target.checked ? "1" : null)}
          className="h-4 w-4 rounded border-input"
        />
        Somente personalizáveis
      </label>

      <div className="ml-auto flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">Ordenar por</span>
        <Select value={searchParams.get("sort") ?? "relevance"} onValueChange={(value) => updateParam("sort", value === "relevance" ? null : value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Mais recentes</SelectItem>
            <SelectItem value="price_asc">Menor preço</SelectItem>
            <SelectItem value="price_desc">Maior preço</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="button" variant="ghost" size="sm" onClick={applyPriceRange}>
        Aplicar
      </Button>
    </div>
  );
}
