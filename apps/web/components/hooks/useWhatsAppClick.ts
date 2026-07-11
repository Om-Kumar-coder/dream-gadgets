'use client';

import { useCallback, useRef } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '919876543210';

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

export function buildWhatsAppUrl(options: WhatsAppClickOptions): string {
  const phone = options.phone ?? WHATSAPP_NUMBER;
  const defaultMessage = options.message ?? 'Hi! I am interested in buying a phone from Dream Gadgets.';
  const message = encodeURIComponent(defaultMessage);

  // Build URL with UTM parameters
  const utmParams = new URLSearchParams({
    utm_source: options.source,
    utm_medium: options.medium ?? 'whatsapp_chat',
    utm_campaign: options.campaign ?? 'organic',
  });

  // Add optional context as utm_content for analytics
  if (options.context) {
    utmParams.set('utm_content', options.context.slice(0, 100));
  }

  // Add productId as a custom param for tracking
  if (options.productId) {
    utmParams.set('product_id', options.productId);
  }

  return `https://wa.me/${phone}?${utmParams.toString()}&text=${message}`;
}

/** Tracks a WhatsApp click via the backend API */
async function trackClick(options: WhatsAppClickOptions): Promise<void> {
  try {
    const payload = {
      source: options.source,
      context: options.context ?? null,
      productId: options.productId ?? null,
      phone: options.phone ?? WHATSAPP_NUMBER,
      url: window.location.href,
      userAgent: navigator.userAgent.slice(0, 200),
      referrer: document.referrer || null,
      timestamp: new Date().toISOString(),
    };

    // Fire-and-forget — don't block the navigation
    fetch(`${API_URL}/public/whatsapp/track-click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true, // Ensures request completes even on page unload
    }).catch(() => {
      // Silently fail — tracking shouldn't break UX
    });
  } catch {
    // Silently fail
  }
}

/**
 * Hook that returns a click handler for WhatsApp links.
 * Fires a tracking event to the backend, then opens WhatsApp.
 */
export function useWhatsAppClick() {
  const lastClickRef = useRef(0);

  const handleWhatsAppClick = useCallback(
    (options: WhatsAppClickOptions) => {
      // Debounce rapid clicks (1 second)
      const now = Date.now();
      if (now - lastClickRef.current < 1000) {
        lastClickRef.current = now;
        return;
      }
      lastClickRef.current = now;

      // Fire tracking event (fire-and-forget)
      trackClick(options);

      // Build the WhatsApp URL with UTM params
      const url = buildWhatsAppUrl(options);

      // Open in new tab
      window.open(url, '_blank', 'noopener,noreferrer');
    },
    [],
  );

  return { handleWhatsAppClick, buildWhatsAppUrl };
}
