import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBuybackEstimatedPrice1740000000031 implements MigrationInterface {
  name = 'AddBuybackEstimatedPrice1740000000031';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "buyback_leads" ADD "estimated_price" DECIMAL(12,2)`);
    await queryRunner.query(`ALTER TABLE "buyback_leads" ADD "condition" VARCHAR(30)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "buyback_leads" DROP COLUMN IF EXISTS "condition"`);
    await queryRunner.query(`ALTER TABLE "buyback_leads" DROP COLUMN IF EXISTS "estimated_price"`);
  }
}
