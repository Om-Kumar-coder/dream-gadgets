'use client';

import { useState, useEffect, useRef } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

interface SearchSuggestionsProps {
  query: string;
  onSelect: (query: string) => void;
}

// Suggestions come ONLY from the live catalog (API results below).
// Hardcoded fake model suggestions were removed: they advertised products
// that may not exist and would mislead customers searching an empty store.

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

  const hasResults = apiResults.length > 0;

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
