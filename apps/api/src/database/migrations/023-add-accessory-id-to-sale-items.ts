import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAccessoryIdToSaleItems1712345678900 implements MigrationInterface {
  name = 'AddAccessoryIdToSaleItems1712345678900';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE sale_items
      ADD COLUMN accessory_id VARCHAR NULL,
      ADD COLUMN quantity INT NULL DEFAULT 1
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE sale_items
      DROP COLUMN accessory_id,
      DROP COLUMN quantity
    `);
  }
}
