import type { Metadata } from "next";
import { PricingTabs } from "@/components/admin/pricing/pricing-tabs";
import { PricingSettingsForm } from "@/components/admin/pricing/pricing-settings-form";
import { PricingSimulator } from "@/components/admin/pricing/pricing-simulator";
import { getAllProductsWithCosts, getAnnualRevenueSoFar, getPricingSettings } from "@/lib/admin/pricing";

export const metadata: Metadata = { title: "Precificação" };

export default async function PrecificacaoPage() {
  const [settings, products, annualRevenueSoFar] = await Promise.all([getPricingSettings(), getAllProductsWithCosts(), getAnnualRevenueSoFar()]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-[26px] font-bold tracking-[-0.02em]">Precificação</h1>
        <p className="mt-0.5 text-[13px] text-ink/52">Descubra o preço mínimo e a margem real de cada produto antes de vender no prejuízo.</p>
      </div>

      <PricingTabs
        simulator={<PricingSimulator products={products} settings={settings} annualRevenueSoFar={annualRevenueSoFar} />}
        settings={<PricingSettingsForm settings={settings} />}
      />
    </div>
  );
}
