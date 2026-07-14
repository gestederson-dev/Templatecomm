import { ProductEditor } from "@/components/admin/product-editor";
import { getAdminCategories } from "@/lib/admin/categories";

export default async function NovoProdutoPage() {
  const categories = await getAdminCategories();
  return <ProductEditor categories={categories} />;
}
