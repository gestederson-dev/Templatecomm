import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { ProductImages } from "@/components/admin/product-images";
import { ProductCustomization } from "@/components/admin/product-customization";
import { ProductPriceTiers } from "@/components/admin/product-price-tiers";
import { getAdminProductById } from "@/lib/admin/products";
import { getAdminCategories } from "@/lib/admin/categories";

export default async function EditarProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([getAdminProductById(id), getAdminCategories()]);

  if (!product) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">{product.name}</h1>
      <ProductForm product={product} categories={categories} />
      <ProductImages productId={product.id} images={product.images} />
      <ProductCustomization productId={product.id} options={product.customization_options} />
      <ProductPriceTiers productId={product.id} tiers={product.price_tiers} />
    </div>
  );
}
