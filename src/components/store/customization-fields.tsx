"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { storeInput, storeLabel } from "@/components/store/ui-styles";
import { hexForColorName } from "@/lib/color-names";
import { contrastingForeground } from "@/lib/color";
import type { ProductCustomizationOption } from "@/lib/types";

function ColorSwatches({ option, value, onSelect }: { option: ProductCustomizationOption; value: string; onSelect: (value: string) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2.5">
        {(option.options ?? []).map((colorName) => {
          const hex = hexForColorName(colorName);
          const selected = value === colorName;
          const checkColor = hex ? contrastingForeground(hex) : "#7f1d1d";

          return (
            <button
              key={colorName}
              type="button"
              onClick={() => onSelect(colorName)}
              title={colorName}
              aria-label={colorName}
              aria-pressed={selected}
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 transition-all ${
                selected ? "border-wine ring-2 ring-wine/25 ring-offset-2 ring-offset-paper" : "border-ink/15 hover:border-ink/35"
              }`}
              style={hex ? { backgroundColor: hex } : undefined}
            >
              {!hex ? <span className="text-[9px] font-semibold uppercase text-ink/50">{colorName.slice(0, 2)}</span> : null}
              {selected ? (
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" strokeWidth={2.5} style={{ stroke: checkColor }}>
                  <path d="M5 12l5 5L20 7" />
                </svg>
              ) : null}
            </button>
          );
        })}
      </div>
      {value ? (
        <p className="text-xs text-ink/52">
          Selecionado: <span className="font-semibold text-ink">{value}</span>
        </p>
      ) : null}
    </div>
  );
}

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

          {option.type === "color" && option.options ? (
            <ColorSwatches option={option} value={values[option.name] ?? ""} onSelect={(value) => onChange(option.name, value)} />
          ) : option.type === "select" && option.options ? (
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
