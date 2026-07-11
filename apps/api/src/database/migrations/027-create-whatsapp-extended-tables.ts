import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateWhatsappExtendedTables1740000000027 implements MigrationInterface {
  name = 'CreateWhatsappExtendedTables1740000000027';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── WhatsApp Templates ──────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "whatsapp_templates" (
        "id"                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "name"                VARCHAR(200) NOT NULL,
        "category"            VARCHAR(50) NOT NULL DEFAULT 'transactional',
        "language"            VARCHAR(10) NOT NULL DEFAULT 'en',
        "template_id"         VARCHAR(100),
        "status"              VARCHAR(30) NOT NULL DEFAULT 'pending',
        "header_type"         VARCHAR(30),
        "header_value"        TEXT,
        "body"                TEXT NOT NULL,
        "footer"              TEXT,
        "buttons"             JSONB,
        "variables"           JSONB,
        "rejection_reason"    TEXT,
        "created_by"          UUID REFERENCES "users"("id"),
        "created_at"          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"          TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "idx_whatsapp_templates_name" ON "whatsapp_templates"("name", "language")
    `);

    // ── WhatsApp Campaigns ──────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "whatsapp_campaigns" (
        "id"                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "name"                VARCHAR(200) NOT NULL,
        "description"         TEXT,
        "status"              VARCHAR(30) NOT NULL DEFAULT 'draft',
        "type"                VARCHAR(50) NOT NULL DEFAULT 'broadcast',
        "template_id"         UUID REFERENCES "whatsapp_templates"("id"),
        "segment_filter"      JSONB,
        "scheduled_at"        TIMESTAMPTZ,
        "sent_at"             TIMESTAMPTZ,
        "completed_at"        TIMESTAMPTZ,
        "total_recipients"    INT NOT NULL DEFAULT 0,
        "sent_count"          INT NOT NULL DEFAULT 0,
        "delivered_count"     INT NOT NULL DEFAULT 0,
        "read_count"          INT NOT NULL DEFAULT 0,
        "failed_count"        INT NOT NULL DEFAULT 0,
        "click_count"         INT NOT NULL DEFAULT 0,
        "conversion_count"    INT NOT NULL DEFAULT 0,
        "metadata"            JSONB,
        "created_by"          UUID REFERENCES "users"("id"),
        "created_at"          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"          TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_whatsapp_campaigns_status" ON "whatsapp_campaigns"("status")
    `);

    // ── Campaign Logs ────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "whatsapp_campaign_logs" (
        "id"                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "campaign_id"         UUID NOT NULL REFERENCES "whatsapp_campaigns"("id") ON DELETE CASCADE,
        "client_id"           UUID REFERENCES "clients"("id"),
        "phone"               VARCHAR(20) NOT NULL,
        "status"              VARCHAR(30) NOT NULL DEFAULT 'queued',
        "provider_message_id" VARCHAR(255),
        "error_message"       TEXT,
        "opened_at"           TIMESTAMPTZ,
        "clicked_at"          TIMESTAMPTZ,
        "converted_at"        TIMESTAMPTZ,
        "metadata"            JSONB,
        "created_at"          TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_whatsapp_campaign_logs_campaign" ON "whatsapp_campaign_logs"("campaign_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_whatsapp_campaign_logs_phone" ON "whatsapp_campaign_logs"("phone")
    `);

    // ── WhatsApp Appointments ───────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "whatsapp_appointments" (
        "id"                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "client_id"           UUID REFERENCES "clients"("id"),
        "phone"               VARCHAR(20) NOT NULL,
        "name"                VARCHAR(200),
        "type"                VARCHAR(50) NOT NULL,
        "status"              VARCHAR(30) NOT NULL DEFAULT 'scheduled',
        "scheduled_at"        TIMESTAMPTZ NOT NULL,
        "reminder_24h_sent"   BOOLEAN NOT NULL DEFAULT false,
        "reminder_2h_sent"    BOOLEAN NOT NULL DEFAULT false,
        "staff_id"            UUID REFERENCES "users"("id"),
        "notes"               TEXT,
        "metadata"            JSONB,
        "feedback_rating"     SMALLINT,
        "feedback_comment"    TEXT,
        "created_by"          UUID REFERENCES "users"("id"),
        "created_at"          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"          TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_whatsapp_appointments_phone" ON "whatsapp_appointments"("phone")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_whatsapp_appointments_staff" ON "whatsapp_appointments"("staff_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_whatsapp_appointments_status" ON "whatsapp_appointments"("status")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_whatsapp_appointments_scheduled" ON "whatsapp_appointments"("scheduled_at")
    `);

    // ── WhatsApp Automation Rules ────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "whatsapp_automation_rules" (
        "id"                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "name"                VARCHAR(200) NOT NULL,
        "trigger_event"       VARCHAR(100) NOT NULL,
        "condition"           JSONB,
        "actions"             JSONB NOT NULL,
        "status"              VARCHAR(30) NOT NULL DEFAULT 'active',
        "priority"            INT NOT NULL DEFAULT 0,
        "cooldown_minutes"    INT NOT NULL DEFAULT 0,
        "last_triggered_at"   TIMESTAMPTZ,
        "trigger_count"       INT NOT NULL DEFAULT 0,
        "created_by"          UUID REFERENCES "users"("id"),
        "created_at"          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"          TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_whatsapp_automation_rules_event" ON "whatsapp_automation_rules"("trigger_event")
    `);

    // ── WhatsApp Notifications (scheduled/triggered) ─────────────────────────
    await queryRunner.query(`
      CREATE TABLE "whatsapp_notifications" (
        "id"                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "type"                VARCHAR(50) NOT NULL,
        "channel"             VARCHAR(20) NOT NULL DEFAULT 'whatsapp',
        "phone"               VARCHAR(20) NOT NULL,
        "template_id"         UUID REFERENCES "whatsapp_templates"("id"),
        "template_vars"       JSONB,
        "body"                TEXT,
        "status"              VARCHAR(30) NOT NULL DEFAULT 'pending',
        "provider_message_id" VARCHAR(255),
        "error_message"       TEXT,
        "scheduled_at"        TIMESTAMPTZ,
        "sent_at"             TIMESTAMPTZ,
        "delivered_at"        TIMESTAMPTZ,
        "read_at"             TIMESTAMPTZ,
        "metadata"            JSONB,
        "created_at"          TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_whatsapp_notifications_phone" ON "whatsapp_notifications"("phone")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_whatsapp_notifications_status" ON "whatsapp_notifications"("status")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_whatsapp_notifications_scheduled" ON "whatsapp_notifications"("scheduled_at")
    `);

    // ── WhatsApp Tags ────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "whatsapp_tags" (
        "id"                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "name"                VARCHAR(100) NOT NULL UNIQUE,
        "color"               VARCHAR(20) NOT NULL DEFAULT '#6366f1',
        "description"         TEXT,
        "created_at"          TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // ── Customer Preferences ─────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "whatsapp_customer_preferences" (
        "id"                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "client_id"           UUID REFERENCES "clients"("id") ON DELETE CASCADE,
        "phone"               VARCHAR(20) NOT NULL,
        "opt_in_marketing"    BOOLEAN NOT NULL DEFAULT false,
        "opt_in_transactional" BOOLEAN NOT NULL DEFAULT true,
        "preferred_language"  VARCHAR(10) NOT NULL DEFAULT 'en',
        "mute_until"          TIMESTAMPTZ,
        "notes"               TEXT,
        "created_at"          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE("client_id", "phone")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_whatsapp_preferences_phone" ON "whatsapp_customer_preferences"("phone")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "whatsapp_customer_preferences"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "whatsapp_tags"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "whatsapp_notifications"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "whatsapp_automation_rules"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "whatsapp_appointments"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "whatsapp_campaign_logs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "whatsapp_campaigns"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "whatsapp_templates"`);
  }
}
