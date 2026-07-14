import { SiteHeaderShell } from "@/components/store/site-header-shell";
import { getCategories, getSiteSettings } from "@/lib/catalog";
import { createClient } from "@/lib/supabase/server";

export async function SiteHeader() {
  const supabase = await createClient();
  const [categories, settings, userResult] = await Promise.all([getCategories(), getSiteSettings(), supabase.auth.getUser()]);
  const siteName = settings?.site_name ?? "Salmar Personalizados";
  const user = userResult.data.user;

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-paper/82 backdrop-saturate-150 backdrop-blur-md">
      <SiteHeaderShell siteName={siteName} categories={categories} userEmail={user?.email ?? null} />
    </header>
  );
}
