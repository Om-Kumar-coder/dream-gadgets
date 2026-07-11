import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { JsonLd } from '../../../components/seo/JsonLd';
import { BreadcrumbJsonLd } from '../../../components/seo/BreadcrumbJsonLd';
import { blogPostingSchema } from '../../../lib/seo/schemas';
const POSTS = {
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
};
export async function generateMetadata({ params }) {
    const post = POSTS[params.slug];
    if (!post)
        return { title: 'Post Not Found — Dream Gadgets' };
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
const CATEGORY_COLORS = {
    News: 'badge-primary',
    Technology: 'badge-info',
    Social: 'badge-success',
    Tips: 'badge-warning',
};
export default function BlogPostPage({ params }) {
    const post = POSTS[params.slug];
    if (!post)
        notFound();
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
    return (_jsxs("main", { className: "animate-fade-in", children: [_jsx(BreadcrumbJsonLd, { items: [
                    { name: 'Home', url: '/' },
                    { name: 'Blog', url: '/blog' },
                    { name: post.title, url: `/blog/${params.slug}` },
                ] }), _jsx(JsonLd, { data: blogSchema }), _jsxs("section", { className: "text-white py-16 px-4 text-center relative overflow-hidden bg-gradient-hero", children: [_jsx("div", { className: "absolute -top-16 -right-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" }), _jsxs("div", { className: "relative max-w-3xl mx-auto", children: [_jsx("span", { className: `badge mb-3 ${CATEGORY_COLORS[post.category] ?? ''}`, children: post.category }), _jsx("h1", { className: "text-3xl md:text-4xl font-extrabold mt-4 mb-3 leading-tight", children: post.title }), _jsxs("p", { className: "text-white/60 text-sm", children: ["By ", post.author, " \u00B7 ", post.date] })] })] }), _jsxs("article", { className: "max-w-3xl mx-auto px-4 py-12", children: [_jsx("div", { className: "text-6xl text-center mb-8", children: post.emoji }), _jsx("div", { className: "prose prose-gray max-w-none space-y-5", children: post.content.map((paragraph, i) => (_jsx("p", { className: "text-surface-600 leading-relaxed text-base whitespace-pre-line", children: paragraph }, i))) }), _jsxs("div", { className: "divider mt-10 pt-8", children: [_jsx("p", { className: "text-sm font-semibold text-surface-900 mb-3", children: "Share this article" }), _jsx("div", { className: "flex gap-2", children: [
                                    { label: 'Twitter', href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(url)}` },
                                    { label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
                                    { label: 'WhatsApp', href: `https://wa.me/?text=${encodeURIComponent(`${post.title} - ${url}`)}` },
                                ].map(s => (_jsx("a", { href: s.href, target: "_blank", rel: "noopener noreferrer", className: "btn-outline btn-sm", children: s.label }, s.label))) })] }), _jsx("div", { className: "mt-8", children: _jsxs(Link, { href: "/blog", className: "text-sm text-primary hover:underline flex items-center gap-1", children: [_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) }), "Back to Blog"] }) }), relatedPosts.length > 0 && (_jsxs("div", { className: "mt-12", children: [_jsx("h2", { className: "heading-sm text-surface-900 mb-4", children: "Related Articles" }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: relatedPosts.map(([slug, p]) => (_jsxs(Link, { href: `/blog/${slug}`, className: "card p-4 hover:shadow-card-hover hover:-translate-y-0.5 transition-all", children: [_jsx("span", { className: "text-2xl mb-2 block", children: p.emoji }), _jsx("h3", { className: "font-bold text-surface-900 text-sm leading-snug mb-1 line-clamp-2", children: p.title }), _jsx("p", { className: "text-xs text-surface-400", children: p.date })] }, slug))) })] }))] })] }));
}
//# sourceMappingURL=page.js.map