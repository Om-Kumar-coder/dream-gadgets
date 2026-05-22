import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWalletBalance1740000000014 implements MigrationInterface {
  name = 'AddWalletBalance1740000000014';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN "wallet_balance" DECIMAL(12,2) NOT NULL DEFAULT 0
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" DROP COLUMN "wallet_balance"
    `);
  }
}
