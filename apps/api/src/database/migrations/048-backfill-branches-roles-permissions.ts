import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Backfills the two permission modules the admin controller requires but the
 * permission seed never created: `branches.*` and `roles.*`.
 *
 * Why: GET /admin/branches (store filter, Store Details, Branches page) requires
 * `branches.view` and GET /admin/roles requires `roles.view`. Those modules did
 * not exist in `permissions`, so every role 403'd on those endpoints.
 *
 * Grants (matching the seed matrix):
 *  - shop_owner: branches.* + roles.* (all actions)
 *  - store_manager / multi_store_manager: branches.view + roles.view
 *
 * Additive + idempotent — no existing rows are modified or removed.
 */
export class BackfillBranchesRolesPermissions1759100000048 implements MigrationInterface {
  name = '048-backfill-branches-roles-permissions-1759100000048';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Ensure the permission rows exist.
    await queryRunner.query(`
      INSERT INTO permissions (module, action, description)
      VALUES
        ('branches', 'view', 'view branches'),
        ('branches', 'create', 'create branches'),
        ('branches', 'edit', 'edit branches'),
        ('branches', 'delete', 'delete branches'),
        ('roles', 'view', 'view roles'),
        ('roles', 'create', 'create roles'),
        ('roles', 'edit', 'edit roles'),
        ('roles', 'delete', 'delete roles')
      ON CONFLICT (module, action) DO NOTHING
    `);

    // 2. Grant to shop_owner (all branches/roles actions).
    await queryRunner.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id
      FROM roles r
      CROSS JOIN permissions p
      WHERE r.name = 'shop_owner'
        AND p.module IN ('branches', 'roles')
      ON CONFLICT DO NOTHING
    `);

    // 3. Grant branches.view + roles.view to manager-class roles.
    await queryRunner.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id
      FROM roles r
      CROSS JOIN permissions p
      WHERE r.name IN ('store_manager', 'multi_store_manager')
        AND p.module IN ('branches', 'roles')
        AND p.action = 'view'
      ON CONFLICT DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM role_permissions
      WHERE permission_id IN (
        SELECT p.id FROM permissions p WHERE p.module IN ('branches', 'roles')
      )
    `);
    await queryRunner.query(`
      DELETE FROM permissions WHERE module IN ('branches', 'roles')
    `);
  }
}
