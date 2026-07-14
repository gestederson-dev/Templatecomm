import Link from "next/link";
import { adminPanel } from "@/components/admin/ui-styles";
import { getAdminCustomers } from "@/lib/admin/customers";
import { formatarCNPJ, formatarCPF } from "@/lib/validators/documento";

export default async function AdminClientesPage() {
  const customers = await getAdminCustomers();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-[26px] font-bold tracking-[-0.02em]">Clientes</h1>
        <p className="mt-0.5 text-[13px] text-ink/52">
          {customers.length} cliente{customers.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className={adminPanel}>
        <table className="w-full border-collapse text-[13.5px]">
          <thead>
            <tr className="bg-ink/[0.015] text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-ink/52">
              <th className="px-4 py-3.5">Nome</th>
              <th className="px-4 py-3.5">Tipo</th>
              <th className="px-4 py-3.5">Documento</th>
              <th className="px-4 py-3.5">Telefone</th>
              <th className="px-4 py-3.5">Desde</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-ink/52">
                  Nenhum cliente encontrado.
                </td>
              </tr>
            ) : null}
            {customers.map((customer) => (
              <tr key={customer.id} className="border-t border-line">
                <td className="px-4 py-3.5">
                  <Link href={`/admin/clientes/${customer.id}`} className="font-semibold text-ink hover:text-wine">
                    {customer.full_name || "(sem nome)"}
                    {customer.person_type === "pj" && customer.company_name ? ` — ${customer.company_name}` : ""}
                  </Link>
                </td>
                <td className="px-4 py-3.5">
                  <span className="rounded-full border border-line px-2.5 py-1 text-[11px] font-semibold text-ink/70">{customer.person_type === "pj" ? "PJ" : "PF"}</span>
                </td>
                <td className="px-4 py-3.5 text-ink/62">{customer.person_type === "pj" ? formatarCNPJ(customer.cnpj ?? "") : formatarCPF(customer.cpf ?? "")}</td>
                <td className="px-4 py-3.5 text-ink/62">{customer.phone ?? "—"}</td>
                <td className="px-4 py-3.5 text-ink/62">{new Date(customer.created_at).toLocaleDateString("pt-BR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
