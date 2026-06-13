import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBuybackAssessmentColumns1740000000020 implements MigrationInterface {
  name = 'AddBuybackAssessmentColumns1740000000020';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "buyback_leads"
        ADD COLUMN "screen_condition" VARCHAR(50),
        ADD COLUMN "body_condition"   VARCHAR(50),
        ADD COLUMN "battery_health"   VARCHAR(20)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "buyback_leads"
        DROP COLUMN IF EXISTS "screen_condition",
        DROP COLUMN IF EXISTS "body_condition",
        DROP COLUMN IF EXISTS "battery_health"
    `);
  }
}
