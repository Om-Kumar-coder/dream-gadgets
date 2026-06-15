'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface RelatedProduct {
  id: string;
  brand: string;
  model: string;
  colour: string;
  storage: string;
  price: number;
  condition: string;
  thumbnail: string;
}

interface RelatedProductsProps {
  itemId: string;
}

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';
const FALLBACK = '/images/placeholders/no-image.svg';

function shuffleArray(arr: any[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function RelatedProducts({ itemId }: RelatedProductsProps) {
  const [products, setProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/public/products/related/${itemId}`)
      .then(res => res.json())
      .then(json => {
        const items = json.data ?? [];
        setProducts(shuffleArray(items));
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [itemId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="heading-sm text-surface-900">You May Also Like</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-surface-100 animate-pulse aspect-[3/4]" />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="heading-sm text-surface-900">You May Also Like</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {products.slice(0, 8).map((p) => {
          const name = `${p.brand} ${p.model} ${p.storage ?? ''}`.trim();
          return (
            <Link
              key={p.id}
              href={`/products/${p.id}`}
              className="group card overflow-hidden hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200"
            >
              <div className="relative aspect-square bg-surface-100">
                <Image
                  src={p.thumbnail || FALLBACK}
                  alt={name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 640px) 50vw, 25vw"
                  onError={(e) => { e.currentTarget.src = FALLBACK; }}
                />
              </div>
              <div className="p-3">
                <p className="text-xs text-surface-400">{p.brand}</p>
                <h3 className="text-sm font-semibold text-surface-900 line-clamp-1">{name}</h3>
                <p className="text-base font-extrabold text-surface-900 mt-1">
                  ₹{p.price.toLocaleString('en-IN')}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
