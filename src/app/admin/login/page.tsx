import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { Logo } from "@/components/store/logo";
import { storeCard, storeSectionTitle } from "@/components/store/ui-styles";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    if (profile?.role === "admin") redirect("/admin");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-8 bg-paper px-4 py-16 font-[family-name:var(--font-body)] text-ink">
      <Logo />
      <div className="w-full max-w-sm">
        <div className={`${storeCard} flex flex-col gap-5`}>
          <h1 className={storeSectionTitle}>Painel administrativo</h1>
          <AdminLoginForm />
        </div>
      </div>
    </div>
  );
}
