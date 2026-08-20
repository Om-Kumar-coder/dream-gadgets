import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEmailVerifiedAt1755000000038 implements MigrationInterface {
  name = 'AddEmailVerifiedAt1755000000038';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "email_verified_at" TIMESTAMPTZ NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN IF EXISTS "email_verified_at"
    `);
  }
}
