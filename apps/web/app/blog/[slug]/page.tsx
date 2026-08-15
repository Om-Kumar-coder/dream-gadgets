import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { JsonLd } from '../../../components/seo/JsonLd';
import { BreadcrumbJsonLd } from '../../../components/seo/BreadcrumbJsonLd';
import { blogPostingSchema } from '../../../lib/seo/schemas';

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
      'With 5G connectivity becoming more widespread in India, Samsung is positioning this device as a future-proof option for consumers looking to upgrade to 5G without breaking the bank.',
      'The device will be available through Samsung\'s official website, Amazon India, and major retail stores across the country.',
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
      'The future of mobile technology promises even more integration with artificial intelligence, augmented reality, and the Internet of Things (IoT).',
      'As we look ahead, refurbished and pre-owned devices will play a crucial role in making technology accessible to more families while reducing e-waste.',
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
      'The digital divide in education has become more apparent than ever. Many school children in underserved communities lack access to smartphones, making it difficult for them to participate in online learning.',
      'If you have an old smartphone lying unused in your drawer, you can give it a second life by donating it to a child in need.',
      'Before donating, make sure to perform a factory reset, remove the SIM card and memory card, include the charger if available, and ensure the battery is in good condition.',
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
      'Clearing app cache and data is one of the most effective ways to free up storage space and improve your phone\'s performance.',
      'Step 1: Open the Settings app. Step 2: Tap on "Apps". Step 3: Select the app. Step 4: Tap on "Storage & cache". Step 5: Tap on "Clear cache".',
      'Note: Clearing data will remove all app settings, login information, and downloaded content. Only clear data if you\'re facing persistent issues.',
    ],
  },
  'make-android-run-faster': {
    title: 'Tips And Tricks to Make Your Android Run Faster',
    date: '2nd April 2022',
    category: 'Tips',
    emoji: '⚡',
    author: 'Dream Gadgets Team',
    content: [
      'It\'s no big deal when Android users complain about their smartphones running slowly. There might be several reasons why the Android smartphone doesn\'t run smooth.',
      '1. Restart Your Phone Regularly. 2. Update Your Software. 3. Uninstall Unused Apps. 4. Disable Animations. 5. Use Lite Versions of Apps. 6. Clear Cache Regularly.',
      'If you\'ve tried all these tips and your phone is still slow, it might be time for an upgrade.',
    ],
  },
  'iphone-battery-health-tips': {
    title: 'How To Maintain iPhone Battery Health — 7 Essential Tips',
    date: '10th January 2025',
    category: 'Tips',
    emoji: '🔋',
    author: 'Dream Gadgets Team',
    content: [
      'Your iPhone battery is a consumable component that naturally degrades over time. But with the right habits, you can slow that degradation and keep your battery health above 90% for much longer.',
      '1. Avoid extreme temperatures — heat is the biggest battery killer. Don\'t leave your iPhone in a parked car or under direct sunlight, and remove thick cases while charging if the phone gets warm.',
      '2. Keep charge between 20% and 80% — deep discharges and charging to 100% constantly stress the chemistry. Top up in short bursts during the day instead.',
      '3. Use the 80% charge limit — on iPhone 15 and later, enable the charge limit in Settings → Battery → Charging to stop charging at 80%.',
      '4. Turn off background app refresh for apps you rarely use — Settings → General → Background App Refresh.',
      '5. Lower screen brightness or use auto-brightness — the display is the largest battery consumer.',
      '6. Use Wi-Fi instead of cellular data when possible, and enable Low Power Mode when your battery is below 50%.',
      '7. Use an MFi-certified charger and cable — cheap, uncertified chargers can deliver unstable voltage that damages battery health over time.',
      'When checking a pre-owned iPhone at Dream Gadgets, we always verify battery health is 85% or higher and share the exact percentage with you before you buy.',
    ],
  },
  'best-refurbished-phones-2025': {
    title: 'Top 5 Best Refurbished Phones To Buy In 2025',
    date: '5th January 2025',
    category: 'Technology',
    emoji: '🏆',
    author: 'Dream Gadgets Team',
    content: [
      'Looking for a great deal on a refurbished phone in 2025? We have tested dozens of devices and narrowed down the top 5 picks across every budget — all available at Dream Gadgets with a 6-month warranty.',
      '1. Apple iPhone 13 — still one of the best all-rounders. Great cameras, excellent battery, and years of iOS updates left. Expect prices around ₹30,000–₹38,000 for a mint unit.',
      '2. Samsung Galaxy S23 Ultra — the ultimate Android flagship. The 200MP camera and S Pen make it a productivity powerhouse at nearly half its launch price.',
      '3. OnePlus 12 — flagship performance, a gorgeous display, and warp-speed charging. The best value flagship for power users.',
      '4. Google Pixel 7 — the best camera in its price range and guaranteed Android updates straight from Google. Pure Android at its finest.',
      '5. Realme 11 Pro+ — the budget king. A 200MP camera and curved AMOLED display at a price that makes new mid-range phones look overpriced.',
      'Every refurbished phone at Dream Gadgets passes a 20-point inspection, ships free with a 7-day return window, and includes a 6-month warranty on parts and labour.',
    ],
  },
  'sell-phone-safely-guide': {
    title: 'How To Safely Sell Your Phone Online — Complete Guide',
    date: '28th December 2024',
    category: 'Guides',
    emoji: '🛡️',
    author: 'Dream Gadgets Team',
    content: [
      'Selling your old phone can be nerve-wracking. From data security to getting the best price, follow our complete guide to sell safely and stress-free.',
      'Step 1 — Back up everything. Sync your photos, contacts, and WhatsApp chats to iCloud or Google Drive before doing anything else.',
      'Step 2 — Sign out of every account. Remove your Apple ID / Google account, disable Find My iPhone / Find My Device, and deactivate any screen-lock PIN, pattern, or fingerprint.',
      'Step 3 — Factory reset the device. This wipes all personal data and restores the phone to out-of-the-box condition.',
      'Step 4 — Remove the SIM and memory card. Keep your number active by moving the SIM to your new phone.',
      'Step 5 — Clean and photograph the device honestly. Real photos of any scratches or dents build trust and get you a faster, fairer quote.',
      'Step 6 — Choose a buyer you trust. Sell to a verified store that inspects devices transparently in front of you, pays on the spot, and offers a written confirmation.',
      'At Dream Gadgets, our team inspects your phone with you, confirms the price upfront, and pays instantly — cash or UPI — so you never lose sight of your device.',
    ],
  },
  'refurbished-vs-new-phone': {
    title: 'Refurbished vs New Phone: Which Should You Buy In 2025?',
    date: '15th December 2024',
    category: 'Guides',
    emoji: '⚖️',
    author: 'Dream Gadgets Team',
    content: [
      'The debate between buying refurbished vs new continues. We break down the pros and cons of each option so you can decide what\'s right for your pocket.',
      'Price: This is where refurbished wins hands-down. A certified refurbished flagship typically costs 40–60% less than the same phone new — often the difference between a mid-range and a flagship experience.',
      'Condition: A certified refurbished phone is inspected, tested, and graded. Buy from a store that shares the actual condition, battery health, and photos, and the risk is minimal.',
      'Warranty: New phones come with a full manufacturer warranty. A good refurbisher matches this with its own warranty — at Dream Gadgets every phone includes 6 months of warranty cover.',
      'Environmental impact: Choosing refurbished keeps perfectly good devices out of landfills and avoids the huge carbon cost of manufacturing a new phone.',
      'The verdict: If you want the latest model with a full manufacturer warranty, buy new. If you want flagship performance at a mid-range price and are happy with a slight age on the model, certified refurbished is the smarter buy.',
    ],
  },
  '5g-india-2025': {
    title: '5G In India: What You Need To Know In 2025',
    date: '1st December 2024',
    category: 'News',
    emoji: '📶',
    author: 'Dream Gadgets Team',
    content: [
      '5G has finally arrived in India at scale. Here is everything you need to know about 5G coverage, compatible devices, and whether it\'s worth upgrading for.',
      'Coverage: Jio, Airtel, and Vi have rolled out 5G across most major cities and are rapidly expanding into tier-2 and tier-3 towns. By the end of 2025, 5G is expected to cover the majority of urban India.',
      'What 5G actually changes: Faster downloads, smoother video streaming, and lower latency for gaming and video calls. For most everyday use, the difference is noticeable but not dramatic — 4G remains perfectly usable.',
      'Do you need a new phone for 5G? Yes — 5G requires a 5G-capable phone. The good news: virtually every phone launched in the last two years supports 5G, and certified refurbished 5G phones start well under ₹15,000.',
      'Battery consideration: 5G can drain battery faster, especially when the signal is weak. Modern phones handle this well with power-saving modes, but it\'s worth enabling battery saver on days you\'re on the move.',
      'Our advice: If you\'re already buying a new or refurbished phone, make sure it supports 5G so you\'re future-proof. Every 5G phone at Dream Gadgets is clearly labelled and quality-checked for both 4G and 5G bands.',
    ],
  },
  'phone-trade-in-tips': {
    title: 'Phone Trade-In Tips: How To Get The Maximum Value',
    date: '20th November 2024',
    category: 'Guides',
    emoji: '💰',
    author: 'Dream Gadgets Team',
    content: [
      'Getting ready to trade in your old phone? Follow these tips to maximize your trade-in value — most sellers leave money on the table without knowing it.',
      '1. Trade in before it\'s too late: Phone values drop every month. A phone that fetches ₹35,000 today might fetch ₹28,000 in six months. Sell while the demand is high.',
      '2. Keep the box and accessories: Original box, charger, and cable add genuine value — some buyers pay up to 10% more for a complete kit.',
      '3. Clean it properly: A gentle wipe with a microfibre cloth removes dust and smudges that can make a phone look worse than it is. Don\'t use harsh chemicals.',
      '4. Be honest about condition: Accurate self-assessment — including scratches and battery health — gets you a fair price faster and avoids surprises at inspection.',
      '5. Remove your accounts before inspection: This signals you\'re ready to sell and speeds up the whole process at the store.',
      '6. Compare quotes: A transparent seller will show you the exact price breakdown. At Dream Gadgets we estimate your price online in 30 seconds, confirm it at the store, and pay instantly.',
    ],
  },
  'reduce-e-waste-home': {
    title: '10 Easy Ways To Reduce E-Waste At Home',
    date: '10th November 2024',
    category: 'Social',
    emoji: '🌱',
    author: 'Dream Gadgets Team',
    content: [
      'Electronic waste is one of the fastest-growing waste streams in the world. Here are 10 practical ways you can reduce it, starting today.',
      '1. Repair instead of replace — a new battery or screen can give a phone years of extra life at a fraction of the cost of a new device.',
      '2. Sell or trade in old phones — a phone gathering dust in a drawer is waste waiting to happen. Sell it for cash so it gets a second life.',
      '3. Buy refurbished — choosing certified pre-owned devices reduces the demand for new manufacturing and keeps working phones in circulation.',
      '4. Recycle through certified channels — never throw electronics in the regular trash bin.',
      '5. Remove batteries before disposal where possible, and tape down connectors on devices you recycle for safety.',
      '6. Donate working devices to schools, NGOs, or family members who need them.',
      '7. Use your phone longer — modern phones are supported with updates for 4–7 years. One extra year of use per phone dramatically cuts e-waste.',
      '8. Avoid unnecessary upgrades — ask yourself whether the new model actually changes your daily experience.',
      '9. Buy accessories that last — a quality case and screen protector prevent the drops that turn a working phone into e-waste.',
      '10. Choose a seller that refurbishes responsibly — every phone Dream Gadgets buys is inspected, refurbished, and resold with warranty, and genuinely unrecoverable devices are sent to certified recyclers.',
    ],
  },
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = POSTS[params.slug];
  if (!post) return { title: 'Post Not Found — Dream Gadgets' };
  return {
    title: `${post.title} — Dream Gadgets Blog`,
    description: post.content[0]?.slice(0, 160) || 'Read more on Dream Gadgets Blog',
    openGraph: {
      title: `${post.title} — Dream Gadgets Blog`,
      description: post.content[0]?.slice(0, 160) || '',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} — Dream Gadgets Blog`,
      description: post.content[0]?.slice(0, 120) || '',
    },
  };
}

const CATEGORY_COLORS: Record<string, string> = {
  News: 'badge-primary',
  Technology: 'badge-info',
  Social: 'badge-success',
  Tips: 'badge-warning',
  Guides: 'badge-purple',
};

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = POSTS[params.slug];
  if (!post) notFound();

  const url = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://dreamgadgets.in'}/blog/${params.slug}`;

  const relatedPosts = Object.entries(POSTS)
    .filter(([s]) => s !== params.slug)
    .slice(0, 3);

  const blogSchema = blogPostingSchema({
    title: post.title,
    description: post.content[0]?.slice(0, 160) || '',
    datePublished: post.date,
    author: post.author,
    url,
  });

  return (
    <main className="animate-fade-in">
      <BreadcrumbJsonLd items={[
        { name: 'Home', url: '/' },
        { name: 'Blog', url: '/blog' },
        { name: post.title, url: `/blog/${params.slug}` },
      ]} />
      <JsonLd data={blogSchema} />
      {/* Hero */}
      <section className="text-white py-16 px-4 text-center relative overflow-hidden bg-gradient-hero">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-3xl mx-auto">
          <span className={`badge mb-3 ${CATEGORY_COLORS[post.category] ?? ''}`}>
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
            <p key={i} className="text-surface-600 leading-relaxed text-base whitespace-pre-line">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Share */}
        <div className="divider mt-10 pt-8">
          <p className="text-sm font-semibold text-surface-900 mb-3">Share this article</p>
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
                className="btn-outline btn-sm"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>

        {/* Back link */}
        <div className="mt-8">
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
            <h2 className="heading-sm text-surface-900 mb-4">Related Articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedPosts.map(([slug, p]) => (
                <Link
                  key={slug}
                  href={`/blog/${slug}`}
                  className="card p-4 hover:shadow-card-hover hover:-translate-y-0.5 transition-all"
                >
                  <span className="text-2xl mb-2 block">{p.emoji}</span>
                  <h3 className="font-bold text-surface-900 text-sm leading-snug mb-1 line-clamp-2">{p.title}</h3>
                  <p className="text-xs text-surface-400">{p.date}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </main>
  );
}
