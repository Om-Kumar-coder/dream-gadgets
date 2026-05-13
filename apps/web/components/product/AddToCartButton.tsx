'use client';
import { useCartStore } from '../../store/cart.store';

interface Props {
  product: { id: string; imei: string; name: string; price: number; slug: string; imageUrl?: string };
}

export function AddToCartButton({ product }: Props) {
  const { items, addItem, removeItem } = useCartStore();
  const inCart = items.some(i => i.id === product.id);

  return inCart ? (
    <button
      onClick={() => removeItem(product.id)}
      className="flex-1 py-3 bg-red-50 border-2 border-red-300 text-red-600 rounded-xl font-medium hover:bg-red-100"
    >
      Remove from Cart
    </button>
  ) : (
    <button
      onClick={() => addItem(product)}
      className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90"
    >
      Add to Cart
    </button>
  );
}
