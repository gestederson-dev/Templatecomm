import Link from "next/link";

const ABAS = [
  { href: "/conta", label: "Perfil" },
  { href: "/conta/enderecos", label: "Endereços" },
  { href: "/conta/pedidos", label: "Meus pedidos" },
  { href: "/conta/orcamentos", label: "Meus orçamentos" },
];

export default function ContaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            Salmar Brindes
          </Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Voltar à loja
          </Link>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">Minha conta</h1>

        <nav aria-label="Seções da conta" className="flex flex-wrap gap-2 border-b pb-2">
          {ABAS.map((aba) => (
            <Link key={aba.href} href={aba.href} className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
              {aba.label}
            </Link>
          ))}
        </nav>

        {children}
      </div>
    </div>
  );
}
