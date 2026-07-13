"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { createQuoteAction } from "@/lib/quote-actions";
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
      setError(`Preencha o campo obrigatório: ${missing.name}`);
      return;
    }

    setSubmitting(true);
    setError(null);

    const result = await createQuoteAction({ productId, quantity, customization: values, message });

    setSubmitting(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }

    router.push("/conta/orcamentos");
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">Quantidade (mín. {minQuantity})</label>
        <Input type="number" min={minQuantity} value={quantity} onChange={(event) => setQuantity(Math.max(minQuantity, Number(event.target.value) || minQuantity))} className="w-24" />
      </div>

      {options.map((option) => (
        <div key={option.id} className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            {option.name}
            {option.required ? " *" : ""}
          </label>

          {(option.type === "select" || option.type === "color") && option.options ? (
            <Select value={values[option.name] ?? ""} onValueChange={(value) => setValues((prev) => ({ ...prev, [option.name]: value ?? "" }))}>
              <SelectTrigger>
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
                className="text-sm"
              />
              {uploading === option.name ? <span className="text-xs text-muted-foreground">Enviando...</span> : null}
              {values[option.name] ? <span className="text-xs text-primary">Arquivo enviado ✓</span> : null}
            </>
          ) : (
            <Input value={values[option.name] ?? ""} onChange={(event) => setValues((prev) => ({ ...prev, [option.name]: event.target.value }))} />
          )}
        </div>
      ))}

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">Mensagem (opcional)</label>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={3}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          placeholder="Conte mais sobre o que você precisa..."
        />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button type="button" variant="secondary" className="w-full" onClick={handleSubmit} disabled={submitting || uploading != null}>
        {submitting ? "Enviando..." : "Solicitar orçamento"}
      </Button>
    </div>
  );
}
