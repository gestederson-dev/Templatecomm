"use client";

import { deleteFiadoCustomerAction } from "@/app/admin/fiado/actions";

export function DeleteFiadoCustomerButton({ customerId, customerName }: { customerId: string; customerName: string }) {
  return (
    <form
      action={deleteFiadoCustomerAction}
      onSubmit={(event) => {
        if (!window.confirm(`Excluir o fiado de ${customerName}? Isso apaga todo o histórico de cobranças e pagamentos. Essa ação não pode ser desfeita.`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={customerId} />
      <button
        type="submit"
        className="inline-flex items-center gap-2 rounded-[10px] border border-destructive/30 px-[18px] py-2.5 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10"
      >
        Excluir cliente
      </button>
    </form>
  );
}
