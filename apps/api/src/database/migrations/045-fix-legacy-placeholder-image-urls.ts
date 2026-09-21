import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Rewrites legacy seed image URLs pointing at the dead external service
 * `via.placeholder.com` to the locally-served placeholder assets:
 *
 *   - brands.logo_url           → /images/placeholders/brand-<name>.svg
 *   - item_photos.url           → /images/placeholders/no-image.svg
 *   - inventory_items.images    → /images/placeholders/no-image.svg (per element)
 *
 * Only rows whose URL actually starts with `https://via.placeholder.com` are
 * touched — real uploaded image URLs (if any) are preserved. The migration is
 * idempotent: once rewritten, the WHERE clauses match nothing on re-run.
 *
 * The `down` migration is intentionally a no-op: the original URLs pointed at
 * an unresponsive external host and must not be restored.
 */
export class FixLegacyPlaceholderImageUrls1758000000045 implements MigrationInterface {
  name = '045-fix-legacy-placeholder-image-urls-1758000000045';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Brand logos — map each brand to its local SVG asset.
    await queryRunner.query(`
      UPDATE "brands"
      SET "logo_url" = '/images/placeholders/brand-' || lower("name") || '.svg'
      WHERE "logo_url" LIKE 'https://via.placeholder.com%'
    `);

    // 2. Item photos (normalized photo table).
    await queryRunner.query(`
      UPDATE "item_photos"
      SET "url" = '/images/placeholders/no-image.svg'
      WHERE "url" LIKE 'https://via.placeholder.com%'
    `);

    // 3. Inventory item images (jsonb array of URL strings). Rewrite only the
    // dead elements; keep all other entries in their original order.
    await queryRunner.query(`
      UPDATE "inventory_items"
      SET "images" = (
        SELECT COALESCE(
          jsonb_agg(
            CASE
              WHEN elem #>> '{}' LIKE 'https://via.placeholder.com%'
                THEN to_jsonb('/images/placeholders/no-image.svg'::text)
              ELSE elem
            END
          ),
          '[]'::jsonb
        )
        FROM jsonb_array_elements("images") AS elem
      )
      WHERE "images"::text LIKE '%https://via.placeholder.com%'
    `);
  }

  public async down(): Promise<void> {
    // Intentional no-op — see file header.
  }
}
