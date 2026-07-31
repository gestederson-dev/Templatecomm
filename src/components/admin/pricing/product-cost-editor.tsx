"use client";

import { useActionState, useMemo, useState } from "react";
import { adminBtnWine, adminCard, adminInput, adminLabel } from "@/components/admin/ui-styles";
import { formatBRL } from "@/lib/format";
import { calcPriceFloor, calcUnitCost, calcWeightedFeePct, type PricingSettings, type ProductCost } from "@/lib/pricing";
import { saveProductCostAction, type ActionState } from "@/app/admin/precificacao/actions";

const COMPLEXITY_OPTIONS = [
  { value: "1", label: "Simples" },
  { value: "1.3", label: "Média" },
  { value: "1.6", label: "Complexa" },
];

export function ProductCostEditor({
  productId,
  cost,
  hasCost,
  weightGramsPacked,
  settings,
}: {
  productId: string;
  cost: ProductCost;
  hasCost: boolean;
  weightGramsPacked: number | null;
  settings: PricingSettings;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(saveProductCostAction, undefined);

  const [blankCost, setBlankCost] = useState(cost.blankCost);
  const [customizationInputCost, setCustomizationInputCost] = useState(cost.customizationInputCost);
  const [productionMinutes, setProductionMinutes] = useState(cost.productionMinutes);
  const [setupMinutes, setSetupMinutes] = useState(cost.setupMinutes);
  const [machineMinutes, setMachineMinutes] = useState(cost.machineMinutes);
  const [machineHourlyCost, setMachineHourlyCost] = useState(cost.machineHourlyCost);
  const [packagingUnitCost, setPackagingUnitCost] = useState(cost.packagingUnitCost);
  const [packagingOrderCost, setPackagingOrderCost] = useState(cost.packagingOrderCost);
  const [complexityFactor, setComplexityFactor] = useState(cost.complexityFactor || 1);
  const [packagingExtraIds, setPackagingExtraIds] = useState<string[]>(cost.packagingExtraIds);

  function toggleExtra(id: string) {
    setPackagingExtraIds((prev) => (prev.includes(id) ? prev.filter((existing) => existing !== id) : [...prev, id]));
  }

  const livePreview = useMemo(() => {
    const liveCost: ProductCost = {
      blankCost,
      customizationInputCost,
      productionMinutes,
      setupMinutes,
      machineMinutes,
      machineHourlyCost,
      packagingUnitCost,
      packagingOrderCost,
      complexityFactor,
      packagingExtraIds,
    };
    const breakdown = calcUnitCost({ productCost: liveCost, settings, quantityInOrder: 1 });
    const feePct = calcWeightedFeePct(settings);
    return { total: breakdown.total, floor: calcPriceFloor(breakdown.total, feePct) };
  }, [blankCost, customizationInputCost, productionMinutes, setupMinutes, machineMinutes, machineHourlyCost, packagingUnitCost, packagingOrderCost, complexityFactor, packagingExtraIds, settings]);

  return (
    <form action={formAction} className={`${adminCard} flex flex-col gap-4`}>
      <input type="hidden" name="productId" value={productId} />
      <div className="flex items-center justify-between">
        <h3 className="font-[family-name:var(--font-display)] text-[15px] font-semibold">Custos e precificação</h3>
        {!hasCost ? <span className="rounded-md bg-warn/10 px-2 py-0.5 text-[11px] font-semibold text-warn">Sem custo cadastrado</span> : null}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={adminLabel}>Produto em branco (R$)</label>
          <input name="blankCost" type="number" step="0.01" min="0" value={blankCost} onChange={(e) => setBlankCost(Number(e.target.value) || 0)} className={adminInput} />
        </div>
        <div>
          <label className={adminLabel}>Insumo de personalização (R$)</label>
          <input name="customizationInputCost" type="number" step="0.01" min="0" value={customizationInputCost} onChange={(e) => setCustomizationInputCost(Number(e.target.value) || 0)} className={adminInput} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={adminLabel}>Tempo de produção (min/un.)</label>
          <input name="productionMinutes" type="number" step="0.1" min="0" value={productionMinutes} onChange={(e) => setProductionMinutes(Number(e.target.value) || 0)} className={adminInput} />
        </div>
        <div>
          <label className={adminLabel}>Tempo de setup (min/pedido)</label>
          <input name="setupMinutes" type="number" step="0.1" min="0" value={setupMinutes} onChange={(e) => setSetupMinutes(Number(e.target.value) || 0)} className={adminInput} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={adminLabel}>Tempo de máquina (min/un.)</label>
          <input name="machineMinutes" type="number" step="0.1" min="0" value={machineMinutes} onChange={(e) => setMachineMinutes(Number(e.target.value) || 0)} className={adminInput} />
        </div>
        <div>
          <label className={adminLabel}>Custo-hora da máquina (R$)</label>
          <input name="machineHourlyCost" type="number" step="0.01" min="0" value={machineHourlyCost} onChange={(e) => setMachineHourlyCost(Number(e.target.value) || 0)} className={adminInput} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={adminLabel}>Embalagem por unidade (R$)</label>
          <input name="packagingUnitCost" type="number" step="0.01" min="0" value={packagingUnitCost} onChange={(e) => setPackagingUnitCost(Number(e.target.value) || 0)} className={adminInput} />
        </div>
        <div>
          <label className={adminLabel}>Embalagem por pedido (R$)</label>
          <input name="packagingOrderCost" type="number" step="0.01" min="0" value={packagingOrderCost} onChange={(e) => setPackagingOrderCost(Number(e.target.value) || 0)} className={adminInput} />
        </div>
      </div>

      <div>
        <label className={adminLabel}>Itens de embalagem que esse produto usa</label>
        {settings.packagingExtras.length === 0 ? (
          <p className="text-[12.5px] text-ink/52">
            Nenhum item cadastrado ainda. Cadastre em{" "}
            <a href="/admin/precificacao" className="font-semibold text-wine hover:underline">
              Precificação → Configuração → Embalagem da entrega
            </a>
            .
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {settings.packagingExtras.map((extra) => {
              const checked = packagingExtraIds.includes(extra.id);
              return (
                <label
                  key={extra.id}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-[12.5px] transition-colors ${checked ? "border-wine bg-wine-tint text-wine" : "border-line text-ink/70"}`}
                >
                  <input type="checkbox" name="packagingExtraIds" value={extra.id} checked={checked} onChange={() => toggleExtra(extra.id)} className="accent-wine" />
                  {extra.label} ({formatBRL(extra.amount)}/{extra.per === "unit" ? "un." : "pedido"})
                </label>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={adminLabel}>Complexidade</label>
          <select name="complexityFactor" value={String(complexityFactor)} onChange={(e) => setComplexityFactor(Number(e.target.value))} className={adminInput}>
            {COMPLEXITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label} ({o.value}x)
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={adminLabel}>Peso embalado (g)</label>
          <input name="weightGramsPacked" type="number" min="0" defaultValue={weightGramsPacked ?? ""} placeholder="opcional" className={adminInput} />
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-line bg-paper px-4 py-3 text-sm">
        <span className="text-ink/70">Custo por unidade / preço mínimo (1 un., taxa média)</span>
        <span className="font-[family-name:var(--font-display)] font-semibold text-ink">
          {formatBRL(livePreview.total)} <span className="text-ink/40">→</span> <span className="text-wine">{formatBRL(livePreview.floor)}</span>
        </span>
      </div>

      {state && "error" in state ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state && "success" in state ? <p className="text-sm font-medium text-ok">Custo salvo.</p> : null}

      <button type="submit" disabled={pending} className={`${adminBtnWine} w-fit disabled:pointer-events-none disabled:opacity-50`}>
        {pending ? "Salvando..." : "Salvar custo"}
      </button>
    </form>
  );
}
