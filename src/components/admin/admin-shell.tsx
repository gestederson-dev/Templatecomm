"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { NavIcon, type NavIconKey } from "@/components/admin/nav-icon";

export type AdminNavItem = { href: string; label: string; icon: NavIconKey; group: string };

const GROUPS = ["Geral", "Catálogo", "Vendas", "Fiado", "Sistema"];

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "AD";
}

export function AdminShell({
  nav,
  pendingQuotes,
  displayName,
  email,
  children,
}: {
  nav: AdminNavItem[];
  pendingQuotes: number;
  displayName: string;
  email?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="grid min-h-full flex-1 grid-cols-1 bg-paper font-[family-name:var(--font-body)] text-ink min-[861px]:grid-cols-[250px_1fr]">
      <div
        role="presentation"
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-ink/42 transition-opacity duration-200 min-[861px]:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[262px] flex-col overflow-y-auto bg-wine px-4 py-[22px] text-white/80 shadow-[0_0_40px_rgba(0,0,0,0.25)] transition-transform duration-300 ease-out min-[861px]:sticky min-[861px]:inset-y-auto min-[861px]:left-auto min-[861px]:top-0 min-[861px]:h-screen min-[861px]:w-full min-[861px]:translate-x-0 min-[861px]:shadow-none ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Link href="/admin" onClick={() => setOpen(false)} className="mb-4 flex items-center gap-2.5 border-b border-white/12 px-2 pb-[22px]">
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
              {nav
                .filter((item) => item.group === group)
                .map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
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
            <small className="block truncate text-[11px] font-normal text-white/50">{email}</small>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-paper/95 px-4 py-3 backdrop-blur min-[861px]:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Abrir menu"
            className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-[10px] border border-line bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-wine" fill="none" strokeWidth={2} strokeLinecap="round">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
          <Link href="/admin" className="flex items-center gap-2">
            <Image src="/logo/salmar-heart-mark.png" alt="" width={24} height={24} className="h-6 w-auto" />
            <span className="font-[family-name:var(--font-display)] text-[15px] font-bold text-wine">Salmar Painel</span>
          </Link>
        </div>

        <main className="min-w-0 px-4 py-6 sm:px-8 sm:py-[26px]">{children}</main>
      </div>
    </div>
  );
}
