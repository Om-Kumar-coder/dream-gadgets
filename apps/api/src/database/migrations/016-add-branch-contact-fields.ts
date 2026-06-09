import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBranchContactFields1700000000016 implements MigrationInterface {
  name = 'AddBranchContactFields1700000000016';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if columns already exist (from earlier migration or manual add)
    const tableInfo = await queryRunner.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'branches'`,
    );
    const existingCols = tableInfo.map((r: any) => r.column_name);

    if (!existingCols.includes('whatsapp')) {
      await queryRunner.query(`ALTER TABLE "branches" ADD COLUMN "whatsapp" VARCHAR(15)`);
    }
    if (!existingCols.includes('email')) {
      await queryRunner.query(`ALTER TABLE "branches" ADD COLUMN "email" VARCHAR(200)`);
    }
    if (!existingCols.includes('instagram')) {
      await queryRunner.query(`ALTER TABLE "branches" ADD COLUMN "instagram" VARCHAR(200)`);
    }
    if (!existingCols.includes('working_hours')) {
      await queryRunner.query(`ALTER TABLE "branches" ADD COLUMN "working_hours" VARCHAR(100)`);
    }
    if (!existingCols.includes('map_url')) {
      await queryRunner.query(`ALTER TABLE "branches" ADD COLUMN "map_url" VARCHAR(500)`);
    }
    if (!existingCols.includes('sort_order')) {
      await queryRunner.query(`ALTER TABLE "branches" ADD COLUMN "sort_order" INTEGER DEFAULT 0`);
    }

    // Also ensure pincode and phone exist (they should from migration 001)
    if (!existingCols.includes('pincode')) {
      await queryRunner.query(`ALTER TABLE "branches" ADD COLUMN "pincode" VARCHAR(10)`);
    }
    if (!existingCols.includes('phone')) {
      await queryRunner.query(`ALTER TABLE "branches" ADD COLUMN "phone" VARCHAR(15)`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "branches" DROP COLUMN IF EXISTS "whatsapp"`);
    await queryRunner.query(`ALTER TABLE "branches" DROP COLUMN IF EXISTS "email"`);
    await queryRunner.query(`ALTER TABLE "branches" DROP COLUMN IF EXISTS "instagram"`);
    await queryRunner.query(`ALTER TABLE "branches" DROP COLUMN IF EXISTS "working_hours"`);
    await queryRunner.query(`ALTER TABLE "branches" DROP COLUMN IF EXISTS "map_url"`);
    await queryRunner.query(`ALTER TABLE "branches" DROP COLUMN IF EXISTS "sort_order"`);
  }
}
