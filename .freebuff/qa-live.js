// Live-site QA runner — drives https://dreamgadgets.in exactly like a browser
// (UA, Origin, cookies, redirects). No localhost involved.
const BASE = 'https://dreamgadgets.in';
const API = `${BASE}/api/v1`;
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

const checks = [];
function check(name, ok, detail) {
  checks.push({ name, ok: !!ok, detail: detail || '' });
}

async function req(path, { method = 'GET', body, headers = {}, origin = BASE } = {}) {
  const h = {
    'User-Agent': UA,
    Accept: 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-IN,en;q=0.9',
    ...headers,
  };
  if (origin) h.Origin = origin;
  if (body !== undefined) h['Content-Type'] = 'application/json';
  const r = await fetch(path.startsWith('http') ? path : BASE + path, {
    method,
    headers: h,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    redirect: 'follow',
  });
  const text = await r.text();
  return { status: r.status, headers: r.headers, text, url: r.url };
}

const strip = (s, n = 300) => (s || '').replace(/\s+/g, ' ').trim().slice(0, n);
// API envelope is { status, data: <payload> } but some endpoints double-wrap { data: { data: ... } }
function unpack(j) {
  if (j && j.data && typeof j.data === 'object' && 'data' in j.data) return j.data.data;
  return j?.data ?? j;
}

// ─────────────────────────── PART A: CUSTOMER PAGES ───────────────────────────
const CUSTOMER_PAGES = [
  '/', '/products', '/sell', '/cart', '/checkout', '/login', '/register',
  '/reset-password', '/account', '/orders', '/stores',
  '/stores/main', '/stores/chetla', '/stores/jadavpur', '/stores/champahati',
  '/stores/barrack', '/stores/salt_lake', '/stores/howrah',
  '/about', '/faq', '/contact', '/terms', '/privacy', '/shipping', '/returns',
  '/cancellation', '/warranty', '/cookies', '/partner', '/blog',
];

