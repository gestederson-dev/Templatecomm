import { CategoryManager } from "@/components/admin/category-manager";
import { getAdminCategories } from "@/lib/admin/categories";

export default async function AdminCategoriasPage() {
  const categories = await getAdminCategories();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-[26px] font-bold tracking-[-0.02em]">Categorias</h1>
        <p className="mt-0.5 text-[13px] text-ink/52">
          {categories.length} categoria{categories.length === 1 ? "" : "s"}
        </p>
      </div>
      <CategoryManager categories={categories} />
    </div>
  );
}
