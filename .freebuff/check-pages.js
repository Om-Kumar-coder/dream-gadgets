const https = require('https');

const HOST = 'dreamgadgets.in';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

function check(path) {
  return new Promise((resolve) => {
    const req = https.request(
      { hostname: HOST, path, method: 'GET', headers: { 'User-Agent': UA, Accept: 'text/html' }, timeout: 15000 },
      (res) => {
        let body = '';
        res.on('data', (d) => { body += d; if (body.length > 60000) req.destroy(); });
        res.on('end', () => resolve({ status: res.statusCode, finalUrl: res.url, loc: res.headers.location || '', body }));
      },
    );
    req.on('error', () => resolve({ status: 0, error: 'network' }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, error: 'timeout' }); });
    req.end();
  });
}

async function main() {
  const paths = [
    // core app routes
    '/', '/products', '/sell', '/cart', '/checkout', '/login', '/register', '/reset-password',
    '/account', '/account/edit', '/orders', '/stores', '/about', '/faq', '/contact', '/terms',
    '/privacy', '/shipping', '/returns', '/cancellation', '/warranty', '/cookies', '/partner', '/blog',
    // feature pages that may not exist
    '/buyback', '/wishlist', '/track-order', '/offers', '/deals', '/compare', '/notifications',
    // brand pages (17 in BRANDS + itel + lava which have brand images)
    ...['apple','samsung','oneplus','oppo','vivo','realme','xiaomi','motorola','google','nothing','asus','honor','infinix','iqoo','nokia','poco','tecno','itel','lava'].map(b => `/brands/${b}`),
    // store pages
    '/stores/main', '/stores/chetla', '/stores/jadavpur', '/stores/champahati', '/stores/barrack', '/stores/salt_lake', '/stores/howrah',
    // blog posts
    '/blog/samsung-galaxy-m53-5g-launch', '/blog/future-of-mobile-technology', '/blog/contribute-used-mobiles-school-children',
    '/blog/clear-app-data-cache-android', '/blog/make-android-run-faster', '/blog/iphone-battery-health-tips',
    '/blog/best-refurbished-phones-2025', '/blog/sell-phone-safely-guide', '/blog/refurbished-vs-new-phone',
    '/blog/5g-india-2025', '/blog/phone-trade-in-tips', '/blog/reduce-e-waste-home',
    // robots + misc
    '/robots.txt', '/sitemap.xml', '/404', '/admin',
  ];

  const results = [];
  for (const p of paths) {
    const r = await check(p);
    const isError = r.status === 0 || r.status >= 400;
    results.push({ p, ...r });
    if (isError) {
      console.log(`❌ ${r.status ?? 'ERR'} ${p}${r.error ? ` (${r.error})` : ''}`);
    }
  }
  const errors = results.filter(r => r.status === 0 || r.status >= 400);
  console.log(`\n${results.length - errors.length}/${results.length} OK; ${errors.length} problematic`);
}

main();
