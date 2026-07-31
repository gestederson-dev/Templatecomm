"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { adminCard, adminInput, adminLabel } from "@/components/admin/ui-styles";
import { formatBRL } from "@/lib/format";
import {
  calcBreakEven,
  calcMarginFromPrice,
  calcMeiCeilingUsage,
  calcPriceFloor,
  calcUnitCost,
  calcWeightedFeePct,
  comparePaymentScenarios,
  validatePriceTiers,
  type PricingSettings,
} from "@/lib/pricing";
import type { PricingProduct } from "@/lib/admin/pricing";

function pct(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return `${value.toFixed(1)}%`;
}

const STATUS_LABEL = { ok: "OK", warning: "Margem baixa", loss: "Prejuízo" } as const;
const STATUS_TONE = { ok: "text-ok", warning: "text-warn", loss: "text-destructive" } as const;

export function PricingSimulator({ products, settings, annualRevenueSoFar }: { products: PricingProduct[]; settings: PricingSettings; annualRevenueSoFar: number }) {
  const productsWithCost = products.filter((p) => p.hasCost);
  const [productId, setProductId] = useState(productsWithCost[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [priceOverride, setPriceOverride] = useState("");

  const product = products.find((p) => p.id === productId) ?? null;

  const matchingTier = useMemo(() => {
    if (!product) return null;
    return product.price_tiers.find((tier) => quantity >= tier.min_quantity && (tier.max_quantity == null || quantity <= tier.max_quantity)) ?? null;
  }, [product, quantity]);

  const defaultPrice = matchingTier?.unit_price ?? product?.base_price ?? 0;
  const price = priceOverride !== "" ? Number(priceOverride) || 0 : defaultPrice;

  if (!product) {
    return <div className={`${adminCard} text-sm text-ink/52`}>Cadastre pelo menos um produto ativo pra usar o simulador.</div>;
  }

  const unitCost = calcUnitCost({ productCost: product.cost, settings, quantityInOrder: quantity, referencePrice: price });
  const weightedFeePct = calcWeightedFeePct(settings);
  const marginAtWeighted = calcMarginFromPrice(price, unitCost.total, weightedFeePct);
  const floorAtWeightedFee = calcPriceFloor(unitCost.total, weightedFeePct);

  const variableUnitCost = unitCost.total - unitCost.fixedAllocated;
  const contribution = calcMarginFromPrice(price, variableUnitCost, weightedFeePct);

  const totalFixedMonthly = settings.fixedCosts.reduce((sum, item) => sum + item.amount, 0) + settings.dasMonthly;
  const breakEven = calcBreakEven(totalFixedMonthly, contribution.profit, price);

  const hoursPerUnit = (product.cost.productionMinutes + product.cost.setupMinutes / Math.max(quantity, 1)) / 60;
  const profitPerHour = hoursPerUnit > 0 ? marginAtWeighted.profit / hoursPerUnit : null;

  const orderRevenue = price * quantity;
  const meiUsage = calcMeiCeilingUsage({ orderRevenue, annualRevenueSoFar, ceiling: settings.meiAnnualCeiling });

  const scenarios = comparePaymentScenarios({ unitCost: unitCost.total, price, settings });

  const tierCheck =
    product.price_tiers.length > 0
      ? validatePriceTiers({
          tiers: product.price_tiers.map((t) => ({ minQuantity: t.min_quantity, maxQuantity: t.max_quantity, unitPrice: t.unit_price })),
          productCost: product.cost,
          settings,
          feePct: weightedFeePct,
        })
      : null;

  return (
    <div className="flex flex-col gap-5">
      <section className={`${adminCard} flex flex-col gap-4`}>
        <h2 className="font-[family-name:var(--font-display)] text-[15px] font-semibold">Simulador</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={adminLabel}>Produto</label>
            <select value={productId} onChange={(e) => setProductId(e.target.value)} className={adminInput}>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                  {p.hasCost ? "" : " (sem custo cadastrado)"}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={adminLabel}>Quantidade</label>
            <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))} className={adminInput} />
          </div>
          <div>
            <label className={adminLabel}>Preço a avaliar (R$)</label>
            <input type="number" step="0.01" min="0" value={priceOverride} onChange={(e) => setPriceOverride(e.target.value)} placeholder={defaultPrice.toFixed(2)} className={adminInput} />
          </div>
        </div>
        {!product.hasCost ? (
          <p className="rounded-lg bg-warn/10 px-3 py-2 text-[12.5px] text-warn">
            Esse produto não tem custo cadastrado — os números abaixo estão zerados. Cadastre em{" "}
            <Link href={`/admin/produtos/${product.id}`} className="font-semibold underline">
              Produtos → {product.name} → aba Custos
            </Link>
            .
          </p>
        ) : null}
      </section>

      <section className={`${adminCard} flex flex-col gap-2 text-sm`}>
        <h3 className="mb-1 font-[family-name:var(--font-display)] text-[14px] font-semibold">Composição do custo</h3>
        {[
          ["Produto branco", unitCost.blank],
          ["Insumo de personalização", unitCost.customization],
          ["Mão de obra", unitCost.labor],
          ["Máquina", unitCost.machine],
          ["Embalagem (unidade)", unitCost.packagingUnit],
          ["Cartão/doce/lembrancinha", unitCost.packagingExtras],
          ["Setup diluído no pedido", unitCost.setupPerUnit],
          ["Ajuste de refugo", unitCost.defectAdjustment],
          ["Custo fixo rateado", unitCost.fixedAllocated],
        ].map(([label, value]) => (
          <div key={label as string} className="flex justify-between text-ink/70">
            <span>{label}</span>
            <span className="tabular-nums">{formatBRL(value as number)}</span>
          </div>
        ))}
        <div className="flex justify-between border-t border-line pt-2 text-[13.5px] font-semibold text-ink">
          <span>Custo total por unidade</span>
          <span className="tabular-nums">{formatBRL(unitCost.total)}</span>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className={`${adminCard} flex flex-col gap-1`}>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-ink/52">Preço mínimo (taxa média)</span>
          <span className="font-[family-name:var(--font-display)] text-xl font-bold text-wine">{formatBRL(floorAtWeightedFee)}</span>
        </div>
        <div className={`${adminCard} flex flex-col gap-1`}>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-ink/52">Lucro líquido/un.</span>
          <span className={`font-[family-name:var(--font-display)] text-xl font-bold ${marginAtWeighted.profit < 0 ? "text-destructive" : "text-ok"}`}>{formatBRL(marginAtWeighted.profit)}</span>
        </div>
        <div className={`${adminCard} flex flex-col gap-1`}>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-ink/52">Margem / Markup</span>
          <span className="font-[family-name:var(--font-display)] text-xl font-bold text-ink">
            {pct(marginAtWeighted.marginPct)} <span className="text-sm font-normal text-ink/45">/ {pct(marginAtWeighted.markupPct)}</span>
          </span>
        </div>
        <div className={`${adminCard} flex flex-col gap-1`}>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-ink/52">Lucro por hora trabalhada</span>
          <span className="font-[family-name:var(--font-display)] text-xl font-bold text-ink">{profitPerHour != null ? formatBRL(profitPerHour) : "—"}</span>
        </div>
      </section>

      <section className={`${adminCard} overflow-x-auto`}>
        <h3 className="mb-3 font-[family-name:var(--font-display)] text-[14px] font-semibold">Por meio de pagamento (preço avaliado: {formatBRL(price)})</h3>
        <table className="w-full min-w-[560px] text-left text-[13px]">
          <thead>
            <tr className="text-[11px] font-semibold uppercase tracking-wide text-ink/52">
              <th className="pb-2">Meio</th>
              <th className="pb-2">Taxa</th>
              <th className="pb-2">Piso</th>
              <th className="pb-2">Lucro</th>
              <th className="pb-2">Margem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {scenarios.map((s) => (
              <tr key={s.label} className={s.belowFloor ? "text-destructive" : "text-ink/80"}>
                <td className="py-1.5 font-medium">{s.label}</td>
                <td className="py-1.5 tabular-nums">{s.fixedFee > 0 ? formatBRL(s.fixedFee) : pct(s.feePct)}</td>
                <td className="py-1.5 tabular-nums">{formatBRL(s.floor)}</td>
                <td className="py-1.5 tabular-nums">{formatBRL(s.profit)}</td>
                <td className="py-1.5 tabular-nums">{pct(s.marginPct)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {tierCheck ? (
        <section className={`${adminCard} overflow-x-auto`}>
          <h3 className="mb-3 font-[family-name:var(--font-display)] text-[14px] font-semibold">Faixas de preço por quantidade</h3>
          {!tierCheck.monotonic ? <p className="mb-2 text-[12.5px] text-destructive">Atenção: alguma faixa tem preço maior que a faixa anterior.</p> : null}
          {tierCheck.profitCliff ? <p className="mb-2 text-[12.5px] text-destructive">Atenção: comprar no topo de uma faixa dá mais lucro total pra loja que comprar no início da próxima.</p> : null}
          <table className="w-full min-w-[480px] text-left text-[13px]">
            <thead>
              <tr className="text-[11px] font-semibold uppercase tracking-wide text-ink/52">
                <th className="pb-2">Faixa</th>
                <th className="pb-2">Preço</th>
                <th className="pb-2">Piso na qtd. mínima</th>
                <th className="pb-2">Margem na qtd. mínima</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {tierCheck.results.map((r) => (
                <tr key={r.minQuantity} className="text-ink/80">
                  <td className="py-1.5">
                    {r.minQuantity}
                    {r.maxQuantity ? `–${r.maxQuantity}` : "+"} un.
                  </td>
                  <td className="py-1.5 tabular-nums">{formatBRL(r.unitPrice)}</td>
                  <td className="py-1.5 tabular-nums">{formatBRL(r.floorAtMinQuantity)}</td>
                  <td className="py-1.5 tabular-nums">{pct(r.marginAtMinQuantity)}</td>
                  <td className={`py-1.5 font-semibold ${STATUS_TONE[r.status]}`}>{STATUS_LABEL[r.status]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}

      <section className={`${adminCard} grid grid-cols-1 gap-4 sm:grid-cols-3`}>
        <div>
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-ink/52">Ponto de equilíbrio</span>
          <span className="font-[family-name:var(--font-display)] text-lg font-bold text-ink">{Number.isFinite(breakEven.units) ? `${breakEven.units} un./mês` : "não atingível"}</span>
          {Number.isFinite(breakEven.revenue) ? <span className="block text-[12px] text-ink/52">{formatBRL(breakEven.revenue)}/mês</span> : null}
        </div>
        <div>
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-ink/52">Este pedido consome do teto MEI</span>
          <span className="font-[family-name:var(--font-display)] text-lg font-bold text-ink">{pct(meiUsage.orderPctOfCeiling)}</span>
        </div>
        <div>
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-ink/52">Receita acumulada em {new Date().getFullYear()}</span>
          <span className="font-[family-name:var(--font-display)] text-lg font-bold text-ink">{pct(meiUsage.accumulatedPctOfCeiling)}</span>
          <span className="block text-[12px] text-ink/52">{formatBRL(annualRevenueSoFar)} de {formatBRL(settings.meiAnnualCeiling)}</span>
        </div>
      </section>
    </div>
  );
}
