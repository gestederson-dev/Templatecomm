import Link from "next/link";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/orcamentos", label: "Orçamentos" },
  { href: "/admin/produtos", label: "Produtos" },
  { href: "/admin/categorias", label: "Categorias" },
  { href: "/admin/clientes", label: "Clientes" },
  { href: "/admin/cupons", label: "Cupons" },
  { href: "/admin/banners", label: "Banners" },
  { href: "/admin/configuracoes", label: "Configurações" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col md:flex-row">
      <aside className="shrink-0 border-b bg-muted/20 p-4 md:w-56 md:border-b-0 md:border-r">
        <Link href="/" className="mb-4 block text-lg font-semibold tracking-tight md:mb-6">
          Salmar Admin
        </Link>
        <nav className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link href="/" className="mt-4 hidden text-xs text-muted-foreground hover:text-foreground md:mt-6 md:block">
          ← Voltar à loja
        </Link>
      </aside>
      <main className="flex-1 p-4 sm:p-8">{children}</main>
    </div>
  );
}
