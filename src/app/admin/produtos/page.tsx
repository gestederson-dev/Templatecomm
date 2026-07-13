import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ToggleActiveButton } from "@/components/admin/toggle-active-button";
import { getAdminProducts } from "@/lib/admin/products";
import { toggleProductActiveAction } from "./actions";
import { formatBRL } from "@/lib/format";

export default async function AdminProdutosPage() {
  const products = await getAdminProducts();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Produtos</h1>
        <Button render={<Link href="/admin/produtos/novo">+ Novo produto</Link>} />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Estoque</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <Link href={`/admin/produtos/${product.id}`} className="font-medium hover:underline">
                  {product.name}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">{product.category?.name ?? "—"}</TableCell>
              <TableCell className="tabular-nums">{product.base_price != null ? formatBRL(product.base_price) : "Sob orçamento"}</TableCell>
              <TableCell className="tabular-nums">{product.stock_quantity}</TableCell>
              <TableCell>
                <Badge variant={product.is_active ? "default" : "secondary"}>{product.is_active ? "Ativo" : "Inativo"}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <ToggleActiveButton id={product.id} isActive={product.is_active} action={toggleProductActiveAction} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
