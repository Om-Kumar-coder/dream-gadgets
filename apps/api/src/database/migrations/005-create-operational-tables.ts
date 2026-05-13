import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOperationalTables1700000000005 implements MigrationInterface {
  name = 'CreateOperationalTables1700000000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // online_order_items
    await queryRunner.query(`
      CREATE TABLE "online_order_items" (
        "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "order_id"    UUID NOT NULL REFERENCES "online_orders"("id") ON DELETE CASCADE,
        "item_id"     UUID REFERENCES "inventory_items"("id"),
        "imei"        VARCHAR(15) NOT NULL,
        "description" VARCHAR(500),
        "unit_price"  DECIMAL(12,2) NOT NULL,
        "tax_rate"    DECIMAL(5,2)  NOT NULL DEFAULT 0,
        "tax_amount"  DECIMAL(12,2) NOT NULL DEFAULT 0,
        "total"       DECIMAL(12,2) NOT NULL,
        "hsn_code"    VARCHAR(20)
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_order_items_order" ON "online_order_items"("order_id")`);

    // returns
    await queryRunner.query(`
      CREATE TABLE "returns" (
        "id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "return_number" VARCHAR(50) UNIQUE NOT NULL,
        "return_type"   VARCHAR(20) NOT NULL,
        "original_id"   UUID NOT NULL,
        "client_id"     UUID REFERENCES "clients"("id"),
        "reason"        TEXT NOT NULL,
        "refund_method" VARCHAR(50),
        "refund_amount" DECIMAL(12,2),
        "refund_status" VARCHAR(30) NOT NULL DEFAULT 'pending',
        "approved_by"   UUID REFERENCES "users"("id"),
        "created_by"    UUID REFERENCES "users"("id"),
        "created_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_returns_type"       ON "returns"("return_type")`);
    await queryRunner.query(`CREATE INDEX "idx_returns_original"   ON "returns"("original_id")`);
    await queryRunner.query(`CREATE INDEX "idx_returns_client"     ON "returns"("client_id")`);
    await queryRunner.query(`CREATE INDEX "idx_returns_created_at" ON "returns"("created_at")`);

    // return_items
    await queryRunner.query(`
      CREATE TABLE "return_items" (
        "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "return_id"   UUID NOT NULL REFERENCES "returns"("id") ON DELETE CASCADE,
        "item_id"     UUID REFERENCES "inventory_items"("id"),
        "imei"        VARCHAR(15) NOT NULL,
        "condition"   VARCHAR(30),
        "notes"       TEXT,
        "disposition" VARCHAR(30) NOT NULL DEFAULT 'available'
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_return_items_return" ON "return_items"("return_id")`);

    // notifications
    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id"    UUID REFERENCES "users"("id"),
        "client_id"  UUID REFERENCES "clients"("id"),
        "type"       VARCHAR(50) NOT NULL,
        "channel"    VARCHAR(20) NOT NULL,
        "subject"    VARCHAR(500),
        "body"       TEXT,
        "status"     VARCHAR(20) NOT NULL DEFAULT 'pending',
        "sent_at"    TIMESTAMPTZ,
        "error"      TEXT,
        "metadata"   JSONB,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_notifications_user"    ON "notifications"("user_id")`);
    await queryRunner.query(`CREATE INDEX "idx_notifications_client"  ON "notifications"("client_id")`);
    await queryRunner.query(`CREATE INDEX "idx_notifications_status"  ON "notifications"("status")`);
    await queryRunner.query(`CREATE INDEX "idx_notifications_created" ON "notifications"("created_at")`);

    // audit_logs
    await queryRunner.query(`
      CREATE TABLE "audit_logs" (
        "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id"     UUID REFERENCES "users"("id"),
        "action"      VARCHAR(100) NOT NULL,
        "entity_type" VARCHAR(100) NOT NULL,
        "entity_id"   UUID,
        "old_values"  JSONB,
        "new_values"  JSONB,
        "ip_address"  INET,
        "user_agent"  TEXT,
        "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_audit_entity"  ON "audit_logs"("entity_type", "entity_id")`);
    await queryRunner.query(`CREATE INDEX "idx_audit_user"    ON "audit_logs"("user_id")`);
    await queryRunner.query(`CREATE INDEX "idx_audit_created" ON "audit_logs"("created_at")`);

    // Partition audit_logs by month (range partitioning setup)
    // Note: actual partitions are created by the maintenance job; this sets up the parent table

    // settings
    await queryRunner.query(`
      CREATE TABLE "settings" (
        "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "key"         VARCHAR(200) UNIQUE NOT NULL,
        "value"       JSONB NOT NULL,
        "description" TEXT,
        "updated_by"  UUID REFERENCES "users"("id"),
        "updated_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // content_banners
    await queryRunner.query(`
      CREATE TABLE "content_banners" (
        "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "title"      VARCHAR(200) NOT NULL,
        "image_url"  VARCHAR(500) NOT NULL,
        "link_url"   VARCHAR(500),
        "sort_order" INT NOT NULL DEFAULT 0,
        "is_active"  BOOLEAN NOT NULL DEFAULT true,
        "starts_at"  TIMESTAMPTZ,
        "ends_at"    TIMESTAMPTZ,
        "created_by" UUID REFERENCES "users"("id"),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // content_pages (CMS)
    await queryRunner.query(`
      CREATE TABLE "content_pages" (
        "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "slug"        VARCHAR(200) UNIQUE NOT NULL,
        "title"       VARCHAR(300) NOT NULL,
        "content"     TEXT,
        "meta_title"  VARCHAR(300),
        "meta_desc"   VARCHAR(500),
        "is_active"   BOOLEAN NOT NULL DEFAULT true,
        "updated_by"  UUID REFERENCES "users"("id"),
        "updated_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // kyc_documents
    await queryRunner.query(`
      CREATE TABLE "kyc_documents" (
        "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "client_id"  UUID NOT NULL REFERENCES "clients"("id") ON DELETE CASCADE,
        "type"       VARCHAR(50) NOT NULL,
        "s3_key"     VARCHAR(500) NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_kyc_client" ON "kyc_documents"("client_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "kyc_documents"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "content_pages"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "content_banners"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "settings"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_logs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "notifications"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "return_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "returns"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "online_order_items"`);
  }
}
