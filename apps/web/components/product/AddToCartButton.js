'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useCartStore } from '../../store/cart.store';
export function AddToCartButton({ product }) {
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
        return (_jsxs("div", { className: "flex-1 flex items-center gap-0 border-2 border-primary/20 rounded-xl overflow-hidden", children: [_jsx("button", { onClick: () => qty > 1 ? updateQuantity(product.id, qty - 1) : removeItem(product.id), className: "w-11 h-11 flex items-center justify-center bg-surface-50 hover:bg-surface-100 active:bg-surface-200 transition-colors text-surface-600 font-bold text-lg", children: "\u2212" }), _jsxs("div", { className: "flex-1 h-11 flex items-center justify-center bg-white font-semibold text-sm text-surface-900 border-x border-surface-100", children: [qty, " in Cart"] }), _jsx("button", { onClick: () => updateQuantity(product.id, qty + 1), className: "w-11 h-11 flex items-center justify-center bg-surface-50 hover:bg-surface-100 active:bg-surface-200 transition-colors text-surface-600 font-bold text-lg", children: "+" })] }));
    }
    return (_jsx("button", { onClick: handleAdd, className: `flex-1 py-3 rounded-xl font-medium active:scale-[0.97] transition-all ${justAdded
            ? 'bg-emerald-500 text-white shadow-sm'
            : 'bg-primary text-primary-foreground hover:opacity-90 shadow-sm hover:shadow-md'}`, children: justAdded ? '✓ Added!' : 'Add to Cart' }));
}
//# sourceMappingURL=AddToCartButton.js.map