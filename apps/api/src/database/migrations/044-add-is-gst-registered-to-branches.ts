import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds `branches.is_gst_registered` (boolean, NOT NULL, default false).
 *
 * Reconciles the `Branch` entity (`isGstRegistered`) with the database schema.
 * The column may already exist in some environments (created out-of-band);
 * every statement below is idempotent so the migration is safe to run in both
 * cases:
 *   - column missing        → created with NOT NULL + default false
 *   - column already exists → nulls are backfilled to false and the column is
 *                             normalized to NOT NULL DEFAULT false
 */
export class AddIsGstRegisteredToBranches1758000000044 implements MigrationInterface {
  name = '044-add-is-gst-registered-to-branches-1758000000044';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "branches"
        ADD COLUMN IF NOT EXISTS "is_gst_registered" BOOLEAN NOT NULL DEFAULT false
    `);

    // Normalize environments where the column pre-existed as nullable:
    // backfill any NULLs, then enforce NOT NULL and the default explicitly.
    await queryRunner.query(`
      UPDATE "branches" SET "is_gst_registered" = false WHERE "is_gst_registered" IS NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "branches"
        ALTER COLUMN "is_gst_registered" SET NOT NULL,
        ALTER COLUMN "is_gst_registered" SET DEFAULT false
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "branches" DROP COLUMN IF EXISTS "is_gst_registered"
    `);
  }
}
