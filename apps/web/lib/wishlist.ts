'use client';

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string | null;
  condition?: string;
  addedAt: number;
}

const KEY = 'dg_wishlist';
const EVENT = 'dg:wishlist';

function read(): WishlistItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as WishlistItem[]) : [];
  } catch {
    return [];
  }
}

function write(items: WishlistItem[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* storage full / private mode — ignore */
  }
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function getWishlist(): WishlistItem[] {
  return read();
}

export function isWished(id: string): boolean {
  return read().some(i => i.id === id);
}

export function toggleWishlist(item: Omit<WishlistItem, 'addedAt'>): boolean {
  const items = read();
  const existing = items.find(i => i.id === item.id);
  if (existing) {
    write(items.filter(i => i.id !== item.id));
    return false;
  }
  write([{ ...item, addedAt: Date.now() }, ...items]);
  return true;
}

export function removeFromWishlist(id: string) {
  write(read().filter(i => i.id !== id));
}

/** Subscribe to wishlist changes (returns an unsubscribe fn). */
export function onWishlistChange(cb: () => void): () => void {
  window.addEventListener(EVENT, cb);
  window.addEventListener('storage', cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener('storage', cb);
  };
}
