import { BannerManager } from "@/components/admin/banner-manager";
import { getAdminBanners } from "@/lib/admin/banners";

export default async function AdminBannersPage() {
  const banners = await getAdminBanners();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Banners</h1>
      <BannerManager banners={banners} />
    </div>
  );
}
