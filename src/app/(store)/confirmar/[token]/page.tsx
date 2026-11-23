import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { artDisplayName, confirmationTotal, getConfirmationByToken } from "@/lib/confirmations";
import { MAX_ARTS } from "@/lib/validators/confirmacao";
import { AddArtsPanel } from "@/components/store/art-uploader";
import { formatBRL } from "@/lib/format";
import { storeCard, storeSectionTitle } from "@/components/store/ui-styles";
import { OrderConfirmationForm } from "@/components/store/order-confirmation-form";

// link pessoal do cliente: não deve aparecer em buscador
export const metadata: Metadata = { title: "Confirmação de pedido", robots: { index: false, follow: false } };

export default async function ConfirmarPedidoPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const confirmation = await getConfirmationByToken(token);
  if (!confirmation || confirmation.status === "cancelado") notFound();

  const total = confirmationTotal(confirmation.items);
  const respondido = confirmation.status === "respondido";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 sm:py-14">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-wine">Confirmação de pedido</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-[clamp(28px,4vw,38px)] font-bold leading-[1.08] tracking-[-0.025em]">
          Olá, {confirmation.customer_label}
        </h1>
        <p className="mt-2 text-[15px] text-ink/62">
          {respondido
            ? "Recebemos a confirmação do seu pedido. Obrigado!"
            : "Confira o que combinamos e complete os dados abaixo para darmos início ao seu pedido."}
        </p>
      </div>

      <section className={storeCard}>
        <h2 className={storeSectionTitle}>Resumo do pedido</h2>
        <ul className="mt-4 flex flex-col divide-y divide-ink/8">
          {confirmation.items.map((item, index) => (
            <li key={index} className="flex flex-col gap-3 py-3 first:pt-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              {item.image_url ? (
                <a
                  href={item.image_url}
                  target="_blank"
                  rel="noopener"
                  title="Ver foto ampliada"
                  className="relative block aspect-square w-44 shrink-0 overflow-hidden rounded-xl bg-paper sm:w-28"
                >
                  <Image src={item.image_url} alt={item.name} fill sizes="176px" className="object-cover" />
                </a>
              ) : null}
              <div className="flex-1">
                <p className="font-semibold text-ink">{item.name}</p>
                {item.description ? <p className="mt-0.5 text-sm text-ink/60">{item.description}</p> : null}
              </div>
              <div className="shrink-0 text-sm tabular-nums text-ink/70 sm:text-right">
                <p>
                  {item.quantity} × {formatBRL(item.unit_price)}
                </p>
                <p className="font-semibold text-ink">{formatBRL(item.quantity * item.unit_price)}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-center justify-between rounded-xl bg-wine px-5 py-4 text-white">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-white/85">Total</span>
          <span className="font-[family-name:var(--font-display)] text-2xl font-bold tabular-nums">{formatBRL(total)}</span>
        </div>
        {confirmation.notes ? <p className="mt-3 text-sm text-ink/60">{confirmation.notes}</p> : null}
      </section>

      {respondido ? (
        <>
          <section className={`${storeCard} text-center`}>
            <p className="font-[family-name:var(--font-display)] text-xl font-semibold">Dados recebidos</p>
            <p className="mt-1.5 text-sm text-ink/62">
              {confirmation.logo_paths.length
                ? `Já estamos com ${confirmation.logo_paths.length > 1 ? `${confirmation.logo_paths.length} artes` : "a arte"} e seus dados.`
                : "Já estamos com seus dados. Falta só a arte."}{" "}
              Se precisar mudar alguma informação, é só falar com a gente.
            </p>
          </section>
          <section className={`${storeCard} flex flex-col gap-3`}>
            <h2 className={storeSectionTitle}>{confirmation.logo_paths.length ? "Quer mandar outra arte?" : "Enviar a arte"}</h2>
            {confirmation.logo_paths.length ? (
              <ul className="flex flex-wrap gap-2">
                {confirmation.logo_paths.map((path) => (
                  <li key={path} className="rounded-lg bg-ok-bg px-2.5 py-1 text-xs font-medium text-ok">
                    ✓ {artDisplayName(path)}
                  </li>
                ))}
              </ul>
            ) : null}
            <AddArtsPanel token={confirmation.token} max={MAX_ARTS - confirmation.logo_paths.length} />
          </section>
        </>
      ) : (
        <OrderConfirmationForm
          token={confirmation.token}
          paymentOptions={confirmation.payment_options}
          total={total}
          defaults={{
            contactName: confirmation.contact_name,
            contactPhone: confirmation.contact_phone,
            contactEmail: confirmation.contact_email,
            document: confirmation.document,
            cep: confirmation.cep,
            street: confirmation.street,
            number: confirmation.number,
            complement: confirmation.complement,
            district: confirmation.district,
            city: confirmation.city,
            state: confirmation.state,
          }}
        />
      )}
    </div>
  );
}
