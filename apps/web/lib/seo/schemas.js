/**
 * Shared JSON-LD Schema generators for Dream Gadgets SEO.
 * These helpers produce structured data objects that can be
 * injected via `<script type="application/ld+json">` on any page.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dreamgadgets.in';
export const SITE_NAME = 'Dream Gadgets';
export const SITE_DESCRIPTION = "India's most transparent mobile selling platform. Highest price, doorstep pickup, instant payment.";
// ─── Organization / LocalBusiness (global) ─────────────────────────────────
export function organizationSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/Logo_Dream_Gadgets.png`,
        description: SITE_DESCRIPTION,
        foundingDate: '2019',
        contactPoint: [
            { '@type': 'ContactPoint', telephone: '+91-8282011193', contactType: 'customer service', availableLanguage: ['English', 'Hindi', 'Bengali'] },
            { '@type': 'ContactPoint', telephone: '+91-9038312344', contactType: 'sales', availableLanguage: ['English', 'Hindi', 'Bengali'] },
        ],
        sameAs: [
            'https://www.facebook.com/DreamGadgets.Kolkata',
            'https://www.instagram.com/dream_gadgets_kolkata',
            'https://www.youtube.com/@dream_gadgets',
        ],
    };
}
export function localBusinessSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: SITE_NAME,
        image: `${SITE_URL}/Logo_Dream_Gadgets.png`,
        '@id': `${SITE_URL}/#localbusiness`,
        url: SITE_URL,
        telephone: '+91-8282011193',
        priceRange: '₹5,000–₹1,50,000',
        address: [
            {
                '@type': 'PostalAddress',
                streetAddress: '29A, Pitambar Ghatak Lane, Chetla',
                addressLocality: 'Kolkata',
                addressRegion: 'West Bengal',
                postalCode: '700027',
                addressCountry: 'IN',
            },
            {
                '@type': 'PostalAddress',
                streetAddress: '17, Sukanta Setu, Sulekha More, Jadavpur',
                addressLocality: 'Kolkata',
                addressRegion: 'West Bengal',
                postalCode: '700032',
                addressCountry: 'IN',
            },
        ],
        openingHoursSpecification: [
            { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '12:30', closes: '21:30' },
        ],
    };
}
export function webSiteSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        url: SITE_URL,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${SITE_URL}/products?search={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
        },
    };
}
export function breadcrumbSchema(items) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: `${SITE_URL}${item.url}`,
        })),
    };
}
// ─── FAQPage ────────────────────────────────────────────────────────────────
export function faqPageSchema(faqs) {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
    };
}
// ─── WebPage (generic) ──────────────────────────────────────────────────────
export function webPageSchema(name, description, breadcrumbs) {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name,
        description,
        url: SITE_URL,
        ...(breadcrumbs && breadcrumbs.length > 0
            ? {
                breadcrumb: {
                    '@type': 'BreadcrumbList',
                    itemListElement: breadcrumbs.map((item, index) => ({
                        '@type': 'ListItem',
                        position: index + 1,
                        name: item.name,
                        item: `${SITE_URL}${item.url}`,
                    })),
                },
            }
            : {}),
    };
}
// ─── BlogPosting ────────────────────────────────────────────────────────────
export function blogPostingSchema(post) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.description,
        ...(post.image ? { image: post.image } : {}),
        datePublished: post.datePublished,
        author: { '@type': 'Person', name: post.author },
        publisher: { '@type': 'Organization', name: SITE_NAME, logo: { '@type': 'ImageObject', url: `${SITE_URL}/Logo_Dream_Gadgets.png` } },
        url: post.url,
        mainEntityOfPage: post.url,
    };
}
// ─── Product (enhanced) ─────────────────────────────────────────────────────
export function productSchema(product) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        ...(product.image ? { image: product.image } : {}),
        ...(product.sku ? { sku: product.sku } : {}),
        brand: { '@type': 'Brand', name: product.brand },
        offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: product.priceCurrency ?? 'INR',
            availability: product.availability ?? 'https://schema.org/InStock',
            url: `${SITE_URL}/products/${product.sku}`,
            ...(product.offers ?? {}),
        },
        ...(product.aggregateRating
            ? {
                aggregateRating: {
                    '@type': 'AggregateRating',
                    ratingValue: product.aggregateRating.ratingValue,
                    reviewCount: product.aggregateRating.reviewCount,
                },
            }
            : {}),
    };
}
//# sourceMappingURL=schemas.js.map