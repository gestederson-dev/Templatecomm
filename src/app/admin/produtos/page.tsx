import Link from "next/link";
import Image from "next/image";
import { CategoryIcon } from "@/components/store/category-icon";
import { ToggleActiveButton } from "@/components/admin/toggle-active-button";
import { ProductFiltersBar } from "@/components/admin/product-filters-bar";
import { adminBtnAmber, adminIconBtn, adminPanel } from "@/components/admin/ui-styles";
import { getAdminProducts } from "@/lib/admin/products";
import { getAdminCategories } from "@/lib/admin/categories";
import { toggleProductActiveAction } from "./actions";
import { formatBRL } from "@/lib/format";

const THUMB_GRADIENTS = [
  "linear-gradient(150deg,#fbeef2,#f0cdd8)",
  "linear-gradient(150deg,#fff2dc,#ffe1b0)",
  "linear-gradient(150deg,#efe6ea,#ddd0d6)",
];

type SearchParams = { q?: string; categoria?: string; status?: string; tipo?: string };

export default async function AdminProdutosPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { q, categoria, status, tipo } = await searchParams;

  const [products, categories] = await Promise.all([
    getAdminProducts({
      search: q,
      categoryId: categoria,
      status: status === "active" || status === "inactive" ? status : undefined,
      type: tipo === "direct" || tipo === "quote" ? tipo : undefined,
    }),
    getAdminCategories(),
  ]);

  const inactiveCount = products.filter((p) => !p.is_active).length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-[26px] font-bold tracking-[-0.02em]">Produtos</h1>
          <p className="mt-0.5 text-[13px] text-ink/52">
            {products.length} produto{products.length === 1 ? "" : "s"}
            {inactiveCount > 0 ? ` · ${inactiveCount} inativo${inactiveCount === 1 ? "" : "s"}` : ""}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <form action="/admin/produtos" method="get" className="flex items-center gap-2 rounded-[10px] border border-line bg-white px-[13px] py-[9px]">
            <svg viewBox="0 0 24 24" className="h-4 w-4 stroke-ink/52" fill="none" strokeWidth={1.8}>
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4-4" />
            </svg>
            <input type="search" name="q" defaultValue={q} placeholder="Buscar produto…" className="w-40 border-none bg-transparent text-[13.5px] outline-none" />
          </form>
          <Link href="/admin/produtos/novo" className={adminBtnAmber}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} className="h-[17px] w-[17px] stroke-current">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Novo produto
          </Link>
        </div>
      </div>

      <ProductFiltersBar categories={categories} />

      <div className={adminPanel}>
        <table className="w-full border-collapse text-[13.5px]">
          <thead>
            <tr className="bg-ink/[0.015] text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-ink/52">
              <th className="px-4 py-3.5">Produto</th>
              <th className="px-4 py-3.5">Categoria</th>
              <th className="px-4 py-3.5">Preço</th>
              <th className="px-4 py-3.5">Estoque</th>
              <th className="px-4 py-3.5">Modelo</th>
              <th className="px-4 py-3.5">Ativo</th>
              <th className="px-4 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-ink/52">
                  Nenhum produto encontrado.
                </td>
              </tr>
            ) : null}
            {products.map((product, index) => (
              <tr key={product.id} className="border-t border-line">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div
                      className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-[10px]"
                      style={product.primary_image ? undefined : { background: THUMB_GRADIENTS[index % 3] }}
                    >
                      {product.primary_image ? (
                        <Image src={product.primary_image.url} alt="" fill sizes="44px" className="object-cover" />
                      ) : (
                        <CategoryIcon slug={product.category?.slug ?? ""} className="h-6 w-6 stroke-wine" />
                      )}
                    </div>
                    <div>
                      <Link href={`/admin/produtos/${product.id}`} className="font-semibold hover:text-wine">
                        {product.name}
                      </Link>
                      {product.sku ? <small className="block text-xs font-normal text-ink/52">SKU {product.sku}</small> : null}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-ink/70">{product.category?.name ?? "—"}</td>
                <td className="px-4 py-3.5">
                  {product.base_price != null ? (
                    <span className="font-[family-name:var(--font-display)] font-semibold text-wine">{formatBRL(product.base_price)}</span>
                  ) : (
                    <span className="text-[13px] font-semibold text-amber">Sob orçamento</span>
                  )}
                </td>
                <td className="px-4 py-3.5 text-ink/70">{product.allow_direct_sale ? product.stock_quantity : "—"}</td>
                <td className="px-4 py-3.5">
                  <div className="flex gap-1.5">
                    {product.allow_direct_sale ? <span className="rounded-full bg-wine-tint px-2.5 py-1 text-[11px] font-semibold text-wine">Direto</span> : null}
                    {product.allow_quote ? <span className="rounded-full bg-amber-tint px-2.5 py-1 text-[11px] font-semibold text-warn">Orçamento</span> : null}
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <ToggleActiveButton id={product.id} isActive={product.is_active} action={toggleProductActiveAction} />
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex gap-1.5">
                    <Link href={`/admin/produtos/${product.id}`} className={adminIconBtn} aria-label="Editar">
                      <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} className="h-[15px] w-[15px] stroke-current">
                        <path d="M4 20h4L18 10l-4-4L4 16z" />
                      </svg>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
