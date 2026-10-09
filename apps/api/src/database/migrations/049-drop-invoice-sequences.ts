import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * BUG-24 — `invoice_sequences` was created in migration 003 as a per-branch
 * invoice counter, but SalesService has always numbered invoices from Redis
 * (`redisService.getNextInvoiceSequence`, with DB resync on collision). A
 * repo-wide search shows no reader or writer outside this table's own DDL, so
 * the table is dead weight that suggests (falsely) that invoice numbering is
 * persisted here.
 *
 * Invoice numbering itself is untouched: Redis stays authoritative.
 * `down()` recreates the empty table exactly as 003 defined it.
 */
export class DropInvoiceSequences1759000000049 implements MigrationInterface {
  name = '049-drop-invoice-sequences-1759000000049';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "invoice_sequences"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate exactly as migration 003 defined it.
    await queryRunner.query(`
      CREATE TABLE "invoice_sequences" (
        "branch_id"  UUID NOT NULL REFERENCES "branches"("id"),
        "year"       SMALLINT NOT NULL,
        "prefix"     VARCHAR(20) NOT NULL DEFAULT 'DG',
        "last_seq"   INT NOT NULL DEFAULT 0,
        PRIMARY KEY ("branch_id", "year")
      )
    `);
  }
}
