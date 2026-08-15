import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddKolkataBranches1740000000033 implements MigrationInterface {
  name = 'AddKolkataBranches1740000000033';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Master-data insert — ON CONFLICT makes re-runs safe (updates instead of failing).
    await queryRunner.query(`
      INSERT INTO "branches" ("name", "code", "address", "city", "state", "pincode", "phone", "whatsapp", "email", "instagram", "working_hours", "sort_order")
      VALUES
        ('Dream Gadgets — Barrackpore', 'BARRACK', 'Barrackpore Station Road', 'Barrackpore', 'West Bengal', '700120', '8017999888', '8017999888', 'dreamgadgetskolkata@gmail.com', '@dream_gadgets_kolkata', '10:30 AM – 9:30 PM', 4),
        ('Dream Gadgets — Salt Lake', 'SALT_LAKE', 'Sector 5, Salt Lake City', 'Kolkata', 'West Bengal', '700091', '8017999888', '8017999888', 'dreamgadgetskolkata@gmail.com', '@dream_gadgets_kolkata', '10:30 AM – 9:30 PM', 5),
        ('Dream Gadgets — Howrah', 'HOWRAH', 'Howrah Station Area', 'Howrah', 'West Bengal', '711101', '8017999888', '8017999888', 'dreamgadgetskolkata@gmail.com', '@dream_gadgets_kolkata', '10:30 AM – 9:30 PM', 6)
      ON CONFLICT ("code") DO UPDATE SET
        "name"          = EXCLUDED."name",
        "address"       = EXCLUDED."address",
        "city"          = EXCLUDED."city",
        "state"         = EXCLUDED."state",
        "pincode"       = EXCLUDED."pincode",
        "phone"         = EXCLUDED."phone",
        "whatsapp"      = EXCLUDED."whatsapp",
        "email"         = EXCLUDED."email",
        "instagram"     = EXCLUDED."instagram",
        "working_hours" = EXCLUDED."working_hours"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "branches" WHERE "code" IN ('BARRACK', 'SALT_LAKE', 'HOWRAH')`);
  }
}
