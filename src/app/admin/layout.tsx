import { AdminShell, type AdminNavItem } from "@/components/admin/admin-shell";
import { createClient } from "@/lib/supabase/server";

const NAV: AdminNavItem[] = [
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
    <AdminShell nav={NAV} pendingQuotes={pendingQuotes ?? 0} displayName={displayName} email={user?.email}>
      {children}
    </AdminShell>
  );
}
