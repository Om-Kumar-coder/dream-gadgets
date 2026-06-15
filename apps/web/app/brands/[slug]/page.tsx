import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductCard } from '../../../components/product/ProductCard';
import { SortSelect } from '../../../components/product/SortSelect';
import { findBrand, BRANDS } from '../../../lib/brands';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

interface Props {
  params: { slug: string };
  searchParams: Record<string, string>;
}

const CONDITIONS = [
  { value: 'SEALED_PACK', label: 'Sealed Pack', short: 'Sealed' },
  { value: 'OPEN_BOX', label: 'Open Box', short: 'Open Box' },
  { value: 'SUPER_MINT', label: 'Super Mint', short: 'Super Mint' },
  { value: 'MINT', label: 'Mint', short: 'Mint' },
  { value: 'GOOD', label: 'Good', short: 'Good' },
];

const PRICE_RANGES = [
  { label: 'Under ₹10,000', min: '', max: '10000' },
  { label: '₹10,000 – ₹25,000', min: '10000', max: '25000' },
  { label: '₹25,000 – ₹50,000', min: '25000', max: '50000' },
  { label: '₹50,000 – ₹1,00,000', min: '50000', max: '100000' },
  { label: 'Above ₹1,00,000', min: '100000', max: '' },
];

async function getProducts(brand: string, searchParams: Record<string, string>) {
  const params = new URLSearchParams({
    page: searchParams.page ?? '1',
    limit: '24',
    brand,
    ...(searchParams.condition && { condition: searchParams.condition }),
    ...(searchParams.minPrice && { minPrice: searchParams.minPrice }),
    ...(searchParams.maxPrice && { maxPrice: searchParams.maxPrice }),
    ...(searchParams.sort && { sort: searchParams.sort }),
  });
  try {
    const res = await fetch(`${API}/public/products?${params}`, {
      next: { revalidate: 60 },
    });
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const brand = findBrand(params.slug);
  if (!brand) return { title: 'Brand Not Found' };
  return {
    title: `${brand.name} Phones — Dream Gadgets`,
    description: `Shop certified pre-owned ${brand.name} phones at the best prices. Quality checked with warranty.`,
  };
}

function FilterLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className={`block text-sm px-3 py-2 rounded-lg transition-all duration-200 ${
        active
          ? 'bg-primary/10 text-primary font-semibold'
          : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
      }`}
    >
      {children}
    </a>
  );
}

