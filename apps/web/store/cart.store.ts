import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  imei: string;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
  slug: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
  itemCount: () => number;
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
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: (i.quantity || 1) + 1 } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        }),
      removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: quantity <= 0
            ? state.items.filter((i) => i.id !== id)
            : state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        })),
      clearCart: () => set({ items: [] }),
      total: () => get().items.reduce((sum, i) => sum + (Number(i.price) || 0) * (i.quantity || 1), 0),
      itemCount: () => get().items.reduce((sum, i) => sum + (i.quantity || 1), 0),
    }),
    {
      name: 'cart-storage',
      storage: safeStorage as any,
    },
  ),
);
