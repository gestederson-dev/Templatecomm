"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { createQuoteAction } from "@/lib/quote-actions";
import { btnAmber } from "@/components/store/button-styles";
import { storeInput, storeLabel } from "@/components/store/ui-styles";
import type { ProductCustomizationOption } from "@/lib/types";

export function QuoteRequestForm({
  productId,
  minQuantity,
  options,
  userId,
}: {
  productId: string;
  minQuantity: number;
  options: ProductCustomizationOption[];
  userId: string;
}) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(minQuantity);
  const [values, setValues] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(optionName: string, file: File | null) {
    if (!file) return;
    setUploading(optionName);
    setError(null);

    const supabase = createClient();
    const path = `${userId}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("quote-attachments").upload(path, file);

    setUploading(null);
    if (uploadError) {
      setError(`Erro ao enviar arquivo: ${uploadError.message}`);
      return;
    }
    setValues((prev) => ({ ...prev, [optionName]: path }));
  }

  async function handleSubmit() {
    const missing = options.find((option) => option.required && !values[option.name]);
    if (missing) {
      setError(`Preencha o campo "${missing.name}".`);
      return;
    }

    setSubmitting(true);
    setError(null);

    const result = await createQuoteAction({
      productId,
      quantity,
      customization: values,
      message,
    });

    setSubmitting(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }

    router.push("/conta/orcamentos");
  }

  return (
    <div className="flex flex-col gap-3.5">
      <div>
        <label className={storeLabel}>Quantidade (mín. {minQuantity})</label>
        <input
          type="number"
          min={minQuantity}
          value={quantity}
          onChange={(event) => setQuantity(Math.max(minQuantity, Number(event.target.value) || minQuantity))}
          className={`${storeInput} w-24`}
        />
      </div>

      {options.map((option) => (
        <div key={option.id}>
          <label className={storeLabel}>
            {option.name}
            {option.required ? " *" : ""}
          </label>

          {(option.type === "select" || option.type === "color") && option.options ? (
            <Select value={values[option.name] ?? ""} onValueChange={(value) => setValues((prev) => ({ ...prev, [option.name]: value ?? "" }))}>
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
          ) : option.type === "logo_upload" ? (
            <>
              <input
                type="file"
                accept="image/*,.pdf,.ai,.eps"
                onChange={(event) => handleFileChange(option.name, event.target.files?.[0] ?? null)}
                className="text-sm text-ink/70 file:mr-3 file:rounded-full file:border-0 file:bg-wine-tint file:px-3.5 file:py-1.5 file:text-[13px] file:font-semibold file:text-wine"
              />
              {uploading === option.name ? <span className="mt-1 block text-xs text-ink/50">Enviando...</span> : null}
              {values[option.name] ? <span className="mt-1 block text-xs font-semibold text-ok">Arquivo enviado ✓</span> : null}
            </>
          ) : (
            <input value={values[option.name] ?? ""} onChange={(event) => setValues((prev) => ({ ...prev, [option.name]: event.target.value }))} className={`${storeInput} w-full`} />
          )}
        </div>
      ))}

      <div>
        <label className={storeLabel}>Mensagem (opcional)</label>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={3}
          className={`${storeInput} w-full`}
          placeholder="Conte mais sobre o que você precisa..."
        />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <button type="button" className={`${btnAmber} w-full disabled:pointer-events-none disabled:opacity-50`} onClick={handleSubmit} disabled={submitting || uploading != null}>
        {submitting ? "Enviando..." : "Solicitar orçamento"}
      </button>
    </div>
  );
}
