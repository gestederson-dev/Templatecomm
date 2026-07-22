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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = user ? (await supabase.from("profiles").select("full_name, role").eq("id", user.id).maybeSingle()).data : null;

  // /admin/login é a única rota sob /admin acessível sem sessão de admin (o
  // proxy garante isso pro resto) — sem o shell do painel em volta dela.
  if (profile?.role !== "admin") {
    return <>{children}</>;
  }

  const { count: pendingQuotes } = await supabase.from("quotes").select("id", { count: "exact", head: true }).eq("status", "requested");

  return (
    <AdminShell nav={NAV} pendingQuotes={pendingQuotes ?? 0} displayName={profile.full_name || user!.email || "Admin"} email={user?.email}>
      {children}
    </AdminShell>
  );
}
