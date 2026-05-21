import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { ConditionBadge } from '../../../components/product/ConditionBadge';
import { EMICalculator } from '../../../components/product/EMICalculator';
import { AddToCartButton } from '../../../components/product/AddToCartButton';

async function getProduct(slug: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1'}/public/products/${slug}`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) {
      console.error('Product detail API returned error', slug, res.status, res.statusText);
      return null;
    }
    const json = await res.json();
    console.log('Product detail API Response:', json);
    // Unwrap TransformInterceptor response: { status, data: item } or { status, data: { data: item } }
    const item = json.data?.data ?? json.data ?? json;
    return item;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) return { title: 'Product Not Found' };
  const name = product.itemName ?? product.model ?? 'Phone';
  return {
    title: name,
    description: `Buy ${name} — ${product.condition?.replace('_', ' ')} condition. ₹${Number(product.onlinePrice ?? product.sellingPrice ?? 0).toLocaleString('en-IN')}`,
    openGraph: {
      title: name,
      images: product.images?.[0] ? [product.images[0]] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  const price = Number(product.price ?? product.onlinePrice ?? product.sellingPrice ?? 0);
  const name = product.itemName ?? `${product.model ?? ''} ${product.storage ?? ''}`.trim();
  const photos: string[] = (product.images ?? []).filter(Boolean);
  const imageUrls = photos.length > 0 ? photos : ['https://via.placeholder.com/300x300?text=No+Image'];

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description: `${product.condition?.replace('_', ' ')} condition smartphone`,
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
    },
    ...(photos[0] && { image: photos[0] }),
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Image Gallery */}
        <div>
          <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 mb-3">
            <Image src={imageUrls[0]} alt={name} fill className="object-cover" />
          </div>
          {imageUrls.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {imageUrls.slice(1).map((url, i) => (
                <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  <Image src={url} alt={`${name} ${i + 2}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <h1 className="text-2xl font-bold flex-1">{name}</h1>
            <ConditionBadge condition={product.condition} />
          </div>

          <p className="text-3xl font-bold">₹{price.toLocaleString('en-IN')}</p>

          {/* Specs */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {product.storage && <div><span className="text-muted-foreground">Storage:</span> <span className="font-medium">{product.storage}</span></div>}
            {product.ram && <div><span className="text-muted-foreground">RAM:</span> <span className="font-medium">{product.ram}</span></div>}
            {product.colour && <div><span className="text-muted-foreground">Colour:</span> <span className="font-medium">{product.colour}</span></div>}
            {product.batteryHealth && <div><span className="text-muted-foreground">Battery:</span> <span className="font-medium">{product.batteryHealth}%</span></div>}
            {product.boxType && <div><span className="text-muted-foreground">Box:</span> <span className="font-medium capitalize">{product.boxType.replace('_', ' ')}</span></div>}
            {product.warrantyStatus && <div><span className="text-muted-foreground">Warranty:</span> <span className="font-medium">{product.warrantyStatus}</span></div>}
          </div>

          {/* EMI Calculator */}
          <EMICalculator price={price} />

          {/* Actions */}
          <div className="flex gap-3">
            <AddToCartButton product={{ id: product.id, imei: product.imei, name, price, slug: params.slug, imageUrl: imageUrls[0] }} />
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '919876543210'}?text=${encodeURIComponent(`Hi! I am interested in ${name} (IMEI: ${product.imei?.slice(0, 8)}*****)`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 border-2 border-green-500 text-green-600 rounded-xl font-medium text-center hover:bg-green-50"
            >
              WhatsApp Inquiry
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