async function customerPages() {
  for (const p of CUSTOMER_PAGES) {
    try {
      const r = await req(p);
      const title = (r.text.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
      const errMarkers = /Application error|Internal Server Error|Server Error|Unhandled|ReferenceError|TypeError:.*is not a function/.test(r.text);
      check(`PAGE ${p}`, r.status === 200 && title.length > 0 && !errMarkers,
        `status=${r.status} title="${strip(title, 60)}" bytes=${r.text.length} errMarker=${errMarkers}`);
    } catch (e) {
      check(`PAGE ${p}`, false, `fetch threw: ${e.message}`);
    }
  }
}

// ─────────────────────── PART B: DEEP CUSTOMER CHECKS ─────────────────────────
async function deepChecks() {
  // Home: main-branch placeholder address + branch list
  const home = await req('/');
  check('HOME main branch address is real (Kolkata, not placeholder)',
    !home.text.includes('123 Tech Street, Mumbai'),
    home.text.includes('123 Tech Street, Mumbai') ? 'Main branch shows "123 Tech Street, Mumbai" placeholder' : 'no placeholder found');
  const branchNames = ['Dream Gadgets — Main Branch', 'Chetla', 'Jadavpur', 'Champahati', 'Barrackpore', 'Salt Lake', 'Howrah'];
  const missingBranches = branchNames.filter((b) => !home.text.includes(b));
  check('HOME Our Branches shows all 7', missingBranches.length === 0, missingBranches.length ? `missing: ${missingBranches.join(', ')}` : 'all 7 present');

  // Products list: distinct names + pagination
  const prodPage = await req('/products');
  const prodApi = await req(`${API}/public/products?page=1&limit=24`);
  let names = [];
  let total = 0;
  try {
    const j = JSON.parse(prodApi.text);
    const data = unpack(j);
    const items = data?.items || (Array.isArray(data) ? data : []);
    total = data?.total ?? items.length;
    names = items.map((i) => i.item_name || i.name || i.productName || i.title || [i.brand, i.model, i.storage].filter(Boolean).join(' ') || '').filter(Boolean);
  } catch (e) {
    check('PRODUCTS api parse', false, `could not parse: ${strip(prodApi.text, 120)}`);
  }
  const distinct = new Set(names).size;
  check('PRODUCTS listing api 200 + parses', prodApi.status === 200 && names.length > 0, `status=${prodApi.status} total=${total} first24=${names.length} distinctNames=${distinct} sample=${strip(names[0], 40)}`);
  check('PRODUCTS page has pagination UI', /page=2|Load more|Load More|Next|›/.test(prodPage.text) && prodPage.text.includes('Showing'), 'searching HTML for page=2 / Load more / Next');
  // API page=2 works?
  const p2 = await req(`${API}/public/products?page=2&limit=24`);
  let p2ok = false;
  try { const j = JSON.parse(p2.text); const d = unpack(j); p2ok = ((d?.items || (Array.isArray(d) ? d : [])) || []).length > 0; } catch (e) {}
  check('PRODUCTS api page=2 returns items', p2ok && p2.status === 200, `status=${p2.status}`);

  // Product detail (SSR) for 3 real slugs + client-side fetch proof
  let slugs = [];
  try { const j = JSON.parse(prodApi.text); const d = unpack(j); slugs = ((d?.items || (Array.isArray(d) ? d : [])) || []).map((i) => i.id || i.slug); } catch (e) {}
  const uniqSlugs = [...new Set(slugs)].slice(0, 5);
  for (const s of uniqSlugs) {
    const r = await req(`/products/${s}`);
    const title = (r.text.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
    check(`PDP /products/${s.slice(0, 8)} SSR`, r.status === 200 && !r.text.includes('Product not found'),
      `status=${r.status} title="${strip(title, 50)}" notFoundInHTML=${r.text.includes('Product not found')}`);
    const client = await req(`${API}/public/products/${s}`);
    const acao = client.headers.get('access-control-allow-origin');
    check(`PDP client-fetch /public/products/${s.slice(0, 8)} (live origin)`, client.status === 200 && !!acao,
      `status=${client.status} ACAO=${acao} ${strip(client.text, 60)}`);
  }

  // Search
  const s1 = await req(`${API}/public/products?search=iphone`);
  let s1n = 0; let s1names = []; try { const d = unpack(JSON.parse(s1.text)); const arr = d?.items || (Array.isArray(d) ? d : []); s1n = arr.length; s1names = arr.slice(0, 6).map((i) => i.model || i.item_name || i.name); } catch (e) {}
  check('SEARCH "iphone" returns ONLY iPhone results', s1.status === 200 && s1n > 0 && s1names.every((n) => /iphone/i.test(String(n))), `status=${s1.status} results=${s1n} models=${s1names.join(',')}`);
  const s2 = await req(`${API}/public/products?search=zzzzqqq`);
  let s2n = -1; try { const d = unpack(JSON.parse(s2.text)); s2n = ((d?.items || (Array.isArray(d) ? d : [])) || []).length; } catch (e) {}
  check('SEARCH no-result query is clean 200/empty', s2.status === 200 && s2n === 0, `status=${s2.status} results=${s2n}`);
  const s3 = await req(`${API}/public/products?search=%22%3E%3Cscript%3E`);
  check('SEARCH special chars/XSS no 500', s3.status < 500, `status=${s3.status}`);

  // Buyback estimate
  const est = await req(`${API}/public/buyback/estimate-price`, {
    method: 'POST',
    body: { brand: 'Apple', modelName: 'iPhone 13', condition: 'Mint', screenCondition: 'Flawless', bodyCondition: 'Flawless', batteryHealth: '90' },
  });
  let estPrice = null; let estSrc = ''; try { const d = unpack(JSON.parse(est.text)); estPrice = d?.estimatedPrice ?? d?.price ?? null; estSrc = d?.dataSource || ''; } catch (e) {}
  check('BUYBACK estimate iPhone 13 → price', est.status === 200 && estPrice > 0, `status=${est.status} price=${estPrice} dataSource=${estSrc}`);
  const est2 = await req(`${API}/public/buyback/estimate-price`, { method: 'POST', body: { brand: 'Samsung', modelName: 'Galaxy S23 Ultra', condition: 'good' } });
  let est2Price = null; try { const d = unpack(JSON.parse(est2.text)); est2Price = d?.estimatedPrice ?? d?.price ?? null; } catch (e) {}
  check('BUYBACK estimate Galaxy S23 Ultra → price', est2.status === 200 && est2Price > 0, `status=${est2.status} price=${est2Price}`);
  const estBad = await req(`${API}/public/buyback/estimate-price`, { method: 'POST', body: { modelName: '' } });
  check('BUYBACK estimate empty model → 400 MODEL_REQUIRED', estBad.status === 400, `status=${estBad.status} ${strip(estBad.text, 80)}`);
  const estRand = await req(`${API}/public/buyback/estimate-price`, { method: 'POST', body: { brand: 'Apple', modelName: 'iPhone 99 Ultra 1TB' } });
  check('BUYBACK estimate unknown model graceful', estRand.status < 500, `status=${estRand.status} ${strip(estRand.text, 100)}`);

  // Stores: placeholder address on MAIN branch (data bug)
  const sm = await req('/stores/main');
  check('STORE /stores/main has real address (no Mumbai placeholder)', !sm.text.includes('123 Tech Street, Mumbai'), sm.text.includes('123 Tech Street, Mumbai') ? 'placeholder present' : 'clean');

  // CORS behavior — same as the live browser
  const corsLive = await req(`${API}/public/announcement`);
  const acaoLive = corsLive.headers.get('access-control-allow-origin');
  check('CORS live origin allowed (ACAO present)', corsLive.status === 200 && acaoLive, `status=${corsLive.status} ACAO=${acaoLive}`);
  const corsForeign = await req(`${API}/public/announcement`, { origin: 'http://localhost:3001' });
  check('CORS foreign origin rejected (documents preview limitation, NOT a site bug)', corsForeign.headers.get('access-control-allow-origin') === null, `ACAO=${corsForeign.headers.get('access-control-allow-origin')}`);

  // Blog
  const blog = await req('/blog');
  check('BLOG page renders content', blog.status === 200 && blog.text.length > 8000, `status=${blog.status} bytes=${blog.text.length}`);

  // The products page is server-rendered — the pagination must be in the HTML itself.
  const hasPage2 = /href="[^"]*page=2/.test(prodPage.text);
  const hasNext = /Next/.test(prodPage.text);
  check('PRODUCTS served HTML has working pagination links (page=2 + Next)', hasPage2 && hasNext, `page2=${hasPage2} next=${hasNext}`);
}

// ─────────────────────────── PART C: ADMIN SIDE ───────────────────────────────
async function adminSide() {
  // Wrong password (one attempt — lockout is 5)
  const bad = await req(`${API}/auth/login`, { method: 'POST', body: { identifier: 'owner@dreamgadgets.in', password: 'WrongPass123!' } });
  check('ADMIN login wrong creds → 401 (first click behaviour)', bad.status === 401, `status=${bad.status}`);

  const good = await req(`${API}/auth/login`, { method: 'POST', body: { identifier: 'owner@dreamgadgets.in', password: 'Test@1234' } });
  let token = null; let user = null;
  try { const j = JSON.parse(good.text); token = j?.data?.accessToken || j?.accessToken; user = j?.data?.user?.role || j?.user?.role; } catch (e) {}
  check('ADMIN login correct creds → 200 + token', good.status === 200 && !!token, `status=${good.status} role=${user}`);
  if (!token) return;
  const authH = { Authorization: `Bearer ${token}` };

  // Admin HTML pages
  const loginPage = await req('/admin/login');
  check('ADMIN /admin/login serves app HTML', loginPage.status === 200 && loginPage.text.includes('Dream'), `status=${loginPage.status} bytes=${loginPage.text.length}`);
  const dashPage = await req('/admin/dashboard');
  check('ADMIN /admin/dashboard (no cookie) redirects to login', dashPage.status === 200 && /login/.test(dashPage.url), `status=${dashPage.status} final=${dashPage.url}`);

  // Module endpoints (exact calls the UI makes)
  const modules = [
    ['reports/dashboard', '/reports/dashboard'],
    ['reports/weekly-sales', '/reports/weekly-sales'],
    ['reports/stock-by-condition', '/reports/stock-by-condition'],
    ['buyback/stats', '/buyback/stats'],
    ['inventory list', '/inventory?page=1&limit=20&search='],
    ['inventory/models', '/inventory/models'],
    ['inventory/brands', '/inventory/brands'],
    ['accessories list', '/accessories?page=1&limit=20&search='],
    ['purchases list', '/purchases?page=1&limit=20&search='],
    ['sales list', '/sales?page=1&limit=20&search='],
    ['orders list', '/orders?page=1&limit=20&search='],
    ['clients list', '/clients?page=1&limit=20&search='],
    ['buyback leads', '/buyback/leads?page=1&limit=20&search='],
    ['admin refunds', '/admin/refunds'],
    ['price guide', '/exchanges/price-guide'],
    ['price guide audits', '/exchanges/price-guide/audits?limit=25'],
    ['admin roles', '/admin/roles'],
    ['admin branches', '/admin/branches'],
    ['admin users list', '/admin/users?page=1&limit=20&search='],
    ['admin banners', '/admin/banners'],
    ['admin brand-heroes', '/admin/brand-heroes'],
    ['banner analytics', '/admin/banners/analytics'],
    ['admin notifications', '/admin/notifications?page=1&limit=20'],
    ['whatsapp conversations', '/whatsapp/conversations?page=1&limit=20'],
    ['whatsapp stats', '/whatsapp/stats'],
    ['whatsapp templates', '/whatsapp/templates?page=1&limit=20'],
    ['whatsapp campaigns', '/whatsapp/campaigns?page=1&limit=20'],
    ['coupons list', '/admin/coupons?page=1&limit=20&search='],
    ['emi providers', '/admin/emi/providers'],
    ['announcement bar settings', '/admin/settings/announcement_bar'],
    ['transfers list', '/transfers?page=1&limit=20&search='],
    ['gst branches', '/admin/branches'],
  ];
  for (const [label, path] of modules) {
    try {
      const r = await req(API + path, { headers: authH });
      const looksErr = r.status >= 500 || /"statusCode":5\d\d/.test(r.text);
      check(`ADMIN ${label}`, r.status < 400 && !looksErr, `status=${r.status} ${strip(r.text, 80)}`);
    } catch (e) {
      check(`ADMIN ${label}`, false, `threw ${e.message}`);
    }
  }

  // POS: create a test sale → void → verify inventory restored
  try {
    const inv = await req(`${API}/inventory?page=1&limit=30&search=`, { headers: authH });
    const items = JSON.parse(inv.text)?.data?.items || JSON.parse(inv.text)?.data || [];
    const avail = items.find((i) => (i.status || i.condition || 'available').toString().toLowerCase() === 'available') || items[0];
    const branches = await req(`${API}/admin/branches`, { headers: authH });
    const br = (JSON.parse(branches.text)?.data || JSON.parse(branches.text) || []).find((b) => (b.code || '').toUpperCase() === 'MAIN') || (JSON.parse(branches.text)?.data || JSON.parse(branches.text) || [])[0];
    if (!avail || !br) { check('ADMIN POS setup', false, 'no item/branch found'); return; }
    const itemId = avail.id;
    const price = typeof avail.price === 'number' ? avail.price : 1000;
    const create = await req(`${API}/sales`, {
      method: 'POST', headers: authH,
      body: { branchId: br.id, items: [{ itemId, unitPrice: price }], payments: [{ method: 'cash', amount: price }], notes: 'QA-BROWSER-TEST' },
    });
    let saleId = null; try { saleId = JSON.parse(create.text)?.data?.id; } catch (e) {}
    check('ADMIN POS create sale', create.status === 201 && !!saleId, `status=${create.status} saleId=${saleId}`);
    if (saleId) {
      const v = await req(`${API}/sales/${saleId}/void`, { method: 'POST', headers: authH });
      const vj = JSON.parse(v.text)?.data || {};
      check('ADMIN POS void sale', v.status === 200 && vj.isVoided === true, `status=${v.status} isVoided=${vj.isVoided}`);
      const back = await req(`${API}/inventory?page=1&limit=50&search=`, { headers: authH });
      let restored = null;
      try {
        const all = JSON.parse(back.text)?.data?.items || JSON.parse(back.text)?.data || [];
        const it = all.find((i) => i.id === itemId);
        restored = it ? (it.status || it.condition) : 'not-found';
      } catch (e) {}
      check('ADMIN POS inventory restored after void', restored === 'available', `item=${String(itemId).slice(0, 8)} status=${restored}`);
    }
  } catch (e) {
    check('ADMIN POS flow', false, `threw ${e.message}`);
  }
}

// ──────────────────────────────── RUN ─────────────────────────────────────────
(async () => {
  const t0 = Date.now();
  await customerPages();
  await deepChecks();
  await adminSide();

  const failures = checks.filter((c) => !c.ok);
  console.log(`\n=== ${checks.length - failures.length}/${checks.length} passed in ${((Date.now() - t0) / 1000).toFixed(1)}s ===\n`);
  for (const c of checks) {
    console.log(`${c.ok ? 'PASS' : 'FAIL'}  ${c.name}${c.detail ? '  →  ' + c.detail : ''}`);
  }
  if (failures.length) {
    console.log(`\n=== ${failures.length} FAILURES ===`);
  }
})();
