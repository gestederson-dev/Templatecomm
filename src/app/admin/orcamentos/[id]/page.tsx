import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusPill, type PillTone } from "@/components/admin/status-pill";
import { QuoteDetail } from "@/components/admin/quote-detail";
import { adminCard } from "@/components/admin/ui-styles";
import { getAdminQuoteById } from "@/lib/admin/quotes";
import { formatarCNPJ, formatarCPF } from "@/lib/validators/documento";
import type { QuoteStatus } from "@/lib/types";

const STATUS_LABEL: Record<QuoteStatus, string> = {
  requested: "Solicitado",
  quoted: "Cotado",
  approved: "Aprovado",
  rejected: "Rejeitado",
  expired: "Expirado",
  converted: "Convertido",
};

const STATUS_TONE: Record<QuoteStatus, PillTone> = {
  requested: "warn",
  quoted: "info",
  approved: "ok",
  rejected: "critical",
  expired: "critical",
  converted: "wine",
};

const STATUS_SUB: Record<QuoteStatus, string> = {
  requested: "aguardando cotação",
  quoted: "aguardando resposta do cliente",
  approved: "aprovado pelo cliente",
  rejected: "recusado",
  expired: "expirado",
  converted: "convertido em pedido",
};

export default async function AdminOrcamentoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quote = await getAdminQuoteById(id);

  if (!quote) notFound();

  const clientName = quote.profile?.company_name || quote.profile?.full_name || "Cliente";
  const document = quote.profile?.person_type === "pj" ? formatarCNPJ(quote.profile.cnpj ?? "") : formatarCPF(quote.profile?.cpf ?? "");

  const clientInfo = (
    <div className={`${adminCard} mb-[18px]`}>
      <h3 className="mb-4 font-[family-name:var(--font-display)] text-[15px] font-semibold">Cliente</h3>
      <dl className="flex flex-col text-[13.5px]">
        <div className="flex items-center justify-between border-b border-line py-2.5">
          <dt className="text-ink/52">{quote.profile?.person_type === "pj" ? "Empresa" : "Nome"}</dt>
          <dd className="font-semibold">{clientName}</dd>
        </div>
        <div className="flex items-center justify-between border-b border-line py-2.5">
          <dt className="text-ink/52">{quote.profile?.person_type === "pj" ? "CNPJ" : "CPF"}</dt>
          <dd className="font-semibold">{document || "—"}</dd>
        </div>
        <div className="flex items-center justify-between border-b border-line py-2.5">
          <dt className="text-ink/52">E-mail</dt>
          <dd className="font-semibold">{quote.customerEmail ?? "—"}</dd>
        </div>
        <div className="flex items-center justify-between py-2.5">
          <dt className="text-ink/52">Telefone</dt>
          <dd className="font-semibold">{quote.profile?.phone ?? "—"}</dd>
        </div>
      </dl>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="mb-1 text-[13px] text-ink/52">
          <Link href="/admin/orcamentos" className="font-semibold text-wine">
            Orçamentos
          </Link>{" "}
          › {quote.quote_number}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-[family-name:var(--font-display)] text-[26px] font-bold tracking-[-0.02em]">{quote.quote_number}</h1>
          <StatusPill tone={STATUS_TONE[quote.status]}>{STATUS_LABEL[quote.status]}</StatusPill>
        </div>
        <p className="mt-0.5 text-[13px] text-ink/52">
          Recebido {new Date(quote.created_at).toLocaleDateString("pt-BR")} · {STATUS_SUB[quote.status]}
        </p>
      </div>

      {quote.customer_message ? (
        <div className={adminCard}>
          <h3 className="mb-3 font-[family-name:var(--font-display)] text-[15px] font-semibold">Mensagem do cliente</h3>
          <div className="rounded-xl bg-wine-tint p-4 text-[13.5px] leading-relaxed text-ink">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-wine">{clientName}</p>
            {quote.customer_message}
          </div>
        </div>
      ) : null}

      <QuoteDetail
        quoteId={quote.id}
        status={quote.status}
        items={quote.items}
        adminResponse={quote.admin_response}
        validUntil={quote.valid_until}
        createdAt={quote.created_at}
        clientInfo={clientInfo}
      />
    </div>
  );
}
