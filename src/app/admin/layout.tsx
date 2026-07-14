import Image from "next/image";
import Link from "next/link";
import { NavIcon, type NavIconKey } from "@/components/admin/nav-icon";
import { createClient } from "@/lib/supabase/server";

const NAV: { href: string; label: string; icon: NavIconKey; group: string }[] = [
  { href: "/admin", label: "Dashboard", icon: "dashboard", group: "Geral" },
  { href: "/admin/produtos", label: "Produtos", icon: "produtos", group: "Catálogo" },
  { href: "/admin/categorias", label: "Categorias", icon: "categorias", group: "Catálogo" },
  { href: "/admin/pedidos", label: "Pedidos", icon: "pedidos", group: "Vendas" },
  { href: "/admin/orcamentos", label: "Orçamentos", icon: "orcamentos", group: "Vendas" },
  { href: "/admin/clientes", label: "Clientes", icon: "clientes", group: "Vendas" },
  { href: "/admin/cupons", label: "Cupons", icon: "cupons", group: "Vendas" },
  { href: "/admin/banners", label: "Banners", icon: "banners", group: "Sistema" },
  { href: "/admin/configuracoes", label: "Configurações", icon: "configuracoes", group: "Sistema" },
];

const GROUPS = ["Geral", "Catálogo", "Vendas", "Sistema"];

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "AD";
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const [{ count: pendingQuotes }, userResult] = await Promise.all([
    supabase.from("quotes").select("id", { count: "exact", head: true }).eq("status", "requested"),
    supabase.auth.getUser(),
  ]);

  const user = userResult.data.user;
  let displayName = "Admin";
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
    displayName = profile?.full_name || user.email || "Admin";
  }

  return (
    <div className="grid min-h-full flex-1 grid-cols-1 bg-paper font-[family-name:var(--font-body)] text-ink md:grid-cols-[250px_1fr]">
      <aside className="sticky top-0 z-40 flex h-auto flex-col bg-wine px-4 py-[22px] text-white/80 md:h-screen">
        <Link href="/admin" className="mb-4 flex items-center gap-2.5 border-b border-white/12 px-2 pb-[22px]">
          <Image src="/logo/salmar-heart-mark.png" alt="" width={34} height={34} className="h-[34px] w-auto brightness-0 invert" />
          <span className="font-[family-name:var(--font-display)] text-lg font-bold leading-none text-white">
            Salmar
            <small className="mt-[3px] block font-[family-name:var(--font-body)] text-[8.5px] font-medium uppercase tracking-[0.28em] text-white/55">Painel</small>
          </span>
        </Link>

        <nav className="flex flex-1 flex-col overflow-y-auto">
          {GROUPS.map((group) => (
            <div key={group}>
              <p className="px-2.5 pb-1.5 pt-3 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white/40">{group}</p>
              {NAV.filter((item) => item.group === group).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative mb-0.5 flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium text-white/78 transition-colors hover:bg-white/8 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber"
                >
                  <NavIcon name={item.icon} className="h-[18px] w-[18px] stroke-current" />
                  {item.label}
                  {item.href === "/admin/orcamentos" && pendingQuotes ? (
                    <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-amber px-1.5 text-[11px] font-bold text-ink">{pendingQuotes}</span>
                  ) : null}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="mt-auto flex items-center gap-2.5 border-t border-white/12 px-2 pt-3">
          <div className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full bg-amber font-[family-name:var(--font-display)] font-bold text-ink">
            {initialsOf(displayName)}
          </div>
          <div className="min-w-0 text-[13px] font-medium leading-tight text-white">
            <p className="truncate">{displayName}</p>
            <small className="block truncate text-[11px] font-normal text-white/50">{user?.email}</small>
          </div>
        </div>
      </aside>

      <main className="min-w-0 px-4 py-6 sm:px-8 sm:py-[26px]">{children}</main>
    </div>
  );
}
