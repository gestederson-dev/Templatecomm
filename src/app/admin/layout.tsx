import Link from "next/link";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/orcamentos", label: "Orçamentos" },
  { href: "/admin/produtos", label: "Produtos" },
  { href: "/admin/categorias", label: "Categorias" },
  { href: "/admin/clientes", label: "Clientes" },
  { href: "/admin/cupons", label: "Cupons" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1">
      <aside className="w-56 shrink-0 border-r bg-muted/20 p-4">
        <Link href="/" className="mb-6 block text-lg font-semibold tracking-tight">
          Salmar Admin
        </Link>
        <nav className="flex flex-col gap-1">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>
        <Link href="/" className="mt-6 block text-xs text-muted-foreground hover:text-foreground">
          ← Voltar à loja
        </Link>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
