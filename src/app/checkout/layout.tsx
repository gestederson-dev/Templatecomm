import Link from "next/link";

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            Salmar Brindes
          </Link>
          <Link href="/carrinho" className="text-sm text-muted-foreground hover:text-foreground">
            ← Voltar ao carrinho
          </Link>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
