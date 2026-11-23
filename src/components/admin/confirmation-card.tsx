import Image from "next/image";
import Link from "next/link";
import { ConfirmationLinkActions, CopyLinkIcon, CopyValue, RegisterOrderButton } from "@/components/admin/confirmation-row-actions";
import { StatusPill, type PillTone } from "@/components/admin/status-pill";
import { confirmationTotal, confirmationUrl, type ArtFile, type ConfirmationWithLinks, type OrderConfirmation } from "@/lib/confirmations";
import { formatBRL, formatCEP, formatPhoneBR, whatsappLink } from "@/lib/format";
import { formatarCNPJ, formatarCPF } from "@/lib/validators/documento";

const STATUS: Record<OrderConfirmation["status"], { label: string; tone: PillTone }> = {
  pendente: { label: "Aguardando", tone: "warn" },
  respondido: { label: "Respondido", tone: "ok" },
  cancelado: { label: "Cancelado", tone: "critical" },
};

const dataCurta = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—";

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2 rounded-xl border border-line bg-paper p-3.5">
      <h3 className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-wine">{titulo}</h3>
      {children}
    </section>
  );
}

function Campo({ label, value, copy, children }: { label: string; value?: string | null; copy?: string | null; children?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="text-[11px] text-ink/50">{label}</p>
        <div className="break-words text-[13.5px] text-ink">{children ?? (value || "—")}</div>
      </div>
      {copy ? <CopyValue value={copy} label={`Copiar ${label.toLowerCase()}`} /> : null}
    </div>
  );
}

/** De onde a confirmação veio: compra no site, pedido do painel ou orçamento. */
function Origem({ c }: { c: ConfirmationWithLinks }) {
  const chip = "rounded-md bg-ink/6 px-1.5 py-0.5 text-[11px] font-semibold text-ink/60 hover:bg-wine-tint hover:text-wine";
  return (
    <>
      {c.order ? (
        <Link href={`/admin/pedidos/${c.order.id}`} className={chip}>
          {c.payment_options.length === 0 ? "Site · " : ""}
          {c.order.order_number ?? "Pedido"}
        </Link>
      ) : null}
      {c.quote ? (
        <Link href={`/admin/orcamentos/${c.quote.id}`} className={chip}>
          {c.quote.quote_number ?? "Orçamento"}
        </Link>
      ) : null}
    </>
  );
}