export default async function BrandPage({ params: { slug }, searchParams }: Props) {
  const brand = findBrand(slug);
  if (!brand) notFound();

  const { data: products, total } = await getProducts(brand.name, searchParams);
  const activeCondition = searchParams.condition;
  const activeSort = searchParams.sort || 'popular';
  const hasFilters = !!(activeCondition || searchParams.minPrice);
  const currentPage = Number(searchParams.page ?? '1');
  const limit = 24;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-surface-50/50">
      {/* ── Brand Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-surface-950 via-surface-900 to-primary/20 min-h-[300px] md:min-h-[400px] flex items-center">
        {/* Giant brand watermark background */}
        <div className="absolute inset-0 flex items-center justify-end pointer-events-none select-none">
          <div className="relative w-[400px] h-[400px] md:w-[500px] md:h-[500px] lg:w-[600px] lg:h-[600px] -mr-20 md:-mr-32 opacity-[0.06] md:opacity-[0.08]">
            <img
              src={brand.image}
              alt=""
              className="w-full h-full object-contain"
              aria-hidden="true"
            />
          </div>
        </div>
        {/* Gradient fade on the right edge */}
        <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-surface-950/80 via-surface-950/40 to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-surface-950/60 to-transparent pointer-events-none" />

        {/* Ambient glow effects */}
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-12 md:py-16">
          <div className="flex items-center gap-6 md:gap-10">
            {/* Brand Logo */}
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center p-4 shrink-0 shadow-xl ring-1 ring-white/5">
              <img
                src={brand.image}
                alt={brand.name}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Brand Info */}
            <div className="flex-1 min-w-0">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-xs text-white/40 mb-3">
                <Link href="/" className="hover:text-white/70 transition-colors font-medium">Home</Link>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-white/70 font-medium">{brand.name}</span>
              </nav>

              <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
                {brand.name} Phones
              </h1>
              <p className="text-white/50 text-sm md:text-base mt-2 max-w-xl">
                {total} certified pre-owned {brand.name} smartphone{total !== 1 ? 's' : ''} available. Quality checked with warranty.
              </p>

              {/* Quick action links */}
              <div className="flex flex-wrap gap-2 mt-4">
                <Link
                  href="/products"
                  className="text-xs px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white/70 border border-white/10 hover:bg-white/20 hover:text-white transition-all"
                >
                  All Brands
                </Link>
                <Link
                  href="/sell"
                  className="text-xs px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white/70 border border-white/10 hover:bg-white/20 hover:text-white transition-all"
                >
                  Sell {brand.name}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Brand Carousel Strip ── */}
      <div className="bg-white border-b border-surface-100/80 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide snap-x snap-mandatory -mx-4 px-4 py-2.5">
            {BRANDS.map(b => {
              const isActive = b.name.toLowerCase() === slug.toLowerCase();
              return (
                <a
                  key={b.name}
                  href={isActive ? '#' : `/brands/${b.name.toLowerCase()}`}
                  className={`snap-start shrink-0 flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-white shadow-sm shadow-primary/20 ring-1 ring-primary/30'
                      : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900 active:scale-[0.97]'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center p-1 ${
                    isActive ? 'bg-white/20' : 'bg-surface-100'
                  }`}>
                    <img
                      src={b.image}
                      alt={b.name}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  </div>
                  <span className="whitespace-nowrap">{b.name}</span>
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
        {/* ── Sidebar (Desktop) ── */}
        <aside className="hidden md:block w-64 shrink-0">
          <div className="sticky top-28 space-y-6">
            {/* Brand info card */}
            <div className="p-4 bg-white rounded-2xl border border-surface-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-100 flex items-center justify-center p-1.5">
                  <img src={brand.image} alt={brand.name} className="w-full h-full object-contain" />
                </div>
                <div>
                  <p className="text-sm font-bold text-surface-900">{brand.name}</p>
                  <p className="text-xs text-surface-400">{total} product{total !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>

            {/* Condition filter */}
            <div>
              <h3 className="text-[11px] font-bold text-surface-400 uppercase tracking-wider mb-3">Condition</h3>
              <div className="space-y-0.5">
                <FilterLink href={`/brands/${slug}`} active={!activeCondition}>
                  All Conditions
                </FilterLink>
                {CONDITIONS.map(c => {
                  const url = activeCondition === c.value
                    ? `/brands/${slug}`
                    : `/brands/${slug}?condition=${c.value}${searchParams.sort ? `&sort=${searchParams.sort}` : ''}`;
                  return (
                    <FilterLink key={c.value} href={url} active={activeCondition === c.value}>
                      <span className="flex items-center gap-2">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          c.value === 'SEALED_PACK' ? 'bg-violet-50 text-violet-600 border-violet-200' :
                          c.value === 'OPEN_BOX' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                          c.value === 'SUPER_MINT' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                          c.value === 'MINT' ? 'bg-teal-50 text-teal-600 border-teal-200' :
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
                  const isActive = searchParams.minPrice === r.min && searchParams.maxPrice === r.max;
                  const qp = new URLSearchParams(r);
                  if (activeCondition) qp.set('condition', activeCondition);
                  if (searchParams.sort) qp.set('sort', searchParams.sort);
                  const href = `/brands/${slug}?${qp}`;
                  return (
                    <FilterLink key={r.label} href={href} active={isActive}>
                      {r.label}
                    </FilterLink>
                  );
                })}
              </div>
            </div>

            {/* Clear all */}
            {hasFilters && (
              <a
                href={`/brands/${slug}`}
                className="flex items-center gap-2 px-3 py-2.5 text-sm text-primary font-semibold hover:bg-primary/5 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear All Filters
              </a>
            )}

            {/* Other brands */}
            <div>
              <h3 className="text-[11px] font-bold text-surface-400 uppercase tracking-wider mb-3">Other Brands</h3>
              <div className="space-y-0.5">
                {BRANDS.filter(b => b.name !== brand.name).slice(0, 8).map(b => (
                  <a
                    key={b.name}
                    href={`/brands/${b.name.toLowerCase()}`}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-surface-600 hover:bg-surface-100 hover:text-surface-900 transition-all"
                  >
                    <div className="w-6 h-6 rounded bg-surface-100 p-0.5 flex items-center justify-center">
                      <img src={b.image} alt={b.name} className="w-full h-full object-contain" />
                    </div>
                    <span>{b.name}</span>
                  </a>
                ))}
              </div>
              <a
                href="/products"
                className="block mt-2 text-xs text-primary font-semibold px-3 py-1.5 hover:bg-primary/5 rounded-lg transition-colors"
              >
                View All Brands →
              </a>
            </div>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <div className="flex-1 min-w-0">
          {/* Mobile filter + Sort bar */}
          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide md:hidden flex-1">
              {CONDITIONS.map(c => (
                <a
                  key={c.value}
                  href={
                    activeCondition === c.value
                      ? `/brands/${slug}`
                      : `/brands/${slug}?condition=${c.value}`
                  }
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
            <SortSelect defaultValue={activeSort} basePath={`/brands/${slug}`} />
          </div>

          {/* Products grid */}
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-28 h-28 bg-surface-100 rounded-full flex items-center justify-center mb-5">
                <div className="w-16 h-16 rounded-full bg-surface-200 flex items-center justify-center">
                  <img src={brand.image} alt={brand.name} className="w-10 h-10 object-contain opacity-40" />
                </div>
              </div>
              <p className="text-lg font-bold text-surface-700">No {brand.name} phones found</p>
              <p className="text-sm text-surface-400 mt-1.5 max-w-xs">
                Try adjusting your filters or browse other brands.
              </p>
              <div className="flex gap-3 mt-6">
                <a
                  href={`/brands/${slug}`}
                  className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 active:scale-[0.97] transition-all shadow-md shadow-primary/25"
                >
                  Clear Filters
                </a>
                <a
                  href="/products"
                  className="px-6 py-2.5 bg-white text-surface-700 rounded-xl text-sm font-bold border border-surface-200 hover:bg-surface-50 active:scale-[0.97] transition-all"
                >
                  Browse All Brands
                </a>
              </div>
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
              {totalPages > 1 && (() => {
                const buildPageUrl = (page: number) => {
                  const qp = new URLSearchParams();
                  if (page > 1) qp.set('page', String(page));
                  if (searchParams.condition) qp.set('condition', searchParams.condition);
                  if (searchParams.sort) qp.set('sort', searchParams.sort);
                  if (searchParams.minPrice) qp.set('minPrice', searchParams.minPrice);
                  if (searchParams.maxPrice) qp.set('maxPrice', searchParams.maxPrice);
                  const qs = qp.toString();
                  return `/brands/${slug}${qs ? `?${qs}` : ''}`;
                };

                // Generate visible page numbers with ellipsis
                const getPageNumbers = () => {
                  const pages: (number | '...')[] = [];
                  if (totalPages <= 7) {
                    for (let i = 1; i <= totalPages; i++) pages.push(i);
                  } else {
                    pages.push(1);
                    if (currentPage > 3) pages.push('...');
                    const start = Math.max(2, currentPage - 1);
                    const end = Math.min(totalPages - 1, currentPage + 1);
                    for (let i = start; i <= end; i++) pages.push(i);
                    if (currentPage < totalPages - 2) pages.push('...');
                    pages.push(totalPages);
                  }
                  return pages;
                };

                const from = (currentPage - 1) * limit + 1;
                const to = Math.min(currentPage * limit, total);

                return (
                  <div className="mt-10 flex flex-col items-center gap-4">
                    {/* Page info */}
                    <p className="text-xs text-surface-400">
                      Showing {from}–{to} of {total} products
                    </p>

                    {/* Page controls */}
                    <nav className="inline-flex items-center gap-1.5" aria-label="Pagination">
                      {/* Previous */}
                      <a
                        href={currentPage > 1 ? buildPageUrl(currentPage - 1) : '#'}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                          currentPage > 1
                            ? 'bg-white text-surface-700 border border-surface-200 hover:border-primary/40 hover:text-primary hover:shadow-sm active:scale-[0.97]'
                            : 'bg-surface-50 text-surface-300 border border-surface-100 cursor-not-allowed'
                        }`}
                        aria-disabled={currentPage <= 1}
                        tabIndex={currentPage <= 1 ? -1 : undefined}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Prev
                      </a>

                      {/* Page numbers */}
                      <div className="hidden sm:flex items-center gap-1">
                        {getPageNumbers().map((page, i) =>
                          page === '...' ? (
                            <span key={`ellipsis-${i}`} className="px-2 py-2 text-sm text-surface-400 select-none">
                              …
                            </span>
                          ) : (
                            <a
                              key={page}
                              href={buildPageUrl(page)}
                              className={`inline-flex items-center justify-center w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
                                page === currentPage
                                  ? 'bg-primary text-white shadow-md shadow-primary/25'
                                  : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900 active:scale-[0.97]'
                              }`}
                              aria-current={page === currentPage ? 'page' : undefined}
                            >
                              {page}
                            </a>
                          ),
                        )}
                      </div>

                      {/* Mobile page indicator */}
                      <span className="sm:hidden text-sm text-surface-500 font-medium px-2">
                        Page {currentPage} of {totalPages}
                      </span>

                      {/* Next */}
                      <a
                        href={currentPage < totalPages ? buildPageUrl(currentPage + 1) : '#'}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                          currentPage < totalPages
                            ? 'bg-white text-surface-700 border border-surface-200 hover:border-primary/40 hover:text-primary hover:shadow-sm active:scale-[0.97]'
                            : 'bg-surface-50 text-surface-300 border border-surface-100 cursor-not-allowed'
                        }`}
                        aria-disabled={currentPage >= totalPages}
                        tabIndex={currentPage >= totalPages ? -1 : undefined}
                      >
                        Next
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                    </nav>
                  </div>
                );
              })()}
            </>
          )}

          {/* SEO-friendly brand description */}
          {products.length > 0 && (
            <div className="mt-16 p-6 bg-white rounded-2xl border border-surface-100">
              <h2 className="text-lg font-bold text-surface-900 mb-2">
                Buy Certified Pre-Owned {brand.name} Phones
              </h2>
              <p className="text-sm text-surface-500 leading-relaxed">
                Browse our collection of quality-checked {brand.name} smartphones at the best prices.
                Every device undergoes a rigorous 20-point inspection, comes with a 6-month warranty,
                free delivery, and 7-day return policy. Whether you are looking for the latest {brand.name} flagship
                or a budget-friendly option, Dream Gadgets has you covered.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
