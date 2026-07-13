import { ProductForm } from "@/components/admin/product-form";
import { getAdminCategories } from "@/lib/admin/categories";

export default async function NovoProdutoPage() {
  const categories = await getAdminCategories();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Novo produto</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
