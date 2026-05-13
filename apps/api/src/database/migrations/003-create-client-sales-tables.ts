import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateClientSalesTables1700000000003 implements MigrationInterface {
  name = 'CreateClientSalesTables1700000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // clients
    await queryRunner.query(`
      CREATE TABLE "clients" (
        "id"               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "first_name"       VARCHAR(100) NOT NULL,
        "last_name"        VARCHAR(100),
        "phone"            VARCHAR(15) UNIQUE NOT NULL,
        "alternate_phone"  VARCHAR(15),
        "email"            VARCHAR(255),
        "gender"           VARCHAR(20),
        "date_of_birth"    DATE,
        "address"          TEXT,
        "city"             VARCHAR(100),
        "district"         VARCHAR(100),
        "state"            VARCHAR(100),
        "pincode"          VARCHAR(10),
        "id_proof_type"    VARCHAR(50),
        "id_proof_number"  VARCHAR(100),
        "ekyc_status"      VARCHAR(20) NOT NULL DEFAULT 'pending',
        "ekyc_verified_at" TIMESTAMPTZ,
        "ekyc_verified_by" UUID REFERENCES "users"("id"),
        "customer_type"    VARCHAR(50) NOT NULL DEFAULT 'walk-in',
        "is_active"        BOOLEAN NOT NULL DEFAULT true,
        "birthday_offer"   BOOLEAN NOT NULL DEFAULT false,
        "notes"            TEXT,
        "tags"             JSONB,
        "created_by"       UUID REFERENCES "users"("id"),
        "branch_id"        UUID REFERENCES "branches"("id"),
        "created_at"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"       TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_clients_phone"  ON "clients"("phone")`);
    await queryRunner.query(`CREATE INDEX "idx_clients_branch" ON "clients"("branch_id")`);
    await queryRunner.query(`CREATE INDEX "idx_clients_dob"    ON "clients"("date_of_birth")`);

    // Add vendor FK to purchases now that clients table exists
    await queryRunner.query(`
      ALTER TABLE "purchases"
        ADD CONSTRAINT "fk_purchases_vendor"
        FOREIGN KEY ("vendor_id") REFERENCES "clients"("id")
    `);

    // sales
    await queryRunner.query(`
      CREATE TABLE "sales" (
        "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "invoice_number"  VARCHAR(50) UNIQUE NOT NULL,
        "client_id"       UUID REFERENCES "clients"("id"),
        "branch_id"       UUID NOT NULL REFERENCES "branches"("id"),
        "subtotal"        DECIMAL(12,2) NOT NULL,
        "discount_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
        "tax_amount"      DECIMAL(12,2) NOT NULL DEFAULT 0,
        "total_amount"    DECIMAL(12,2) NOT NULL,
        "payment_status"  VARCHAR(30) NOT NULL DEFAULT 'paid',
        "sale_type"       VARCHAR(30) NOT NULL DEFAULT 'in-store',
        "notes"           TEXT,
        "created_by"      UUID REFERENCES "users"("id"),
        "sale_date"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "created_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_sales_branch"   ON "sales"("branch_id")`);
    await queryRunner.query(`CREATE INDEX "idx_sales_client"   ON "sales"("client_id")`);
    await queryRunner.query(`CREATE INDEX "idx_sales_date"     ON "sales"("sale_date")`);
    await queryRunner.query(`CREATE INDEX "idx_sales_created"  ON "sales"("created_by")`);

    // sale_items
    await queryRunner.query(`
      CREATE TABLE "sale_items" (
        "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "sale_id"     UUID NOT NULL REFERENCES "sales"("id") ON DELETE CASCADE,
        "item_id"     UUID REFERENCES "inventory_items"("id"),
        "imei"        VARCHAR(15) NOT NULL,
        "description" VARCHAR(500),
        "unit_price"  DECIMAL(12,2) NOT NULL,
        "discount"    DECIMAL(12,2) NOT NULL DEFAULT 0,
        "tax_rate"    DECIMAL(5,2)  NOT NULL DEFAULT 0,
        "tax_amount"  DECIMAL(12,2) NOT NULL DEFAULT 0,
        "total"       DECIMAL(12,2) NOT NULL,
        "hsn_code"    VARCHAR(20)
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_sale_items_sale" ON "sale_items"("sale_id")`);
    await queryRunner.query(`CREATE INDEX "idx_sale_items_imei" ON "sale_items"("imei")`);

    // online_orders (needed as FK for payments)
    await queryRunner.query(`
      CREATE TABLE "online_orders" (
        "id"               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "order_number"     VARCHAR(50) UNIQUE NOT NULL,
        "client_id"        UUID REFERENCES "clients"("id"),
        "branch_id"        UUID REFERENCES "branches"("id"),
        "status"           VARCHAR(50) NOT NULL DEFAULT 'pending_payment',
        "subtotal"         DECIMAL(12,2) NOT NULL,
        "shipping_charge"  DECIMAL(12,2) NOT NULL DEFAULT 0,
        "discount_amount"  DECIMAL(12,2) NOT NULL DEFAULT 0,
        "tax_amount"       DECIMAL(12,2) NOT NULL DEFAULT 0,
        "total_amount"     DECIMAL(12,2) NOT NULL,
        "shipping_address" JSONB NOT NULL,
        "tracking_number"  VARCHAR(200),
        "courier"          VARCHAR(100),
        "notes"            TEXT,
        "assigned_to"      UUID REFERENCES "users"("id"),
        "ordered_at"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "shipped_at"       TIMESTAMPTZ,
        "delivered_at"     TIMESTAMPTZ,
        "created_at"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"       TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_orders_client" ON "online_orders"("client_id")`);
    await queryRunner.query(`CREATE INDEX "idx_orders_status" ON "online_orders"("status")`);
    await queryRunner.query(`CREATE INDEX "idx_orders_branch" ON "online_orders"("branch_id")`);

    // payments
    await queryRunner.query(`
      CREATE TABLE "payments" (
        "id"                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "sale_id"              UUID REFERENCES "sales"("id"),
        "online_order_id"      UUID REFERENCES "online_orders"("id"),
        "method"               VARCHAR(50) NOT NULL,
        "amount"               DECIMAL(12,2) NOT NULL,
        "reference"            VARCHAR(200),
        "note"                 TEXT,
        "razorpay_order_id"    VARCHAR(200),
        "razorpay_payment_id"  VARCHAR(200),
        "razorpay_signature"   VARCHAR(500),
        "status"               VARCHAR(30) NOT NULL DEFAULT 'completed',
        "emi_plan"             JSONB,
        "exchange_device_id"   UUID,
        "created_at"           TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_payments_sale"    ON "payments"("sale_id")`);
    await queryRunner.query(`CREATE INDEX "idx_payments_order"   ON "payments"("online_order_id")`);
    await queryRunner.query(`CREATE INDEX "idx_payments_rzp_pid" ON "payments"("razorpay_payment_id")`);

    // invoice_sequences — atomic per-branch invoice numbering
    await queryRunner.query(`
      CREATE TABLE "invoice_sequences" (
        "branch_id"  UUID NOT NULL REFERENCES "branches"("id"),
        "year"       SMALLINT NOT NULL,
        "prefix"     VARCHAR(20) NOT NULL DEFAULT 'DG',
        "last_seq"   INT NOT NULL DEFAULT 0,
        PRIMARY KEY ("branch_id", "year")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "invoice_sequences"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "payments"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "online_orders"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "sale_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "sales"`);
    await queryRunner.query(`ALTER TABLE "purchases" DROP CONSTRAINT IF EXISTS "fk_purchases_vendor"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "clients"`);
  }
}
