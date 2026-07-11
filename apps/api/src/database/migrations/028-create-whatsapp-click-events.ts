import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWhatsappClickEvents1740000000028 implements MigrationInterface {
  name = 'CreateWhatsappClickEvents1740000000028';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "whatsapp_click_events" (
        "id"                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "source"              VARCHAR(100) NOT NULL,
        "context"             VARCHAR(500),
        "product_id"          VARCHAR(100),
        "phone"               VARCHAR(20) NOT NULL,
        "page_url"            TEXT,
        "user_agent"          VARCHAR(500),
        "referrer"            TEXT,
        "created_at"          TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_whatsapp_click_source" ON "whatsapp_click_events"("source")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_whatsapp_click_created" ON "whatsapp_click_events"("created_at")
    `);

    // WhatsApp click analytics permissions are seeded via migration 030+ pattern.
    // The roles table does not have a jsonb `permissions` column — permissions
    // are managed through the `permissions` and `role_permissions` tables.
    console.log('WhatsApp click events table created. Permissions seeded separately.');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "whatsapp_click_events"`);
  }
}
