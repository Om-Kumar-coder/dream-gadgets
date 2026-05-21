'use client';
import Link from 'next/link';
import Image from 'next/image';
import { ConditionBadge } from './ConditionBadge';

interface ProductCardProps {
  id: string;
  slug: string;
  name: string;
  condition: string;
  price: number;
  imageUrl?: string;
  storage?: string;
}

const FALLBACK_IMAGE = 'https://via.placeholder.com/300x300?text=No+Image';

export function ProductCard({ slug, name, condition, price, imageUrl, storage }: ProductCardProps) {
  const src = imageUrl || FALLBACK_IMAGE;

  return (
    <Link
      href={`/products/${slug}`}
      className="group flex flex-col rounded-2xl border border-gray-100 bg-white overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
    >
      <div className="relative aspect-square bg-gray-200 overflow-hidden">
        <Image
          src={src}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
        />
        <div className="absolute top-2 left-2">
          <ConditionBadge condition={condition} />
        </div>
      </div>

      <div className="p-3 flex flex-col gap-1 flex-1">
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">{name}</h3>
        {storage && (
          <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full w-fit">{storage}</span>
        )}
        <div className="mt-auto pt-2 flex items-center justify-between">
          <p className="text-base font-extrabold text-gray-900">
            ₹{price.toLocaleString('en-IN')}
          </p>
          <span className="text-xs text-violet-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}
