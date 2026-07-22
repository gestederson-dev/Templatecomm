import { notFound } from "next/navigation";
import { ProfileForm } from "@/components/account/profile-form";
import { ChangePasswordForm } from "@/components/account/change-password-form";
import { storeCard, storeSectionTitle } from "@/components/store/ui-styles";
import { getCurrentProfile } from "@/lib/account";
import { formatarCNPJ, formatarCPF } from "@/lib/validators/documento";

export default async function ContaPage() {
  const profile = await getCurrentProfile();
  if (!profile) notFound();

  const documento = profile.person_type === "pj" ? formatarCNPJ(profile.cnpj ?? "") : formatarCPF(profile.cpf ?? "");

  return (
    <div className="flex flex-col gap-6">
      <div className={`${storeCard} flex flex-col gap-6`}>
        <span className="w-fit rounded-full bg-wine-tint px-3 py-1 text-[12.5px] font-semibold text-wine">
          {profile.person_type === "pj" ? "Pessoa jurídica" : "Pessoa física"}
        </span>

        <ProfileForm fullName={profile.full_name ?? ""} phone={profile.phone ?? ""} />

        <div className="flex flex-col gap-1 border-t border-ink/10 pt-5 text-sm text-ink/62">
          <p>
            {profile.person_type === "pj" ? "CNPJ" : "CPF"}: <span className="font-medium text-ink">{documento || "não informado"}</span>
          </p>
          {profile.person_type === "pj" && profile.company_name ? (
            <p>
              Razão social: <span className="font-medium text-ink">{profile.company_name}</span>
            </p>
          ) : null}
          <p className="text-xs text-ink/45">Documento não pode ser alterado por aqui. Fale com a gente se precisar corrigir.</p>
        </div>
      </div>

      <div className={`${storeCard} flex flex-col gap-4`}>
        <h2 className={storeSectionTitle}>Senha</h2>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
