import { MigrationInterface, QueryRunner } from 'typeorm';

// Launch content (2026-08-15) so the storefront doesn't run on fallbacks:
//  - content_banners for the home page (slider x3, middle x2, bottom x1, offer x1)
//    and the promotional placement used by brand pages (middle x1, offer x1)
//  - brand_hero:{slug} settings pointing at per-brand hero images
//
// The images are static SVGs served from the web app's public folder
// (https://dreamgadgets.in/banners/*.svg, /brand-hero/*.svg).
//
// Values are inlined as SQL literals (no bind parameters): the earlier
// INSERT..SELECT..WHERE NOT EXISTS variant hit Postgres "inconsistent types
// deduced for parameter $1" when a parameter was reused across contexts.
const SITE = 'https://dreamgadgets.in';

export class SeedLaunchContent1750000000037 implements MigrationInterface {
  name = 'SeedLaunchContent1750000000037';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Each banner: [title, subtitle, imageUrl, linkUrl, ctaText, pageType, position, sortOrder].
    // Titles use a literal newline so the hero slider renders two lines.
    const banners: Array<[string, string, string, string, string, string, string, number]> = [
      // ── Home hero slider ──
      ['Premium Phones\nBest Prices', 'Certified & Verified', `${SITE}/banners/hero-1.svg`, '/products', 'Shop Now', 'home', 'slider', 1],
      ['Sell Your Phone\nGet Paid Instantly', 'Instant Payment', `${SITE}/banners/hero-2.svg`, '/sell', 'Get Estimate', 'home', 'slider', 2],
      ['Shop Top Brands\nHuge Savings', 'All Brands In Stock', `${SITE}/banners/hero-3.svg`, '/products', 'Browse Brands', 'home', 'slider', 3],
      // ── Home middle banners ──
      ['Certified Pre-Owned Phones', 'Refurbished & Warranty', `${SITE}/banners/mid-buy.svg`, '/products', 'Shop Now', 'home', 'middle', 1],
      ['Sell Your Old Phone For Cash', 'Best Price Guaranteed', `${SITE}/banners/mid-sell.svg`, '/sell', 'Sell Now', 'home', 'middle', 2],
      // ── Home bottom (hero side card / "Just Sold") ──
      ['iPhone 13', 'Just Sold', `${SITE}/banners/phone-product.svg`, '/products', 'Shop Now', 'home', 'bottom', 1],
      // ── Home offer banner ──
      ['Festive Season Mega Sale', 'Limited Period Offer', `${SITE}/banners/offer.svg`, '/products?sort=discount', 'Grab The Deal', 'home', 'offer', 1],
      // ── Promotional (brand pages) ──
      ['Certified Pre-Owned Phones With Warranty', '20-Point Quality Check', `${SITE}/banners/mid-buy.svg`, '/products', 'Shop Now', 'promotional', 'middle', 1],
      ['Buy More, Save More', 'Exclusive Store Offers', `${SITE}/banners/offer.svg`, '/products?sort=discount', 'View Deals', 'promotional', 'offer', 1],
    ];

    for (const [title, subtitle, imageUrl, linkUrl, ctaText, pageType, position, sortOrder] of banners) {
      const sql =
        `INSERT INTO "content_banners"` +
        ` ("title","subtitle","image_url","mobile_image_url","link_url","cta_text",` +
        ` "page_type","position","device_type","sort_order","is_active","click_count")` +
        ` SELECT '${title.replace(/'/g, "''")}', '${subtitle.replace(/'/g, "''")}', '${imageUrl}', NULL,` +
        ` '${linkUrl}', '${ctaText}', '${pageType}', '${position}', 'all', ${sortOrder}, true, 0` +
        ` WHERE NOT EXISTS (` +
        `   SELECT 1 FROM "content_banners"` +
        `   WHERE "page_type" = '${pageType}' AND "position" = '${position}' AND "title" = '${title.replace(/'/g, "''")}'` +
        ` )`;
      await queryRunner.query(sql);
    }

    // ── Brand hero images ──
    const brands = [
      'apple', 'samsung', 'oneplus', 'oppo', 'vivo', 'realme', 'xiaomi',
      'motorola', 'google', 'nothing', 'asus', 'honor', 'infinix', 'iqoo',
      'nokia', 'poco', 'tecno',
    ];

    for (const slug of brands) {
      await queryRunner.query(
        `INSERT INTO "settings" ("key", "value", "description")` +
        ` VALUES ('brand_hero:${slug}', '{"imageUrl":"${SITE}/brand-hero/${slug}.svg"}'::jsonb, 'Brand hero image for ${slug}')` +
        ` ON CONFLICT ("key") DO UPDATE SET` +
        `   "value" = EXCLUDED."value",` +
        `   "description" = EXCLUDED."description"`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Launch content — not reverted.
  }
}
