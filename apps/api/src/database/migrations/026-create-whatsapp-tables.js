export class CreateWhatsappTables1740000000026 {
    constructor() {
        this.name = 'CreateWhatsappTables1740000000026';
    }
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE "whatsapp_conversations" (
        "id"                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "customer_phone"      VARCHAR(20) NOT NULL,
        "customer_name"       VARCHAR(200),
        "type"                VARCHAR(50) NOT NULL DEFAULT 'general',
        "status"              VARCHAR(30) NOT NULL DEFAULT 'active',
        "assigned_staff_id"   UUID REFERENCES "users"("id"),
        "priority"            VARCHAR(10) NOT NULL DEFAULT 'normal',
        "tags"                JSONB,
        "last_message_at"     TIMESTAMPTZ,
        "last_message_preview" TEXT,
        "unread_count"        INT NOT NULL DEFAULT 0,
        "metadata"            JSONB,
        "created_at"          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"          TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
        await queryRunner.query(`
      CREATE INDEX "idx_whatsapp_conversations_phone"   ON "whatsapp_conversations"("customer_phone")
    `);
        await queryRunner.query(`
      CREATE INDEX "idx_whatsapp_conversations_status"  ON "whatsapp_conversations"("status")
    `);
        await queryRunner.query(`
      CREATE INDEX "idx_whatsapp_conversations_staff"   ON "whatsapp_conversations"("assigned_staff_id")
    `);
        await queryRunner.query(`
      CREATE INDEX "idx_whatsapp_conversations_type"    ON "whatsapp_conversations"("type")
    `);
        // Partial unique index: only one active conversation per phone at a time
        await queryRunner.query(`
      CREATE UNIQUE INDEX "uq_whatsapp_conversations_active_phone"
        ON "whatsapp_conversations"("customer_phone")
        WHERE status = 'active'
    `);
        await queryRunner.query(`
      CREATE TABLE "whatsapp_messages" (
        "id"                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "conversation_id"     UUID NOT NULL REFERENCES "whatsapp_conversations"("id") ON DELETE CASCADE,
        "direction"           VARCHAR(10) NOT NULL,
        "from_number"         VARCHAR(20) NOT NULL,
        "to_number"           VARCHAR(20) NOT NULL,
        "content"             TEXT,
        "content_type"        VARCHAR(30) NOT NULL DEFAULT 'text',
        "media_url"           TEXT,
        "media_mime_type"     VARCHAR(100),
        "media_filename"      VARCHAR(500),
        "status"              VARCHAR(20) NOT NULL DEFAULT 'sent',
        "provider_message_id" VARCHAR(255),
        "error_message"       TEXT,
        "metadata"            JSONB,
        "created_at"          TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
        await queryRunner.query(`
      CREATE INDEX "idx_whatsapp_messages_conversation" ON "whatsapp_messages"("conversation_id")
    `);
        await queryRunner.query(`
      CREATE INDEX "idx_whatsapp_messages_provider"     ON "whatsapp_messages"("provider_message_id")
    `);
        await queryRunner.query(`
      CREATE INDEX "idx_whatsapp_messages_created"      ON "whatsapp_messages"("created_at")
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE IF EXISTS "whatsapp_messages"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "whatsapp_conversations"`);
    }
}
//# sourceMappingURL=026-create-whatsapp-tables.js.map