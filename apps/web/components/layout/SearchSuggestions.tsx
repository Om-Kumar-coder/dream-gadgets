'use client';

import { useState, useEffect, useRef } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

interface SearchSuggestionsProps {
  query: string;
  onSelect: (query: string) => void;
}

const STATIC_SUGGESTIONS = [
  { label: 'Apple iPhone 15', category: 'Popular' },
  { label: 'Samsung Galaxy S24', category: 'Popular' },
  { label: 'OnePlus 12', category: 'Popular' },
  { label: 'iPhone 13', category: 'Popular' },
  { label: 'Samsung Galaxy S23', category: 'Popular' },
  { label: 'Nothing Phone 2', category: 'Popular' },
  { label: 'Vivo V30', category: 'Popular' },
  { label: 'Realme 12 Pro', category: 'Popular' },
];

const BRAND_SUGGESTIONS = [
  { label: 'Apple', category: 'Brands' },
  { label: 'Samsung', category: 'Brands' },
  { label: 'OnePlus', category: 'Brands' },
  { label: 'Xiaomi', category: 'Brands' },
  { label: 'Realme', category: 'Brands' },
  { label: 'Vivo', category: 'Brands' },
  { label: 'Oppo', category: 'Brands' },
  { label: 'Google', category: 'Brands' },
];

export function SearchSuggestions({ query, onSelect }: SearchSuggestionsProps) {
  const [apiResults, setApiResults] = useState<Array<{ label: string; category: string }>>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced API search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.length < 2) {
      setApiResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/public/products?search=${encodeURIComponent(query)}&limit=5`);
        if (res.ok) {
          const json = await res.json();
          const items = json.data ?? [];
          setApiResults(
            items.slice(0, 5).map((item: any) => ({
              label: item.itemName || `${item.brand || ''} ${item.model || ''} ${item.storage || ''}`.trim(),
              category: item.brand || 'Product',
            }))
          );
        }
      } catch {
        // Silent fail — fall back to static suggestions
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const filteredStatic = STATIC_SUGGESTIONS.filter(s =>
    s.label.toLowerCase().includes(query.toLowerCase())
  );
  const filteredBrands = BRAND_SUGGESTIONS.filter(s =>
    s.label.toLowerCase().includes(query.toLowerCase())
  );

  const hasResults = apiResults.length > 0 || filteredStatic.length > 0 || filteredBrands.length > 0;

  if (!hasResults && !loading) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-surface-100 shadow-xl shadow-black/5 overflow-hidden animate-dropdown z-50">
      {loading && (
        <div className="p-4 text-center">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      )}

      {!loading && (
        <div className="p-2 max-h-80 overflow-y-auto">
          {/* API results first */}
          {apiResults.length > 0 && (
            <div>
              <p className="px-3 py-2 text-xs font-semibold text-surface-400 uppercase tracking-wider">Products</p>
              {apiResults.map((r, i) => (
                <button
                  key={`api-${i}`}
                  type="button"
                  onClick={() => onSelect(r.label)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors group"
                >
                  <svg className="w-4 h-4 text-surface-300 shrink-0 group-hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="flex-1 text-left">{r.label}</span>
                  <span className="text-[10px] text-surface-400">{r.category}</span>
                </button>
              ))}
            </div>
          )}

          {/* Static suggestions */}
          {filteredStatic.length > 0 && (
            <div>
              {apiResults.length > 0 && <div className="border-t border-surface-100 my-1" />}
              <p className="px-3 py-2 text-xs font-semibold text-surface-400 uppercase tracking-wider">Popular</p>
              {filteredStatic.slice(0, 5).map((s, i) => (
                <button
                  key={`static-${i}`}
                  type="button"
                  onClick={() => onSelect(s.label)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors group"
                >
                  <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  {s.label}
                </button>
              ))}
            </div>
          )}

          {/* Brand suggestions */}
          {filteredBrands.length > 0 && (
            <div>
              <div className="border-t border-surface-100 my-1" />
              <p className="px-3 py-2 text-xs font-semibold text-surface-400 uppercase tracking-wider">Brands</p>
              {filteredBrands.map((b, i) => (
                <button
                  key={`brand-${i}`}
                  type="button"
                  onClick={() => onSelect(b.label)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-surface-600 hover:bg-surface-50 hover:text-surface-900 transition-colors"
                >
                  <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  {b.label}
                </button>
              ))}
            </div>
          )}

          {/* View all result */}
          <div className="border-t border-surface-100 mt-1 pt-1">
            <button
              type="button"
              onClick={() => onSelect(query)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm text-primary font-medium hover:bg-primary/5 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search for &ldquo;{query}&rdquo;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
