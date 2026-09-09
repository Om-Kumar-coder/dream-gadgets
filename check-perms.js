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
  // First check if tables exist
  const sql1 = "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename";
  const b64 = Buffer.from(sql1).toString('base64');
  const tables = await runSSH(`echo "${b64}" | base64 -d > /tmp/q.sql && sudo -u postgres psql -d dreamgadgets -f /tmp/q.sql -t -A && rm /tmp/q.sql`);
  console.log('Tables:', tables.trim());
  
  // Check roles
  const sql2 = "SELECT id, name FROM roles ORDER BY name";
  const b642 = Buffer.from(sql2).toString('base64');
  const roles = await runSSH(`echo "${b642}" | base64 -d > /tmp/q.sql && sudo -u postgres psql -d dreamgadgets -f /tmp/q.sql -t -A && rm /tmp/q.sql`);
  console.log('\nRoles:', roles.trim());
  
  // Check role_permissions
  const sql3 = "SELECT * FROM role_permissions LIMIT 5";
  const b643 = Buffer.from(sql3).toString('base64');
  const rps = await runSSH(`echo "${b643}" | base64 -d > /tmp/q.sql && sudo -u postgres psql -d dreamgadgets -f /tmp/q.sql -t -A && rm /tmp/q.sql`);
  console.log('\nrole_permissions:', rps.trim());
  
  // Check permissions
  const sql4 = "SELECT id, name FROM permissions ORDER BY name";
  const b644 = Buffer.from(sql4).toString('base64');
  const perms = await runSSH(`echo "${b644}" | base64 -d > /tmp/q.sql && sudo -u postgres psql -d dreamgadgets -f /tmp/q.sql -t -A && rm /tmp/q.sql`);
  console.log('\nPermissions:', perms.trim());
})();
