import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePriceGuideAudits1740000000032 implements MigrationInterface {
  name = 'CreatePriceGuideAudits1740000000032';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "price_guide_audits" (
        "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "model_id"   UUID REFERENCES "models"("id") ON DELETE SET NULL,
        "model_name" VARCHAR(200),
        "condition"  VARCHAR(30),
        "old_price"  DECIMAL(12,2),
        "new_price"  DECIMAL(12,2),
        "action"     VARCHAR(20) NOT NULL,
        "updated_by" UUID REFERENCES "users"("id"),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_price_guide_audits_model" ON "price_guide_audits"("model_id")`);
    await queryRunner.query(`CREATE INDEX "idx_price_guide_audits_created" ON "price_guide_audits"("created_at")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "price_guide_audits"`);
  }
}
