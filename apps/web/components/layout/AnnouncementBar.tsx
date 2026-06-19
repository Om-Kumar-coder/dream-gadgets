'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { X, ExternalLink, Loader2 } from 'lucide-react';

interface AnnouncementBarValue {
  text: string;
  isActive: boolean;
  linkUrl?: string;
  linkText?: string;
  bgColor?: string;
  textColor?: string;
  dismissible?: boolean;
}

const STORAGE_KEY = 'dg_announcement_dismissed';

export function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(true); // Start dismissed until we verify
  const [mounted, setMounted] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['announcement-bar'],
    queryFn: async () => {
      const { data } = await apiClient.get('/public/announcement');
      return (data.data || data) as AnnouncementBarValue | null;
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  // Hydrate dismissed state from localStorage
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Only consider dismissed if the stored text matches current text
        if (data?.text && parsed.text === data.text) {
          setDismissed(true);
          return;
        }
      } catch {
        // ignore
      }
    }
    setDismissed(false);
  }, [data?.text]);

  // Don't render anything during SSR
  if (!mounted) return null;

  // Loading state — render a skeleton placeholder
  if (isLoading) {
    return (
      <div className="bg-surface-950">
        <div className="max-w-7xl mx-auto px-4 py-2.5">
          <div className="h-5 w-64 bg-white/10 rounded animate-pulse mx-auto" />
        </div>
      </div>
    );
  }

  // No data or not active
  if (!data || !data.isActive || !data.text) return null;

  // User dismissed this announcement
  if (dismissed) return null;

  const bgColor = data.bgColor || '#0f172a';
  const textColor = data.textColor || '#ffffff';
  const isDismissible = data.dismissible !== false;

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ text: data.text }));
    } catch {
      // localStorage might be unavailable
    }
  };

  return (
    <div style={{ backgroundColor: bgColor, color: textColor }}>
      <div className="max-w-7xl mx-auto px-4 py-2.5 text-center text-sm flex items-center justify-center gap-2 flex-wrap">
        <span>{data.text}</span>
        {data.linkUrl && (
          <a
            href={data.linkUrl}
            className="inline-flex items-center gap-1 underline font-medium hover:opacity-80 transition-opacity"
            style={{ color: textColor }}
            target={data.linkUrl.startsWith('http') ? '_blank' : undefined}
            rel={data.linkUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
          >
            {data.linkText || 'Learn more'}
            {data.linkUrl.startsWith('http') && <ExternalLink className="w-3 h-3" />}
          </a>
        )}
        {isDismissible && (
          <button
            onClick={handleDismiss}
            className="ml-1 opacity-60 hover:opacity-100 transition-opacity p-0.5"
            style={{ color: textColor }}
            aria-label="Dismiss announcement"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
