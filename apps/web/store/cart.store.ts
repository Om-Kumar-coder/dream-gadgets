import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  imei: string;
  name: string;
  price: number;
  imageUrl?: string;
  slug: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  total: () => number;
}

const isClient = typeof window !== 'undefined';

const safeStorage = {
  getItem: (name: string) => {
    if (!isClient) return null;
    const raw = window.localStorage.getItem(name);
    if (!raw) return null;
    try {
      JSON.parse(raw);
      return raw;
    } catch (error) {
      console.error('Cart parse error', error);
      window.localStorage.removeItem(name);
      return null;
    }
  },
  setItem: (name: string, value: string) => {
    if (!isClient) return;
    window.localStorage.setItem(name, value);
  },
  removeItem: (name: string) => {
    if (!isClient) return;
    window.localStorage.removeItem(name);
  },
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          if (state.items.find((i) => i.id === item.id)) return state;
          return { items: [...state.items, item] };
        }),
      removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      clearCart: () => set({ items: [] }),
      total: () => get().items.reduce((sum, i) => sum + (Number(i.price) || 0), 0),
    }),
    {
      name: 'cart-storage',
      storage: safeStorage as any,
    },
  ),
);
