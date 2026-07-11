interface WhatsAppClickOptions {
    /** Source/location of the click: 'floating_button' | 'product_page' | 'contact_page' | 'stores_page' | 'footer' | 'blog_share' | 'buy_panel' */
    source: string;
    /** Optional context (e.g., product name, store name, blog title) */
    context?: string;
    /** Optional product ID if tracking from a product page */
    productId?: string;
    /** Optional UTM campaign */
    campaign?: string;
    /** Optional UTM medium */
    medium?: string;
    /** Custom phone number (for store-specific numbers) */
    phone?: string;
    /** Custom message text */
    message?: string;
    /** Whether to use navigator.share on mobile instead of wa.me link */
    useShare?: boolean;
}
export declare function buildWhatsAppUrl(options: WhatsAppClickOptions): string;
/**
 * Hook that returns a click handler for WhatsApp links.
 * Fires a tracking event to the backend, then opens WhatsApp.
 */
export declare function useWhatsAppClick(): {
    handleWhatsAppClick: (options: WhatsAppClickOptions) => void;
    buildWhatsAppUrl: typeof buildWhatsAppUrl;
};
export {};
//# sourceMappingURL=useWhatsAppClick.d.ts.map