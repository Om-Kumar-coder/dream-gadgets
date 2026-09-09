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
  const roles = ['shop_owner','multi_store_manager','store_manager','shop_sales','store_sales','calling_staff','employee'];
  for (const r of roles) {
    const sql = `SELECT p.module || '.' || p.action AS perm FROM role_permissions rp JOIN permissions p ON rp.permission_id = p.id JOIN roles r ON rp.role_id = r.id WHERE r.name = '${r}' ORDER BY perm`;
    const b64 = Buffer.from(sql).toString('base64');
    const res = await runSSH(`echo "${b64}" | base64 -d > /tmp/q.sql && sudo -u postgres psql -d dreamgadgets -f /tmp/q.sql -t -A && rm /tmp/q.sql`);
    console.log(`\n=== ${r} ===`);
    console.log(res.trim());
  }
})();
