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
  // Flush Redis first
  await runSSH('redis-cli FLUSHALL');
  console.log('Redis flushed');

  const users = [
    { name: 'Owner', phone: '9800000001' },
    { name: 'Multi-Store Mgr', phone: '9800000007' },
    { name: 'Store Manager', phone: '9800000002' },
    { name: 'Shop Sales', phone: '9800000003' },
    { name: 'Store Sales', phone: '9800000004' },
    { name: 'Calling Staff', phone: '9800000005' },
    { name: 'Employee', phone: '9800000006' },
  ];

  for (const u of users) {
    const res = await fetch('https://dreamgadgets.in/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: u.phone, password: 'Test@1234' }),
    });
    const data = await res.json();
    const token = data.accessToken || data.data?.accessToken;
    if (!token) {
      console.log(`${u.name} (${u.phone}): LOGIN FAILED - ${JSON.stringify(data).substring(0, 150)}`);
      continue;
    }
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    console.log(`${u.name} (${u.phone}): ${payload.permissions?.length || 0} permissions`);
    console.log(`  ${(payload.permissions || []).sort().join(', ')}`);
  }
})().catch(e => console.error(e));
