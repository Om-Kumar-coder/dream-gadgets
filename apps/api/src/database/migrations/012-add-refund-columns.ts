import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRefundColumns1711000000000 implements MigrationInterface {
  name = 'AddRefundColumns1711000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "payments"
        ADD COLUMN "razorpay_refund_id" VARCHAR,
        ADD COLUMN "refund_amount" DECIMAL(12, 2),
        ADD COLUMN "refund_status" VARCHAR(50),
        ADD COLUMN "refunded_at" TIMESTAMP
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "payments"
        DROP COLUMN "razorpay_refund_id",
        DROP COLUMN "refund_amount",
        DROP COLUMN "refund_status",
        DROP COLUMN "refunded_at"
    `);
  }
}
