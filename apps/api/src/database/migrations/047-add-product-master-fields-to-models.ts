import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Product-master layer (Phase 1): brands + models already act as the shared
 * product master, so give models explicit master attributes:
 *
 *  - sku        — global product identifier (nullable: existing rows are
 *                 backfilled below; future inserts may set it explicitly).
 *                 UNIQUE — Postgres treats NULLs as distinct, so models without
 *                 a SKU never collide.
 *  - category   — product category (e.g. smartphone, tablet, laptop, audio).
 *                 Nullable with default 'smartphone' to fit the existing data.
 */
export class AddProductMasterFieldsToModels1759000000047 implements MigrationInterface {
  name = '047-add-product-master-fields-to-models-1759000000047';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── sku ──────────────────────────────────────────────────────────────────
    await queryRunner.query(`
      ALTER TABLE "models"
        ADD COLUMN "sku" VARCHAR(50)
    `);
    // Backfill a deterministic SKU from the slug (or name when slug is null),
    // prefixed to avoid clashing with accessories SKUs. Row-number suffix keeps
    // duplicates distinct so the UNIQUE index can always be created. The base
    // is truncated so 'MDL-' + base + '-N' always fits VARCHAR(50).
    await queryRunner.query(`
      WITH numbered AS (
        SELECT
          "id",
          COALESCE("slug", "name") AS sku_base,
          ROW_NUMBER() OVER (
            PARTITION BY COALESCE("slug", "name")
            ORDER BY "created_at", "id"
          ) AS rn,
          COUNT(*) OVER (PARTITION BY COALESCE("slug", "name")) AS total
        FROM "models"
      )
      UPDATE "models" m
      SET "sku" = 'MDL-' || LEFT(UPPER(REPLACE(n.sku_base, ' ', '-')), 40)
        || CASE WHEN n.total > 1 THEN '-' || n.rn::text ELSE '' END
      FROM numbered n
      WHERE m.id = n.id
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "idx_models_sku" ON "models"("sku") WHERE "sku" IS NOT NULL
    `);

    // ── category ─────────────────────────────────────────────────────────────
    await queryRunner.query(`
      ALTER TABLE "models"
        ADD COLUMN "category" VARCHAR(50) NOT NULL DEFAULT 'smartphone'
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_models_category" ON "models"("category")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_models_category"`);
    await queryRunner.query(`ALTER TABLE "models" DROP COLUMN IF EXISTS "category"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_models_sku"`);
    await queryRunner.query(`ALTER TABLE "models" DROP COLUMN IF EXISTS "sku"`);
  }
}
