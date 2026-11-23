import Image from "next/image";
import { CopyValue } from "@/components/admin/confirmation-row-actions";
import { StatusPill, type PillTone } from "@/components/admin/status-pill";
import { confirmationTotal, type OrderConfirmation } from "@/lib/confirmations";
import { formatBRL, formatCEP, formatPhoneBR, whatsappLink } from "@/lib/format";
import { formatarCNPJ, formatarCPF } from "@/lib/validators/documento";

const STATUS: Record<OrderConfirmation["status"], { label: string; tone: PillTone }> = {
  pendente: { label: "Aguardando cliente", tone: "warn" },
  respondido: { label: "Respondido", tone: "ok" },
  cancelado: { label: "Cancelado", tone: "critical" },
};

const dataHora = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" }) : "—";

export type Logo = { download: string | null; preview: string | null };

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2 rounded-xl border border-line bg-paper p-4">
      <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-wine">{titulo}</h3>
      {children}
    </section>
  );
}

function Campo({ label, value, copy, children }: { label: string; value?: string | null; copy?: string | null; children?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="text-[11.5px] text-ink/50">{label}</p>
        <div className="break-words text-sm text-ink">{children ?? (value || "—")}</div>
      </div>
      {copy ? <CopyValue value={copy} label={`Copiar ${label.toLowerCase()}`} /> : null}
    </div>
  );
}

function Itens({ c }: { c: OrderConfirmation }) {
  return (
    <ul className="flex flex-col gap-2">
      {c.items.map((item, index) => (
        <li key={index} className="flex items-center gap-3">
          {item.image_url ? (
            <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-line bg-white">
              <Image src={item.image_url} alt={item.name} fill sizes="48px" className="object-cover" />
            </span>
          ) : null}
          <div className="min-w-0 text-sm">
            <p className="font-semibold text-ink">{item.name}</p>
            <p className="tabular-nums text-ink/60">
              {item.quantity} × {formatBRL(item.unit_price)} = {formatBRL(item.quantity * item.unit_price)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function Cabecalho({ c }: { c: OrderConfirmation }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="font-[family-name:var(--font-display)] text-lg font-bold">{c.customer_label}</p>
        <p className="text-[13px] text-ink/52">
          {c.items.map((item) => `${item.quantity}× ${item.name}`).join(" · ")} — <strong className="text-ink">{formatBRL(confirmationTotal(c.items))}</strong>
        </p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <StatusPill tone={STATUS[c.status].tone}>{STATUS[c.status].label}</StatusPill>
        <span className="text-[11.5px] text-ink/45">
          {c.status === "respondido" ? `Respondido em ${dataHora(c.responded_at)}` : `Criado em ${dataHora(c.created_at)}`}
        </span>
      </div>
    </div>
  );
}

export function FichaCliente({ c, logo }: { c: OrderConfirmation; logo: Logo }) {
  const pagamento = c.payment_options.find((option) => option.id === c.payment_choice);
  const doc = c.document ? (c.document.length === 11 ? formatarCPF(c.document) : formatarCNPJ(c.document)) : null;
  const endereco = c.street
    ? `${c.street}, ${c.number}${c.complement ? ` (${c.complement})` : ""} — ${c.district}, ${c.city}/${c.state} — CEP ${formatCEP(c.cep)}`
    : null;

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <Bloco titulo="Pedido">
        <Itens c={c} />
        <div className="mt-1 border-t border-line pt-2">
          <Campo label="Forma de pagamento">
            <span className="font-semibold">{pagamento?.label ?? c.payment_choice}</span>
            {pagamento ? <span className="block tabular-nums text-ink/70">{formatBRL(pagamento.amount)}</span> : null}
            {pagamento?.note ? <span className="block text-[12.5px] text-ink/55">{pagamento.note}</span> : null}
          </Campo>
        </div>
      </Bloco>

      <Bloco titulo="Contato">
        <Campo label="Nome" value={c.contact_name} copy={c.contact_name} />
        <Campo label="Telefone" copy={c.contact_phone}>
          {c.contact_phone ? (
            <a href={whatsappLink(c.contact_phone)} target="_blank" rel="noopener" className="font-semibold text-wine underline-offset-2 hover:underline">
              {formatPhoneBR(c.contact_phone)}
            </a>
          ) : (
            "—"
          )}
        </Campo>
        <Campo label="E-mail" copy={c.contact_email}>
          {c.contact_email ? (
            <a href={`mailto:${c.contact_email}`} className="text-wine underline-offset-2 hover:underline">
              {c.contact_email}
            </a>
          ) : (
            "—"
          )}
        </Campo>
      </Bloco>

      <Bloco titulo="Nota fiscal">
        <Campo label="Emitir nota fiscal" value={c.wants_invoice ? "Sim" : "Não"} />
        {c.wants_invoice ? (
          <>
            <Campo label={c.document?.length === 11 ? "CPF" : "CNPJ"} value={doc} copy={doc} />
            <Campo label="Endereço" copy={endereco}>
              {c.street ? (
                <>
                  {c.street}, {c.number}
                  {c.complement ? ` (${c.complement})` : ""}
                  <br />
                  {c.district} — {c.city}/{c.state}
                  <br />
                  CEP {formatCEP(c.cep)}
                </>
              ) : (
                "—"
              )}
            </Campo>
          </>
        ) : null}
      </Bloco>

      <Bloco titulo="Arte e observações">
        {c.logo_path ? (
          <div className="flex items-center gap-3">
            {logo.preview ? (
              // eslint-disable-next-line @next/next/no-img-element -- link assinado e temporário do bucket privado
              <img
                src={logo.preview}
                alt="Logo enviada pelo cliente"
                className="h-16 w-16 shrink-0 rounded-lg border border-line bg-white object-contain p-1"
              />
            ) : (
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-lg border border-line bg-white text-[11px] font-semibold uppercase text-ink/45">
                {c.logo_path.split(".").pop()}
              </span>
            )}
            {logo.download ? (
              <a href={logo.download} className="text-sm font-semibold text-wine underline underline-offset-2">
                Baixar logo
              </a>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-ink/50">Nenhuma logo enviada.</p>
        )}
        <Campo label="Observações do cliente" value={c.customer_message} />
      </Bloco>
    </div>
  );
}

export function Secao({ titulo, total, children }: { titulo: string; total: number; children: React.ReactNode }) {
  if (total === 0) return null;
  return (
    <section className="flex flex-col gap-3">
      <h2 className="flex items-center gap-2 font-[family-name:var(--font-display)] text-[15px] font-semibold">
        {titulo}
        <span className="rounded-full bg-ink/6 px-2 py-0.5 text-xs font-semibold text-ink/60">{total}</span>
      </h2>
      {children}
    </section>
  );
}
