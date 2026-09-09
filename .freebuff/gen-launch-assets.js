/**
 * Generates launch-content image assets for the Dream Gadgets storefront:
 *   apps/web/public/banners/*.svg      — home hero slider, mid, offer, product
 *   apps/web/public/brand-hero/*.svg   — per-brand hero backgrounds
 *
 * All SVGs are self-contained (no external fonts/images) and share the
 * site's dark + brand-red design language. The UI overlays text on top.
 */
const fs = require('fs');
const path = require('path');

const WEB_PUBLIC = path.join(__dirname, '..', 'apps', 'web', 'public');
const BANNER_DIR = path.join(WEB_PUBLIC, 'banners');
const HERO_DIR = path.join(WEB_PUBLIC, 'brand-hero');
fs.mkdirSync(BANNER_DIR, { recursive: true });
fs.mkdirSync(HERO_DIR, { recursive: true });

const RED = '#E31E2B';
const DARK0 = '#0B0F19';
const DARK1 = '#111828';

/* ─── helpers ───────────────────────────────────────────────────────────── */

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** A stylised phone outline group. x/y = top-left of the phone. */
function phone(x, y, w, h, stroke, screenFill, accent = RED) {
  const rx = w * 0.12;
  const camR = Math.max(3, w * 0.02);
  return `
    <g transform="translate(${x},${y})">
      <rect width="${w}" height="${h}" rx="${rx}" fill="none" stroke="${stroke}" stroke-width="2"/>
      <rect x="${w * 0.07}" y="${h * 0.06}" width="${w * 0.86}" height="${h * 0.84}" rx="${rx * 0.7}" fill="${screenFill}" stroke="none"/>
      <circle cx="${w * 0.5}" cy="${h * 0.085}" r="${camR}" fill="${accent}" opacity="0.9"/>
      <rect x="${w * 0.32}" y="${h * 0.92}" width="${w * 0.36}" height="${h * 0.02}" rx="1" fill="${stroke}"/>
    </g>`;
}

function rings(cx, cy, r1, r2, stroke) {
  return `
    <circle cx="${cx}" cy="${cy}" r="${r1}" fill="none" stroke="${stroke}" stroke-width="1.5"/>
    <circle cx="${cx}" cy="${cy}" r="${r2}" fill="none" stroke="${stroke}" stroke-width="1"/>`;
}

function diagonalLines(w, h, stroke) {
  let lines = '';
  for (let x = -h; x < w; x += 56) {
    lines += `<line x1="${x}" y1="${h}" x2="${x + h}" y2="0" stroke="${stroke}" stroke-width="1"/>`;
  }
  return `<g opacity="0.5">${lines}</g>`;
}

