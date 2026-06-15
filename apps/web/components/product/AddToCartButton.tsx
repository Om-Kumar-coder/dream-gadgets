'use client';
import { useState } from 'react';
import { useCartStore } from '../../store/cart.store';

interface Props {
  product: { id: string; imei: string; name: string; price: number; slug: string; imageUrl?: string };
}

export function AddToCartButton({ product }: Props) {
  const { items, addItem, removeItem, updateQuantity } = useCartStore();
  const [justAdded, setJustAdded] = useState(false);
  const cartItem = items.find(i => i.id === product.id);
  const qty = cartItem?.quantity ?? 0;

  function handleAdd() {
    addItem(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  }

  if (qty > 0) {
    return (
      <div className="flex-1 flex items-center gap-0 border-2 border-primary/20 rounded-xl overflow-hidden">
        <button
          onClick={() => qty > 1 ? updateQuantity(product.id, qty - 1) : removeItem(product.id)}
          className="w-11 h-11 flex items-center justify-center bg-surface-50 hover:bg-surface-100 active:bg-surface-200 transition-colors text-surface-600 font-bold text-lg"
        >
          −
        </button>
        <div className="flex-1 h-11 flex items-center justify-center bg-white font-semibold text-sm text-surface-900 border-x border-surface-100">
          {qty} in Cart
        </div>
        <button
          onClick={() => updateQuantity(product.id, qty + 1)}
          className="w-11 h-11 flex items-center justify-center bg-surface-50 hover:bg-surface-100 active:bg-surface-200 transition-colors text-surface-600 font-bold text-lg"
        >
          +
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleAdd}
      className={`flex-1 py-3 rounded-xl font-medium active:scale-[0.97] transition-all ${
        justAdded
          ? 'bg-emerald-500 text-white shadow-sm'
          : 'bg-primary text-primary-foreground hover:opacity-90 shadow-sm hover:shadow-md'
      }`}
    >
      {justAdded ? '✓ Added!' : 'Add to Cart'}
    </button>
  );
}