function Artes({ c, arts }: { c: OrderConfirmation; arts: ArtFile[] }) {
  if (arts.length === 0) {
    return <p className="text-[13px] text-ink/55">{c.art_later ? "Cliente vai enviar depois pelo mesmo link." : "Nenhuma arte enviada."}</p>;
  }
  return (
    <ul className="flex flex-col gap-2">
      {arts.map((art) => (
        <li key={art.path} className="flex items-center gap-2.5">
          {art.preview ? (
            // eslint-disable-next-line @next/next/no-img-element -- link assinado e temporário do bucket privado
            <img src={art.preview} alt="" className="h-11 w-11 shrink-0 rounded-lg border border-line bg-white object-contain p-0.5" />
          ) : (
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-line bg-white text-[10px] font-bold uppercase text-ink/45">
              {art.ext}
            </span>
          )}
          <span className="min-w-0 flex-1 truncate text-[13px] text-ink">{art.name}</span>
          {art.download ? (
            <a href={art.download} className="shrink-0 rounded-md px-2 py-1 text-[12.5px] font-semibold text-wine hover:bg-wine-tint">
              Baixar
            </a>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export function FichaCliente({ c, arts }: { c: OrderConfirmation; arts: ArtFile[] }) {
  const pagamento = c.payment_options.find((option) => option.id === c.payment_choice);
  const doc = c.document ? (c.document.length === 11 ? formatarCPF(c.document) : formatarCNPJ(c.document)) : null;
  const endereco = c.street
    ? `${c.street}, ${c.number}${c.complement ? ` (${c.complement})` : ""} — ${c.district}, ${c.city}/${c.state} — CEP ${formatCEP(c.cep)}`
    : null;

  return (
    <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
      <Bloco titulo="Pedido">
        <ul className="flex flex-col gap-1.5">
          {c.items.map((item, index) => (
            <li key={index} className="text-[13px]">
              <span className="font-semibold text-ink">{item.name}</span>
              <span className="block tabular-nums text-ink/60">
                {item.quantity} × {formatBRL(item.unit_price)} = {formatBRL(item.quantity * item.unit_price)}
              </span>
            </li>
          ))}
        </ul>
        <div className="border-t border-line pt-2">
          <Campo label="Pagamento">
            {pagamento ? (
              <>
                <span className="font-semibold">{pagamento.label}</span> · <span className="tabular-nums">{formatBRL(pagamento.amount)}</span>
                {pagamento.note ? <span className="block text-[12px] text-ink/55">{pagamento.note}</span> : null}
              </>
            ) : (
              "Pago pelo site"
            )}
          </Campo>
        </div>
      </Bloco>

      <Bloco titulo="Contato">
        <Campo label="Nome" value={c.contact_name} copy={c.contact_name} />
        <Campo label="Telefone" copy={c.contact_phone}>
          {c.contact_phone ? (
            <a href={whatsappLink(c.contact_phone)} target="_blank" rel="noopener" className="font-semibold text-wine hover:underline">
              {formatPhoneBR(c.contact_phone)}
            </a>
          ) : (
            "—"
          )}
        </Campo>
        <Campo label="E-mail" copy={c.contact_email}>
          {c.contact_email ? (
            <a href={`mailto:${c.contact_email}`} className="break-all text-wine hover:underline">
              {c.contact_email}
            </a>
          ) : (
            "—"
          )}
        </Campo>
      </Bloco>

      <Bloco titulo={c.wants_invoice ? "Nota fiscal · emitir" : "Nota fiscal · não precisa"}>
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
        ) : (
          <p className="text-[13px] text-ink/55">Cliente não pediu nota.</p>
        )}
      </Bloco>

      <Bloco titulo={`Artes${arts.length ? ` · ${arts.length}` : ""}`}>
        <Artes c={c} arts={arts} />
        {c.customer_message ? <Campo label="Observações do cliente" value={c.customer_message} /> : null}
      </Bloco>
    </div>
  );
}

/**
 * Uma linha por confirmação: fechada mostra só o essencial (cliente, produto, total,
 * situação e copiar link); aberta mostra o link completo ou a ficha do cliente.
 */
export function ConfirmationRow({ c, arts, open = false }: { c: ConfirmationWithLinks; arts: ArtFile[]; open?: boolean }) {
  const thumb = c.items.find((item) => item.image_url)?.image_url;
  const semArte = c.status === "respondido" && c.logo_paths.length === 0;
  const resumo = c.items.length === 1 ? `${c.items[0].quantity}× ${c.items[0].name}` : `${c.items.length} produtos`;

  return (
    <details open={open} className="group overflow-hidden rounded-2xl border border-line bg-white shadow-[var(--shadow-panel)] open:ring-1 open:ring-wine/20">
      <summary className="flex cursor-pointer list-none items-center gap-3 px-3.5 py-3 sm:px-4 [&::-webkit-details-marker]:hidden">
        <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-line bg-paper">
          {thumb ? <Image src={thumb} alt="" fill sizes="44px" className="object-cover" /> : null}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="truncate font-[family-name:var(--font-display)] text-[15px] font-bold text-ink">{c.customer_label}</span>
            <Origem c={c} />
            {semArte ? <span className="rounded-md bg-warn-bg px-1.5 py-0.5 text-[11px] font-semibold text-warn">Falta arte</span> : null}
          </span>
          <span className="block truncate text-[12.5px] text-ink/55">
            <strong className="font-semibold text-ink/80">{formatBRL(confirmationTotal(c.items))}</strong> · {resumo}
            <span className="hidden sm:inline">
              {" "}
              · {c.status === "respondido" ? `respondido ${dataCurta(c.responded_at)}` : `criado ${dataCurta(c.created_at)}`}
            </span>
          </span>
        </span>
        <span className="hidden shrink-0 sm:block">
          <StatusPill tone={STATUS[c.status].tone}>{STATUS[c.status].label}</StatusPill>
        </span>
        <span
          className={`h-2.5 w-2.5 shrink-0 rounded-full sm:hidden ${c.status === "pendente" ? "bg-warn" : c.status === "respondido" ? "bg-ok" : "bg-destructive"}`}
        />
        {c.status === "pendente" ? <CopyLinkIcon url={confirmationUrl(c.token)} /> : null}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="h-4 w-4 shrink-0 text-ink/40 transition-transform group-open:rotate-180"
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </summary>

      <div className="flex flex-col gap-3 border-t border-line px-3.5 py-3.5 sm:px-4">
        {c.status === "pendente" ? <ConfirmationLinkActions id={c.id} url={confirmationUrl(c.token)} customer={c.customer_label} highlight={open} /> : null}
        {c.status === "respondido" ? (
          <>
            <FichaCliente c={c} arts={arts} />
            <div className="flex flex-wrap items-center justify-end gap-2">
              <a href={confirmationUrl(c.token)} target="_blank" rel="noopener" className="mr-auto text-[12.5px] font-semibold text-ink/55 hover:text-wine">
                Ver página do cliente ↗
              </a>
              {c.order ? (
                <Link href={`/admin/pedidos/${c.order.id}`} className="text-[13px] font-semibold text-wine hover:underline">
                  Abrir pedido {c.order.order_number} →
                </Link>
              ) : (
                <RegisterOrderButton id={c.id} />
              )}
            </div>
          </>
        ) : null}
        {c.status === "cancelado" ? <p className="text-sm text-ink/55">Cancelada: o link não funciona mais.</p> : null}
      </div>
    </details>
  );
}

/**
 * Bloco nas telas de pedido e de orçamento: mostra a confirmação ligada (link ou ficha)
 * ou o botão para gerar uma, já preenchida com os itens.
 */
export function LinkedConfirmationPanel({
  confirmation,
  arts,
  createHref,
  emptyText,
}: {
  confirmation: OrderConfirmation | null;
  arts: ArtFile[];
  createHref: string | null;
  emptyText: string;
}) {
  if (!confirmation) {
    if (!createHref) return null;
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-wine/30 bg-wine-tint/25 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-[family-name:var(--font-display)] text-[15px] font-semibold">Confirmação do cliente</p>
          <p className="text-[13px] text-ink/60">{emptyText}</p>
        </div>
        <Link
          href={createHref}
          className="inline-flex shrink-0 items-center justify-center rounded-[10px] bg-wine px-[18px] py-2.5 text-sm font-semibold text-white hover:-translate-y-px"
        >
          Gerar confirmação
        </Link>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      <p className="font-[family-name:var(--font-display)] text-[15px] font-semibold">Confirmação do cliente</p>
      <ConfirmationRow c={{ ...confirmation, order: null, quote: null }} arts={arts} open={confirmation.status !== "cancelado"} />
    </div>
  );
}
