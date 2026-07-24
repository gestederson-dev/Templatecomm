import { SiteSettingsForm } from "@/components/admin/site-settings-form";
import { ShippingIntegrationCard } from "@/components/admin/shipping-integration-card";
import { getSiteSettings } from "@/lib/catalog";
import { createClient } from "@/lib/supabase/server";

export default async function AdminConfiguracoesPage({ searchParams }: { searchParams: Promise<{ melhor_envio?: string }> }) {
  const { melhor_envio: melhorEnvioStatus } = await searchParams;
  const settings = await getSiteSettings();

  if (!settings) {
    return <p className="text-sm text-ink/52">Configurações do site não encontradas.</p>;
  }

  const supabase = await createClient();
  const { data: shippingToken } = await supabase.from("shipping_provider_tokens").select("updated_at").eq("provider", "melhor_envio").maybeSingle();

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-[family-name:var(--font-display)] text-[26px] font-bold tracking-[-0.02em]">Configurações</h1>
      <SiteSettingsForm settings={settings} />
      <ShippingIntegrationCard connected={Boolean(shippingToken)} connectedAt={shippingToken?.updated_at ?? null} status={melhorEnvioStatus} />
    </div>
  );
}
