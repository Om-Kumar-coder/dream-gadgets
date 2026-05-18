import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAccessoriesTable1700000000007 implements MigrationInterface {
  name = 'CreateAccessoriesTable1700000000007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "accessories" (
        "id"               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "sku"              VARCHAR(50) UNIQUE NOT NULL,
        "name"             VARCHAR(100) NOT NULL,
        "description"      TEXT,
        "brand_id"         UUID REFERENCES "brands"("id"),
        "model_id"         UUID REFERENCES "models"("id"),
        "category"         VARCHAR(50) NOT NULL,
        "purchase_price"   DECIMAL(12,2) NOT NULL,
        "selling_price"    DECIMAL(12,2),
        "wholesale_price"  DECIMAL(12,2),
        "stock_quantity"   SMALLINT NOT NULL DEFAULT 0,
        "reorder_level"    SMALLINT NOT NULL DEFAULT 10,
        "status"           VARCHAR(20) NOT NULL DEFAULT 'available',
        "is_online"        BOOLEAN NOT NULL DEFAULT false,
        "hsn_code"         VARCHAR(50),
        "tax_rate"         DECIMAL(5,2) NOT NULL DEFAULT 0,
        "notes"            TEXT,
        "branch_id"        UUID REFERENCES "branches"("id"),
        "created_by_id"    UUID REFERENCES "users"("id"),
        "specs"            JSONB,
        "photos"           JSONB,
        "created_at"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"       TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_accessories_sku" ON "accessories"("sku")`);
    await queryRunner.query(`CREATE INDEX "idx_accessories_category" ON "accessories"("category")`);
    await queryRunner.query(`CREATE INDEX "idx_accessories_status" ON "accessories"("status")`);
    await queryRunner.query(`CREATE INDEX "idx_accessories_branch" ON "accessories"("branch_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "accessories"`);
  }
}