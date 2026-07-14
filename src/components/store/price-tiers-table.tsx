import { formatBRL } from "@/lib/format";
import type { PriceTier } from "@/lib/types";

export function PriceTiersTable({ tiers }: { tiers: PriceTier[] }) {
  if (tiers.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-ink/8">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-ink/8 bg-paper text-left">
            <th className="px-3 py-2 text-[11.5px] font-semibold uppercase tracking-[0.04em] text-ink/52">Quantidade</th>
            <th className="px-3 py-2 text-right text-[11.5px] font-semibold uppercase tracking-[0.04em] text-ink/52">Preço unitário</th>
          </tr>
        </thead>
        <tbody>
          {tiers.map((tier) => (
            <tr key={tier.id} className="border-b border-ink/8 last:border-0">
              <td className="px-3 py-2.5 text-ink/78">{tier.max_quantity ? `${tier.min_quantity} a ${tier.max_quantity}` : `${tier.min_quantity} ou mais`}</td>
              <td className="px-3 py-2.5 text-right font-[family-name:var(--font-display)] font-semibold tabular-nums text-wine">{formatBRL(tier.unit_price)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
