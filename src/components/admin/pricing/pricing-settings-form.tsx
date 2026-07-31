"use client";

import { useActionState, useMemo, useState } from "react";
import { FixedCostsEditor } from "@/components/admin/pricing/fixed-costs-editor";
import { adminBtnWine, adminCard, adminInput, adminLabel } from "@/components/admin/ui-styles";
import { savePricingSettingsAction, type ActionState } from "@/app/admin/precificacao/actions";
import { deriveHourlyRate, type PricingSettings } from "@/lib/pricing";
import { formatBRL } from "@/lib/format";

const INSTALLMENTS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export function PricingSettingsForm({ settings }: { settings: PricingSettings }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(savePricingSettingsAction, undefined);

  const [prolabore, setProlabore] = useState(settings.targetMonthlyProlabore ?? 0);
  const [hours, setHours] = useState(settings.workableHoursMonth ?? 0);
  const [allocationMode, setAllocationMode] = useState(settings.fixedCostAllocationMode);

  const suggestedHourlyRate = useMemo(() => deriveHourlyRate(prolabore || null, hours || null), [prolabore, hours]);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <section className={`${adminCard} flex flex-col gap-4`}>
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-[15px] font-semibold">Custos fixos mensais</h2>
          <p className="mt-0.5 text-[11.5px] text-ink/52">Hospedagem, assinaturas, contador, internet... — tudo que você paga todo mês, independente de vender.</p>
        </div>
        <FixedCostsEditor initial={settings.fixedCosts} />

        <div className="grid grid-cols-3 gap-4 border-t border-line pt-4">
          <div>
            <label className={adminLabel}>DAS mensal (R$)</label>
            <input name="dasMonthly" type="number" step="0.01" min="0" defaultValue={settings.dasMonthly} className={adminInput} />
          </div>
          <div>
            <label className={adminLabel}>Volume mensal estimado (un.)</label>
            <input name="monthlyVolumeEstimate" type="number" min="0" defaultValue={settings.monthlyVolumeEstimate} className={adminInput} />
          </div>
          <div>
            <label className={adminLabel}>Como ratear o fixo</label>
            <select name="fixedCostAllocationMode" defaultValue={settings.fixedCostAllocationMode} onChange={(e) => setAllocationMode(e.target.value as PricingSettings["fixedCostAllocationMode"])} className={adminInput}>
              <option value="per_unit">Por unidade (igual pra todo produto)</option>
              <option value="percent_revenue">% da receita (produtos caros absorvem mais)</option>
            </select>
          </div>
        </div>

        {allocationMode === "percent_revenue" ? (
          <div>
            <label className={adminLabel}>Ticket médio estimado (R$)</label>
            <input name="avgTicketEstimate" type="number" step="0.01" min="0" defaultValue={settings.avgTicketEstimate ?? ""} className={`${adminInput} max-w-[200px]`} />
            <p className="mt-1 text-[11.5px] text-ink/52">Usado só nesse modo, pra saber a fatia do fixo que cada preço deve carregar.</p>
          </div>
        ) : null}
      </section>

      <section className={`${adminCard} flex flex-col gap-4`}>
        <h2 className="font-[family-name:var(--font-display)] text-[15px] font-semibold">Mão de obra</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={adminLabel}>Pró-labore desejado (R$/mês)</label>
            <input name="targetMonthlyProlabore" type="number" step="0.01" min="0" defaultValue={settings.targetMonthlyProlabore ?? ""} onChange={(e) => setProlabore(Number(e.target.value) || 0)} className={adminInput} />
          </div>
          <div>
            <label className={adminLabel}>Horas trabalháveis/mês</label>
            <input name="workableHoursMonth" type="number" min="0" defaultValue={settings.workableHoursMonth ?? ""} onChange={(e) => setHours(Number(e.target.value) || 0)} className={adminInput} />
          </div>
          <div>
            <label className={adminLabel}>Valor-hora (R$)</label>
            <input name="hourlyRate" type="number" step="0.01" min="0" defaultValue={settings.hourlyRate} className={adminInput} />
            {suggestedHourlyRate != null ? <p className="mt-1 text-[11.5px] text-ink/52">Sugestão: {formatBRL(suggestedHourlyRate)}/h</p> : null}
          </div>
        </div>
      </section>

      <section className={`${adminCard} flex flex-col gap-4`}>
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-[15px] font-semibold">Taxas do Mercado Pago</h2>
          <p className="mt-0.5 text-[11.5px] text-ink/52">Valores de referência — confirme os reais no painel da sua conta (Custos → Taxas) antes de confiar no cálculo.</p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={adminLabel}>Pix (%)</label>
            <input name="pixFeePct" type="number" step="0.01" min="0" defaultValue={settings.pixFeePct} className={adminInput} />
          </div>
          <div>
            <label className={adminLabel}>Boleto (R$ fixo)</label>
            <input name="boletoFeeFixed" type="number" step="0.01" min="0" defaultValue={settings.boletoFeeFixed} className={adminInput} />
          </div>
          <div>
            <label className={adminLabel}>Prazo de liberação padrão</label>
            <select name="cardReleaseDefault" defaultValue={settings.cardReleaseDefault} className={adminInput}>
              <option value="d0">Na hora (D+0)</option>
              <option value="d14">14 dias</option>
              <option value="d30">30 dias</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={adminLabel}>Cartão à vista, D+0 (%)</label>
            <input name="cardFeeD0Pct" type="number" step="0.01" min="0" defaultValue={settings.cardFeeD0Pct} className={adminInput} />
          </div>
          <div>
            <label className={adminLabel}>Cartão à vista, D+14 (%)</label>
            <input name="cardFeeD14Pct" type="number" step="0.01" min="0" defaultValue={settings.cardFeeD14Pct} className={adminInput} />
          </div>
          <div>
            <label className={adminLabel}>Cartão à vista, D+30 (%)</label>
            <input name="cardFeeD30Pct" type="number" step="0.01" min="0" defaultValue={settings.cardFeeD30Pct} className={adminInput} />
          </div>
        </div>

        <div>
          <label className={adminLabel}>Quem absorve o acréscimo do parcelamento sem juros?</label>
          <select name="installmentMode" defaultValue={settings.installmentMode} className={`${adminInput} max-w-[320px]`}>
            <option value="seller_absorbs">A loja (parcelado vendedor — sai da margem)</option>
            <option value="buyer_pays">O cliente (parcelado comprador — mais seguro pra margem)</option>
          </select>
        </div>

        <div>
          <label className={adminLabel}>Acréscimo por parcela (%) — só importa se a loja absorve</label>
          <div className="grid grid-cols-6 gap-2 sm:grid-cols-11">
            {INSTALLMENTS.map((n) => (
              <div key={n}>
                <span className="mb-1 block text-center text-[11px] text-ink/52">{n}x</span>
                <input name={`installment_${n}`} type="number" step="0.01" min="0" defaultValue={settings.installmentFees[String(n)] ?? ""} className={`${adminInput} px-1.5 text-center text-[12.5px]`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`${adminCard} flex flex-col gap-4`}>
        <h2 className="font-[family-name:var(--font-display)] text-[15px] font-semibold">Mix de pagamento</h2>
        <p className="text-[11.5px] text-ink/52">Distribuição estimada das suas vendas — usada só pra calcular uma taxa média de referência.</p>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={adminLabel}>Pix (%)</label>
            <input name="mixPix" type="number" min="0" max="100" defaultValue={settings.paymentMix.pix} className={adminInput} />
          </div>
          <div>
            <label className={adminLabel}>Cartão (%)</label>
            <input name="mixCard" type="number" min="0" max="100" defaultValue={settings.paymentMix.card} className={adminInput} />
          </div>
          <div>
            <label className={adminLabel}>Boleto (%)</label>
            <input name="mixBoleto" type="number" min="0" max="100" defaultValue={settings.paymentMix.boleto} className={adminInput} />
          </div>
        </div>
      </section>

      <section className={`${adminCard} flex flex-col gap-4`}>
        <h2 className="font-[family-name:var(--font-display)] text-[15px] font-semibold">Perdas e riscos</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={adminLabel}>Taxa de refugo/perda na produção (%)</label>
            <input name="defectRatePct" type="number" step="0.01" min="0" max="99" defaultValue={settings.defectRatePct} className={adminInput} />
          </div>
          <div>
            <label className={adminLabel}>Taxa de devolução/estorno (%)</label>
            <input name="returnRatePct" type="number" step="0.01" min="0" max="99" defaultValue={settings.returnRatePct} className={adminInput} />
          </div>
        </div>
      </section>

      <section className={`${adminCard} flex flex-col gap-4`}>
        <h2 className="font-[family-name:var(--font-display)] text-[15px] font-semibold">Fiscal (MEI)</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={adminLabel}>Teto anual do MEI (R$)</label>
            <input name="meiAnnualCeiling" type="number" step="0.01" min="0" defaultValue={settings.meiAnnualCeiling} className={adminInput} />
          </div>
          <div>
            <label className={adminLabel}>Alíquota simulada do Simples, se desenquadrar (%)</label>
            <input name="simulatedSimplesRatePct" type="number" step="0.01" min="0" defaultValue={settings.simulatedSimplesRatePct ?? ""} placeholder="confirme com o contador" className={adminInput} />
          </div>
        </div>
      </section>

      <section className={`${adminCard} flex flex-col gap-4`}>
        <h2 className="font-[family-name:var(--font-display)] text-[15px] font-semibold">Comercial</h2>
        <div>
          <label className={adminLabel}>Margem mínima aceitável (%)</label>
          <input name="minimumMarginPct" type="number" step="0.01" min="0" defaultValue={settings.minimumMarginPct} className={`${adminInput} max-w-[200px]`} />
          <p className="mt-1 text-[11.5px] text-ink/52">Abaixo disso, o simulador avisa mesmo que o produto não esteja no prejuízo.</p>
        </div>
      </section>

      {state && "error" in state ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state && "success" in state ? <p className="text-sm font-medium text-ok">Configurações salvas.</p> : null}

      <button type="submit" disabled={pending} className={`${adminBtnWine} w-fit disabled:pointer-events-none disabled:opacity-50`}>
        {pending ? "Salvando..." : "Salvar configurações"}
      </button>
    </form>
  );
}
