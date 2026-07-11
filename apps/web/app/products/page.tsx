import type { Metadata } from 'next';
import { ItemCondition } from '@dream-gadgets/shared-types';
import { ProductCard } from '../../components/product/ProductCard';
import { FilterSheetClient } from './FilterSheetClient';
import { SortSelect } from '../../components/product/SortSelect';
import { ShopBannerSlider, ShopBannerOffer } from '../../components/banner/ShopBanners';
import { JsonLd } from '../../components/seo/JsonLd';
import { BreadcrumbJsonLd } from '../../components/seo/BreadcrumbJsonLd';
import { webPageSchema } from '../../lib/seo/schemas';

export const metadata: Metadata = {
  title: 'Buy Certified Used Phones Online — Dream Gadgets',
  description: 'Browse our collection of certified refurbished smartphones at the best prices. Apple, Samsung, OnePlus, and more. 6-month warranty, free delivery, 7-day returns.',
  openGraph: {
    title: 'Buy Certified Used Phones Online — Dream Gadgets',
    description: 'Browse certified refurbished smartphones at the best prices. Apple, Samsung, OnePlus & more. Warranty included.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Buy Certified Used Phones Online — Dream Gadgets',
    description: 'Browse certified refurbished smartphones at the best prices with warranty.',
  },
};

interface Props {
  searchParams: Record<string, string>;
}

const BRANDS = ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Realme', 'Vivo', 'Oppo', 'Google'];

const CONDITIONS = [
  { value: ItemCondition.SEALED_PACK, label: 'Sealed Pack', short: 'Sealed' },
  { value: ItemCondition.OPEN_BOX, label: 'Open Box', short: 'Open Box' },
  { value: ItemCondition.SUPER_MINT, label: 'Super Mint', short: 'Super Mint' },
  { value: ItemCondition.MINT, label: 'Mint', short: 'Mint' },
  { value: ItemCondition.GOOD, label: 'Good', short: 'Good' },
];

const PRICE_RANGES = [
  { label: 'Under ₹10,000', min: '', max: '10000' },
  { label: '₹10,000 – ₹25,000', min: '10000', max: '25000' },
  { label: '₹25,000 – ₹50,000', min: '25000', max: '50000' },
  { label: '₹50,000 – ₹1,00,000', min: '50000', max: '100000' },
  { label: 'Above ₹1,00,000', min: '100000', max: '' },
];

async function getProducts(searchParams: Record<string, string>) {
  const params = new URLSearchParams({
    page: searchParams.page ?? '1',
    limit: '24',
    ...(searchParams.brand && { brand: searchParams.brand }),
    ...(searchParams.condition && { condition: searchParams.condition }),
    ...(searchParams.minPrice && { minPrice: searchParams.minPrice }),
    ...(searchParams.maxPrice && { maxPrice: searchParams.maxPrice }),
    ...(searchParams.sort && { sort: searchParams.sort }),
    ...(searchParams.search && { search: searchParams.search }),
  });
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1'}/public/products?${params}`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return { data: [], total: 0, meta: {} };
    const json = await res.json();
    return {
      data: json.data ?? json.items ?? [],
      total: json.meta?.total ?? json.total ?? 0,
      meta: json.meta ?? {},
    };
  } catch {
    return { data: [], total: 0, meta: {} };
  }
}

function FilterLink({ href, active, children, className }: { href: string; active: boolean; children: React.ReactNode; className?: string }) {
  return (
    <a
      href={href}
      className={`block text-sm px-3 py-2 rounded-lg transition-all duration-200 ${
        active
          ? 'bg-primary/10 text-primary font-semibold'
          : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
      } ${className || ''}`}
    >
      {children}
    </a>
  );
}

const PRODUCTS_JSONLD = webPageSchema(
  'Buy Certified Used Phones Online — Dream Gadgets',
  'Browse certified refurbished smartphones at the best prices. Apple, Samsung, OnePlus, and more. 6-month warranty, free delivery, 7-day returns.',
  [{ name: 'Home', url: '/' }, { name: 'All Phones', url: '/products' }],
);

