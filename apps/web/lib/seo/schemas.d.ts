/**
 * Shared JSON-LD Schema generators for Dream Gadgets SEO.
 * These helpers produce structured data objects that can be
 * injected via `<script type="application/ld+json">` on any page.
 */
export declare const SITE_URL: string;
export declare const SITE_NAME = "Dream Gadgets";
export declare const SITE_DESCRIPTION = "India's most transparent mobile selling platform. Highest price, doorstep pickup, instant payment.";
export declare function organizationSchema(): {
    '@context': string;
    '@type': string;
    name: string;
    url: string;
    logo: string;
    description: string;
    foundingDate: string;
    contactPoint: {
        '@type': string;
        telephone: string;
        contactType: string;
        availableLanguage: string[];
    }[];
    sameAs: string[];
};
export declare function localBusinessSchema(): {
    '@context': string;
    '@type': string;
    name: string;
    image: string;
    '@id': string;
    url: string;
    telephone: string;
    priceRange: string;
    address: {
        '@type': string;
        streetAddress: string;
        addressLocality: string;
        addressRegion: string;
        postalCode: string;
        addressCountry: string;
    }[];
    openingHoursSpecification: {
        '@type': string;
        dayOfWeek: string[];
        opens: string;
        closes: string;
    }[];
};
export declare function webSiteSchema(): {
    '@context': string;
    '@type': string;
    url: string;
    name: string;
    description: string;
    potentialAction: {
        '@type': string;
        target: {
            '@type': string;
            urlTemplate: string;
        };
        'query-input': string;
    };
};
interface BreadcrumbItem {
    name: string;
    url: string;
}
export declare function breadcrumbSchema(items: BreadcrumbItem[]): {
    '@context': string;
    '@type': string;
    itemListElement: {
        '@type': string;
        position: number;
        name: string;
        item: string;
    }[];
};
export declare function faqPageSchema(faqs: {
    question: string;
    answer: string;
}[]): {
    '@context': string;
    '@type': string;
    mainEntity: {
        '@type': string;
        name: string;
        acceptedAnswer: {
            '@type': string;
            text: string;
        };
    }[];
};
export declare function webPageSchema(name: string, description: string, breadcrumbs?: BreadcrumbItem[]): {
    breadcrumb?: {
        '@type': string;
        itemListElement: {
            '@type': string;
            position: number;
            name: string;
            item: string;
        }[];
    } | undefined;
    '@context': string;
    '@type': string;
    name: string;
    description: string;
    url: string;
};
export declare function blogPostingSchema(post: {
    title: string;
    description: string;
    datePublished: string;
    author: string;
    url: string;
    image?: string;
}): {
    datePublished: string;
    author: {
        '@type': string;
        name: string;
    };
    publisher: {
        '@type': string;
        name: string;
        logo: {
            '@type': string;
            url: string;
        };
    };
    url: string;
    mainEntityOfPage: string;
    image?: string | undefined;
    '@context': string;
    '@type': string;
    headline: string;
    description: string;
};
export declare function productSchema(product: {
    name: string;
    description: string;
    brand: string;
    price: number;
    priceCurrency?: string;
    availability?: string;
    image?: string;
    sku?: string;
    aggregateRating?: {
        ratingValue: number;
        reviewCount: number;
    };
    offers?: Record<string, unknown>;
}): {
    aggregateRating?: {
        '@type': string;
        ratingValue: number;
        reviewCount: number;
    } | undefined;
    brand: {
        '@type': string;
        name: string;
    };
    offers: {
        '@type': string;
        price: number;
        priceCurrency: string;
        availability: string;
        url: string;
    };
    sku?: string | undefined;
    image?: string | undefined;
    '@context': string;
    '@type': string;
    name: string;
    description: string;
};
export {};
//# sourceMappingURL=schemas.d.ts.map