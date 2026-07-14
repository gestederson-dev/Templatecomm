"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ABAS = [
  { href: "/conta", label: "Perfil" },
  { href: "/conta/enderecos", label: "Endereços" },
  { href: "/conta/pedidos", label: "Meus pedidos" },
  { href: "/conta/orcamentos", label: "Meus orçamentos" },
];

export function ContaTabs() {
  const pathname = usePathname();

  return (
    <nav aria-label="Seções da conta" className="flex flex-wrap gap-1.5 border-b border-ink/10 pb-3">
      {ABAS.map((aba) => {
        const active = aba.href === "/conta" ? pathname === "/conta" : pathname.startsWith(aba.href);
        return (
          <Link
            key={aba.href}
            href={aba.href}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine focus-visible:ring-offset-2 focus-visible:ring-offset-paper ${
              active ? "bg-wine text-white" : "text-ink/62 hover:bg-wine-tint hover:text-wine"
            }`}
          >
            {aba.label}
          </Link>
        );
      })}
    </nav>
  );
}
