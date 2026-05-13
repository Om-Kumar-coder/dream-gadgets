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

export function ProductCard({ slug, name, condition, price, imageUrl, storage }: ProductCardProps) {
  return (
    <Link
      href={`/products/${slug}`}
      className="group flex flex-col rounded-2xl border border-gray-100 bg-white overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
    >
      <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        {imageUrl ? (
          <Image src={imageUrl} alt={name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-300">
            <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
        )}
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
