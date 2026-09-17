import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Purchase-time GST split (intra vs inter-state).
 *
 * Adds supply-type + persisted CGST/SGST/IGST columns to "purchases" and a
 * "purchase_items" line-item table. Backfills legacy rows with a 50/50
 * CGST/SGST split (matching the historical report-time derivation for
 * unknown vendor state), then adds the header identity CHECK.
 */
export class PurchaseGstSplit1758000000043 implements MigrationInterface {
  name = 'PurchaseGstSplit1758000000043';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. New columns on "purchases"
    await queryRunner.query(`
      ALTER TABLE "purchases"
        ADD COLUMN "supply_type"        VARCHAR(10)   NOT NULL DEFAULT 'intra',
        ADD COLUMN "supply_type_source" VARCHAR(10)   NOT NULL DEFAULT 'derived',
        ADD COLUMN "vendor_gstin"       VARCHAR(15),
        ADD COLUMN "vendor_state_code"  VARCHAR(2),
        ADD COLUMN "place_of_supply"    VARCHAR(2),
        ADD COLUMN "is_reverse_charge"  BOOLEAN       NOT NULL DEFAULT false,
        ADD COLUMN "is_itc_eligible"    BOOLEAN       NOT NULL DEFAULT true,
        ADD COLUMN "cgst_amount"        DECIMAL(12,2) NOT NULL DEFAULT 0,
        ADD COLUMN "sgst_amount"        DECIMAL(12,2) NOT NULL DEFAULT 0,
        ADD COLUMN "igst_amount"        DECIMAL(12,2) NOT NULL DEFAULT 0
    `);

    // 2. Line items table
    await queryRunner.query(`
      CREATE TABLE "purchase_items" (
        "id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "purchase_id"   UUID NOT NULL REFERENCES "purchases"("id") ON DELETE CASCADE,
        "item_id"       UUID REFERENCES "inventory_items"("id"),
        "description"   VARCHAR(300) NOT NULL,
        "hsn_code"      VARCHAR(10),
        "quantity"      DECIMAL(12,3) NOT NULL DEFAULT 1,
        "unit_price"    DECIMAL(12,2) NOT NULL DEFAULT 0,
        "tax_rate"      DECIMAL(5,2)  NOT NULL DEFAULT 0,
        "taxable_value" DECIMAL(12,2) NOT NULL DEFAULT 0,
        "cgst_amount"   DECIMAL(12,2) NOT NULL DEFAULT 0,
        "sgst_amount"   DECIMAL(12,2) NOT NULL DEFAULT 0,
        "igst_amount"   DECIMAL(12,2) NOT NULL DEFAULT 0,
        "tax_amount"    DECIMAL(12,2) NOT NULL DEFAULT 0,
        "line_total"    DECIMAL(12,2) NOT NULL DEFAULT 0,
        "created_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_purchase_items_purchase" ON "purchase_items"("purchase_id")`);
    await queryRunner.query(`CREATE INDEX "idx_purchase_items_item" ON "purchase_items"("item_id")`);

    // 3. Backfill: legacy rows have no vendor state — split 50/50 CGST/SGST,
    //    matching gst.service.computeTaxBreakup(_, _, isInterState=false) so
    //    reported buckets do not shift. Auditable via supply_type_source.
    await queryRunner.query(`
      UPDATE "purchases" SET
        "supply_type"        = 'intra',
        "supply_type_source" = 'derived',
        "cgst_amount"        = ROUND("tax_amount" / 2, 2),
        "sgst_amount"        = ROUND("tax_amount" / 2, 2),
        "igst_amount"        = 0
    `);

    // 4. Header identity: cgst + sgst + igst === tax_amount (after backfill)
    await queryRunner.query(`
      ALTER TABLE "purchases"
        ADD CONSTRAINT "chk_purchases_tax_split"
        CHECK (ROUND("cgst_amount" + "sgst_amount" + "igst_amount", 2) = ROUND("tax_amount", 2))
    `);
    await queryRunner.query(`
      ALTER TABLE "purchase_items"
        ADD CONSTRAINT "chk_purchase_items_tax_split"
        CHECK (ROUND("cgst_amount" + "sgst_amount" + "igst_amount", 2) = ROUND("tax_amount", 2))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "purchase_items" DROP CONSTRAINT IF EXISTS "chk_purchase_items_tax_split"`);
    await queryRunner.query(`ALTER TABLE "purchases" DROP CONSTRAINT IF EXISTS "chk_purchases_tax_split"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "purchase_items"`);
    await queryRunner.query(`
      ALTER TABLE "purchases"
        DROP COLUMN IF EXISTS "supply_type",
        DROP COLUMN IF EXISTS "supply_type_source",
        DROP COLUMN IF EXISTS "vendor_gstin",
        DROP COLUMN IF EXISTS "vendor_state_code",
        DROP COLUMN IF EXISTS "place_of_supply",
        DROP COLUMN IF EXISTS "is_reverse_charge",
        DROP COLUMN IF EXISTS "is_itc_eligible",
        DROP COLUMN IF EXISTS "cgst_amount",
        DROP COLUMN IF EXISTS "sgst_amount",
        DROP COLUMN IF EXISTS "igst_amount"
    `);
  }
}
