import { CategoryManager } from "@/components/admin/category-manager";
import { getAdminCategories } from "@/lib/admin/categories";

export default async function AdminCategoriasPage() {
  const categories = await getAdminCategories();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Categorias</h1>
      <CategoryManager categories={categories} />
    </div>
  );
}
