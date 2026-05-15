import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 pt-14 pb-8">

        {/* Main grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <img src="/Logo_Dream_Gadgets.png" alt="Dream Gadgets" className="h-9 w-auto rounded-md" />
            </div>
            <p className="text-sm leading-relaxed mb-4">
              India's most transparent mobile selling platform. Certified used phones, doorstep pickup, instant payment.
            </p>
            <p className="text-xs text-gray-500">Mumbai, Maharashtra</p>
            <p className="text-xs text-gray-500 mt-1">
              <a href="mailto:support@dreamgadgets.in" className="hover:text-white transition-colors">
                support@dreamgadgets.in
              </a>
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Services</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/sell" className="hover:text-white transition-colors">Sell Phone</Link></li>
              <li><Link href="/sell?type=tablet" className="hover:text-white transition-colors">Sell Tablet</Link></li>
              <li><Link href="/sell?type=laptop" className="hover:text-white transition-colors">Sell Laptop</Link></li>
              <li><Link href="/sell?type=smartwatch" className="hover:text-white transition-colors">Sell Smartwatch</Link></li>
              <li><Link href="/sell?type=gaming" className="hover:text-white transition-colors">Sell Gaming Console</Link></li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">About</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Blogs</Link></li>
              <li><Link href="/stores" className="hover:text-white transition-colors">Our Stores</Link></li>
              <li><Link href="/partner" className="hover:text-white transition-colors">Become Partner</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Help Center</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/orders" className="hover:text-white transition-colors">Track Order</Link></li>
              <li><Link href="/returns" className="hover:text-white transition-colors">Return & Refund</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Law and Orders</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Use</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/cookies" className="hover:text-white transition-colors">Cookies Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Quick sell links */}
        <div className="border-t border-gray-800 pt-6 mb-6">
          <p className="text-xs text-gray-500 mb-3 font-semibold uppercase tracking-wider">Quick Links</p>
          <div className="flex flex-wrap gap-2">
            {['Apple', 'Samsung', 'OnePlus', 'Oppo', 'Vivo', 'Xiaomi', 'Motorola', 'Google', 'Nokia'].map(b => (
              <Link key={b} href={`/sell?brand=${b}`}
                className="text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-2.5 py-1 rounded-full transition-colors">
                Sell Old {b} Mobile
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p>© {new Date().getFullYear()} Dream Gadgets. All Rights Reserved.</p>
          <div className="flex items-center gap-4 text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              All systems operational
            </span>
            <span>Do you have questions?</span>
            <Link href="/faq" className="hover:text-white transition-colors">Get Answers →</Link>
          </div>
        </div>

        <p className="text-xs text-gray-600 mt-4 text-center">
          All trademarks, logos, and brand names are the property of their respective owners. Brand names used here are for identification purposes only and do not imply ownership or endorsement.
        </p>
      </div>
    </footer>
  );
}
