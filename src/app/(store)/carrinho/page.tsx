import type { Metadata } from "next";
import { CartView } from "@/components/store/cart-view";

export const metadata: Metadata = {
  title: "Carrinho",
};

export default function CarrinhoPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 font-[family-name:var(--font-display)] text-[26px] font-bold tracking-[-0.02em]">Carrinho</h1>
      <CartView />
    </div>
  );
}
