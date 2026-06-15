'use client';

import Link from 'next/link';
import { useState } from 'react';

interface Post {
  slug: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  emoji: string;
}

const POSTS: Post[] = [
  {
    slug: 'samsung-galaxy-m53-5g-launch',
    title: 'Samsung Galaxy M53 5G To Be Launched In India On April 22',
    date: '19th April 2022',
    category: 'News',
    excerpt: 'Samsung keeps on adding to their series of smartphones each year. With multiple lines of series and aiming at low as well as high budget mobile phones, it has always been on the top of the list.',
    emoji: '📱',
  },
  {
    slug: 'future-of-mobile-technology',
    title: 'Future Of Mobile Technology And Its Impact On Modern Family',
    date: '21st April 2022',
    category: 'Technology',
    excerpt: 'We have come so far when it comes to mobile technology. The fast pace of growth in the technology sector is quite commendable.',
    emoji: '🚀',
  },
  {
    slug: 'contribute-used-mobiles-school-children',
    title: 'How To Contribute Used Mobiles To Poor School Children',
    date: '18th March 2022',
    category: 'Social',
    excerpt: 'Smartphones have become a significant part of our life\'s functional values. However, it is unfortunate that not every individual who needs access to a smartphone has it.',
    emoji: '🎓',
  },
  {
    slug: 'clear-app-data-cache-android',
    title: 'How To Clear App Data and Cache on Android?',
    date: '14th June 2022',
    category: 'Tips',
    excerpt: 'We use a smartphone daily for work as well as for personal and entertainment services. Your mobile phone might gather some cache that can slow it down if not cleared on time.',
    emoji: '🧹',
  },
  {
    slug: 'make-android-run-faster',
    title: 'Tips And Tricks to Make Your Android Run Faster',
    date: '2nd April 2022',
    category: 'Tips',
    excerpt: 'It\'s no big deal when Android users complain about their smartphones running slowly. Here are some tips to fix it.',
    emoji: '⚡',
  },
  {
    slug: 'iphone-battery-health-tips',
    title: 'How To Maintain iPhone Battery Health — 7 Essential Tips',
    date: '10th January 2025',
    category: 'Tips',
    excerpt: 'Your iPhone battery is a consumable component that naturally degrades over time. But with the right habits, you can slow that degradation.',
    emoji: '🔋',
  },
  {
    slug: 'best-refurbished-phones-2025',
    title: 'Top 5 Best Refurbished Phones To Buy In 2025',
    date: '5th January 2025',
    category: 'Technology',
    excerpt: 'Looking for a great deal on a refurbished phone in 2025? We have tested dozens of devices and narrowed down the top 5.',
    emoji: '🏆',
  },
  {
    slug: 'sell-phone-safely-guide',
    title: 'How To Safely Sell Your Phone Online — Complete Guide',
    date: '28th December 2024',
    category: 'Guides',
    excerpt: 'Selling your old phone can be nerve-wracking. From data security to getting the best price, follow our complete guide.',
    emoji: '🛡️',
  },
  {
    slug: 'refurbished-vs-new-phone',
    title: 'Refurbished vs New Phone: Which Should You Buy In 2025?',
    date: '15th December 2024',
    category: 'Guides',
    excerpt: 'The debate between buying refurbished vs new continues. We break down the pros and cons of each option.',
    emoji: '⚖️',
  },
  {
    slug: '5g-india-2025',
    title: '5G In India: What You Need To Know In 2025',
    date: '1st December 2024',
    category: 'News',
    excerpt: '5G has finally arrived in India at scale. Here is everything you need to know about 5G coverage and compatible devices.',
    emoji: '📶',
  },
  {
    slug: 'phone-trade-in-tips',
    title: 'Phone Trade-In Tips: How To Get The Maximum Value',
    date: '20th November 2024',
    category: 'Guides',
    excerpt: 'Getting ready to trade in your old phone? Follow these tips to maximize your trade-in value.',
    emoji: '💰',
  },
  {
    slug: 'reduce-e-waste-home',
    title: '10 Easy Ways To Reduce E-Waste At Home',
    date: '10th November 2024',
    category: 'Social',
    excerpt: 'Electronic waste is one of the fastest-growing waste streams in the world. Here are 10 practical ways you can reduce it.',
    emoji: '🌱',
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  News: 'badge-primary',
  Technology: 'badge-info',
  Social: 'badge-success',
  Tips: 'badge-warning',
  Guides: 'badge-purple',
};

const PER_PAGE = 4;

export default function BlogPage() {
  const [visibleCount, setVisibleCount] = useState(PER_PAGE);
  const featured = POSTS[0];
  const gridPosts = POSTS.slice(1);
  const visiblePosts = gridPosts.slice(0, visibleCount);
  const hasMore = visibleCount < gridPosts.length;

  return (
    <main className="animate-fade-in">
      {/* Hero */}
      <section className="text-white py-16 px-4 text-center relative overflow-hidden bg-gradient-hero">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative">
          <h1 className="text-4xl font-extrabold mb-3">Our Blog</h1>
          <p className="text-white/70">Tips, news & tech insights from Dream Gadgets</p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16">
        {/* Featured Post */}
        <Link href={`/blog/${featured.slug}`}
          className="block mb-10 card-hover overflow-hidden group">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="h-64 md:h-auto flex items-center justify-center text-8xl bg-gradient-brand-subtle">
              {featured.emoji}
            </div>
            <div className="p-8 flex flex-col justify-center">
              <span className={`badge mb-3 ${CATEGORY_COLORS[featured.category]}`}>
                {featured.category}
              </span>
              <h2 className="heading-sm text-surface-900 mb-3 group-hover:text-primary transition-colors">
                {featured.title}
              </h2>
              <p className="text-sm text-surface-500 mb-4 leading-relaxed">{featured.excerpt}</p>
              <p className="text-xs text-surface-400">By Dream Gadgets · {featured.date}</p>
            </div>
          </div>
        </Link>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {visiblePosts.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`}
              className="card overflow-hidden hover:shadow-card-hover hover:-translate-y-1 transition-all group">
              <div className="h-36 flex items-center justify-center text-5xl bg-gradient-brand-subtle">
                {p.emoji}
              </div>
              <div className="p-4">
                <span className={`badge mb-2 ${CATEGORY_COLORS[p.category]}`}>
                  {p.category}
                </span>
                <h3 className="font-bold text-surface-900 text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {p.title}
                </h3>
                <p className="text-xs text-surface-500 line-clamp-2 leading-relaxed">{p.excerpt}</p>
                <p className="text-xs text-surface-400 mt-3">{p.date}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Load More */}
        {hasMore && (
          <div className="mt-10 text-center">
            <button
              onClick={() => setVisibleCount((c) => c + PER_PAGE)}
              className="btn-outline btn-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              Load More Articles
              <span className="text-xs text-surface-400">({gridPosts.length - visibleCount} remaining)</span>
            </button>
          </div>
        )}

        {/* All loaded */}
        {!hasMore && gridPosts.length > PER_PAGE && (
          <div className="mt-10 text-center">
            <p className="text-sm text-surface-400 flex items-center justify-center gap-2">
              <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              You&apos;ve viewed all {gridPosts.length} articles
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
