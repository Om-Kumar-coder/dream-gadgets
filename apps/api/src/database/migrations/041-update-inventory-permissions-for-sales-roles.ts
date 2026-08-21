import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateInventoryPermissionsForSalesRoles1755000000041
  implements MigrationInterface
{
  name = '041-update-inventory-permissions-for-sales-roles-1755000000041';

  async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add inventory.create and inventory.edit to shop_sales
    await queryRunner.query(`
      UPDATE settings
      SET value = (
        SELECT jsonb_agg(DISTINCT val)
        FROM (
          SELECT jsonb_array_elements_text(value) AS val
          FROM settings
          WHERE key = 'role_permissions.shop_sales'
          UNION ALL
          SELECT unnest(ARRAY['inventory.create', 'inventory.edit']) AS val
        ) combined
      )
      WHERE key = 'role_permissions.shop_sales'
    `);

    // 2. Add inventory.create and inventory.edit to store_sales
    await queryRunner.query(`
      UPDATE settings
      SET value = (
        SELECT jsonb_agg(DISTINCT val)
        FROM (
          SELECT jsonb_array_elements_text(value) AS val
          FROM settings
          WHERE key = 'role_permissions.store_sales'
          UNION ALL
          SELECT unnest(ARRAY['inventory.create', 'inventory.edit']) AS val
        ) combined
      )
      WHERE key = 'role_permissions.store_sales'
    `);

    // 3. Add products.publish to shop_owner, store_manager, multi_store_manager
    for (const roleKey of [
      'role_permissions.shop_owner',
      'role_permissions.store_manager',
      'role_permissions.multi_store_manager',
    ]) {
      await queryRunner.query(
        `
        UPDATE settings
        SET value = (
          SELECT jsonb_agg(DISTINCT val)
          FROM (
            SELECT jsonb_array_elements_text(value) AS val
            FROM settings
            WHERE key = $1
            UNION ALL
            SELECT 'products.publish' AS val
          ) combined
        )
        WHERE key = $1
      `,
        [roleKey],
      );
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    // Remove inventory.create/edit from shop_sales and store_sales
    for (const roleKey of [
      'role_permissions.shop_sales',
      'role_permissions.store_sales',
    ]) {
      await queryRunner.query(
        `
        UPDATE settings
        SET value = (
          SELECT jsonb_agg(val)
          FROM (
            SELECT jsonb_array_elements_text(value) AS val
            FROM settings
            WHERE key = $1
          ) filtered
          WHERE val NOT IN ('inventory.create', 'inventory.edit')
        )
        WHERE key = $1
      `,
        [roleKey],
      );
    }

    // Remove products.publish from all roles
    for (const roleKey of [
      'role_permissions.shop_owner',
      'role_permissions.store_manager',
      'role_permissions.multi_store_manager',
    ]) {
      await queryRunner.query(
        `
        UPDATE settings
        SET value = (
          SELECT jsonb_agg(val)
          FROM (
            SELECT jsonb_array_elements_text(value) AS val
            FROM settings
            WHERE key = $1
          ) filtered
          WHERE val != 'products.publish'
        )
        WHERE key = $1
      `,
        [roleKey],
      );
    }
  }
}