function shell(w, h, glow, glowColor, extra = '') {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${DARK0}"/>
      <stop offset="1" stop-color="${DARK1}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.78" cy="0.72" r="0.75">
      <stop offset="0" stop-color="${glowColor}" stop-opacity="${glow}"/>
      <stop offset="1" stop-color="${glowColor}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <rect width="${w}" height="${h}" fill="url(#glow)"/>
  ${extra}
</svg>`;
}

/* ─── banners ───────────────────────────────────────────────────────────── */

function heroBanner(name, accent, variant) {
  const w = 1600, h = 600;
  const glowColor = variant === 'amber' ? '#F59E0B' : accent;
  let extra = `
    ${diagonalLines(w, h, 'rgba(255,255,255,0.025)')}
    <g opacity="0.5">${rings(w - 180, 120, 150, 230, 'rgba(255,255,255,0.05)')}</g>`;
  if (variant === 'brands') {
    // Stacked phone cards motif
    extra += `
      <g transform="rotate(-8 1150 300)">
        <rect x="980" y="150" width="380" height="80" rx="16" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" stroke-width="1.5"/>
        <rect x="1040" y="230" width="340" height="80" rx="16" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.10)" stroke-width="1.5"/>
        ${phone(1080, 310, 260, 200, 'rgba(255,255,255,0.22)', 'rgba(255,255,255,0.06)', glowColor)}
      </g>`;
  } else {
    extra += `
      <g transform="rotate(6 1120 300)">
        ${phone(1020, 150, 240, 320, 'rgba(255,255,255,0.20)', 'rgba(255,255,255,0.06)', glowColor)}
        ${phone(1330, 110, 200, 280, 'rgba(255,255,255,0.09)', 'rgba(255,255,255,0.03)', glowColor)}
      </g>`;
  }
  fs.writeFileSync(path.join(BANNER_DIR, `${name}.svg`), shell(w, h, 0.32, glowColor, extra));
}

function midBanner(name, accent) {
  const w = 800, h = 400;
  const extra = `
    ${diagonalLines(w, h, 'rgba(255,255,255,0.025)')}
    <g transform="rotate(6 600 200)">
      ${phone(520, 70, 170, 230, 'rgba(255,255,255,0.20)', 'rgba(255,255,255,0.06)', accent)}
    </g>`;
  fs.writeFileSync(path.join(BANNER_DIR, `${name}.svg`), shell(w, h, 0.35, accent, extra));
}

function offerBanner(name) {
  const w = 1400, h = 400;
  const extra = `
    <rect x="0" y="${h - 90}" width="${w}" height="90" fill="${RED}" opacity="0.22"/>
    <rect x="0" y="${h - 28}" width="${w}" height="28" fill="${RED}" opacity="0.45"/>
    ${diagonalLines(w, h, 'rgba(255,255,255,0.025)')}
    <g transform="rotate(-6 1150 200)">
      ${phone(1030, 90, 200, 260, 'rgba(255,255,255,0.22)', 'rgba(255,255,255,0.06)', RED)}
    </g>`;
  fs.writeFileSync(path.join(BANNER_DIR, `${name}.svg`), shell(w, h, 0.30, RED, extra));
}

/* Transparent phone product shot for the hero side card */
function productShot() {
  const s = 600;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <defs>
    <radialGradient id="pg" cx="0.5" cy="0.45" r="0.6">
      <stop offset="0" stop-color="${RED}" stop-opacity="0.5"/>
      <stop offset="1" stop-color="${RED}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <ellipse cx="300" cy="540" rx="170" ry="26" fill="rgba(0,0,0,0.25)"/>
  <circle cx="300" cy="300" r="240" fill="url(#pg)"/>
  ${phone(210, 90, 180, 360, 'rgba(20,28,46,0.85)', 'rgba(255,255,255,0.12)', RED)}
</svg>`;
  fs.writeFileSync(path.join(BANNER_DIR, 'phone-product.svg'), svg);
}

/* ─── brand heroes ──────────────────────────────────────────────────────── */

const BRAND_COLORS = {
  apple: '#A6ADB3',
  samsung: '#4480FF',
  oneplus: '#F5010C',
  oppo: '#00B46E',
  vivo: '#415FFF',
  realme: '#FFC20E',
  xiaomi: '#FF6900',
  motorola: '#5B6EE8',
  google: '#4285F4',
  nothing: '#D9D9D9',
  asus: '#2E8BFF',
  honor: '#3A4CE4',
  infinix: '#2FA8E0',
  iqoo: '#0057FF',
  nokia: '#2D5BE3',
  poco: '#FA6400',
  tecno: '#0C59E6',
};

function brandHero(slug, color) {
  const w = 1600, h = 500;
  const extra = `
    ${diagonalLines(w, h, 'rgba(255,255,255,0.02)')}
    <g opacity="0.55">${rings(w - 200, 120, 130, 210, 'rgba(255,255,255,0.05)')}</g>
    <g transform="rotate(5 1160 250)">
      ${phone(1060, 110, 210, 290, 'rgba(255,255,255,0.18)', 'rgba(255,255,255,0.05)', color)}
    </g>`;
  fs.writeFileSync(path.join(HERO_DIR, `${slug}.svg`), shell(w, h, 0.34, color, extra));
}

/* ─── generate everything ───────────────────────────────────────────────── */

heroBanner('hero-1', RED, 'default');
heroBanner('hero-2', RED, 'amber');
heroBanner('hero-3', RED, 'brands');
midBanner('mid-buy', RED);
midBanner('mid-sell', RED);
offerBanner('offer');
productShot();

for (const [slug, color] of Object.entries(BRAND_COLORS)) {
  brandHero(slug, color);
}

console.log('Generated:');
console.log('  banners/', fs.readdirSync(BANNER_DIR).join(', '));
console.log('  brand-hero/', fs.readdirSync(HERO_DIR).join(', '));
