"use client";

import { startTransition, useActionState, useState } from "react";
import { submitConfirmationAction, type ConfirmationState } from "@/app/(store)/confirmar/[token]/actions";
import { btnWine } from "@/components/store/button-styles";
import { storeCard, storeInput, storeLabel, storeSectionTitle } from "@/components/store/ui-styles";
import { formatarCNPJ, formatarCPF } from "@/lib/validators/documento";
import { LOGO_EXTENSIONS, LOGO_MAX_BYTES } from "@/lib/validators/confirmacao";
import { formatBRL } from "@/lib/format";
import type { PaymentOption } from "@/lib/confirmations";

function formatCep(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

function formatPhone(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function formatDocument(value: string): string {
  const digits = value.replace(/\D/g, "");
  return digits.length <= 11 ? formatarCPF(digits) : formatarCNPJ(digits);
}

const choiceCard =
  "flex cursor-pointer items-start gap-3 rounded-xl border border-ink/12 bg-white p-4 transition-colors hover:border-wine/50 has-[:checked]:border-wine has-[:checked]:bg-wine-tint";

export function OrderConfirmationForm({ token, paymentOptions }: { token: string; paymentOptions: PaymentOption[] }) {
  const [state, formAction, pending] = useActionState<ConfirmationState, FormData>(submitConfirmationAction.bind(null, token), undefined);
  const [nota, setNota] = useState<"sim" | "nao" | "">("");
  const [phone, setPhone] = useState("");
  const [documento, setDocumento] = useState("");
  const [cep, setCep] = useState("");
  const [street, setStreet] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [uf, setUf] = useState("");
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [logoName, setLogoName] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);

  async function buscarCep(rawCep: string) {
    const digits = rawCep.replace(/\D/g, "");
    if (digits.length !== 8) return;
    setBuscandoCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setStreet(data.logradouro ?? "");
        setDistrict(data.bairro ?? "");
        setCity(data.localidade ?? "");
        setUf(data.uf ?? "");
      }
    } catch {
      // silencioso: o cliente preenche à mão se a busca falhar
    } finally {
      setBuscandoCep(false);
    }
  }

  function onLogoChange(file: File | undefined) {
    setLogoError(null);
    setLogoName(file?.name ?? null);
    if (file && file.size > LOGO_MAX_BYTES) setLogoError("A logo pode ter no máximo 8 MB.");
  }

  if (state && "success" in state) {
    return (
      <section className={`${storeCard} text-center`}>
        <p className="font-[family-name:var(--font-display)] text-xl font-semibold">Pedido confirmado!</p>
        <p className="mt-1.5 text-sm text-ink/62">Recebemos seus dados e a logo. Em breve entramos em contato para os próximos passos.</p>
      </section>
    );
  }

  const comNota = nota === "sim";

  return (
    <form
      // onSubmit em vez de action={}: o React 19 limpa o formulário depois de uma action,
      // e o cliente perderia tudo (inclusive a logo escolhida) se um campo der erro
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startTransition(() => formAction(data));
      }}
      className="flex flex-col gap-6"
    >
      <section className={storeCard}>
        <h2 className={storeSectionTitle}>Forma de pagamento</h2>
        <div className="mt-4 grid gap-3">
          {paymentOptions.map((option) => (
            <label key={option.id} className={choiceCard}>
              <input type="radio" name="paymentChoice" value={option.id} required className="mt-1 h-4 w-4 accent-wine" />
              <span className="flex flex-1 flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                <span className="font-semibold text-ink">{option.label}</span>
                <span className="font-[family-name:var(--font-display)] text-lg font-bold tabular-nums text-wine">{formatBRL(option.amount)}</span>
              </span>
              {option.note ? <span className="sr-only">{option.note}</span> : null}
            </label>
          ))}
        </div>
        {paymentOptions.some((option) => option.note) ? (
          <ul className="mt-3 flex flex-col gap-1 text-[13px] text-ink/60">
            {paymentOptions.filter((option) => option.note).map((option) => (
              <li key={option.id}>
                <span className="font-semibold text-ink/75">{option.label}:</span> {option.note}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className={storeCard}>
        <h2 className={storeSectionTitle}>Logo para a personalização</h2>
        <p className="mt-1 text-sm text-ink/60">De preferência em vetor (PDF, AI, CDR, EPS ou SVG) ou PNG em boa resolução. Até 8 MB.</p>
        <label className="mt-4 flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border-2 border-dashed border-ink/15 bg-paper/60 px-4 py-8 text-center transition-colors hover:border-wine/50">
          <span className="text-sm font-semibold text-wine">{logoName ? "Trocar arquivo" : "Escolher arquivo da logo"}</span>
          <span className="text-[13px] text-ink/55">{logoName ?? "Nenhum arquivo escolhido"}</span>
          <input
            type="file"
            name="logo"
            required
            accept={LOGO_EXTENSIONS.map((ext) => `.${ext}`).join(",")}
            onChange={(event) => onLogoChange(event.target.files?.[0])}
            className="sr-only"
          />
        </label>
        {logoError ? <p className="mt-2 text-sm text-destructive">{logoError}</p> : null}
      </section>

      <section className={`${storeCard} flex flex-col gap-4`}>
        <h2 className={storeSectionTitle}>Seus dados</h2>
        <div>
          <label htmlFor="contactName" className={storeLabel}>
            Nome completo ou razão social
          </label>
          <input id="contactName" name="contactName" required autoComplete="organization" className={`${storeInput} w-full`} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="contactPhone" className={storeLabel}>
              Telefone / WhatsApp
            </label>
            <input
              id="contactPhone"
              name="contactPhone"
              required
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(event) => setPhone(formatPhone(event.target.value))}
              placeholder="(45) 99999-9999"
              className={`${storeInput} w-full`}
            />
          </div>
          <div>
            <label htmlFor="contactEmail" className={storeLabel}>
              E-mail
            </label>
            <input id="contactEmail" name="contactEmail" type="email" required autoComplete="email" className={`${storeInput} w-full`} />
          </div>
        </div>
      </section>

      <section className={`${storeCard} flex flex-col gap-4`}>
        <h2 className={storeSectionTitle}>Nota fiscal</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className={choiceCard}>
            <input type="radio" name="wantsInvoice" value="sim" required checked={nota === "sim"} onChange={() => setNota("sim")} className="mt-1 h-4 w-4 accent-wine" />
            <span className="font-semibold text-ink">Sim, preciso de nota fiscal</span>
          </label>
          <label className={choiceCard}>
            <input type="radio" name="wantsInvoice" value="nao" required checked={nota === "nao"} onChange={() => setNota("nao")} className="mt-1 h-4 w-4 accent-wine" />
            <span className="font-semibold text-ink">Não preciso</span>
          </label>
        </div>

        {comNota ? (
          <div className="flex flex-col gap-4 border-t border-ink/8 pt-4">
            <div>
              <label htmlFor="document" className={storeLabel}>
                CNPJ ou CPF
              </label>
              <input
                id="document"
                name="document"
                required
                inputMode="numeric"
                value={documento}
                onChange={(event) => setDocumento(formatDocument(event.target.value))}
                className={`${storeInput} w-full sm:w-72`}
              />
            </div>
            <div>
              <label htmlFor="cep" className={storeLabel}>
                CEP
              </label>
              <input
                id="cep"
                name="cep"
                required
                inputMode="numeric"
                value={cep}
                onChange={(event) => setCep(formatCep(event.target.value))}
                onBlur={(event) => buscarCep(event.target.value)}
                placeholder="00000-000"
                className={`${storeInput} w-36`}
              />
              {buscandoCep ? <span className="mt-1 block text-xs text-ink/50">Buscando endereço...</span> : null}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label htmlFor="street" className={storeLabel}>
                  Rua
                </label>
                <input id="street" name="street" required value={street} onChange={(event) => setStreet(event.target.value)} className={`${storeInput} w-full`} />
              </div>
              <div>
                <label htmlFor="number" className={storeLabel}>
                  Número
                </label>
                <input id="number" name="number" required className={`${storeInput} w-full`} />
              </div>
            </div>
            <div>
              <label htmlFor="complement" className={storeLabel}>
                Complemento (opcional)
              </label>
              <input id="complement" name="complement" className={`${storeInput} w-full`} />
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-4 sm:col-span-2">
                <label htmlFor="district" className={storeLabel}>
                  Bairro
                </label>
                <input id="district" name="district" required value={district} onChange={(event) => setDistrict(event.target.value)} className={`${storeInput} w-full`} />
              </div>
              <div className="col-span-3 sm:col-span-1">
                <label htmlFor="city" className={storeLabel}>
                  Cidade
                </label>
                <input id="city" name="city" required value={city} onChange={(event) => setCity(event.target.value)} className={`${storeInput} w-full`} />
              </div>
              <div>
                <label htmlFor="state" className={storeLabel}>
                  UF
                </label>
                <input id="state" name="state" required maxLength={2} value={uf} onChange={(event) => setUf(event.target.value.toUpperCase())} className={`${storeInput} w-full`} />
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <section className={storeCard}>
        <label htmlFor="customerMessage" className={storeLabel}>
          Observações (opcional)
        </label>
        <textarea id="customerMessage" name="customerMessage" rows={3} className={`${storeInput} w-full`} placeholder="Cor do copo, posição da logo, algum detalhe da entrega..." />
      </section>

      {state && "error" in state ? <p className="text-sm font-medium text-destructive">{state.error}</p> : null}

      <button type="submit" disabled={pending || logoError != null} className={`${btnWine} w-full disabled:pointer-events-none disabled:opacity-50 sm:w-auto sm:self-end`}>
        {pending ? "Enviando..." : "Confirmar pedido"}
      </button>
    </form>
  );
}
