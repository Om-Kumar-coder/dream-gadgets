export class AddEmiPermissions1712345678030 {
    constructor() {
        this.name = 'AddEmiPermissions1712345678030';
    }
    async up(queryRunner) {
        // Insert EMI permissions
        const permissions = [
            { module: 'emi', action: 'view', description: 'View EMI providers and plans' },
            { module: 'emi', action: 'create', description: 'Create EMI providers and plans' },
            { module: 'emi', action: 'edit', description: 'Edit EMI providers and plans' },
            { module: 'emi', action: 'delete', description: 'Delete EMI providers and plans' },
        ];
        for (const perm of permissions) {
            await queryRunner.query(`INSERT INTO permissions (module, action, description)
         VALUES ($1, $2, $3)
         ON CONFLICT (module, action) DO NOTHING`, [perm.module, perm.action, perm.description]);
        }
        // Assign emi.* permissions to admin and shop_owner roles
        // First, get the permission IDs
        await queryRunner.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id
      FROM roles r, permissions p
      WHERE r.name IN ('admin', 'shop_owner')
        AND p.module = 'emi'
        AND NOT EXISTS (
          SELECT 1 FROM role_permissions rp
          WHERE rp.role_id = r.id AND rp.permission_id = p.id
        )
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DELETE FROM role_permissions WHERE permission_id IN (
        SELECT id FROM permissions WHERE module = 'emi'
      )`);
        await queryRunner.query(`DELETE FROM permissions WHERE module = 'emi'`);
    }
}
//# sourceMappingURL=030-add-emi-permissions.js.map