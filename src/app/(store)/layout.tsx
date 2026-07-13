import { SiteHeader } from "@/components/store/site-header";
import { SiteFooter } from "@/components/store/site-footer";
import { CartHydration } from "@/components/store/cart-hydration";
import { ThemeInjector } from "@/components/store/theme-injector";
import { getSiteSettings } from "@/lib/catalog";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <div className="flex min-h-full flex-1 flex-col bg-paper font-[family-name:var(--font-body)] text-ink">
      <ThemeInjector primaryColor={settings?.primary_color ?? "#860531"} secondaryColor={settings?.secondary_color ?? "#f39a00"} />
      <CartHydration />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
