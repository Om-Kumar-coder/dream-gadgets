import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Blog — Dream Gadgets',
  description: 'Tips, news and tech insights from Dream Gadgets.',
};

const POSTS = [
  {
    slug: 'samsung-galaxy-m53-5g-launch',
    title: 'Samsung Galaxy M53 5G To Be Launched In India On April 22',
    date: '19th April 2022',
    category: 'News',
    excerpt: 'Samsung keeps on adding to their series of smartphones each year. With multiple lines of series and aiming at low as well as high budget mobile phones, it has always been on the top of the list of trending smartphones.',
    emoji: '📱',
  },
  {
    slug: 'future-of-mobile-technology',
    title: 'Future Of Mobile Technology And Its Impact On Modern Family',
    date: '21st April 2022',
    category: 'Technology',
    excerpt: 'We have come so far when it comes to mobile technology. The fast pace of growth in the technology sector is quite commendable. From heavy handsets to slim and portable smartphones, we have made it so far in this journey.',
    emoji: '🚀',
  },
  {
    slug: 'contribute-used-mobiles-school-children',
    title: 'How To Contribute Used Mobiles To Poor School Children',
    date: '18th March 2022',
    category: 'Social',
    excerpt: 'Smartphones have become a significant part of our life\'s functional values. However, it is unfortunate that not every individual who needs access to a smartphone has it. There are many ways we can help.',
    emoji: '🎓',
  },
  {
    slug: 'clear-app-data-cache-android',
    title: 'How To Clear App Data and Cache on Android?',
    date: '14th June 2022',
    category: 'Tips',
    excerpt: 'We use a smartphone daily for work as well as for personal and entertainment services. While performing such activities, your mobile phone might gather some cache that can slow it down if not cleared on time.',
    emoji: '🧹',
  },
  {
    slug: 'make-android-run-faster',
    title: 'Tips And Tricks to Make Your Android Run Faster',
    date: '2nd April 2022',
    category: 'Tips',
    excerpt: 'It\'s no big deal when Android users complain about their smartphones running slowly. There might be several reasons why the Android smartphone doesn\'t run smooth. Here are some tips to fix it.',
    emoji: '⚡',
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  News: 'bg-red-100 text-red-700',
  Technology: 'bg-red-100 text-red-700',
  Social: 'bg-red-100 text-red-700',
  Tips: 'bg-amber-100 text-amber-700',
};

export default function BlogPage() {
  return (
    <main>
      <section className="text-white py-16 px-4 text-center" style={{
        background: 'linear-gradient(135deg, #0F0F10 0%, #1A1A1A 50%, #0F0F10 100%)'
      }}>
        <h1 className="text-4xl font-extrabold mb-3">Our Blog</h1>
        <p className="text-white/80">Tips, news & tech insights from Dream Gadgets</p>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16">
        {/* Featured */}
        <Link href={`/blog/${POSTS[0].slug}`}
          className="block mb-10 bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all group" onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#E50914';
            e.currentTarget.style.boxShadow = '0 0 10px rgba(229, 9, 20, 0.25)';
          }} onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#E5E5E5';
            e.currentTarget.style.boxShadow = '';
          }}>
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="h-64 md:h-auto flex items-center justify-center text-8xl" style={{
              background: 'linear-gradient(135deg, rgba(229, 9, 20, 0.05), rgba(255, 45, 45, 0.05))'
            }}>
              {POSTS[0].emoji}
            </div>
            <div className="p-8 flex flex-col justify-center">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full w-fit mb-3 ${CATEGORY_COLORS[POSTS[0].category]}`}>
                {POSTS[0].category}
              </span>
              <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors" style={{ '--group-hover-text-color': '#E50914' } as React.CSSProperties}>
                {POSTS[0].title}
              </h2>
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">{POSTS[0].excerpt}</p>
              <p className="text-xs text-gray-400">By Dream Gadgets · {POSTS[0].date}</p>
            </div>
          </div>
        </Link>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {POSTS.slice(1).map(p => (
            <Link key={p.slug} href={`/blog/${p.slug}`}
              className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all group" onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#E50914';
                e.currentTarget.style.boxShadow = '0 0 10px rgba(229, 9, 20, 0.25)';
              }} onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E5E5E5';
                e.currentTarget.style.boxShadow = '';
              }}>
              <div className="h-36 flex items-center justify-center text-5xl" style={{
                background: 'linear-gradient(135deg, rgba(229, 9, 20, 0.05), rgba(255, 45, 45, 0.05))'
              }}>
                {p.emoji}
              </div>
              <div className="p-4">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[p.category]}`}>
                  {p.category}
                </span>
                <h3 className="font-bold text-gray-900 text-sm mt-2 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                  {p.title}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{p.excerpt}</p>
                <p className="text-xs text-gray-400 mt-3">{p.date}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
