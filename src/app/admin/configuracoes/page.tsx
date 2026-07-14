import { SiteSettingsForm } from "@/components/admin/site-settings-form";
import { getSiteSettings } from "@/lib/catalog";

export default async function AdminConfiguracoesPage() {
  const settings = await getSiteSettings();

  if (!settings) {
    return <p className="text-sm text-ink/52">Configurações do site não encontradas.</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-[family-name:var(--font-display)] text-[26px] font-bold tracking-[-0.02em]">Configurações</h1>
      <SiteSettingsForm settings={settings} />
    </div>
  );
}
