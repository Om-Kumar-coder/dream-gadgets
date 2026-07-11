export class CreateInventoryTables1700000000002 {
    constructor() {
        this.name = 'CreateInventoryTables1700000000002';
    }
    async up(queryRunner) {
        // brands
        await queryRunner.query(`
      CREATE TABLE "brands" (
        "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "name"       VARCHAR(100) UNIQUE NOT NULL,
        "logo_url"   VARCHAR(500),
        "is_active"  BOOLEAN NOT NULL DEFAULT true,
        "sort_order" INT NOT NULL DEFAULT 0,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
        // models
        await queryRunner.query(`
      CREATE TABLE "models" (
        "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "brand_id"    UUID NOT NULL REFERENCES "brands"("id"),
        "name"        VARCHAR(200) NOT NULL,
        "slug"        VARCHAR(200) UNIQUE,
        "description" TEXT,
        "specs"       JSONB,
        "is_active"   BOOLEAN NOT NULL DEFAULT true,
        "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE("brand_id", "name")
      )
    `);
        await queryRunner.query(`CREATE INDEX "idx_models_brand" ON "models"("brand_id")`);
        await queryRunner.query(`CREATE INDEX "idx_models_slug"  ON "models"("slug")`);
        // purchases (needed as FK for inventory_items)
        await queryRunner.query(`
      CREATE TABLE "purchases" (
        "id"             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "invoice_number" VARCHAR(50) UNIQUE NOT NULL,
        "vendor_id"      UUID,
        "vendor_name"    VARCHAR(200),
        "branch_id"      UUID NOT NULL REFERENCES "branches"("id"),
        "total_amount"   DECIMAL(12,2) NOT NULL,
        "tax_amount"     DECIMAL(12,2) NOT NULL DEFAULT 0,
        "notes"          TEXT,
        "status"         VARCHAR(30) NOT NULL DEFAULT 'completed',
        "created_by"     UUID REFERENCES "users"("id"),
        "purchase_date"  DATE NOT NULL,
        "created_at"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"     TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
        await queryRunner.query(`CREATE INDEX "idx_purchases_branch"  ON "purchases"("branch_id")`);
        await queryRunner.query(`CREATE INDEX "idx_purchases_vendor"  ON "purchases"("vendor_id")`);
        await queryRunner.query(`CREATE INDEX "idx_purchases_date"    ON "purchases"("purchase_date")`);
        // inventory_items
        await queryRunner.query(`
      CREATE TABLE "inventory_items" (
        "id"                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "imei"              VARCHAR(15) UNIQUE NOT NULL,
        "imei2"             VARCHAR(15),
        "brand_id"          UUID NOT NULL REFERENCES "brands"("id"),
        "model_id"          UUID NOT NULL REFERENCES "models"("id"),
        "colour"            VARCHAR(100),
        "storage"           VARCHAR(20),
        "ram"               VARCHAR(20),
        "box_type"          VARCHAR(30) NOT NULL,
        "pku_code"          VARCHAR(100),
        "battery_health"    SMALLINT CHECK ("battery_health" BETWEEN 0 AND 100),
        "country_of_origin" VARCHAR(100),
        "hsn_code"          VARCHAR(20),
        "condition"         VARCHAR(30) NOT NULL,
        "item_name"         VARCHAR(300),
        "first_invoice_date" DATE,
        "purchase_price"    DECIMAL(12,2) NOT NULL,
        "wholesale_price"   DECIMAL(12,2),
        "box_price"         DECIMAL(12,2),
        "tax_rate"          DECIMAL(5,2) NOT NULL DEFAULT 0,
        "tax_amount"        DECIMAL(12,2) NOT NULL DEFAULT 0,
        "total_cost"        DECIMAL(12,2) NOT NULL,
        "selling_price"     DECIMAL(12,2),
        "online_price"      DECIMAL(12,2),
        "status"            VARCHAR(30) NOT NULL DEFAULT 'available',
        "is_online"         BOOLEAN NOT NULL DEFAULT false,
        "birthday_offer"    BOOLEAN NOT NULL DEFAULT false,
        "branch_id"         UUID NOT NULL REFERENCES "branches"("id"),
        "purchase_id"       UUID REFERENCES "purchases"("id"),
        "notes"             TEXT,
        "accessories"       JSONB,
        "warranty_status"   VARCHAR(50),
        "warranty_expiry"   DATE,
        "created_by"        UUID REFERENCES "users"("id"),
        "created_at"        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"        TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
        await queryRunner.query(`CREATE INDEX "idx_inventory_imei"      ON "inventory_items"("imei")`);
        await queryRunner.query(`CREATE INDEX "idx_inventory_status"    ON "inventory_items"("status")`);
        await queryRunner.query(`CREATE INDEX "idx_inventory_branch"    ON "inventory_items"("branch_id")`);
        await queryRunner.query(`CREATE INDEX "idx_inventory_model"     ON "inventory_items"("model_id")`);
        await queryRunner.query(`CREATE INDEX "idx_inventory_brand"     ON "inventory_items"("brand_id")`);
        await queryRunner.query(`CREATE INDEX "idx_inventory_condition" ON "inventory_items"("condition")`);
        await queryRunner.query(`CREATE INDEX "idx_inventory_is_online" ON "inventory_items"("is_online")`);
        // Full-text search index
        await queryRunner.query(`
      ALTER TABLE "inventory_items"
        ADD COLUMN "search_vector" TSVECTOR
          GENERATED ALWAYS AS (
            to_tsvector('english',
              COALESCE("item_name", '') || ' ' ||
              COALESCE("imei", '') || ' ' ||
              COALESCE("pku_code", '')
            )
          ) STORED
    `);
        await queryRunner.query(`CREATE INDEX "idx_inventory_fts" ON "inventory_items" USING GIN("search_vector")`);
        // item_photos
        await queryRunner.query(`
      CREATE TABLE "item_photos" (
        "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "item_id"    UUID NOT NULL REFERENCES "inventory_items"("id") ON DELETE CASCADE,
        "url"        VARCHAR(500) NOT NULL,
        "key"        VARCHAR(500) NOT NULL,
        "sort_order" INT NOT NULL DEFAULT 0,
        "is_primary" BOOLEAN NOT NULL DEFAULT false,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
        await queryRunner.query(`CREATE INDEX "idx_photos_item" ON "item_photos"("item_id")`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE IF EXISTS "item_photos"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "inventory_items"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "purchases"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "models"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "brands"`);
    }
}
//# sourceMappingURL=002-create-inventory-tables.js.map