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
  // Flush ALL Redis keys to force fresh DB lookups
  console.log('=== Flushing Redis ===');
  const flush = await runSSH('redis-cli FLUSHALL');
  console.log('Flush result:', flush.trim());

  // Verify employee only has dashboard.view in DB
  console.log('\n=== Employee DB permissions ===');
  const empSql = `SELECT p.module || '.' || p.action AS perm FROM role_permissions rp JOIN permissions p ON rp.permission_id = p.id JOIN roles r ON rp.role_id = r.id WHERE r.name = 'employee' ORDER BY perm`;
  const empB64 = Buffer.from(empSql).toString('base64');
  const emp = await runSSH(`echo "${empB64}" | base64 -d | sudo -u postgres psql -d dreamgadgets -t -A`);
  console.log(emp.trim());

  // Verify store_sales
  console.log('\n=== Store Sales DB permissions ===');
  const ssSql = `SELECT p.module || '.' || p.action AS perm FROM role_permissions rp JOIN permissions p ON rp.permission_id = p.id JOIN roles r ON rp.role_id = r.id WHERE r.name = 'store_sales' ORDER BY perm`;
  const ssB64 = Buffer.from(ssSql).toString('base64');
  const ss = await runSSH(`echo "${ssB64}" | base64 -d | sudo -u postgres psql -d dreamgadgets -t -A`);
  console.log(ss.trim());

  // Now login as employee and check JWT
  console.log('\n=== Login as Employee ===');
  const empLogin = await fetch('https://dreamgadgets.in/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: '9800000007', password: 'Test@1234' }),
  });
  const empData = await empLogin.json();
  const empToken = empData.accessToken || empData.data?.accessToken;
  if (empToken) {
    const payload = JSON.parse(Buffer.from(empToken.split('.')[1], 'base64').toString());
    console.log(`Employee JWT permissions (${payload.permissions?.length || 0}):`);
    console.log((payload.permissions || []).sort().join(', '));
  } else {
    console.log('Login failed:', JSON.stringify(empData).substring(0, 200));
  }

  // Login as store_sales
  console.log('\n=== Login as Store Sales ===');
  const ssLogin = await fetch('https://dreamgadgets.in/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: '9800000006', password: 'Test@1234' }),
  });
  const ssData = await ssLogin.json();
  const ssToken = ssData.accessToken || ssData.data?.accessToken;
  if (ssToken) {
    const payload = JSON.parse(Buffer.from(ssToken.split('.')[1], 'base64').toString());
    console.log(`Store Sales JWT permissions (${payload.permissions?.length || 0}):`);
    console.log((payload.permissions || []).sort().join(', '));
  } else {
    console.log('Login failed:', JSON.stringify(ssData).substring(0, 200));
  }
})();
