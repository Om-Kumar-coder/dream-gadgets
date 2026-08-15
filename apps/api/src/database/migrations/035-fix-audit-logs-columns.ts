import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * The audit_logs table (migration 005) was created with user_id/old_values/
 * new_values, but the code writes performed_by_id + changes:
 *   - middleware: (entity_type, entity_id, action, performed_by_id, ...)
 *   - inventory: (..., changes, performed_by_id, ...)
 *   - sales void: (..., performed_by_id, changes, ...)
 * Every INSERT was failing with "column ... does not exist". In voidSale the
 * failed INSERT aborted the whole transaction, so COMMIT silently rolled the
 * void back — the endpoint returned 200 but nothing persisted.
 * These adds make all three shapes valid; re-runs are safe (IF NOT EXISTS).
 */
export class FixAuditLogsColumns1740000000035 implements MigrationInterface {
  name = 'FixAuditLogsColumns1740000000035';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "audit_logs"
        ADD COLUMN IF NOT EXISTS "performed_by_id" varchar,
        ADD COLUMN IF NOT EXISTS "changes" jsonb
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "audit_logs"
        DROP COLUMN IF EXISTS "performed_by_id",
        DROP COLUMN IF EXISTS "changes"
    `);
  }
}
