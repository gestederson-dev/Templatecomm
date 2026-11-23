"use client";

import { startTransition, useActionState, useState } from "react";
import { submitConfirmationAction, type ConfirmationState } from "@/app/(store)/confirmar/[token]/actions";
import { btnWine } from "@/components/store/button-styles";
import { storeCard, storeInput, storeLabel, storeSectionTitle } from "@/components/store/ui-styles";
import { formatarCNPJ, formatarCPF } from "@/lib/validators/documento";
import { MAX_ARTS } from "@/lib/validators/confirmacao";
import { formatBRL } from "@/lib/format";
import type { PaymentOption } from "@/lib/confirmations";
import { ArtUploader } from "@/components/store/art-uploader";

/** Dados que já conhecemos do cliente (cadastro do site, por exemplo), para ele só conferir. */
export type ConfirmationDefaults = {
  contactName?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  document?: string | null;
  cep?: string | null;
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  district?: string | null;
  city?: string | null;
  state?: string | null;
};

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

function SectionTitle({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <h2 className={`${storeSectionTitle} flex items-center gap-2.5`}>
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-wine text-[13px] font-bold text-white">{n}</span>
      {children}
    </h2>
  );
}

export function OrderConfirmationForm({
  token,
  paymentOptions,
  total,
  defaults = {},
}: {
  token: string;
  paymentOptions: PaymentOption[];
  total: number;
  defaults?: ConfirmationDefaults;
}) {
  const [state, formAction, pending] = useActionState<ConfirmationState, FormData>(submitConfirmationAction.bind(null, token), undefined);
  const [nota, setNota] = useState<"sim" | "nao" | "">("");
  const [phone, setPhone] = useState(formatPhone(defaults.contactPhone ?? ""));
  const [documento, setDocumento] = useState(defaults.document ? formatDocument(defaults.document) : "");
  const [cep, setCep] = useState(formatCep(defaults.cep ?? ""));
  const [street, setStreet] = useState(defaults.street ?? "");
  const [district, setDistrict] = useState(defaults.district ?? "");
  const [city, setCity] = useState(defaults.city ?? "");
  const [uf, setUf] = useState(defaults.state ?? "");
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [arts, setArts] = useState<{ paths: string[]; busy: boolean }>({ paths: [], busy: false });
  const [artLater, setArtLater] = useState(false);
  const [paymentId, setPaymentId] = useState("");
  const hasPayment = paymentOptions.length > 0;
  const n = { pagamento: 1, arte: hasPayment ? 2 : 1, dados: hasPayment ? 3 : 2, nota: hasPayment ? 4 : 3 };

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

  if (state && "success" in state) {
    return (
      <section className={`${storeCard} text-center`}>
        <p className="font-[family-name:var(--font-display)] text-xl font-semibold">Pedido confirmado!</p>
        <p className="mt-1.5 text-sm text-ink/62">
          {arts.paths.length ? "Recebemos seus dados e a arte." : "Recebemos seus dados. Quando tiver a arte, é só voltar neste mesmo link para enviar."} Em
          breve entramos em contato para os próximos passos.
        </p>
      </section>
    );
  }

  const comNota = nota === "sim";
  const chosen = paymentOptions.find((option) => option.id === paymentId);

  return (
    <form
      // onSubmit em vez de action={}: o React 19 limpa o formulário depois de uma action,
      // e o cliente perderia tudo (inclusive a logo escolhida) se um campo der erro
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        data.set("artPaths", JSON.stringify(arts.paths));
        startTransition(() => formAction(data));
      }}
      className="flex flex-col gap-5 pb-24 sm:gap-6 sm:pb-0"
    >
      {hasPayment ? (
        <section className={storeCard}>
          <SectionTitle n={n.pagamento}>Forma de pagamento</SectionTitle>
          <div className="mt-4 grid gap-3">
            {paymentOptions.map((option) => (
              <label key={option.id} className={choiceCard}>
                <input
                  type="radio"
                  name="paymentChoice"
                  value={option.id}
                  required
                  checked={paymentId === option.id}
                  onChange={() => setPaymentId(option.id)}
                  className="mt-1 h-5 w-5 accent-wine"
                />
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
              {paymentOptions
                .filter((option) => option.note)
                .map((option) => (
                  <li key={option.id}>
                    <span className="font-semibold text-ink/75">{option.label}:</span> {option.note}
                  </li>
                ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      <section className={`${storeCard} flex flex-col gap-3`}>
        <SectionTitle n={n.arte}>Arte para a personalização</SectionTitle>
        <p className="-mt-1 text-sm text-ink/60">
          De preferência em vetor (PDF, AI, CDR, EPS ou SVG) ou PNG em boa resolução. Tem versão colorida e branca? Mande as duas.
        </p>
        {!artLater ? <ArtUploader token={token} max={MAX_ARTS} onChange={setArts} /> : null}
        {arts.paths.length === 0 ? (
          <label className="flex cursor-pointer items-center gap-3 rounded-xl px-1 py-1.5 text-sm text-ink/75">
            <input
              type="checkbox"
              name="artLater"
              checked={artLater}
              onChange={(event) => setArtLater(event.target.checked)}
              className="h-5 w-5 shrink-0 accent-wine"
            />
            Ainda não tenho a arte, vou enviar depois por este mesmo link
          </label>
        ) : null}
      </section>

      <section className={`${storeCard} flex flex-col gap-4`}>
        <SectionTitle n={n.dados}>Seus dados</SectionTitle>
        <div>
          <label htmlFor="contactName" className={storeLabel}>
            Nome completo ou razão social
          </label>
          <input
            id="contactName"
            name="contactName"
            required
            autoComplete="organization"
            defaultValue={defaults.contactName ?? ""}
            className={`${storeInput} w-full`}
          />
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
            <input
              id="contactEmail"
              name="contactEmail"
              type="email"
              inputMode="email"
              required
              autoComplete="email"
              defaultValue={defaults.contactEmail ?? ""}
              className={`${storeInput} w-full`}
            />
          </div>
        </div>
      </section>

      <section className={`${storeCard} flex flex-col gap-4`}>
        <SectionTitle n={n.nota}>Nota fiscal</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className={choiceCard}>
            <input
              type="radio"
              name="wantsInvoice"
              value="sim"
              required
              checked={nota === "sim"}
              onChange={() => setNota("sim")}
              className="mt-1 h-4 w-4 accent-wine"
            />
            <span className="font-semibold text-ink">Sim, preciso de nota fiscal</span>
          </label>
          <label className={choiceCard}>
            <input
              type="radio"
              name="wantsInvoice"
              value="nao"
              required
              checked={nota === "nao"}
              onChange={() => setNota("nao")}
              className="mt-1 h-4 w-4 accent-wine"
            />
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
                <input
                  id="street"
                  name="street"
                  required
                  value={street}
                  onChange={(event) => setStreet(event.target.value)}
                  className={`${storeInput} w-full`}
                />
              </div>
              <div>
                <label htmlFor="number" className={storeLabel}>
                  Número
                </label>
                <input id="number" name="number" required inputMode="numeric" defaultValue={defaults.number ?? ""} className={`${storeInput} w-full`} />
              </div>
            </div>
            <div>
              <label htmlFor="complement" className={storeLabel}>
                Complemento (opcional)
              </label>
              <input id="complement" name="complement" defaultValue={defaults.complement ?? ""} className={`${storeInput} w-full`} />
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-4 sm:col-span-2">
                <label htmlFor="district" className={storeLabel}>
                  Bairro
                </label>
                <input
                  id="district"
                  name="district"
                  required
                  value={district}
                  onChange={(event) => setDistrict(event.target.value)}
                  className={`${storeInput} w-full`}
                />
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
                <input
                  id="state"
                  name="state"
                  required
                  maxLength={2}
                  value={uf}
                  onChange={(event) => setUf(event.target.value.toUpperCase())}
                  className={`${storeInput} w-full`}
                />
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <section className={storeCard}>
        <label htmlFor="customerMessage" className={storeLabel}>
          Observações (opcional)
        </label>
        <textarea
          id="customerMessage"
          name="customerMessage"
          rows={3}
          className={`${storeInput} w-full`}
          placeholder="Cor do copo, posição da logo, algum detalhe da entrega..."
        />
      </section>

      {state && "error" in state ? (
        <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive">
          {state.error}
        </p>
      ) : null}

      {/* no celular o botão fica preso no rodapé, com o valor escolhido sempre à vista */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink/10 bg-white/95 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <div className="mx-auto flex max-w-3xl items-center gap-3 sm:justify-end">
          <div className="min-w-0 flex-1 sm:hidden">
            <p className="text-[11px] uppercase tracking-[0.12em] text-ink/50">{chosen ? chosen.label : "Total"}</p>
            <p className="font-[family-name:var(--font-display)] text-lg font-bold tabular-nums text-wine">{formatBRL(chosen ? chosen.amount : total)}</p>
          </div>
          <button type="submit" disabled={pending || arts.busy} className={`${btnWine} shrink-0 disabled:pointer-events-none disabled:opacity-50`}>
            {pending ? "Enviando..." : arts.busy ? "Enviando arte..." : "Confirmar pedido"}
          </button>
        </div>
      </div>
    </form>
  );
}
