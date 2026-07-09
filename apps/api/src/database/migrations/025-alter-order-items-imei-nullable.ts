import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterOrderItemsImeiNullable1712345679025 implements MigrationInterface {
  name = 'AlterOrderItemsImeiNullable1712345679025';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "online_order_items"
        ALTER COLUMN "imei" TYPE VARCHAR(50),
        ALTER COLUMN "imei" DROP NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "online_order_items"
        ALTER COLUMN "imei" TYPE VARCHAR(15),
        ALTER COLUMN "imei" SET NOT NULL
    `);
  }
}