export default async function ProductsPage({ searchParams }: Props) {
  const { data: products, total } = await getProducts(searchParams);
  const activeCondition = searchParams.condition;
  const activeBrand = searchParams.brand;
  const activeSort = searchParams.sort || 'popular';
  const activeSearch = searchParams.search || '';

  const pageTitle = activeSearch
    ? `Results for "${activeSearch}"`
    : activeBrand
    ? `${activeBrand} Phones`
    : activeCondition
    ? CONDITIONS.find(c => c.value === activeCondition)?.label ?? 'Phones'
    : 'All Products';

  const hasFilters = !!(activeBrand || activeCondition || activeSearch || searchParams.minPrice);

  return (
    <div className="min-h-screen bg-surface-50/50">
      <BreadcrumbJsonLd items={[
        { name: 'Home', url: '/' },
        { name: 'All Phones', url: '/products' },
      ]} />
      <JsonLd data={PRODUCTS_JSONLD} />
      {/* Shop Banner — Hero Slider at top */}
      <ShopBannerSlider />

      {/* Page header */}
      <div className="bg-white border-b border-surface-100/80">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-surface-900 tracking-tight">{pageTitle}</h1>
              <p className="text-sm text-surface-400 mt-1">
                {total} product{total !== 1 ? 's' : ''} available
                {activeSearch && <> for &ldquo;{activeSearch}&rdquo;</>}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
        {/* ── Sidebar (Desktop) ── */}
        <aside className="hidden md:block w-64 shrink-0">
          <div className="sticky top-28 space-y-6">
            {/* Search summary */}
            {activeSearch && (
              <div>
                <h3 className="text-[11px] font-bold text-surface-400 uppercase tracking-wider mb-3">Search</h3>
                <div className="flex items-center gap-2 px-3 py-2.5 bg-primary/5 rounded-xl border border-primary/10">
                  <svg className="w-3.5 h-3.5 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="text-xs text-primary font-medium truncate">{activeSearch}</span>
                  <a href="/products" className="ml-auto text-surface-300 hover:text-surface-500 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </a>
                </div>
              </div>
            )}

            {/* Brand filter */}
            <div>
              <h3 className="text-[11px] font-bold text-surface-400 uppercase tracking-wider mb-3">Brand</h3>
              <div className="space-y-0.5">
                <FilterLink href={activeSearch ? `/products?search=${encodeURIComponent(activeSearch)}` : '/products'} active={!activeBrand}>
                  All Brands
                </FilterLink>
                {BRANDS.map(b => (
                  <FilterLink
                    key={b}
                    href={`/products?brand=${b}${activeSearch ? `&search=${encodeURIComponent(activeSearch)}` : ''}`}
                    active={activeBrand === b}
                  >
                    {b}
                  </FilterLink>
                ))}
              </div>
            </div>

            {/* Condition filter */}
            <div>
              <h3 className="text-[11px] font-bold text-surface-400 uppercase tracking-wider mb-3">Condition</h3>
              <div className="space-y-0.5">
                <FilterLink
                  href={activeBrand ? `/products?brand=${activeBrand}` : '/products'}
                  active={!activeCondition}
                >
                  All Conditions
                </FilterLink>
                {CONDITIONS.map(c => {
                  const params = new URLSearchParams({ condition: c.value });
                  if (activeBrand) params.set('brand', activeBrand);
                  return (
                    <FilterLink
                      key={c.value}
                      href={`/products?${params}`}
                      active={activeCondition === c.value}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          c.value === ItemCondition.SEALED_PACK ? 'bg-violet-50 text-violet-600 border-violet-200' :
                          c.value === ItemCondition.OPEN_BOX ? 'bg-blue-50 text-blue-600 border-blue-200' :
                          c.value === ItemCondition.SUPER_MINT ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                          c.value === ItemCondition.MINT ? 'bg-teal-50 text-teal-600 border-teal-200' :
                          'bg-amber-50 text-amber-600 border-amber-200'
                        }`}>
                          {c.short}
                        </span>
                      </span>
                    </FilterLink>
                  );
                })}
              </div>
            </div>

            {/* Price range */}
            <div>
              <h3 className="text-[11px] font-bold text-surface-400 uppercase tracking-wider mb-3">Price Range</h3>
              <div className="space-y-0.5">
                {PRICE_RANGES.map(r => {
                  const params = new URLSearchParams(r);
                  if (activeBrand) params.set('brand', activeBrand);
                  if (activeCondition) params.set('condition', activeCondition);
                  const isActive = searchParams.minPrice === r.min && searchParams.maxPrice === r.max;
                  return (
                    <FilterLink key={r.label} href={`/products?${params}`} active={isActive}>
                      {r.label}
                    </FilterLink>
                  );
                })}
              </div>
            </div>

            {/* Clear all */}
            {hasFilters && (
              <a
                href="/products"
                className="flex items-center gap-2 px-3 py-2.5 text-sm text-primary font-semibold hover:bg-primary/5 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear All Filters
              </a>
            )}
          </div>
        </aside>

        {/* ── Main Content ── */}
        <div className="flex-1 min-w-0">
          {/* Mobile filter + Sort bar */}
          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide md:hidden flex-1">
              <FilterSheetClient
                brands={BRANDS}
                activeBrand={activeBrand}
                activeCondition={activeCondition}
                activeMinPrice={searchParams.minPrice}
                activeMaxPrice={searchParams.maxPrice}
              />
              {CONDITIONS.map(c => (
                <a
                  key={c.value}
                  href={`/products?condition=${c.value}${activeBrand ? `&brand=${activeBrand}` : ''}`}
                  className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium border transition-all ${
                    activeCondition === c.value
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-white text-surface-600 border-surface-200 hover:border-surface-300'
                  }`}
                >
                  {c.short}
                </a>
              ))}
            </div>
            <SortSelect defaultValue={activeSort} />
          </div>

          {/* Products grid */}
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-28 h-28 bg-surface-100 rounded-full flex items-center justify-center mb-5">
                <svg className="w-14 h-14 text-surface-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-lg font-bold text-surface-700">No products found</p>
              <p className="text-sm text-surface-400 mt-1.5 max-w-xs">
                {activeSearch
                  ? `We couldn't find any results for "${activeSearch}". Try a different search term.`
                  : 'Try adjusting your filters or browse all products.'}
              </p>
              <a href="/products" className="mt-6 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 active:scale-[0.97] transition-all shadow-md shadow-primary/25">
                Browse All Products
              </a>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
                {products.map((p: any) => {
                  const price = Number(p.price ?? p.onlinePrice ?? p.sellingPrice ?? 0);
                  const originalPrice = p.originalPrice ? Number(p.originalPrice) : undefined;
                  return (
                    <ProductCard
                      key={p.id}
                      id={p.id}
                      slug={p.id}
                      name={p.itemName ?? `${p.model ?? ''} ${p.storage ?? ''}`.trim()}
                      condition={p.condition}
                      price={price}
                      originalPrice={originalPrice}
                      imageUrl={p.images?.[0]}
                      storage={p.storage}
                      brand={p.brand}
                      rating={p.rating ?? 0}
                      reviewCount={p.reviewCount ?? 0}
                      inStock={p.inStock ?? true}
                      quickAdd
                    />
                  );
                })}
              </div>

              {/* Pagination */}
              {total > 24 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  <div className="inline-flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-surface-200 shadow-sm">
                    <span className="text-sm text-surface-500 font-medium">
                      Showing 1–{Math.min(24, total)} of {total}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Shop Banner — Offer at bottom */}
          <ShopBannerOffer />
        </div>
      </div>
    </div>
  );
}
