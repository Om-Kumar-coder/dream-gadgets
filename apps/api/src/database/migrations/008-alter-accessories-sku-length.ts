import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterAccessoriesSkuLength1700000000008 implements MigrationInterface {
  name = 'AlterAccessoriesSkuLength1700000000008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Alter the sku column to allow longer values
    await queryRunner.query(`
      ALTER TABLE "accessories" 
      ALTER COLUMN "sku" TYPE VARCHAR(50)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "accessories" 
      ALTER COLUMN "sku" TYPE VARCHAR(20)
    `);
  }
}
