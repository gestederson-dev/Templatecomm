import { ConfirmationEditor } from "@/components/admin/confirmation-editor";
import { getConfirmationProductOptions } from "@/lib/confirmations";

export default async function NovaConfirmacaoPage() {
  const products = await getConfirmationProductOptions();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-[26px] font-bold tracking-[-0.02em]">Nova confirmação de pedido</h1>
        <p className="mt-0.5 text-[13px] text-ink/52">Monte o que o cliente fechou. Ao salvar, o link para enviar aparece na lista.</p>
      </div>
      <ConfirmationEditor products={products} />
    </div>
  );
}
