import Link from "next/link";
import { ConfirmationLinkBox } from "@/components/admin/confirmation-row-actions";
import { StatusPill, type PillTone } from "@/components/admin/status-pill";
import { adminBtnAmber, adminCard } from "@/components/admin/ui-styles";
import { confirmationTotal, confirmationUrl, listConfirmations, logoDownloadUrl, type OrderConfirmation } from "@/lib/confirmations";
import { formatBRL } from "@/lib/format";
import { formatarCNPJ, formatarCPF } from "@/lib/validators/documento";

const STATUS: Record<OrderConfirmation["status"], { label: string; tone: PillTone }> = {
  pendente: { label: "Aguardando cliente", tone: "warn" },
  respondido: { label: "Respondido", tone: "ok" },
  cancelado: { label: "Cancelado", tone: "critical" },
};

function Linha({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[130px_1fr] gap-3 py-1.5 text-sm">
      <dt className="text-ink/52">{label}</dt>
      <dd className="text-ink">{children}</dd>
    </div>
  );
}

export default async function AdminConfirmacoesPage({ searchParams }: { searchParams: Promise<{ criada?: string; editada?: string }> }) {
  const { criada, editada } = await searchParams;
  const confirmations = await listConfirmations();
  const logos = await Promise.all(confirmations.map((c) => (c.logo_path ? logoDownloadUrl(c.logo_path) : null)));
  const destaque = criada ?? editada;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-[26px] font-bold tracking-[-0.02em]">Confirmações de pedido</h1>
          <p className="mt-0.5 text-[13px] text-ink/52">Links enviados aos clientes que fecharam, com a resposta de cada um.</p>
        </div>
        <Link href="/admin/confirmacoes/nova" className={adminBtnAmber}>
          + Nova confirmação
        </Link>
      </div>

      {destaque ? (
        <p className="rounded-xl border border-wine/25 bg-wine-tint/50 px-4 py-3 text-sm text-wine">
          {criada ? "Confirmação criada. Copie o link abaixo e envie ao cliente." : "Alterações salvas. O link continua o mesmo."}
        </p>
      ) : null}

      {confirmations.length === 0 ? <p className={`${adminCard} text-sm text-ink/52`}>Nenhuma confirmação criada ainda.</p> : null}

      {confirmations.map((c, index) => {
        const pagamento = c.payment_options.find((option) => option.id === c.payment_choice);
        const doc = c.document ? (c.document.length === 11 ? formatarCPF(c.document) : formatarCNPJ(c.document)) : null;
        return (
          <article key={c.id} className={`${adminCard} flex flex-col gap-3 ${c.id === destaque ? "ring-2 ring-wine/40" : ""}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-[family-name:var(--font-display)] text-lg font-bold">{c.customer_label}</p>
                <p className="text-[13px] text-ink/52">
                  {c.items.map((item) => `${item.quantity}× ${item.name}`).join(" · ")} — {formatBRL(confirmationTotal(c.items))}
                </p>
              </div>
              <StatusPill tone={STATUS[c.status].tone}>{STATUS[c.status].label}</StatusPill>
            </div>

            {c.status === "pendente" ? <ConfirmationLinkBox id={c.id} url={confirmationUrl(c.token)} /> : null}

            {c.status === "respondido" ? (
              <dl className="divide-y divide-line border-t border-line pt-1.5">
                <Linha label="Respondido em">{c.responded_at ? new Date(c.responded_at).toLocaleString("pt-BR") : "—"}</Linha>
                <Linha label="Pagamento">{pagamento ? `${pagamento.label} — ${formatBRL(pagamento.amount)}` : c.payment_choice}</Linha>
                <Linha label="Nota fiscal">{c.wants_invoice ? "Sim" : "Não"}</Linha>
                <Linha label="Nome">{c.contact_name}</Linha>
                <Linha label="Telefone">{c.contact_phone}</Linha>
                <Linha label="E-mail">{c.contact_email}</Linha>
                {c.wants_invoice ? (
                  <>
                    <Linha label="CPF/CNPJ">{doc}</Linha>
                    <Linha label="Endereço">
                      {c.street}, {c.number}
                      {c.complement ? ` (${c.complement})` : ""} — {c.district}, {c.city}/{c.state} — CEP {c.cep}
                    </Linha>
                  </>
                ) : null}
                {c.customer_message ? <Linha label="Observações">{c.customer_message}</Linha> : null}
                <Linha label="Logo">
                  {logos[index] ? (
                    <a href={logos[index]!} className="font-semibold text-wine underline underline-offset-2">
                      Baixar arquivo
                    </a>
                  ) : (
                    "—"
                  )}
                </Linha>
              </dl>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
