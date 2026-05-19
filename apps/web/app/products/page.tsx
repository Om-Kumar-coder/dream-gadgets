import type { Metadata } from 'next';
import { ItemCondition } from '@dream-gadgets/shared-types';
import { ProductCard } from '../../components/product/ProductCard';

export const metadata: Metadata = {
  title: 'All Phones',
  description: 'Browse our collection of certified used smartphones.',
};

async function getProducts(searchParams: Record<string, string>) {
  const params = new URLSearchParams({
    page: searchParams.page ?? '1',
    limit: '20',
    ...(searchParams.brand && { brand: searchParams.brand }),
    ...(searchParams.condition && { condition: searchParams.condition }),
    ...(searchParams.minPrice && { minPrice: searchParams.minPrice }),
    ...(searchParams.maxPrice && { maxPrice: searchParams.maxPrice }),
  });
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1'}/public/products?${params}`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) {
      console.error('Products API returned error', res.status, res.statusText);
      return { data: [], total: 0 };
    }
    const json = await res.json();
    console.log('Products API Response:', json);
    return {
      data: json.data ?? json.items ?? [],
      total: json.meta?.total ?? json.total ?? 0,
    };
  } catch {
    return { data: [], total: 0 };
  }
}

const CONDITIONS = [
  { value: ItemCondition.SEALED_PACK, label: 'Sealed Pack', color: 'bg-red-100 text-red-700' },
  { value: ItemCondition.OPEN_BOX, label: 'Open Box', color: 'bg-red-100 text-red-700' },
  { value: ItemCondition.SUPER_MINT, label: 'Super Mint', color: 'bg-red-100 text-red-700' },
  { value: ItemCondition.MINT, label: 'Mint', color: 'bg-red-100 text-red-700' },
  { value: ItemCondition.GOOD, label: 'Good', color: 'bg-red-100 text-red-700' },
];

const BRANDS = ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Realme', 'Vivo', 'Oppo'];

export default async function ProductsPage({ searchParams }: { searchParams: Record<string, string> }) {
  const { data: products, total } = await getProducts(searchParams);

  const activeCondition = searchParams.condition;
  const activeBrand = searchParams.brand;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {activeBrand ? `${activeBrand} Phones` : activeCondition ? CONDITIONS.find(c => c.value === activeCondition)?.label ?? 'Phones' : 'All Phones'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{total} phones available</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">

        {/* Sidebar */}
        <aside className="hidden md:block w-52 shrink-0 space-y-6">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Brand</h3>
            <div className="space-y-1">
              <a
                href="/products"
                className={`block text-sm px-3 py-1.5 rounded-lg transition-colors ${!activeBrand ? 'bg-red-50 text-red-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                All Brands
              </a>
              {BRANDS.map(b => (
                <a
                  key={b}
                  href={`/products?brand=${b}`}
                  className={`block text-sm px-3 py-1.5 rounded-lg transition-colors ${activeBrand === b ? 'bg-red-50 text-red-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {b}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Condition</h3>
            <div className="space-y-1">
              <a
                href="/products"
                className={`block text-sm px-3 py-1.5 rounded-lg transition-colors ${!activeCondition ? 'bg-red-50 text-red-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                All Conditions
              </a>
              {CONDITIONS.map(c => (
                <a
                  key={c.value}
                  href={`/products?condition=${c.value}`}
                  className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg transition-colors ${activeCondition === c.value ? 'bg-red-50 text-red-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${c.color}`}>{c.label}</span>
                </a>
              ))}
            </div>
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1 min-w-0">
          {/* Mobile filter chips */}
          <div className="flex gap-2 overflow-x-auto pb-3 md:hidden">
            {CONDITIONS.map(c => (
              <a
                key={c.value}
                href={`/products?condition=${c.value}`}
                className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${activeCondition === c.value ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600 border-gray-200'}`}
              >
                {c.label}
              </a>
            ))}
          </div>

          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="text-6xl mb-4">📱</div>
              <p className="text-lg font-semibold text-gray-700">No phones found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
              <a href="/products" className="mt-4 text-sm text-red-600 font-medium hover:underline">
                Clear all filters
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((p: any) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  slug={p.slug ?? p.id}
                  name={p.itemName ?? `${p.model?.name ?? ''} ${p.storage ?? ''}`.trim()}
                  condition={p.condition}
                  price={Number(p.onlinePrice ?? p.sellingPrice ?? 0)}
                  imageUrl={p.photos?.[0]?.cdnUrl}
                  storage={p.storage}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
