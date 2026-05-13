import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTransferExchangeTables1700000000004 implements MigrationInterface {
  name = 'CreateTransferExchangeTables1700000000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // stock_transfers
    await queryRunner.query(`
      CREATE TABLE "stock_transfers" (
        "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "transfer_number" VARCHAR(50) UNIQUE NOT NULL,
        "from_branch_id"  UUID NOT NULL REFERENCES "branches"("id"),
        "to_branch_id"    UUID NOT NULL REFERENCES "branches"("id"),
        "status"          VARCHAR(30) NOT NULL DEFAULT 'initiated',
        "notes"           TEXT,
        "initiated_by"    UUID REFERENCES "users"("id"),
        "received_by"     UUID REFERENCES "users"("id"),
        "initiated_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "received_at"     TIMESTAMPTZ,
        "created_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_transfers_from"   ON "stock_transfers"("from_branch_id")`);
    await queryRunner.query(`CREATE INDEX "idx_transfers_to"     ON "stock_transfers"("to_branch_id")`);
    await queryRunner.query(`CREATE INDEX "idx_transfers_status" ON "stock_transfers"("status")`);

    // stock_transfer_items
    await queryRunner.query(`
      CREATE TABLE "stock_transfer_items" (
        "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "transfer_id" UUID NOT NULL REFERENCES "stock_transfers"("id") ON DELETE CASCADE,
        "item_id"     UUID REFERENCES "inventory_items"("id"),
        "imei"        VARCHAR(15) NOT NULL,
        "status"      VARCHAR(30) NOT NULL DEFAULT 'pending',
        "notes"       TEXT
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_transfer_items_transfer" ON "stock_transfer_items"("transfer_id")`);
    await queryRunner.query(`CREATE INDEX "idx_transfer_items_imei"     ON "stock_transfer_items"("imei")`);

    // exchange_devices
    await queryRunner.query(`
      CREATE TABLE "exchange_devices" (
        "id"                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "client_id"           UUID REFERENCES "clients"("id"),
        "sale_id"             UUID REFERENCES "sales"("id"),
        "brand_id"            UUID REFERENCES "brands"("id"),
        "model_id"            UUID REFERENCES "models"("id"),
        "imei"                VARCHAR(15),
        "colour"              VARCHAR(100),
        "storage"             VARCHAR(20),
        "condition"           VARCHAR(30),
        "battery_health"      SMALLINT CHECK ("battery_health" BETWEEN 0 AND 100),
        "condition_notes"     JSONB,
        "exchange_price"      DECIMAL(12,2) NOT NULL,
        "photos"              JSONB,
        "kyc_verified"        BOOLEAN NOT NULL DEFAULT false,
        "added_to_inventory"  BOOLEAN NOT NULL DEFAULT false,
        "inventory_item_id"   UUID REFERENCES "inventory_items"("id"),
        "created_by"          UUID REFERENCES "users"("id"),
        "created_at"          TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_exchange_client" ON "exchange_devices"("client_id")`);
    await queryRunner.query(`CREATE INDEX "idx_exchange_sale"   ON "exchange_devices"("sale_id")`);

    // Add FK from payments to exchange_devices now that the table exists
    await queryRunner.query(`
      ALTER TABLE "payments"
        ADD CONSTRAINT "fk_payments_exchange"
        FOREIGN KEY ("exchange_device_id") REFERENCES "exchange_devices"("id")
    `);

    // exchange_price_guide — market price reference per model + condition
    await queryRunner.query(`
      CREATE TABLE "exchange_price_guide" (
        "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "model_id"   UUID NOT NULL REFERENCES "models"("id"),
        "condition"  VARCHAR(30) NOT NULL,
        "base_price" DECIMAL(12,2) NOT NULL,
        "updated_by" UUID REFERENCES "users"("id"),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE("model_id", "condition")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "exchange_price_guide"`);
    await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT IF EXISTS "fk_payments_exchange"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "exchange_devices"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "stock_transfer_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "stock_transfers"`);
  }
}
