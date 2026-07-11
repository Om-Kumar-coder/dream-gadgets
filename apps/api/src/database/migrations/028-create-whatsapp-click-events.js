export class CreateWhatsappClickEvents1740000000028 {
    constructor() {
        this.name = 'CreateWhatsappClickEvents1740000000028';
    }
    async up(queryRunner) {
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
        // Add WhatsApp click permissions to existing roles if they have whatsapp module
        await queryRunner.query(`
      UPDATE roles
      SET permissions = jsonb_set(
        COALESCE(permissions, '{}'::jsonb),
        '{whatsapp}',
        CASE
          WHEN permissions->'whatsapp' IS NOT NULL
          THEN (permissions->'whatsapp')::jsonb || '["analytics"]'::jsonb
          ELSE '["view"]'::jsonb
        END
      )
      WHERE permissions->'whatsapp' IS NOT NULL
        AND NOT (permissions->'whatsapp' ?? 'analytics')
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE IF EXISTS "whatsapp_click_events"`);
    }
}
//# sourceMappingURL=028-create-whatsapp-click-events.js.map