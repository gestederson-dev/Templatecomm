import { notFound } from "next/navigation";
import { ProductEditor } from "@/components/admin/product-editor";
import { getAdminProductById } from "@/lib/admin/products";
import { getAdminCategories } from "@/lib/admin/categories";

export default async function EditarProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([getAdminProductById(id), getAdminCategories()]);

  if (!product) notFound();

  return <ProductEditor product={product} categories={categories} />;
}
