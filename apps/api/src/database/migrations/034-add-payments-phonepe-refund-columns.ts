import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * The Payment entity references PhonePe + refund fields, but no migration ever
 * added them — so `payments` in prod was missing the columns, breaking
 * POST /sales (POS checkout) and GET /orders with:
 *   column "phonepe_transaction_id" of relation "payments" does not exist
 * All adds are IF NOT EXISTS so re-runs are safe.
 */
export class AddPaymentsPhonePeRefundColumns1740000000034 implements MigrationInterface {
  name = 'AddPaymentsPhonePeRefundColumns1740000000034';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "payments"
        ADD COLUMN IF NOT EXISTS "phonepe_transaction_id" varchar,
        ADD COLUMN IF NOT EXISTS "phonepe_merchant_txn_id" varchar,
        ADD COLUMN IF NOT EXISTS "phonepe_refund_id" varchar,
        ADD COLUMN IF NOT EXISTS "refund_amount" decimal(12,2),
        ADD COLUMN IF NOT EXISTS "refund_status" varchar(50),
        ADD COLUMN IF NOT EXISTS "refunded_at" timestamp
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "payments"
        DROP COLUMN IF EXISTS "phonepe_transaction_id",
        DROP COLUMN IF EXISTS "phonepe_merchant_txn_id",
        DROP COLUMN IF EXISTS "phonepe_refund_id",
        DROP COLUMN IF EXISTS "refund_amount",
        DROP COLUMN IF EXISTS "refund_status",
        DROP COLUMN IF EXISTS "refunded_at"
    `);
  }
}
