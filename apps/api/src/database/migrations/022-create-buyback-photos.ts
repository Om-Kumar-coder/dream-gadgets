import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBuybackPhotos1740000000022 implements MigrationInterface {
  name = 'CreateBuybackPhotos1740000000022';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "buyback_photos" (
        "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "lead_id"    UUID NOT NULL REFERENCES "buyback_leads"("id") ON DELETE CASCADE,
        "url"        VARCHAR(500) NOT NULL,
        "sort_order" INTEGER NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_buyback_photos_lead_id" ON "buyback_photos" ("lead_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_buyback_photos_lead_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "buyback_photos"`);
  }
}
