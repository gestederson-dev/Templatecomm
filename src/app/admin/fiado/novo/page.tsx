import { FiadoNewCustomerForm } from "@/components/admin/fiado-new-customer-form";

export default function NovoFiadoPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-[26px] font-bold tracking-[-0.02em]">Novo fiado</h1>
        <p className="mt-0.5 text-[13px] text-ink/52">Cadastre o cliente e, se quiser, já lance a primeira cobrança.</p>
      </div>

      <FiadoNewCustomerForm />
    </div>
  );
}
