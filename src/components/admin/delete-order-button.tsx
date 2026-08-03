"use client";

import { deleteOrderAction } from "@/app/admin/pedidos/actions";

export function DeleteOrderButton({ orderId, orderNumber }: { orderId: string; orderNumber: string }) {
  return (
    <form
      action={deleteOrderAction}
      onSubmit={(event) => {
        if (!window.confirm(`Excluir o pedido ${orderNumber}? Essa ação não pode ser desfeita.`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={orderId} />
      <button
        type="submit"
        className="inline-flex items-center gap-2 rounded-[10px] border border-destructive/30 px-[18px] py-2.5 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10"
      >
        Excluir pedido
      </button>
    </form>
  );
}
