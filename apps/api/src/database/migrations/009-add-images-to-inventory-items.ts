import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddImagesToInventoryItems1700000000009 implements MigrationInterface {
  name = 'AddImagesToInventoryItems1700000000009';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "inventory_items" ADD COLUMN "images" JSONB NOT NULL DEFAULT '[]'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "inventory_items" DROP COLUMN IF EXISTS "images"`);
  }
}
