interface ProductCardProps {
    /** Raw product data from the API */
    product: any;
    /** Visual variant — 'grid' has 4:3 aspect, 'square' has 1:1 aspect */
    variant?: 'grid' | 'square';
    /** Optional index fallback for key when product has no id */
    index?: number;
}
/**
 * Named-export version that accepts individual props (used by brands/[slug] and products pages).
 */
export declare function ProductCard({ id, name, condition, price, originalPrice, imageUrl, storage, brand, rating, reviewCount, inStock, quickAdd, variant, }: {
    id: string;
    slug?: string;
    name: string;
    condition: string;
    price: number;
    originalPrice?: number;
    imageUrl?: string;
    storage?: string;
    brand?: string;
    rating?: number;
    reviewCount?: number;
    inStock?: boolean;
    quickAdd?: boolean;
    variant?: 'grid' | 'square';
}): import("react/jsx-runtime").JSX.Element;
/**
 * Default export — accepts raw product API data.
 * Used by the homepage (page.tsx).
 */
export default function ProductCardDefault({ product: p, variant, index }: ProductCardProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ProductCard.d.ts.map