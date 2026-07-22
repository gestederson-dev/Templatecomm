"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { storeInput, storeLabel } from "@/components/store/ui-styles";
import type { ProductCustomizationOption } from "@/lib/types";

export function CustomizationFields({
  options,
  values,
  onChange,
  onFileChange,
  uploading,
}: {
  options: ProductCustomizationOption[];
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
  onFileChange?: (name: string, file: File | null) => void;
  uploading?: string | null;
}) {
  return (
    <>
      {options.map((option) => (
        <div key={option.id}>
          <label className={storeLabel}>
            {option.name}
            {option.required ? " *" : ""}
          </label>

          {(option.type === "select" || option.type === "color") && option.options ? (
            <Select
              value={values[option.name] ?? ""}
              onValueChange={(value) => onChange(option.name, value ?? "")}
              items={option.options.map((value) => ({ value, label: value }))}
            >
              <SelectTrigger className="w-full rounded-xl border-ink/12 focus-visible:border-wine focus-visible:ring-wine/40">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {option.options.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : option.type === "logo_upload" && onFileChange ? (
            <>
              <input
                type="file"
                accept="image/*,.pdf,.ai,.eps"
                onChange={(event) => onFileChange(option.name, event.target.files?.[0] ?? null)}
                className="text-sm text-ink/70 file:mr-3 file:rounded-full file:border-0 file:bg-wine-tint file:px-3.5 file:py-1.5 file:text-[13px] file:font-semibold file:text-wine"
              />
              {uploading === option.name ? <span className="mt-1 block text-xs text-ink/50">Enviando...</span> : null}
              {values[option.name] ? <span className="mt-1 block text-xs font-semibold text-ok">Arquivo enviado ✓</span> : null}
            </>
          ) : option.type === "logo_upload" ? null : (
            <input value={values[option.name] ?? ""} onChange={(event) => onChange(option.name, event.target.value)} className={`${storeInput} w-full`} />
          )}
        </div>
      ))}
    </>
  );
}
