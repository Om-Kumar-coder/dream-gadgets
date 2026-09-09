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
  // Use psql with -A flag for unaligned output
  const out = await runSSH(`sudo -u postgres psql -d dreamgadgets -A -c "SELECT phone, name, role_id, is_active FROM users ORDER BY phone"`);
  console.log(out);

  // Also check with phone format
  const out2 = await runSSH(`sudo -u postgres psql -d dreamgadgets -A -c "SELECT phone, name, r.name as role FROM users u JOIN roles r ON u.role_id = r.id ORDER BY phone"`);
  console.log('\nUser with roles:');
  console.log(out2);
})().catch(e => console.error(e));
