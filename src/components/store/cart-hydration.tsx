"use client";

import { useEffect, useRef } from "react";
import { useCartStore } from "@/stores/cart";
import { getServerCartItems, replaceServerCart } from "@/lib/cart-sync";

/** Roda uma vez por carregamento: se logado, funde carrinho local (localStorage) com o salvo no banco. */
export function CartHydration() {
  const ranOnce = useRef(false);

  useEffect(() => {
    if (ranOnce.current) return;
    ranOnce.current = true;

    (async () => {
      const serverItems = await getServerCartItems();
      const localItems = useCartStore.getState().items;

      if (serverItems.length > 0 && localItems.length === 0) {
        useCartStore.getState().replaceAll(serverItems);
      } else if (localItems.length > 0) {
        await replaceServerCart(localItems);
      }
    })();
  }, []);

  return null;
}
