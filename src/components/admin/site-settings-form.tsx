"use client";

import { useActionState } from "react";
import { LogoUpload } from "@/components/admin/logo-upload";
import { adminBtnWine, adminCard, adminInput, adminLabel } from "@/components/admin/ui-styles";
import { saveSiteSettingsAction, type ActionState } from "@/app/admin/configuracoes/actions";
import type { SiteSettings } from "@/lib/types";

export function SiteSettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(saveSiteSettingsAction, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <section className={`${adminCard} flex flex-col gap-4`}>
        <h2 className="font-[family-name:var(--font-display)] text-[15px] font-semibold">Identidade</h2>
        <LogoUpload currentUrl={settings.logo_url} />
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={adminLabel}>Nome do site</label>
            <input name="siteName" defaultValue={settings.site_name} className={adminInput} />
          </div>
          <div>
            <label className={adminLabel}>Cor primária</label>
            <input name="primaryColor" type="color" defaultValue={settings.primary_color} className={`${adminInput} h-9 p-1`} />
          </div>
          <div>
            <label className={adminLabel}>Cor secundária</label>
            <input name="secondaryColor" type="color" defaultValue={settings.secondary_color} className={`${adminInput} h-9 p-1`} />
          </div>
        </div>
      </section>

      <section className={`${adminCard} flex flex-col gap-4`}>
        <h2 className="font-[family-name:var(--font-display)] text-[15px] font-semibold">Contato</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={adminLabel}>E-mail</label>
            <input name="contactEmail" type="email" defaultValue={settings.contact_email ?? ""} className={adminInput} />
          </div>
          <div>
            <label className={adminLabel}>Telefone</label>
            <input name="contactPhone" defaultValue={settings.contact_phone ?? ""} className={adminInput} />
          </div>
          <div>
            <label className={adminLabel}>WhatsApp</label>
            <input name="whatsapp" defaultValue={settings.whatsapp ?? ""} className={adminInput} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={adminLabel}>Instagram</label>
            <input name="instagram" defaultValue={settings.social_links?.instagram ?? ""} placeholder="https://instagram.com/..." className={adminInput} />
          </div>
          <div>
            <label className={adminLabel}>Facebook</label>
            <input name="facebook" defaultValue={settings.social_links?.facebook ?? ""} placeholder="https://facebook.com/..." className={adminInput} />
          </div>
        </div>
      </section>

      <section className={`${adminCard} flex flex-col gap-4`}>
        <h2 className="font-[family-name:var(--font-display)] text-[15px] font-semibold">Endereço e CNPJ</h2>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className={adminLabel}>CNPJ</label>
            <input name="storeCnpj" defaultValue={settings.store_cnpj ?? ""} className={adminInput} />
          </div>
          <div className="col-span-2">
            <label className={adminLabel}>Endereço</label>
            <input name="addressStreet" defaultValue={settings.store_address?.street ?? ""} className={adminInput} />
          </div>
          <div>
            <label className={adminLabel}>CEP</label>
            <input name="addressCep" defaultValue={settings.store_address?.cep ?? ""} className={adminInput} />
          </div>
          <div>
            <label className={adminLabel}>Cidade</label>
            <input name="addressCity" defaultValue={settings.store_address?.city ?? ""} className={adminInput} />
          </div>
          <div>
            <label className={adminLabel}>UF</label>
            <input name="addressState" defaultValue={settings.store_address?.state ?? ""} maxLength={2} className={adminInput} />
          </div>
        </div>
      </section>

      <section className={`${adminCard} flex flex-col gap-4`}>
        <h2 className="font-[family-name:var(--font-display)] text-[15px] font-semibold">Páginas institucionais</h2>
        <div>
          <label className={adminLabel}>Sobre a loja</label>
          <textarea name="policySobre" defaultValue={settings.policies?.sobre ?? ""} rows={3} className={`${adminInput} w-full`} />
        </div>
        <div>
          <label className={adminLabel}>Política de trocas e devoluções</label>
          <textarea name="policyTrocas" defaultValue={settings.policies?.trocas ?? ""} rows={3} className={`${adminInput} w-full`} />
        </div>
        <div>
          <label className={adminLabel}>Política de privacidade</label>
          <textarea name="policyPrivacidade" defaultValue={settings.policies?.privacidade ?? ""} rows={3} className={`${adminInput} w-full`} />
        </div>
        <div>
          <label className={adminLabel}>Termos de uso</label>
          <textarea name="policyTermos" defaultValue={settings.policies?.termos ?? ""} rows={3} className={`${adminInput} w-full`} />
        </div>
      </section>

      {state && "error" in state ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state && "success" in state ? <p className="text-sm font-medium text-ok">Configurações salvas.</p> : null}

      <button type="submit" disabled={pending} className={`${adminBtnWine} w-fit disabled:pointer-events-none disabled:opacity-50`}>
        {pending ? "Salvando..." : "Salvar configurações"}
      </button>
    </form>
  );
}
