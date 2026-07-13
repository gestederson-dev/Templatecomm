import { CouponManager } from "@/components/admin/coupon-manager";
import { getAdminCoupons } from "@/lib/admin/coupons";

export default async function AdminCuponsPage() {
  const coupons = await getAdminCoupons();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Cupons</h1>
      <CouponManager coupons={coupons} />
    </div>
  );
}
