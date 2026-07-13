import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/catalog";

export const metadata: Metadata = { title: "Contato" };

export default async function ContatoPage() {
  const settings = await getSiteSettings();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Contato</h1>
      <dl className="flex flex-col gap-3 text-sm">
        {settings?.contact_email ? (
          <div>
            <dt className="text-muted-foreground">E-mail</dt>
            <dd className="font-medium">{settings.contact_email}</dd>
          </div>
        ) : null}
        {settings?.contact_phone ? (
          <div>
            <dt className="text-muted-foreground">Telefone</dt>
            <dd className="font-medium">{settings.contact_phone}</dd>
          </div>
        ) : null}
        {settings?.whatsapp ? (
          <div>
            <dt className="text-muted-foreground">WhatsApp</dt>
            <dd className="font-medium">{settings.whatsapp}</dd>
          </div>
        ) : null}
        {settings?.store_address?.street ? (
          <div>
            <dt className="text-muted-foreground">Endereço</dt>
            <dd className="font-medium">
              {settings.store_address.street} — {settings.store_address.city}/{settings.store_address.state} — CEP {settings.store_address.cep}
            </dd>
          </div>
        ) : null}
        {settings?.store_cnpj ? (
          <div>
            <dt className="text-muted-foreground">CNPJ</dt>
            <dd className="font-medium">{settings.store_cnpj}</dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}
