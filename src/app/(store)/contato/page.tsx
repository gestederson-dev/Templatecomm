import type { Metadata } from "next";
import { storeCard } from "@/components/store/ui-styles";
import { getSiteSettings } from "@/lib/catalog";

export const metadata: Metadata = { title: "Contato" };

export default async function ContatoPage() {
  const settings = await getSiteSettings();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 font-[family-name:var(--font-display)] text-[26px] font-bold tracking-[-0.02em]">Contato</h1>
      <dl className={`${storeCard} flex flex-col gap-4 text-sm`}>
        {settings?.contact_email ? (
          <div>
            <dt className="text-[11.5px] font-semibold uppercase tracking-[0.04em] text-ink/52">E-mail</dt>
            <dd className="mt-0.5 font-medium text-ink">{settings.contact_email}</dd>
          </div>
        ) : null}
        {settings?.contact_phone ? (
          <div>
            <dt className="text-[11.5px] font-semibold uppercase tracking-[0.04em] text-ink/52">Telefone</dt>
            <dd className="mt-0.5 font-medium text-ink">{settings.contact_phone}</dd>
          </div>
        ) : null}
        {settings?.whatsapp ? (
          <div>
            <dt className="text-[11.5px] font-semibold uppercase tracking-[0.04em] text-ink/52">WhatsApp</dt>
            <dd className="mt-0.5 font-medium text-ink">{settings.whatsapp}</dd>
          </div>
        ) : null}
        {settings?.store_address?.street ? (
          <div>
            <dt className="text-[11.5px] font-semibold uppercase tracking-[0.04em] text-ink/52">Endereço</dt>
            <dd className="mt-0.5 font-medium text-ink">
              {settings.store_address.street} — {settings.store_address.city}/{settings.store_address.state} — CEP {settings.store_address.cep}
            </dd>
          </div>
        ) : null}
        {settings?.store_cnpj ? (
          <div>
            <dt className="text-[11.5px] font-semibold uppercase tracking-[0.04em] text-ink/52">CNPJ</dt>
            <dd className="mt-0.5 font-medium text-ink">{settings.store_cnpj}</dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}
