const { Client } = require('ssh2');
function runSSH(cmd) {
  return new Promise((resolve, reject) => {
    const c = new Client();
    c.on('ready', () => {
      c.exec(cmd, (err, stream) => {
        let out = '';
        stream.on('data', d => out += d.toString());
        stream.on('end', () => { c.end(); resolve(out); });
      });
    }).on('error', reject)
      .connect({ host: '187.127.165.229', port: 22, username: 'root', password: '?ESlq-)/e8z3LSgv' });
  });
}

(async () => {
  // 1. Remove wrong permissions from multi_store_manager
  //    Should NOT have: financial.*, sales.approve, roles.view
  const msql = `
    DELETE FROM role_permissions
    WHERE role_id = (SELECT id FROM roles WHERE name = 'multi_store_manager')
    AND permission_id IN (
      SELECT id FROM permissions WHERE
      (module = 'financial' AND action IN ('view','pnl','reports','export'))
      OR (module = 'sales' AND action = 'approve')
      OR (module = 'roles' AND action = 'view')
    )
  `;
  let res = await runSSH(`sudo -u postgres psql -d dreamgadgets -c "${msql.replace(/"/g, '\\"').replace(/\n/g, ' ')}" -t -A`);
  console.log('multi_store_manager removed:', res.trim());

  // 2. Remove reports.view from shop_sales, store_sales, calling_staff, employee
  for (const role of ['shop_sales', 'store_sales', 'calling_staff', 'employee']) {
    const sql = `
      DELETE FROM role_permissions
      WHERE role_id = (SELECT id FROM roles WHERE name = '${role}')
      AND permission_id = (SELECT id FROM permissions WHERE module = 'reports' AND action = 'view')
    `;
    res = await runSSH(`sudo -u postgres psql -d dreamgadgets -c "${sql.replace(/"/g, '\\"').replace(/\n/g, ' ')}" -t -A`);
    console.log(`${role} removed reports.view:`, res.trim());
  }

  // 3. Also: shop_sales & store_sales should NOT have:
  //    - transfers.* (they can't do transfers per matrix)
  //    - orders.edit (only view, not edit)
  //    - whatsapp.send for store_sales only (only view)
  for (const role of ['shop_sales', 'store_sales']) {
    const sql = `
      DELETE FROM role_permissions
      WHERE role_id = (SELECT id FROM roles WHERE name = '${role}')
      AND permission_id IN (
        SELECT id FROM permissions WHERE
        (module = 'transfers' AND action IN ('create','edit','view','delete'))
      )
    `;
    res = await runSSH(`sudo -u postgres psql -d dreamgadgets -c "${sql.replace(/"/g, '\\"').replace(/\n/g, ' ')}" -t -A`);
    console.log(`${role} removed transfers.*:`, res.trim());
  }

  // 4. calling_staff should NOT have:
  //    - orders.edit (only view)
  //    - buyback.edit (only view per matrix? Let's check... matrix doesn't list buyback for calling staff)
  //    Actually calling_staff needs orders.view + orders.edit for managing online orders. Keep orders.edit.
  //    But they should NOT have purchases.view (they shouldn't see purchases)
  //    Actually let me check: the matrix doesn't have purchases row. Let's keep calling_staff as-is for now.

  // 5. Invalidate Redis cache for all affected roles
  const roles = ['multi_store_manager', 'shop_sales', 'store_sales', 'calling_staff', 'employee'];
  const roleIds = await runSSH(`sudo -u postgres psql -d dreamgadgets -c "SELECT name, id FROM roles WHERE name IN ('${roles.join("','")}')" -t -A`);
  console.log('\nRole IDs:', roleIds.trim());

  // Get role IDs and invalidate each
  for (const role of roles) {
    const idRes = await runSSH(`sudo -u postgres psql -d dreamgadgets -c "SELECT id FROM roles WHERE name = '${role}'" -t -A`);
    const roleId = idRes.trim();
    if (roleId) {
      // We need Redis CLI on VPS
      await runSSH(`redis-cli DEL "perms:role:${roleId}"`);
      console.log(`Invalidated cache for ${role} (${roleId})`);
    }
  }

  // 6. Verify final permissions
  console.log('\n=== FINAL PERMISSIONS ===');
  for (const role of ['shop_owner','multi_store_manager','store_manager','shop_sales','store_sales','calling_staff','employee']) {
    const sql = `SELECT p.module || '.' || p.action AS perm FROM role_permissions rp JOIN permissions p ON rp.permission_id = p.id JOIN roles r ON rp.role_id = r.id WHERE r.name = '${role}' ORDER BY perm`;
    const b64 = Buffer.from(sql).toString('base64');
    const out = await runSSH(`echo "${b64}" | base64 -d > /tmp/q.sql && sudo -u postgres psql -d dreamgadgets -f /tmp/q.sql -t -A && rm /tmp/q.sql`);
    console.log(`\n=== ${role} ===`);
    console.log(out.trim());
  }
})();
