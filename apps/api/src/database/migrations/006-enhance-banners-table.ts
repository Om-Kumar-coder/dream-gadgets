import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnhanceBannersTable1700000000006 implements MigrationInterface {
  name = 'EnhanceBannersTable1700000000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new columns to content_banners
    await queryRunner.query(`ALTER TABLE "content_banners" ADD COLUMN "subtitle" VARCHAR(500)`);
    await queryRunner.query(`ALTER TABLE "content_banners" ADD COLUMN "page_type" VARCHAR(50) NOT NULL DEFAULT 'home'`);
    await queryRunner.query(`ALTER TABLE "content_banners" ADD COLUMN "position" VARCHAR(50) NOT NULL DEFAULT 'slider'`);
    await queryRunner.query(`ALTER TABLE "content_banners" ADD COLUMN "device_type" VARCHAR(20) NOT NULL DEFAULT 'all'`);
    await queryRunner.query(`ALTER TABLE "content_banners" ADD COLUMN "cta_text" VARCHAR(100)`);
    await queryRunner.query(`ALTER TABLE "content_banners" ADD COLUMN "mobile_image_url" VARCHAR(500)`);
    await queryRunner.query(`ALTER TABLE "content_banners" ADD COLUMN "click_count" INT NOT NULL DEFAULT 0`);

    // Add indexes for common query patterns
    await queryRunner.query(`CREATE INDEX "idx_banners_page_type" ON "content_banners"("page_type")`);
    await queryRunner.query(`CREATE INDEX "idx_banners_position" ON "content_banners"("position")`);
    await queryRunner.query(`CREATE INDEX "idx_banners_active" ON "content_banners"("is_active")`);
    await queryRunner.query(`CREATE INDEX "idx_banners_sort" ON "content_banners"("sort_order")`);
    await queryRunner.query(`CREATE INDEX "idx_banners_page_position_active" ON "content_banners"("page_type", "position", "is_active")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_banners_page_position_active"`);
    await queryRunner.query(`DROP INDEX "idx_banners_sort"`);
    await queryRunner.query(`DROP INDEX "idx_banners_active"`);
    await queryRunner.query(`DROP INDEX "idx_banners_position"`);
    await queryRunner.query(`DROP INDEX "idx_banners_page_type"`);
    await queryRunner.query(`ALTER TABLE "content_banners" DROP COLUMN "click_count"`);
    await queryRunner.query(`ALTER TABLE "content_banners" DROP COLUMN "mobile_image_url"`);
    await queryRunner.query(`ALTER TABLE "content_banners" DROP COLUMN "cta_text"`);
    await queryRunner.query(`ALTER TABLE "content_banners" DROP COLUMN "device_type"`);
    await queryRunner.query(`ALTER TABLE "content_banners" DROP COLUMN "position"`);
    await queryRunner.query(`ALTER TABLE "content_banners" DROP COLUMN "page_type"`);
    await queryRunner.query(`ALTER TABLE "content_banners" DROP COLUMN "subtitle"`);
  }
}
