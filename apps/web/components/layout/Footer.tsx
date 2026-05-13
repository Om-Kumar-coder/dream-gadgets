import Link from 'next/link';
import { Smartphone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#0A0A0A] border-t border-[#2a2a2a] mt-16">
      <div className="max-w-7xl mx-auto px-4 pt-14 pb-8">

        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#FF2D2D] rounded-lg flex items-center justify-center">
                <Smartphone className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-white text-base">DreamGadgets</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              India's most transparent mobile selling platform. Certified used phones, doorstep pickup, instant payment.
            </p>
            <p className="text-xs text-gray-700">Mumbai, Maharashtra</p>
            <a href="mailto:support@dreamgadgets.in"
              className="text-xs text-gray-700 hover:text-[#00FF9C] transition-colors mt-1 block">
              support@dreamgadgets.in
            </a>
          </div>

          {[
            {
              title: 'Services',
              links: [
                { href: '/sell', label: 'Sell Phone' },
                { href: '/sell?type=tablet', label: 'Sell Tablet' },
                { href: '/sell?type=laptop', label: 'Sell Laptop' },
                { href: '/sell?type=smartwatch', label: 'Sell Smartwatch' },
                { href: '/sell?type=gaming', label: 'Sell Gaming Console' },
              ],
            },
            {
              title: 'About',
              links: [
                { href: '/about', label: 'About Us' },
                { href: '/blog', label: 'Blogs' },
                { href: '/stores', label: 'Our Stores' },
                { href: '/partner', label: 'Become Partner' },
              ],
            },
            {
              title: 'Help Center',
              links: [
                { href: '/faq', label: 'FAQ' },
                { href: '/contact', label: 'Contact Us' },
                { href: '/orders', label: 'Track Order' },
                { href: '/returns', label: 'Return & Refund' },
              ],
            },
            {
              title: 'Law and Orders',
              links: [
                { href: '/terms', label: 'Terms of Use' },
                { href: '/terms', label: 'Terms & Conditions' },
                { href: '/privacy', label: 'Privacy Policy' },
                { href: '/cookies', label: 'Cookies Policy' },
              ],
            },
          ].map(({ title, links }) => (
            <div key={title}>
              <h4 className="text-white font-semibold mb-4 text-sm tracking-wide">{title}</h4>
              <ul className="space-y-2.5 text-sm">
                {links.map(({ href, label }) => (
                  <li key={label}>
                    <Link href={href} className="text-gray-600 hover:text-[#00FF9C] transition-colors duration-200">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Quick sell links */}
        <div className="border-t border-[#1a1a1a] pt-6 mb-6">
          <p className="text-xs text-gray-700 mb-3 font-semibold uppercase tracking-wider">Quick Links</p>
          <div className="flex flex-wrap gap-2">
            {['Apple', 'Samsung', 'OnePlus', 'Oppo', 'Vivo', 'Xiaomi', 'Motorola', 'Google', 'Nokia'].map(b => (
              <Link key={b} href={`/sell?brand=${b}`}
                className="text-xs text-gray-600 hover:text-[#00FF9C] border border-[#2a2a2a] hover:border-[#00FF9C] px-2.5 py-1 rounded-full transition-all duration-200">
                Sell Old {b} Mobile
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-[#1a1a1a] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-700">
          <p>© {new Date().getFullYear()} Dream Gadgets. All Rights Reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-[#00FF9C] rounded-full animate-pulse" />
              All systems operational
            </span>
            <Link href="/faq" className="hover:text-[#00FF9C] transition-colors">Do you have questions? Get Answers →</Link>
          </div>
        </div>

        <p className="text-xs text-gray-800 mt-4 text-center">
          All trademarks, logos, and brand names are the property of their respective owners. Brand names used here are for identification purposes only and do not imply ownership or endorsement.
        </p>
      </div>
    </footer>
  );
}
