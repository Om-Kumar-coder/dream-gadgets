import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBuybackFunctionalIssues1740000000021 implements MigrationInterface {
  name = 'AddBuybackFunctionalIssues1740000000021';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "buyback_leads"
        ADD COLUMN "functional_issues" TEXT
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "buyback_leads"
        DROP COLUMN IF EXISTS "functional_issues"
    `);
  }
}
