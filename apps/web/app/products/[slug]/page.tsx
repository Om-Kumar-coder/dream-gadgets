import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductGallery } from '../../../components/product/ProductGallery';
import { AddToCartButton } from '../../../components/product/AddToCartButton';
import dynamic from 'next/dynamic';
import { ProductBuyPanel } from '../../../components/product/ProductBuyPanel';
import { UrgencyBadge } from '../../../components/product/UrgencyBadge';
import { PriceComparison } from '../../../components/product/PriceComparison';
import { JsonLd } from '../../../components/seo/JsonLd';
import { BreadcrumbJsonLd } from '../../../components/seo/BreadcrumbJsonLd';

// Lazy-load below-the-fold interactive components to reduce initial bundle size
const EMICalculator = dynamic(
  () => import('../../../components/product/EMICalculator').then((mod) => ({ default: mod.EMICalculator })),
  { ssr: false, loading: () => <div className="h-32 bg-surface-50 animate-pulse rounded-2xl" /> },
);

const ReviewSection = dynamic(
  () => import('../../../components/product/ReviewSection').then((mod) => ({ default: mod.ReviewSection })),
  { loading: () => <div className="h-48 bg-surface-50 animate-pulse rounded-2xl" /> },
);

const RelatedProducts = dynamic(
  () => import('../../../components/product/RelatedProducts').then((mod) => ({ default: mod.RelatedProducts })),
  { loading: () => <div className="h-40 bg-surface-50 animate-pulse rounded-2xl" /> },
);

const ProductSpecs = dynamic(
  () => import('../../../components/product/ProductSpecs').then((mod) => ({ default: mod.ProductSpecs })),
  { loading: () => <div className="h-40 bg-surface-50 animate-pulse rounded-2xl" /> },
);

const TrustElements = dynamic(
  () => import('../../../components/product/TrustElements').then((mod) => ({ default: mod.TrustElements })),
  { loading: () => <div className="h-24 bg-surface-50 animate-pulse rounded-2xl" /> },
);

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

