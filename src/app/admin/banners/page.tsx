import { BannerManager } from "@/components/admin/banner-manager";
import { getAdminBanners } from "@/lib/admin/banners";

export default async function AdminBannersPage() {
  const banners = await getAdminBanners();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-[26px] font-bold tracking-[-0.02em]">Banners</h1>
        <p className="mt-0.5 text-[13px] text-ink/52">
          {banners.length} banner{banners.length === 1 ? "" : "s"}
        </p>
      </div>
      <BannerManager banners={banners} />
    </div>
  );
}
