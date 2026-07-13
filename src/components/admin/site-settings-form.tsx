"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LogoUpload } from "@/components/admin/logo-upload";
import { saveSiteSettingsAction, type ActionState } from "@/app/admin/configuracoes/actions";
import type { SiteSettings } from "@/lib/types";

export function SiteSettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(saveSiteSettingsAction, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-8">
      <section className="flex flex-col gap-4 rounded-lg border p-4">
        <h2 className="text-sm font-semibold">Identidade</h2>
        <LogoUpload currentUrl={settings.logo_url} />
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Nome do site</label>
            <Input name="siteName" defaultValue={settings.site_name} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Cor primária</label>
            <Input name="primaryColor" type="color" defaultValue={settings.primary_color} className="h-9 w-full" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Cor secundária</label>
            <Input name="secondaryColor" type="color" defaultValue={settings.secondary_color} className="h-9 w-full" />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-lg border p-4">
        <h2 className="text-sm font-semibold">Contato</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">E-mail</label>
            <Input name="contactEmail" type="email" defaultValue={settings.contact_email ?? ""} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Telefone</label>
            <Input name="contactPhone" defaultValue={settings.contact_phone ?? ""} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">WhatsApp</label>
            <Input name="whatsapp" defaultValue={settings.whatsapp ?? ""} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Instagram</label>
            <Input name="instagram" defaultValue={settings.social_links?.instagram ?? ""} placeholder="https://instagram.com/..." />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Facebook</label>
            <Input name="facebook" defaultValue={settings.social_links?.facebook ?? ""} placeholder="https://facebook.com/..." />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-lg border p-4">
        <h2 className="text-sm font-semibold">Endereço e CNPJ</h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">CNPJ</label>
            <Input name="storeCnpj" defaultValue={settings.store_cnpj ?? ""} />
          </div>
          <div className="col-span-2 flex flex-col gap-1.5">
            <label className="text-sm font-medium">Endereço</label>
            <Input name="addressStreet" defaultValue={settings.store_address?.street ?? ""} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">CEP</label>
            <Input name="addressCep" defaultValue={settings.store_address?.cep ?? ""} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Cidade</label>
            <Input name="addressCity" defaultValue={settings.store_address?.city ?? ""} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">UF</label>
            <Input name="addressState" defaultValue={settings.store_address?.state ?? ""} maxLength={2} />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-lg border p-4">
        <h2 className="text-sm font-semibold">Páginas institucionais</h2>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Sobre a loja</label>
          <Textarea name="policySobre" defaultValue={settings.policies?.sobre ?? ""} rows={3} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Política de trocas e devoluções</label>
          <Textarea name="policyTrocas" defaultValue={settings.policies?.trocas ?? ""} rows={3} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Política de privacidade</label>
          <Textarea name="policyPrivacidade" defaultValue={settings.policies?.privacidade ?? ""} rows={3} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Termos de uso</label>
          <Textarea name="policyTermos" defaultValue={settings.policies?.termos ?? ""} rows={3} />
        </div>
      </section>

      {state && "error" in state ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state && "success" in state ? <p className="text-sm text-primary">Configurações salvas.</p> : null}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Salvando..." : "Salvar configurações"}
      </Button>
    </form>
  );
}
