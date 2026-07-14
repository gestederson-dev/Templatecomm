import Link from "next/link";
import { Logo } from "@/components/store/logo";
import { SiteFooter } from "@/components/store/site-footer";

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-paper font-[family-name:var(--font-body)] text-ink">
      <header className="border-b border-ink/10 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4 sm:px-6">
          <Logo />
          <Link href="/carrinho" className="text-sm font-medium text-ink/62 transition-colors hover:text-wine">
            ← Voltar ao carrinho
          </Link>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
