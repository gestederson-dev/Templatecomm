import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ProfileForm } from "@/components/account/profile-form";
import { getCurrentProfile } from "@/lib/account";
import { formatarCNPJ, formatarCPF } from "@/lib/validators/documento";

export default async function ContaPage() {
  const profile = await getCurrentProfile();
  if (!profile) notFound();

  const documento = profile.person_type === "pj" ? formatarCNPJ(profile.cnpj ?? "") : formatarCPF(profile.cpf ?? "");

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-2">
        <Badge variant="secondary">{profile.person_type === "pj" ? "Pessoa jurídica" : "Pessoa física"}</Badge>
      </div>

      <ProfileForm fullName={profile.full_name ?? ""} phone={profile.phone ?? ""} />

      <div className="flex flex-col gap-1 text-sm text-muted-foreground">
        <p>
          {profile.person_type === "pj" ? "CNPJ" : "CPF"}: <span className="text-foreground">{documento || "não informado"}</span>
        </p>
        {profile.person_type === "pj" && profile.company_name ? (
          <p>
            Razão social: <span className="text-foreground">{profile.company_name}</span>
          </p>
        ) : null}
        <p className="text-xs">Documento não pode ser alterado por aqui. Fale com a gente se precisar corrigir.</p>
      </div>
    </div>
  );
}
