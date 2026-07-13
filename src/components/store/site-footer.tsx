import { getSiteSettings } from "@/lib/catalog";

export async function SiteFooter() {
  const settings = await getSiteSettings();
  const siteName = settings?.site_name ?? "Salmar Brindes";
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t bg-muted/30">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm sm:grid-cols-3 sm:px-6">
        <div>
          <p className="font-semibold">{siteName}</p>
          <p className="mt-2 text-muted-foreground">Brindes corporativos e itens promocionais, venda direta ou sob orçamento.</p>
        </div>

        <div>
          <p className="font-semibold">Contato</p>
          <ul className="mt-2 space-y-1 text-muted-foreground">
            {settings?.contact_email ? <li>{settings.contact_email}</li> : null}
            {settings?.contact_phone ? <li>{settings.contact_phone}</li> : null}
            {settings?.whatsapp ? <li>WhatsApp: {settings.whatsapp}</li> : null}
            {!settings?.contact_email && !settings?.contact_phone && !settings?.whatsapp ? (
              <li>Configuração de contato pendente.</li>
            ) : null}
          </ul>
        </div>

        <div>
          <p className="font-semibold">Institucional</p>
          <p className="mt-2 text-muted-foreground">Políticas e páginas institucionais em breve.</p>
        </div>
      </div>

      <div className="border-t px-4 py-4 text-center text-xs text-muted-foreground sm:px-6">
        © {year} {siteName}. Todos os direitos reservados.
      </div>
    </footer>
  );
}
