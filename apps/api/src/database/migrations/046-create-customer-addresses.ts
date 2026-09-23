import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Customer saved addresses — one table per user, scoped by user_id.
 * Replaces the old "Address — Coming soon" placeholder in the account area.
 */
export class CreateCustomerAddresses1759000000046 implements MigrationInterface {
  name = '046-create-customer-addresses-1759000000046';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "customer_addresses" (
        "id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id"       UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "full_name"     VARCHAR(120) NOT NULL,
        "mobile"        VARCHAR(15) NOT NULL,
        "address_line1" VARCHAR(200) NOT NULL,
        "address_line2" VARCHAR(200),
        "landmark"      VARCHAR(120),
        "city"          VARCHAR(100) NOT NULL,
        "state"         VARCHAR(100) NOT NULL,
        "pincode"       VARCHAR(6) NOT NULL,
        "address_type"  VARCHAR(10) NOT NULL DEFAULT 'home',
        "is_default"    BOOLEAN NOT NULL DEFAULT false,
        "created_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "ck_address_type" CHECK ("address_type" IN ('home', 'work', 'other'))
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_customer_addresses_user" ON "customer_addresses"("user_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "customer_addresses"`);
  }
}
