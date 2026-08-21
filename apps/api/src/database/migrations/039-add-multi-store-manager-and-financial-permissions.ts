import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds:
 * 1. `multi_store_manager` role with cross-store inventory/staff access
 * 2. Financial permissions (financial.view, financial.reports, financial.pnl)
 * 3. `financial_access` column on users table to control financial data visibility
 */
export class AddMultiStoreManagerAndFinancialPerms1750000000039
  implements MigrationInterface
{
  name = 'AddMultiStoreManagerAndFinancialPerms1750000000039';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add financial module permissions
    const FINANCIAL_ACTIONS = ['view', 'reports', 'pnl', 'export'];
    for (const action of FINANCIAL_ACTIONS) {
      await queryRunner.query(
        `INSERT INTO "permissions" ("module", "action", "description")
         VALUES ('financial', $1, $2)
         ON CONFLICT ("module", "action") DO UPDATE SET "description" = EXCLUDED."description"`,
        [action, `${action} financial`],
      );
    }

    // 2. Add `financial_access` column to users table
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "financial_access" boolean DEFAULT false`,
    );

    // 3. Create multi_store_manager role
    await queryRunner.query(
      `INSERT INTO "roles" ("name", "description", "is_system")
       VALUES ('multi_store_manager', 'Multi-Store Manager', true)
       ON CONFLICT ("name") DO NOTHING`,
    );

    // 4. Assign permissions to multi_store_manager
    // Can see all stores, all inventory, manage staff — but NOT financial unless explicitly granted
    const MANAGER_MODULES: Record<string, string[]> = {
      dashboard: ['view'],
      inventory: ['view', 'create', 'edit', 'export'],
      purchases: ['view', 'create', 'edit', 'export'],
      sales: ['view', 'create', 'edit', 'export', 'approve'],
      clients: ['view', 'create', 'edit', 'export'],
      transfers: ['view', 'create', 'edit'],
      exchange: ['view', 'create', 'edit', 'approve'],
      orders: ['view', 'edit'],
      returns: ['view', 'create', 'approve'],
      reports: ['view', 'export'],
      users: ['view', 'create', 'edit'],
      settings: [],
      content: [],
      buyback: ['view', 'edit'],
      whatsapp: ['view', 'edit', 'send'],
      coupons: ['view', 'create', 'edit'],
      emi: ['view', 'create', 'edit'],
      gst: ['view', 'export'],
      notifications: ['view'],
      payments: ['view', 'approve'],
      // NO financial permissions by default
    };

    for (const [module, actions] of Object.entries(MANAGER_MODULES)) {
      if (actions.length === 0) continue;
      await queryRunner.query(
        `INSERT INTO "role_permissions" ("role_id", "permission_id")
         SELECT r.id, p.id
         FROM "roles" r
         CROSS JOIN "permissions" p
         WHERE r."name" = 'multi_store_manager'
           AND p."module" = $1
           AND p."action" = ANY($2)
         ON CONFLICT DO NOTHING`,
        [module, actions],
      );
    }

    // 5. Assign financial permissions to shop_owner (all financial access)
    const FINANCIAL_ACTIONS_OWNER = ['view', 'reports', 'pnl', 'export'];
    await queryRunner.query(
      `INSERT INTO "role_permissions" ("role_id", "permission_id")
       SELECT r.id, p.id
       FROM "roles" r
       CROSS JOIN "permissions" p
       WHERE r."name" = 'shop_owner'
         AND p."module" = 'financial'
         AND p."action" = ANY($1)
       ON CONFLICT DO NOTHING`,
      [FINANCIAL_ACTIONS_OWNER],
    );

    // 6. Assign financial.view to store_manager (they see store-level financials)
    await queryRunner.query(
      `INSERT INTO "role_permissions" ("role_id", "permission_id")
       SELECT r.id, p.id
       FROM "roles" r
       CROSS JOIN "permissions" p
       WHERE r."name" = 'store_manager'
         AND p."module" = 'financial'
         AND p."action" IN ('view', 'reports')
       ON CONFLICT DO NOTHING`,
    );

    // 7. Mark owner user with financial_access
    await queryRunner.query(
      `UPDATE "users" SET "financial_access" = true
       WHERE "role_id" IN (
         SELECT id FROM "roles" WHERE "name" = 'shop_owner'
       )`,
    );

    // 8. Mark multi_store_manager users with financial_access = false (default)
    // They need explicit financial_access grant from owner
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "role_permissions" WHERE "role_id" IN (
        SELECT id FROM "roles" WHERE "name" = 'multi_store_manager'
      )`,
    );
    await queryRunner.query(
      `DELETE FROM "roles" WHERE "name" = 'multi_store_manager'`,
    );
    await queryRunner.query(
      `DELETE FROM "permissions" WHERE "module" = 'financial'`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN IF EXISTS "financial_access"`,
    );
  }
}
