'use client';
import { useState } from 'react';
import { useCartStore } from '../../store/cart.store';

interface Props {
  product: { id: string; imei: string; name: string; price: number; slug: string; imageUrl?: string };
}

export function AddToCartButton({ product }: Props) {
  const { items, addItem, removeItem } = useCartStore();
  const [justAdded, setJustAdded] = useState(false);
  const inCart = items.some(i => i.id === product.id);

  function handleAdd() {
    addItem(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  }

  function handleRemove() {
    removeItem(product.id);
  }

  if (inCart) {
    return (
      <button
        onClick={handleRemove}
        className="flex-1 py-3 bg-red-50 border-2 border-red-300 text-red-600 rounded-xl font-medium hover:bg-red-100 active:scale-95 transition-all"
      >
        Remove from Cart
      </button>
    );
  }

  return (
    <button
      onClick={handleAdd}
      className={`flex-1 py-3 rounded-xl font-medium active:scale-95 transition-all ${
        justAdded
          ? 'bg-emerald-500 text-white'
          : 'bg-primary text-primary-foreground hover:opacity-90'
      }`}
    >
      {justAdded ? '✓ Added!' : 'Add to Cart'}
    </button>
  );
}
