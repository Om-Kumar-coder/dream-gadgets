import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateContactInquiries1710000000001 implements MigrationInterface {
  name = 'CreateContactInquiries1710000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "contact_inquiries" (
        "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "name"       VARCHAR(300) NOT NULL,
        "phone"      VARCHAR(20) NOT NULL,
        "email"      VARCHAR(255),
        "message"    TEXT NOT NULL,
        "is_read"    BOOLEAN NOT NULL DEFAULT false,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_contact_inquiries_created" ON "contact_inquiries"("created_at" DESC)`);
    await queryRunner.query(`CREATE INDEX "idx_contact_inquiries_read" ON "contact_inquiries"("is_read")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "contact_inquiries"`);
  }
}
