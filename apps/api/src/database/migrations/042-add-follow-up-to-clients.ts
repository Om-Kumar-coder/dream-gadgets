import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFollowUpToClients1757894400000 implements MigrationInterface {
  // Name must carry the trailing timestamp TypeORM requires AND match the name
  // already recorded in existing environments' migrations table (applied by an
  // earlier server-side hotfix), so this migration is not re-executed there.
  name = 'AddFollowUpToClients1757894400000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE clients
        ADD COLUMN IF NOT EXISTS next_follow_up_at timestamptz,
        ADD COLUMN IF NOT EXISTS follow_up_notes text,
        ADD COLUMN IF NOT EXISTS follow_up_status varchar DEFAULT 'none'
    `);

    // Index for fast follow-up queue queries
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_clients_follow_up
        ON clients (next_follow_up_at, follow_up_status)
        WHERE follow_up_status IN ('pending', 'overdue')
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_clients_follow_up`);
    await queryRunner.query(`
      ALTER TABLE clients
        DROP COLUMN IF EXISTS next_follow_up_at,
        DROP COLUMN IF EXISTS follow_up_notes,
        DROP COLUMN IF EXISTS follow_up_status
    `);
  }
}
