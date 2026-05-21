import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const POSTS: Record<string, {
  title: string;
  date: string;
  category: string;
  content: string[];
  emoji: string;
  author: string;
}> = {
  'samsung-galaxy-m53-5g-launch': {
    title: 'Samsung Galaxy M53 5G To Be Launched In India On April 22',
    date: '19th April 2022',
    category: 'News',
    emoji: '📱',
    author: 'Dream Gadgets Team',
    content: [
      'Samsung keeps on adding to their series of smartphones each year. With multiple lines of series and aiming at low as well as high budget mobile phones, it has always been on the top of the list of trending smartphones.',
      'The Samsung Galaxy M53 5G is the latest addition to the Galaxy M series, which is known for offering premium features at affordable prices. The device is expected to come with a 6.7-inch Super AMOLED display with 120Hz refresh rate, MediaTek Dimensity 900 processor, and a 108MP quad camera setup.',
      'With 5G connectivity becoming more widespread in India, Samsung is positioning this device as a future-proof option for consumers looking to upgrade to 5G without breaking the bank. The Galaxy M53 5G is expected to be priced competitively, making it an attractive option for budget-conscious buyers.',
      'The device will be available through Samsung\'s official website, Amazon India, and major retail stores across the country. Pre-bookings are expected to start from April 20th, with early bird discounts and exchange offers available.',
    ],
  },
  'future-of-mobile-technology': {
    title: 'Future Of Mobile Technology And Its Impact On Modern Family',
    date: '21st April 2022',
    category: 'Technology',
    emoji: '🚀',
    author: 'Dream Gadgets Team',
    content: [
      'We have come so far when it comes to mobile technology. The fast pace of growth in the technology sector is quite commendable. From heavy handsets to slim and portable smartphones, we have made it so far in this journey.',
      'Mobile technology has fundamentally changed how families communicate, share experiences, and manage their daily lives. Smartphones have become the central hub for everything — from banking and shopping to education and healthcare.',
      'The future of mobile technology promises even more integration with artificial intelligence, augmented reality, and the Internet of Things (IoT). We can expect our devices to become even smarter, anticipating our needs and automating routine tasks.',
      'However, with these advances come challenges. Digital wellness, screen time management, and data privacy are becoming increasingly important considerations for modern families. At Dream Gadgets, we believe in using technology responsibly and helping our customers make informed choices.',
      'As we look ahead, refurbished and pre-owned devices will play a crucial role in making technology accessible to more families while reducing e-waste. It\'s a win-win for both consumers and the environment.',
    ],
  },
  'contribute-used-mobiles-school-children': {
    title: 'How To Contribute Used Mobiles To Poor School Children',
    date: '18th March 2022',
    category: 'Social',
    emoji: '🎓',
    author: 'Dream Gadgets Team',
    content: [
      'Smartphones have become a significant part of our life\'s functional values. However, it is unfortunate that not every individual who needs access to a smartphone has it.',
      'The digital divide in education has become more apparent than ever. Many school children in underserved communities lack access to smartphones, making it difficult for them to participate in online learning and access educational resources.',
      'If you have an old smartphone lying unused in your drawer, you can give it a second life by donating it to a child in need. Here are some ways you can contribute:',
      '1. Donate through certified recycling programs that refurbish devices and distribute them to students.\n2. Partner with local NGOs that run digital literacy programs.\n3. Use platforms like Dream Gadgets to sell your device and donate the proceeds to educational charities.\n4. Check with schools in your area — many have programs to accept device donations.',
      'Before donating, make sure to:\n• Perform a factory reset to erase all personal data\n• Remove the SIM card and memory card\n• Include the charger if available\n• Ensure the battery is in good condition',
      'At Dream Gadgets, we support device donation initiatives and ensure that every device we handle is either given a second life or recycled responsibly. Together, we can bridge the digital divide and create opportunities for every child.',
    ],
  },
  'clear-app-data-cache-android': {
    title: 'How To Clear App Data and Cache on Android?',
    date: '14th June 2022',
    category: 'Tips',
    emoji: '🧹',
    author: 'Dream Gadgets Team',
    content: [
      'We use a smartphone daily for work as well as for personal and entertainment services. While performing such activities, your mobile phone might gather some cache that can slow it down if not cleared on time.',
      'Clearing app cache and data is one of the most effective ways to free up storage space and improve your phone\'s performance. Here\'s how you can do it on any Android device:',
      'Step 1: Open the Settings app on your Android device.\nStep 2: Tap on "Apps" or "Applications" (the name may vary depending on your device).\nStep 3: Select the app whose cache you want to clear.\nStep 4: Tap on "Storage & cache".\nStep 5: Tap on "Clear cache" to remove temporary files.\nStep 6: If the app is misbehaving, tap on "Clear storage" or "Clear data" to reset it completely.',
      'Note: Clearing data will remove all app settings, login information, and downloaded content. You will need to set up the app again from scratch. Only clear data if you\'re facing persistent issues with the app.',
      'For best results, we recommend clearing cache once every month. This keeps your device running smoothly without affecting your personal data or settings.',
      'If your phone is still running slow after clearing cache, it might be time for an upgrade. Check out our collection of certified refurbished phones at Dream Gadgets.',
    ],
  },
  'make-android-run-faster': {
    title: 'Tips And Tricks to Make Your Android Run Faster',
    date: '2nd April 2022',
    category: 'Tips',
    emoji: '⚡',
    author: 'Dream Gadgets Team',
    content: [
      'It\'s no big deal when Android users complain about their smartphones running slowly. There might be several reasons why the Android smartphone doesn\'t run smooth. Here are some tips to fix it.',
      '1. Restart Your Phone Regularly\nA simple restart can clear temporary files and free up memory. Make it a habit to restart your phone at least once a week.',
      '2. Update Your Software\nManufacturers regularly release software updates that include performance improvements and bug fixes. Always keep your device updated to the latest version.',
      '3. Uninstall Unused Apps\nApps you don\'t use take up storage space and may run background processes. Go through your app list and uninstall anything you haven\'t used in the last month.',
      '4. Disable Animations\nDeveloper options allow you to reduce or turn off window animations, which can make your phone feel significantly faster.',
      '5. Use Lite Versions of Apps\nMany popular apps like Facebook, Twitter, and Messenger have "Lite" versions that use fewer resources and run better on older devices.',
      '6. Clear Cache Regularly\nAs mentioned in our previous article, clearing app cache can free up significant storage space and improve performance.',
      'If you\'ve tried all these tips and your phone is still slow, it might be time for an upgrade. Visit Dream Gadgets to explore our range of certified refurbished smartphones at great prices.',
    ],
  },
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = POSTS[params.slug];
  if (!post) return { title: 'Post Not Found — Dream Gadgets' };
  return {
    title: `${post.title} — Dream Gadgets Blog`,
    description: post.content[0]?.slice(0, 160) || 'Read more on Dream Gadgets Blog',
  };
}

