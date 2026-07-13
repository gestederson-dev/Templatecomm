import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAdminCustomers } from "@/lib/admin/customers";
import { formatarCNPJ, formatarCPF } from "@/lib/validators/documento";

export default async function AdminClientesPage() {
  const customers = await getAdminCustomers();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Clientes</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Documento</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Desde</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell>
                <Link href={`/admin/clientes/${customer.id}`} className="font-medium hover:underline">
                  {customer.full_name || "(sem nome)"}
                  {customer.person_type === "pj" && customer.company_name ? ` — ${customer.company_name}` : ""}
                </Link>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{customer.person_type === "pj" ? "PJ" : "PF"}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{customer.person_type === "pj" ? formatarCNPJ(customer.cnpj ?? "") : formatarCPF(customer.cpf ?? "")}</TableCell>
              <TableCell className="text-muted-foreground">{customer.phone ?? "—"}</TableCell>
              <TableCell className="text-muted-foreground">{new Date(customer.created_at).toLocaleDateString("pt-BR")}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
