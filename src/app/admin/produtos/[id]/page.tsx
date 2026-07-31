import { notFound } from "next/navigation";
import { ProductEditor } from "@/components/admin/product-editor";
import { getAdminProductById } from "@/lib/admin/products";
import { getAdminCategories } from "@/lib/admin/categories";
import { getProductCost, getPricingSettings } from "@/lib/admin/pricing";

export default async function EditarProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories, { cost, hasCost, weightGramsPacked }, pricingSettings] = await Promise.all([
    getAdminProductById(id),
    getAdminCategories(),
    getProductCost(id),
    getPricingSettings(),
  ]);

  if (!product) notFound();

  return (
    <ProductEditor
      product={product}
      categories={categories}
      productCost={cost}
      hasProductCost={hasCost}
      productCostWeightGramsPacked={weightGramsPacked}
      pricingSettings={pricingSettings}
    />
  );
}
