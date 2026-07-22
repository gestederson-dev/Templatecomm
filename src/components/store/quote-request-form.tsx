"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createQuoteAction } from "@/lib/quote-actions";
import { sanitizeFileName } from "@/lib/storage";
import { btnAmber } from "@/components/store/button-styles";
import { storeInput, storeLabel } from "@/components/store/ui-styles";
import { CustomizationFields } from "@/components/store/customization-fields";
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
    const path = `${userId}/${Date.now()}-${sanitizeFileName(file.name)}`;
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

      <CustomizationFields
        options={options}
        values={values}
        onChange={(name, value) => setValues((prev) => ({ ...prev, [name]: value }))}
        onFileChange={handleFileChange}
        uploading={uploading}
      />

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
