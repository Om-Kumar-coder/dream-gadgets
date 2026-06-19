'use client';

import { apiClient } from './api';
import { useQuery } from '@tanstack/react-query';

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
export function usePromotionalBanners() {
  return useQuery({
    queryKey: ['promotional-banners'],
    queryFn: () => getAllBanners('promotional'),
    staleTime: 60 * 1000,
    retry: 2,
  });
}

/**
 * Fetch active banners for a given page type and position
 */
export async function getBanners(
  pageType: string = 'home',
  position: string = 'slider',
  device?: string
): Promise<Banner[]> {
  const params: Record<string, string> = { pageType, position };
  if (device) params.device = device;

  const { data } = await apiClient.get('/public/banners', { params });
  return data.data || data || [];
}

/**
 * Fetch all active banners grouped by position for a page type
 */
export async function getAllBanners(pageType: string = 'home'): Promise<BannersByPosition> {
  const { data } = await apiClient.get('/public/banners/all', {
    params: { pageType },
  });
  const result = data.data || data;
  return {
    slider: result.slider || [],
    middle: result.middle || [],
    bottom: result.bottom || [],
    offer: result.offer || [],
  };
}

/**
 * Track a banner click
 */
export async function trackBannerClick(bannerId: string): Promise<void> {
  try {
    await apiClient.post(`/public/banners/${bannerId}/click`);
  } catch {
    // Silently fail — analytics shouldn't break the UX
  }
}

/**
 * Detect device type
 */
export function getDeviceType(): 'mobile' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  return window.innerWidth < 768 ? 'mobile' : 'desktop';
}

/**
 * Get the best image URL for the current device
 * Prefixes relative URLs with the API base URL so they resolve correctly
 * behind the Nginx proxy.
 */
export function getBannerImage(banner: Banner): string {
  const device = getDeviceType();
  let url = device === 'mobile' && banner.mobileImageUrl
    ? banner.mobileImageUrl
    : banner.imageUrl;

  // Prefix relative URLs with API base URL so they work through Nginx proxy
  if (url && url.startsWith('/')) {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
    url = `${apiBase}${url}`;
  }

  return url;
}

/**
 * Build the href for a banner link
 */
export function getBannerHref(banner: Banner): string {
  if (!banner.linkUrl) return '#';
  if (banner.linkUrl.startsWith('http://') || banner.linkUrl.startsWith('https://')) {
    return banner.linkUrl;
  }
  return banner.linkUrl;
}
