"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { CartLink } from "@/components/store/cart-link";
import { btnGhost, btnOutline, btnAmber } from "@/components/store/button-styles";
import type { Category } from "@/lib/types";

export function SiteHeaderShell({
  siteName,
  categories,
  userEmail,
}: {
  siteName: string;
  categories: Category[];
  userEmail?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [first, ...rest] = siteName.split(" ");
  const small = rest.join(" ");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Renderizado via portal: o <header> tem backdrop-filter, que cria um novo
  // containing block para descendentes fixed — sem o portal, inset-y-0 fica
  // relativo à altura do header, não da viewport.
  const drawer = (
    <>
      <div
        role="presentation"
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-ink/45 transition-opacity duration-200 sm:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[290px] flex-col overflow-y-auto bg-white shadow-[0_0_50px_rgba(0,0,0,0.3)] transition-transform duration-300 ease-out sm:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-ink/10 p-4">
          <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2.5">
            <Image src="/logo/salmar-heart-mark.png" alt="" width={34} height={34} className="h-[34px] w-auto" />
            <span className="font-[family-name:var(--font-serif)] text-lg font-semibold leading-none text-wine">
              {first}
              {small ? <small className="mt-0.5 block font-[family-name:var(--font-body)] text-[8px] font-medium uppercase tracking-[0.26em] text-ink/50">{small}</small> : null}
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fechar menu"
            className="grid h-9 w-9 place-items-center rounded-[9px] border border-ink/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine"
          >
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] stroke-ink" fill="none" strokeWidth={2}>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3.5">
          <div className="mb-4 rounded-2xl bg-wine-tint p-1.5">
            {userEmail ? (
              <>
                <Link href="/conta" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-semibold text-ink">
                  <svg viewBox="0 0 24 24" className="h-[19px] w-[19px] stroke-wine" fill="none" strokeWidth={1.8}>
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 21a8 8 0 0 1 16 0" />
                  </svg>
                  Minha conta
                </Link>
                <div className="mx-2.5 h-px bg-ink/10" />
                <form action="/auth/logout" method="post">
                  <button type="submit" className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-semibold text-wine">
                    <svg viewBox="0 0 24 24" className="h-[19px] w-[19px] stroke-wine" fill="none" strokeWidth={1.8}>
                      <path d="M16 17l5-5-5-5M21 12H9M12 3H5v18h7" />
                    </svg>
                    Sair
                  </button>
                </form>
              </>
            ) : (
              <Link href="/login" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-semibold text-ink">
                <svg viewBox="0 0 24 24" className="h-[19px] w-[19px] stroke-wine" fill="none" strokeWidth={1.8}>
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21a8 8 0 0 1 16 0" />
                </svg>
                Entrar
              </Link>
            )}
          </div>

          <Link href="/produtos?quote=1" onClick={() => setOpen(false)} className={`${btnAmber} mb-5 block w-full rounded-[13px] py-3.5`}>
            Peça seu orçamento
          </Link>

          {categories.length > 0 ? (
            <>
              <p className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/45">Categorias</p>
              <nav className="mb-3.5 flex flex-col">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/categoria/${category.slug}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-xl px-3 py-3 text-[15.5px] font-medium text-ink transition-colors hover:bg-wine-tint hover:text-wine"
                  >
                    {category.name}
                    <svg viewBox="0 0 24 24" className="h-[17px] w-[17px] stroke-ink/45" fill="none" strokeWidth={2}>
                      <path d="M9 6l6 6-6 6" />
                    </svg>
                  </Link>
                ))}
              </nav>
            </>
          ) : null}

          <div className="my-3.5 h-px bg-ink/10" />
          <div className="flex flex-col">
            <Link href="/sobre" onClick={() => setOpen(false)} className="px-3 py-2.5 text-sm font-medium text-ink/60">
              Sobre
            </Link>
            <Link href="/contato" onClick={() => setOpen(false)} className="px-3 py-2.5 text-sm font-medium text-ink/60">
              Contato
            </Link>
            <Link href="/politicas" onClick={() => setOpen(false)} className="px-3 py-2.5 text-sm font-medium text-ink/60">
              Políticas
            </Link>
          </div>
        </div>
      </aside>
    </>
  );

  return (
    <>
      {mounted ? createPortal(drawer, document.body) : null}

      {/* mobile row: hamburger / centered logo / cart */}
      <div className="grid grid-cols-[42px_1fr_42px] items-center gap-3 px-4 py-3 sm:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
          className="grid h-[42px] w-[42px] place-items-center rounded-[11px] active:bg-wine-tint"
        >
          <svg viewBox="0 0 24 24" className="h-[23px] w-[23px] stroke-wine" fill="none" strokeWidth={2}>
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
        <Link href="/" className="flex items-center justify-center gap-2">
          <Image src="/logo/salmar-heart-mark.png" alt="" width={30} height={30} className="h-[30px] w-auto" />
          <span className="font-[family-name:var(--font-serif)] text-[19px] font-semibold text-wine">{first}</span>
        </Link>
        <CartLink />
      </div>
      <div className="px-4 pb-3 sm:hidden">
        <form action="/produtos" method="get">
          <Input
            type="search"
            name="q"
            placeholder="Buscar produtos..."
            aria-label="Buscar produtos"
            className="rounded-full border-ink/15 bg-white focus-visible:border-wine focus-visible:ring-wine/40"
          />
        </form>
      </div>

      {/* desktop row */}
      <div className="mx-auto hidden max-w-6xl items-center gap-4 px-7 sm:flex sm:h-[78px]">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo/salmar-heart-mark.png" alt="" width={46} height={46} className="h-[46px] w-auto" priority />
          <span className="font-[family-name:var(--font-serif)] text-[23px] font-semibold leading-[0.95] tracking-[-0.01em] text-wine">
            {first}
            {small ? <small className="mt-1 block font-[family-name:var(--font-body)] text-[9.5px] font-medium uppercase tracking-[0.34em] text-ink/60">{small}</small> : null}
          </span>
        </Link>

        <form action="/produtos" method="get" className="ml-2 max-w-sm flex-1">
          <Input
            type="search"
            name="q"
            placeholder="Buscar produtos..."
            aria-label="Buscar produtos"
            className="rounded-full border-ink/15 bg-white focus-visible:border-wine focus-visible:ring-wine/40"
          />
        </form>

        <div className="ml-auto flex items-center gap-2">
          {userEmail ? (
            <>
              <Link href="/conta" className={btnGhost}>
                Minha conta
              </Link>
              <form action="/auth/logout" method="post">
                <button type="submit" className={btnGhost}>
                  Sair
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" className={btnGhost}>
              Entrar
            </Link>
          )}
          <Link href="/produtos?quote=1" className={btnOutline}>
            Peça seu orçamento
          </Link>
          <CartLink />
        </div>
      </div>

      {categories.length > 0 ? (
        <div className="hidden border-t border-ink/10 sm:block">
          <nav aria-label="Categorias" className="mx-auto flex h-[46px] max-w-6xl items-center gap-6 overflow-x-auto px-4 sm:px-7">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categoria/${category.slug}`}
                className="shrink-0 text-[13.5px] font-medium text-ink/62 transition-colors hover:text-wine"
              >
                {category.name}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </>
  );
}
