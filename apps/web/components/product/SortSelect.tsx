'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const SORT_OPTIONS = [
  { value: 'popular', label: 'Popularity' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
  { value: 'discount', label: 'Biggest Discount' },
];

interface SortSelectProps {
  defaultValue: string;
}

export function SortSelect({ defaultValue }: SortSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    params.set('sort', e.target.value);
    router.push(`/products?${params}`);
  };

  return (
    <div className="flex items-center gap-2 ml-auto">
      <label htmlFor="sort-select" className="text-xs text-gray-400 hidden sm:block">
        Sort by:
      </label>
      <select
        id="sort-select"
        name="sort"
        className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
        defaultValue={defaultValue}
        onChange={handleChange}
      >
        {SORT_OPTIONS.map(s => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
    </div>
  );
}
