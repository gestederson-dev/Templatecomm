import { CouponManager } from "@/components/admin/coupon-manager";
import { getAdminCoupons } from "@/lib/admin/coupons";

export default async function AdminCuponsPage() {
  const coupons = await getAdminCoupons();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-[26px] font-bold tracking-[-0.02em]">Cupons</h1>
        <p className="mt-0.5 text-[13px] text-ink/52">
          {coupons.length} cupom{coupons.length === 1 ? "" : "ns"}
        </p>
      </div>
      <CouponManager coupons={coupons} />
    </div>
  );
}
