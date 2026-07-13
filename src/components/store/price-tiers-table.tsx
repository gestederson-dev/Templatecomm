import { formatBRL } from "@/lib/format";
import type { PriceTier } from "@/lib/types";

export function PriceTiersTable({ tiers }: { tiers: PriceTier[] }) {
  if (tiers.length === 0) return null;

  return (
    <div className="rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/30 text-left">
            <th className="px-3 py-2 font-medium">Quantidade</th>
            <th className="px-3 py-2 text-right font-medium">Preço unitário</th>
          </tr>
        </thead>
        <tbody>
          {tiers.map((tier) => (
            <tr key={tier.id} className="border-b last:border-0">
              <td className="px-3 py-2">{tier.max_quantity ? `${tier.min_quantity} a ${tier.max_quantity}` : `${tier.min_quantity} ou mais`}</td>
              <td className="px-3 py-2 text-right tabular-nums">{formatBRL(tier.unit_price)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
