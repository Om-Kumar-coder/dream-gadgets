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
  // Check what DB the API is connecting to
  const env = await runSSH('cat /var/www/dream-gadgets/apps/api/.env 2>/dev/null | grep -i "DB\\|DATABASE\\|REDIS" | head -10');
  console.log('=== API DB config ===');
  console.log(env);

  // Check the actual DB name being used by psql
  const dbName = await runSSH('sudo -u postgres psql -d dreamgadgets -c "SELECT current_database()" -t -A');
  console.log('\n=== Current DB ===');
  console.log(dbName.trim());

  // Check total role_permissions count
  const count = await runSSH('sudo -u postgres psql -d dreamgadgets -c "SELECT role_id, count(*) as cnt FROM role_permissions GROUP BY role_id" -t -A');
  console.log('\n=== Role permissions count ===');
  console.log(count.trim());

  // Now login as employee and check the DB query result directly
  const result = await runSSH('sudo -u postgres psql -d dreamgadgets -t -A -c "SELECT p.module, p.action FROM permissions p JOIN role_permissions rp ON rp.permission_id = p.id WHERE rp.role_id = (SELECT id FROM roles WHERE name = \\x27employee\\x27)"');
  console.log('\n=== Direct query employee ===');
  console.log(result.trim());

  // Check if the API might be using a different DB
  const apiDb = await runSSH('grep -i "database\\|dbname" /var/www/dream-gadgets/apps/api/.env | head -5');
  console.log('\n=== API database setting ===');
  console.log(apiDb);
})().catch(e => console.error(e));
