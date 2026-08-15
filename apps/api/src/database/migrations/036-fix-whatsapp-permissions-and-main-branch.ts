import { MigrationInterface, QueryRunner } from 'typeorm';

// Fixes found by the live QA run (2026-08-15):
//  - WhatsApp module returns 403 for every role because role_permissions were
//    seeded before the whatsapp module existed (seeds aren't re-run on deploy).
//  - MAIN branch shows a placeholder address ("123 Tech Street, Mumbai").
//  - search_vector is generated from item_name/imei/pku_code only, and the
//    seeded catalog has item_name = NULL, so full-text search matches nothing.
export class FixWhatsappPermissionsAndMainBranch1750000000036 implements MigrationInterface {
  name = 'FixWhatsappPermissionsAndMainBranch1750000000036';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Ensure whatsapp module permissions exist (idempotent).
    const WHATSAPP_ACTIONS = ['view', 'create', 'edit', 'delete', 'export', 'approve', 'send'];
    for (const action of WHATSAPP_ACTIONS) {
      await queryRunner.query(
        `INSERT INTO "permissions" ("module", "action", "description")
         VALUES ('whatsapp', $1, $2)
         ON CONFLICT ("module", "action") DO UPDATE SET "description" = EXCLUDED."description"`,
        [action, `${action} whatsapp`],
      );
    }

    // 2. Assign whatsapp permissions per the role matrix (matches seed 001).
    const matrix: Record<string, string[]> = {
      shop_owner: WHATSAPP_ACTIONS,
      store_manager: ['view', 'edit', 'send'],
      shop_sales: ['view', 'send'],
      store_sales: ['view'],
      calling_staff: ['view', 'edit', 'send'],
      employee: [],
    };
    for (const [roleName, actions] of Object.entries(matrix)) {
      if (actions.length === 0) continue;
      await queryRunner.query(
        `INSERT INTO "role_permissions" ("role_id", "permission_id")
         SELECT r.id, p.id
         FROM "roles" r
         CROSS JOIN "permissions" p
         WHERE r."name" = $1 AND p."module" = 'whatsapp' AND p."action" = ANY($2)
         ON CONFLICT DO NOTHING`,
        [roleName, actions],
      );
    }

    // 3. Fix MAIN branch placeholder data → real flagship (Chetla) details.
    await queryRunner.query(
      `UPDATE "branches" SET
         "address" = '29A, Pitambar Ghatak Lane, Chetla, Near Chetla Police Station, Opp. CIT Market',
         "city" = 'Kolkata',
         "state" = 'West Bengal',
         "pincode" = '700027',
         "phone" = '8282011193',
         "whatsapp" = '8282011193',
         "email" = 'dreamgadgetskolkata@gmail.com',
         "instagram" = '@dream_gadgets_kolkata',
         "working_hours" = '12:30 PM – 9:30 PM'
       WHERE "code" = 'MAIN'`,
    );

    // 4. Backfill item_name (model + storage) so the generated search_vector
    //    actually contains searchable product names.
    await queryRunner.query(
      `UPDATE "inventory_items" i
       SET "item_name" = TRIM(COALESCE(m."name", '') || ' ' || COALESCE(i."storage", ''))
       FROM "models" m
       WHERE i."model_id" = m."id"
         AND (i."item_name" IS NULL OR i."item_name" = '')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Permissions and master-data corrections are not reverted.
  }
}
