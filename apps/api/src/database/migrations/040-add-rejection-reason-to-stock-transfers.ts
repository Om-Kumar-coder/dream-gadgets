import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRejectionReasonToStockTransfers1755000000040
  implements MigrationInterface
{
  name = '040-add-rejection-reason-to-stock-transfers-1755000000040';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE stock_transfers
      ADD COLUMN IF NOT EXISTS rejection_reason TEXT
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE stock_transfers
      DROP COLUMN IF EXISTS rejection_reason
    `);
  }
}
