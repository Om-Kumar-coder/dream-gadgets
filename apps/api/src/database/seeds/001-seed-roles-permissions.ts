import { DataSource } from 'typeorm';

// All modules and their allowed actions
const MODULES = [
  'dashboard',
  'inventory',
  'purchases',
  'sales',
  'clients',
  'transfers',
  'exchange',
  'orders',
  'returns',
  'reports',
  'users',
  'settings',
  'content',
  'buyback',
  'whatsapp',
];

const ACTIONS = ['view', 'create', 'edit', 'delete', 'export', 'approve', 'send'];

// Role permission matrix
// Format: { module: actions[] }
const ROLE_PERMISSIONS: Record<string, Record<string, string[]>> = {
  shop_owner: Object.fromEntries(MODULES.map((m) => [m, ACTIONS])),

  store_manager: {
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
  },

  shop_sales: {
    dashboard: ['view'],
    inventory: ['view'],
    purchases: ['view', 'create'],
    sales: ['view', 'create'],
    clients: ['view', 'create', 'edit'],
    transfers: [],
    exchange: ['view', 'create'],
    orders: ['view'],
    returns: ['view', 'create'],
    reports: [],
    users: [],
    settings: [],
    content: [],
    buyback: ['view'],
    whatsapp: ['view', 'send'],
  },

  store_sales: {
    dashboard: ['view'],
    inventory: ['view'],
    purchases: ['view', 'create'],
    sales: ['view', 'create'],
    clients: ['view', 'create', 'edit'],
    transfers: [],
    exchange: ['view', 'create'],
    orders: ['view'],
    returns: ['view', 'create'],
    reports: [],
    users: [],
    settings: [],
    content: [],
    buyback: ['view'],
    whatsapp: ['view'],
  },

  calling_staff: {
    dashboard: ['view'],
    inventory: ['view'],
    purchases: ['view'],
    sales: ['view'],
    clients: ['view', 'create', 'edit'],
    transfers: [],
    exchange: [],
    orders: ['view', 'edit'],
    returns: ['view', 'create'],
    reports: [],
    users: [],
    settings: [],
    content: [],
    buyback: ['view', 'edit'],
    whatsapp: ['view', 'edit', 'send'],
  },

  employee: {
    dashboard: [],
    inventory: [],
    purchases: [],
    sales: [],
    clients: ['view'],
    transfers: [],
    exchange: [],
    orders: [],
    returns: [],
    reports: [],
    users: [],
    settings: [],
    content: [],
    buyback: [],
    whatsapp: [],
  },
};

export async function seedRolesAndPermissions(dataSource: DataSource): Promise<void> {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // Insert all permissions
    const permissionIds: Record<string, string> = {};
    for (const module of MODULES) {
      for (const action of ACTIONS) {
        const result = await queryRunner.query(
          `INSERT INTO permissions (module, action, description)
           VALUES ($1, $2, $3)
           ON CONFLICT (module, action) DO UPDATE SET description = EXCLUDED.description
           RETURNING id`,
          [module, action, `${action} ${module}`],
        );
        permissionIds[`${module}.${action}`] = result[0].id;
      }
    }

    // Insert roles and assign permissions
    for (const [roleName, modulePerms] of Object.entries(ROLE_PERMISSIONS)) {
      const roleResult = await queryRunner.query(
        `INSERT INTO roles (name, description, is_system)
         VALUES ($1, $2, true)
         ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description
         RETURNING id`,
        [roleName, roleName.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())],
      );
      const roleId = roleResult[0].id;

      // Clear existing permissions for this role
      await queryRunner.query(`DELETE FROM role_permissions WHERE role_id = $1`, [roleId]);

      // Assign permissions
      for (const [module, actions] of Object.entries(modulePerms)) {
        for (const action of actions) {
          const permId = permissionIds[`${module}.${action}`];
          if (permId) {
            await queryRunner.query(
              `INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
              [roleId, permId],
            );
          }
        }
      }
    }

    await queryRunner.commitTransaction();
    console.log('✓ Roles and permissions seeded');
  } catch (err) {
    await queryRunner.rollbackTransaction();
    throw err;
  } finally {
    await queryRunner.release();
  }
}