const CATEGORY_COLORS: Record<string, string> = {
  News: 'bg-red-100 text-red-700',
  Technology: 'bg-blue-100 text-blue-700',
  Social: 'bg-green-100 text-green-700',
  Tips: 'bg-amber-100 text-amber-700',
};

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = POSTS[params.slug];
  if (!post) notFound();

  const url = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://dreamgadgets.in'}/blog/${params.slug}`;

  const relatedPosts = Object.entries(POSTS)
    .filter(([s]) => s !== params.slug)
    .slice(0, 3);

  return (
    <main>
      {/* Hero */}
      <section className="text-white py-16 px-4 text-center relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #0F0F10 0%, #1A1A1A 50%, #0F0F10 100%)'
      }}>
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-3xl mx-auto">
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${CATEGORY_COLORS[post.category] ?? 'bg-gray-100 text-gray-700'}`}>
            {post.category}
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold mt-4 mb-3 leading-tight">{post.title}</h1>
          <p className="text-white/60 text-sm">
            By {post.author} · {post.date}
          </p>
        </div>
      </section>

      {/* Content */}
      <article className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-6xl text-center mb-8">{post.emoji}</div>
        <div className="prose prose-gray max-w-none space-y-5">
          {post.content.map((paragraph, i) => (
            <p key={i} className="text-gray-600 leading-relaxed text-base whitespace-pre-line">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Share */}
        <div className="mt-10 pt-8 border-t border-gray-100">
          <p className="text-sm font-semibold text-gray-900 mb-3">Share this article</p>
          <div className="flex gap-2">
            {[
              { label: 'Twitter', href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(url)}` },
              { label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
              { label: 'WhatsApp', href: `https://wa.me/?text=${encodeURIComponent(`${post.title} - ${url}`)}` },
            ].map(s => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:text-gray-900 transition-all"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between items-center">
          <Link href="/blog" className="text-sm text-primary hover:underline flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Blog
          </Link>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Related Articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedPosts.map(([slug, p]) => (
                <Link
                  key={slug}
                  href={`/blog/${slug}`}
                  className="bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-md hover:-translate-y-0.5 transition-all card-hover-red"
                >
                  <span className="text-2xl mb-2 block">{p.emoji}</span>
                  <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1 line-clamp-2">{p.title}</h3>
                  <p className="text-xs text-gray-400">{p.date}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </main>
  );
}
