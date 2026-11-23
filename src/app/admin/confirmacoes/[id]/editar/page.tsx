import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmationEditor } from "@/components/admin/confirmation-editor";
import { adminBtnSoft, adminCard } from "@/components/admin/ui-styles";
import { draftTotal, paymentConfigFromOptions } from "@/lib/confirmation-draft";
import { getConfirmationById, getConfirmationProductOptions } from "@/lib/confirmations";

export default async function EditarConfirmacaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [confirmation, products] = await Promise.all([getConfirmationById(id), getConfirmationProductOptions()]);
  if (!confirmation) notFound();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-[26px] font-bold tracking-[-0.02em]">Editar confirmação — {confirmation.customer_label}</h1>
        <p className="mt-0.5 text-[13px] text-ink/52">O link continua o mesmo: o cliente vê os valores novos ao abrir de novo.</p>
      </div>

      {confirmation.status === "pendente" ? (
        <ConfirmationEditor
          products={products}
          initial={{
            id: confirmation.id,
            customerLabel: confirmation.customer_label,
            items: confirmation.items,
            payment: paymentConfigFromOptions(draftTotal(confirmation.items), confirmation.payment_options),
            notes: confirmation.notes ?? "",
          }}
        />
      ) : (
        <div className={`${adminCard} flex flex-col items-start gap-3`}>
          <p className="text-sm text-ink/70">
            Esta confirmação está <strong>{confirmation.status}</strong> e não pode mais ser alterada. Para mudar valores, crie uma nova.
          </p>
          <Link href="/admin/confirmacoes" className={adminBtnSoft}>
            Voltar
          </Link>
        </div>
      )}
    </div>
  );
}
