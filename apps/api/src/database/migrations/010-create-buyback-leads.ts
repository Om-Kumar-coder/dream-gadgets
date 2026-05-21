import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBuybackLeads1740000000010 implements MigrationInterface {
  name = 'CreateBuybackLeads1740000000010';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "buyback_leads" (
        "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "brand"       VARCHAR(100) NOT NULL,
        "model_name"  VARCHAR(200) NOT NULL,
        "phone"       VARCHAR(20) NOT NULL,
        "device_type" VARCHAR(50) NOT NULL DEFAULT 'mobile',
        "status"      VARCHAR(30) NOT NULL DEFAULT 'pending',
        "notes"       TEXT,
        "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_buyback_leads_status" ON "buyback_leads"("status")`);
    await queryRunner.query(`CREATE INDEX "idx_buyback_leads_created" ON "buyback_leads"("created_at")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "buyback_leads"`);
  }
}