async function getProduct(slug: string) {
  try {
    const res = await fetch(`${API}/public/products/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const item = json.data?.data ?? json.data ?? json;
    return item;
  } catch {
    return null;
  }
}

async function getReviews(itemId: string) {
  if (!itemId) return { data: [], summary: { total_reviews: 0, avg_rating: 0, '5_star': 0, '4_star': 0, '3_star': 0, '2_star': 0, '1_star': 0 } };
  try {
    const res = await fetch(`${API}/public/products/${itemId}/reviews`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return { data: [], summary: { total_reviews: 0, avg_rating: 0, '5_star': 0, '4_star': 0, '3_star': 0, '2_star': 0, '1_star': 0 } };
    const json = await res.json();
    const unwrapped = json.data ?? json;
    return {
      data: unwrapped.data ?? [],
      summary: unwrapped.summary ?? { total_reviews: 0, avg_rating: 0, '5_star': 0, '4_star': 0, '3_star': 0, '2_star': 0, '1_star': 0 },
    };
  } catch {
    return { data: [], summary: { total_reviews: 0, avg_rating: 0, '5_star': 0, '4_star': 0, '3_star': 0, '2_star': 0, '1_star': 0 } };
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) return { title: 'Product Not Found' };
  const name = product.item_name ?? `${product.brand ?? ''} ${product.model ?? ''} ${product.storage ?? ''}`.trim();
  return {
    title: name,
    description: product.description || `Buy ${name} — ${product.condition?.replace('_', ' ')} condition. ₹${Number(product.price ?? 0).toLocaleString('en-IN')}`,
    openGraph: {
      title: name,
      description: product.description || '',
      images: product.images?.[0] ? [product.images[0]] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  const price = Number(product.price ?? 0);
  const originalPrice = Number(product.selling_price ?? 0) > price ? Number(product.selling_price) : null;
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const name = product.item_name ?? `${product.brand ?? ''} ${product.model ?? ''} ${product.storage ?? ''}`.trim();
  const photos: string[] = (product.images ?? []).filter(Boolean);
  const imageUrls = photos.length > 0 ? photos : ['/images/placeholders/no-image.svg'];

  const reviewsData = await getReviews(product.id);

  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Phones', url: '/products' },
    { name, url: `/products/${params.slug}` },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description: product.description || `${product.condition?.replace('_', ' ')} condition smartphone`,
    brand: { '@type': 'Brand', name: product.brand },
    sku: product.imei,
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency: 'INR',
      availability: product.status === 'available' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      ...(originalPrice && { priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }),
    },
    ...(imageUrls[0] && { image: imageUrls[0] }),
    ...(reviewsData.summary?.total_reviews > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: reviewsData.summary.avg_rating,
        reviewCount: reviewsData.summary.total_reviews,
      },
    }),
  };

  const specs = product.specs ?? {};

  const CONDITION_BADGES: Record<string, { label: string; color: string; emoji: string }> = {
    SEALED_PACK: { label: 'Sealed Pack', color: 'bg-violet-100 text-violet-700 border-violet-200', emoji: '🎯' },
    OPEN_BOX: { label: 'Open Box', color: 'bg-blue-100 text-blue-700 border-blue-200', emoji: '📦' },
    SUPER_MINT: { label: 'Super Mint', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', emoji: '✨' },
    MINT: { label: 'Mint', color: 'bg-teal-100 text-teal-700 border-teal-200', emoji: '💎' },
    GOOD: { label: 'Good', color: 'bg-amber-100 text-amber-700 border-amber-200', emoji: '👍' },
  };
  const conditionBadge = CONDITION_BADGES[product.condition] || { label: product.condition?.replace(/_/g, ' '), color: 'bg-surface-100 text-surface-600 border-surface-200', emoji: '📱' };

  return (
    <>
      {/* Structured Data */}
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <JsonLd data={jsonLd} />

      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-surface-100/50">
        <div className="container-page py-3">
          <nav className="flex items-center gap-2 text-xs text-surface-400" aria-label="Breadcrumb">
            <a href="/" className="hover:text-primary transition-colors font-medium">Home</a>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <a href="/products" className="hover:text-primary transition-colors font-medium">Phones</a>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-surface-600 truncate max-w-[200px] font-medium">{name}</span>
          </nav>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="container-page py-6 pb-24 lg:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">

          {/* ── Left Column: Gallery ── */}
          <div className="lg:col-span-6">
            <div className="lg:sticky lg:top-28">
              <ProductGallery images={imageUrls} name={name} />
            </div>
          </div>

          {/* ── Right Column: Info + Actions ── */}
          <div className="lg:col-span-6 space-y-6">

            {/* Brand & Name */}
            <div>
              {product.brand && (
                <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1.5">
                  {product.brand}
                </p>
              )}
              <h1 className="heading-lg text-surface-900">
                {name}
              </h1>
              {product.model && (
                <p className="text-sm text-surface-400 mt-1">{product.model}</p>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-4xl font-extrabold text-surface-900 tracking-tight">
                ₹{price.toLocaleString('en-IN')}
              </span>
              {originalPrice && (
                <>
                  <span className="text-lg text-surface-400 line-through">
                    ₹{originalPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-0.5 rounded-full border border-emerald-200">
                    Save {discount}%
                  </span>
                </>
              )}
            </div>

            {/* Stock Status + SKU */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className={`inline-block w-2 h-2 rounded-full ${product.status === 'available' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <span className={`text-sm font-semibold ${product.status === 'available' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {product.status === 'available' ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
              {product.status === 'available' && (
                <UrgencyBadge stockLevel={product.stock_quantity <= 2 ? 'low' : 'high'} salesVelocity={(product.sales_count ?? 0) > 50 ? 'fast' : 'normal'} />
              )}
              {product.imei && (
                <span className="text-xs text-surface-400 ml-auto font-mono">SKU: {product.imei?.slice(0, 8)}*****</span>
              )}
            </div>

            {/* Condition & Key Specs */}
            <div className="flex flex-wrap gap-2">
              <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${conditionBadge.color}`}>
                {conditionBadge.emoji} {conditionBadge.label}
              </span>
              {product.storage && (
                <span className="text-xs px-3 py-1.5 rounded-full bg-surface-100 text-surface-700 font-semibold">
                  {product.storage}
                </span>
              )}
              {product.ram && (
                <span className="text-xs px-3 py-1.5 rounded-full bg-surface-100 text-surface-700 font-semibold">
                  {product.ram} RAM
                </span>
              )}
              {product.colour && (
                <span className="text-xs px-3 py-1.5 rounded-full bg-surface-100 text-surface-700 font-semibold">
                  {product.colour}
                </span>
              )}
            </div>

            {/* Ratings Summary */}
            {reviewsData.summary && reviewsData.summary.total_reviews > 0 && (
              <a href="#reviews" className="inline-flex items-center gap-2 text-sm group px-4 py-2 bg-amber-50 rounded-xl border border-amber-100 hover:bg-amber-100/50 transition-colors">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-4 h-4 ${star <= Math.round(reviewsData.summary.avg_rating) ? 'text-amber-400' : 'text-surface-200'}`}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm font-bold text-surface-900">
                  {reviewsData.summary.avg_rating.toFixed(1)}
                </span>
                <span className="text-xs text-surface-500 group-hover:text-primary transition-colors">
                  ({reviewsData.summary.total_reviews} reviews)
                </span>
              </a>
            )}

            {/* Price Comparison vs New */}
            {originalPrice && (
              <PriceComparison
                refurbishedPrice={price}
                newPrice={originalPrice}
                brand={product.brand}
                modelName={product.model}
              />
            )}

            <hr className="divider" />

            {/* Quick Specs */}
            {Object.keys(specs).length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(specs).slice(0, 4).map(([key, value]) => (
                  <div key={key} className="bg-surface-50 rounded-xl px-4 py-3 border border-surface-100">
                    <p className="text-xs text-surface-400 capitalize font-medium">{key.replace(/([A-Z])/g, ' $1')}</p>
                    <p className="text-sm font-bold text-surface-900 mt-0.5">{String(value)}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div className="space-y-2 p-4 bg-surface-50 rounded-xl border border-surface-100">
                <h3 className="text-sm font-bold text-surface-900 flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  About this item
                </h3>
                <p className="text-sm text-surface-600 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <AddToCartButton
                product={{
                  id: product.id,
                  imei: product.imei,
                  name,
                  price,
                  slug: params.slug,
                  imageUrl: imageUrls[0],
                }}
              />
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '919876543210'}?text=${encodeURIComponent(`Hi! I am interested in ${name} (IMEI: ${product.imei?.slice(0, 8)}*****)`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 border-2 border-emerald-500 text-emerald-600 rounded-xl font-bold text-sm text-center hover:bg-emerald-50 active:scale-[0.97] transition-all flex items-center justify-center gap-1.5"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp Inquiry
              </a>
            </div>

            {/* EMI Calculator */}
            <EMICalculator price={price} />

            {/* Delivery Timeline */}
            {product.status === 'available' && (
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-50/50 rounded-2xl p-6 border border-emerald-100">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-sm font-bold text-surface-900">Delivery Timeline</span>
                    <p className="text-xs text-surface-400">Free shipping on all orders</p>
                  </div>
                </div>
                <div className="timeline">
                  <div className="timeline-item timeline-item-completed">
                    <p className="text-sm font-bold text-surface-900">Order Confirmed</p>
                    <p className="text-xs text-surface-500">Instant</p>
                  </div>
                  <div className="timeline-item timeline-item-completed">
                    <p className="text-sm font-bold text-surface-900">Quality Check</p>
                    <p className="text-xs text-surface-500">Within 24 hours</p>
                  </div>
                  <div className="timeline-item timeline-item-active">
                    <p className="text-sm font-bold text-surface-900">Shipped</p>
                    <p className="text-xs text-surface-500">1–2 business days</p>
                  </div>
                  <div className="timeline-item">
                    <p className="text-sm font-bold text-surface-900">Delivered</p>
                    <p className="text-xs text-surface-500">3–5 business days</p>
                  </div>
                </div>
                <p className="text-xs text-emerald-600 mt-4 flex items-center gap-1.5 font-medium">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  100% genuine products with warranty
                </p>
              </div>
            )}

            {/* Trust Elements (Desktop) */}
            <div className="hidden lg:block">
              <TrustElements
                warrantyStatus={product.warranty_status}
                warrantyExpiry={product.warranty_expiry}
                condition={product.condition}
              />
            </div>
          </div>
        </div>

        {/* ── Full-width Section ── */}
        <div className="mt-12 space-y-12 max-w-5xl">

          {/* Specifications */}
          {Object.keys(specs).length > 0 && (
            <ProductSpecs
              specs={specs}
              storage={product.storage}
              ram={product.ram}
              colour={product.colour}
              batteryHealth={product.battery_health}
            />
          )}

          {/* Trust Elements (Mobile/Tablet) */}
          <div className="lg:hidden">
            <TrustElements
              warrantyStatus={product.warranty_status}
              warrantyExpiry={product.warranty_expiry}
              condition={product.condition}
            />
          </div>

          {/* Why Choose Us */}
          <div className="relative overflow-hidden card-dark p-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-white mb-6">Why Choose Dream Gadgets?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {[
                  { icon: '🔬', title: '20-Point Inspection', desc: 'Every device is professionally tested and verified before listing.' },
                  { icon: '🛡️', title: '6-Month Warranty', desc: 'All purchases come with a comprehensive warranty for your peace of mind.' },
                  { icon: '💳', title: 'Easy EMIs', desc: 'Flexible payment options starting at ₹1,500/month. No cost EMI available.' },
                  { icon: '↩️', title: '7-Day Returns', desc: 'Not satisfied? Return within 7 days for a full refund. No questions asked.' },
                  { icon: '🔋', title: '90%+ Battery Health', desc: 'All devices have a minimum battery health of 90% or more.' },
                  { icon: '📦', title: 'Free Shipping', desc: 'Free doorstep delivery across India with secure packaging.' },
                ].map(c => (
                  <div key={c.title} className="flex gap-3 items-start p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                    <span className="text-2xl shrink-0 mt-0.5">{c.icon}</span>
                    <div>
                      <h4 className="text-sm font-bold text-white">{c.title}</h4>
                      <p className="text-xs text-white/50 leading-relaxed mt-0.5">{c.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div id="reviews" className="scroll-mt-28">
            <ReviewSection
              itemId={product.id}
              initialSummary={reviewsData.summary}
              initialReviews={reviewsData.data ?? []}
            />
          </div>

          {/* Related Products */}
          <RelatedProducts itemId={params.slug} />
        </div>
      </div>

      {/* Mobile Sticky Buy Bar */}
      <ProductBuyPanel
        name={name}
        price={price}
        originalPrice={originalPrice}
        imageUrl={imageUrls[0]}
        productId={product.id}
        imei={product.imei}
        slug={params.slug}
      />
    </>
  );
}
