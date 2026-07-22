import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  name: string;
  slug: string;
  unitPrice: number;
  quantity: number;
  imageUrl: string | null;
  customization?: Record<string, string> | null;
};

/** Chave estável pra identificar uma linha do carrinho — mesmo produto com
 * cor diferente é uma linha diferente, não soma quantidade junto. */
function lineKey(productId: string, customization?: Record<string, string> | null): string {
  if (!customization || Object.keys(customization).length === 0) return productId;
  const sorted = Object.keys(customization)
    .sort()
    .map((key) => `${key}=${customization[key]}`)
    .join("&");
  return `${productId}::${sorted}`;
}

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string, customization?: Record<string, string> | null) => void;
  setQuantity: (productId: string, quantity: number, customization?: Record<string, string> | null) => void;
  clear: () => void;
  replaceAll: (items: CartItem[]) => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (item, quantity = 1) =>
        set((state) => {
          const key = lineKey(item.productId, item.customization);
          const existing = state.items.find((i) => lineKey(i.productId, i.customization) === key);
          if (existing) {
            return {
              items: state.items.map((i) => (lineKey(i.productId, i.customization) === key ? { ...i, quantity: i.quantity + quantity } : i)),
            };
          }
          return { items: [...state.items, { ...item, quantity }] };
        }),

      removeItem: (productId, customization) => {
        const key = lineKey(productId, customization);
        set((state) => ({ items: state.items.filter((i) => lineKey(i.productId, i.customization) !== key) }));
      },

      setQuantity: (productId, quantity, customization) => {
        const key = lineKey(productId, customization);
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => lineKey(i.productId, i.customization) !== key)
              : state.items.map((i) => (lineKey(i.productId, i.customization) === key ? { ...i, quantity } : i)),
        }));
      },

      clear: () => set({ items: [] }),

      replaceAll: (items) => set({ items }),
    }),
    { name: "salmar-brindes-cart" },
  ),
);

export function cartItemKey(item: CartItem): string {
  return lineKey(item.productId, item.customization);
}

export function cartTotalItems(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function cartTotalPrice(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}
