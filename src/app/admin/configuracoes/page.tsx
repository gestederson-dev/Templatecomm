import { SiteSettingsForm } from "@/components/admin/site-settings-form";
import { getSiteSettings } from "@/lib/catalog";

export default async function AdminConfiguracoesPage() {
  const settings = await getSiteSettings();

  if (!settings) {
    return <p className="text-sm text-muted-foreground">Configurações do site não encontradas.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
      <SiteSettingsForm settings={settings} />
    </div>
  );
}
