import Link from "next/link";
import Image from "next/image";
import { getSiteSettings } from "@/lib/catalog";

export async function SiteFooter() {
  const settings = await getSiteSettings();
  const siteName = settings?.site_name ?? "Salmar Personalizados";
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-ink text-white/72">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-[2fr_1fr_1fr] sm:px-7">
        <div>
          <Image
            src="/logo/salmar-logo-lockup.png"
            alt={siteName}
            width={220}
            height={88}
            className="h-[72px] w-auto object-contain opacity-92 brightness-0 invert"
          />
          <p className="mt-4 max-w-[300px] text-[14.5px] text-white/55">
            Brindes corporativos e itens promocionais personalizados. Venda direta ou sob orçamento, para todo o Brasil.
          </p>
        </div>

        <div>
          <h4 className="mb-4 font-[family-name:var(--font-display)] text-sm font-semibold uppercase tracking-wide text-white">Contato</h4>
          <ul className="space-y-2.5 text-[14.5px] text-white/60">
            {settings?.contact_email ? <li>{settings.contact_email}</li> : null}
            {settings?.contact_phone ? <li>{settings.contact_phone}</li> : null}
            {settings?.whatsapp ? <li>WhatsApp: {settings.whatsapp}</li> : null}
            {!settings?.contact_email && !settings?.contact_phone && !settings?.whatsapp ? (
              <li>Configuração de contato pendente.</li>
            ) : null}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-[family-name:var(--font-display)] text-sm font-semibold uppercase tracking-wide text-white">Institucional</h4>
          <ul className="space-y-2.5 text-[14.5px]">
            <li>
              <Link href="/sobre" className="text-white/60 transition-colors hover:text-amber">
                Sobre
              </Link>
            </li>
            <li>
              <Link href="/contato" className="text-white/60 transition-colors hover:text-amber">
                Contato
              </Link>
            </li>
            <li>
              <Link href="/politicas" className="text-white/60 transition-colors hover:text-amber">
                Políticas
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-5 text-center text-[13px] text-white/40 sm:px-7">
        © {year} {siteName}. Todos os direitos reservados.
      </div>
    </footer>
  );
}
