export interface Banner {
    id: string;
    title: string;
    subtitle: string | null;
    imageUrl: string;
    mobileImageUrl: string | null;
    linkUrl: string | null;
    ctaText: string | null;
    pageType: string;
    position: string;
    deviceType: string;
    sortOrder: number;
    isActive: boolean;
    clickCount: number;
    startsAt: string | null;
    endsAt: string | null;
    createdAt: string;
}
export interface BannersByPosition {
    slider: Banner[];
    middle: Banner[];
    bottom: Banner[];
    offer: Banner[];
}
/**
 * React Query hook to fetch promotional banners (shared across brand pages, static pages, etc.)
 */
export declare function usePromotionalBanners(): import("@tanstack/react-query").UseQueryResult<BannersByPosition, Error>;
/**
 * Fetch active banners for a given page type and position
 */
export declare function getBanners(pageType?: string, position?: string, device?: string): Promise<Banner[]>;
/**
 * Fetch all active banners grouped by position for a page type
 */
export declare function getAllBanners(pageType?: string): Promise<BannersByPosition>;
/**
 * Track a banner click
 */
export declare function trackBannerClick(bannerId: string): Promise<void>;
/**
 * Detect device type
 */
export declare function getDeviceType(): 'mobile' | 'desktop';
/**
 * Get the best image URL for the current device
 * Prefixes relative URLs with the API base URL so they resolve correctly
 * behind the Nginx proxy.
 */
export declare function getBannerImage(banner: Banner): string;
/**
 * Build the href for a banner link
 */
export declare function getBannerHref(banner: Banner): string;
//# sourceMappingURL=bannerService.d.ts.map