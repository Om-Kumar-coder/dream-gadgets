const { Client } = require('ssh2');
const conn = new Client();
function exec(cmd) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let out = '';
      stream.on('data', d => out += d.toString());
      stream.stderr.on('data', d => out += d.toString());
      stream.on('close', () => resolve(out.trim()));
    });
  });
}
conn.connect({ host: '187.127.165.229', port: 22, username: 'root', password: '?ESlq-)/e8z3LSgv', readyTimeout: 15000 });
conn.on('ready', async () => {
  console.log('✅ Connected — RBAC Authorization Tests\n');
  let passed = 0, failed = 0;
  function assert(label, actual, expected) {
    if (actual === expected) { passed++; console.log(`  ✅ ${label}`); }
    else { failed++; console.log(`  ❌ ${label} — expected ${expected}, got ${actual}`); }
  }

  // Get owner token
  console.log('=== 1. Login as owner ===');
  let r = await exec(`curl -s -X POST http://localhost:3000/api/v1/auth/login -H "Content-Type: application/json" -d '{"identifier":"owner@dreamgadgets.in","password":"Admin@12345"}'`);
  let j = JSON.parse(r);
  const ownerToken = j.accessToken;
  assert('Owner login succeeds', !!ownerToken, true);

  // Test 2: Unauthenticated access to protected endpoints
  console.log('\n=== 2. Unauthenticated access (expect 401) ===');
  r = await exec('curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/v1/admin/users');
  assert('GET /admin/users without token → 401', r, '401');
  r = await exec('curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/v1/clients');
  assert('GET /clients without token → 401', r, '401');

  // Test 3: Owner can access protected endpoints
  console.log('\n=== 3. Owner access (expect 200) ===');
  r = await exec(`curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer ${ownerToken}" http://localhost:3000/api/v1/admin/users`);
  assert('GET /admin/users with owner token → 200', r, '200');
  r = await exec(`curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer ${ownerToken}" http://localhost:3000/api/v1/admin/roles`);
  assert('GET /admin/roles with owner token → 200', r, '200');
  r = await exec(`curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer ${ownerToken}" http://localhost:3000/api/v1/admin/banners`);
  assert('GET /admin/banners with owner token → 200', r, '200');
  r = await exec(`curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer ${ownerToken}" http://localhost:3000/api/v1/admin/pages`);
  assert('GET /admin/pages with owner token → 200', r, '200');

  // Test 4: Public endpoints remain public
  console.log('\n=== 4. Public endpoints (expect 200) ===');
  r = await exec('curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/v1/public/buyback/estimate-price -X POST -H "Content-Type: application/json" -d \'{"brand":"Apple","modelName":"iPhone 16 Pro","condition":"sealed_pack"}\'');
  assert('POST /public/buyback/estimate-price → 200', r, '200');
  r = await exec('curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/v1/health');
  assert('GET /health → 200', r, '200');

  // Test 5: Self-escalation prevention
  console.log('\n=== 5. Self-escalation prevention ===');
  // Get user's own ID
  r = await exec(`curl -s -H "Authorization: Bearer ${ownerToken}" http://localhost:3000/api/v1/auth/me`);
  j = JSON.parse(r);
  const ownUserId = j.data?.id || j.id;
  if (ownUserId) {
    // Try to change own role (should be blocked for owner trying to change own role)
    r = await exec(`curl -s -o /dev/null -w "%{http_code}" -X PATCH -H "Authorization: Bearer ${ownerToken}" -H "Content-Type: application/json" http://localhost:3000/api/v1/admin/users/${ownUserId} -d '{"roleId":"some-other-role"}'`);
    assert('Self-escalation (own role change) blocked → 403', r, '403');
  } else {
    console.log('  ⚠️  Could not get own user ID (response format different)');
  }

  // Test 6: Buyback API still works (regression)
  console.log('\n=== 6. Buyback regression ===');
  r = await exec('curl -s -X POST http://localhost:3000/api/v1/public/buyback/estimate-price -H "Content-Type: application/json" -d \'{"brand":"Apple","modelName":"iPhone 16 Pro","condition":"sealed_pack"}\'');
  j = JSON.parse(r);
  assert('Buyback estimate price correct', j.data?.estimatedPrice, 104500);
  assert('No double-nesting', !j.data?.data, true);

  // Test 7: Health check
  console.log('\n=== 7. Service health ===');
  r = await exec('curl -s http://localhost:3000/api/v1/health');
  j = JSON.parse(r);
  assert('API healthy', j.data?.services?.api?.status, 'ok');
  assert('DB healthy', j.data?.services?.database?.status, 'ok');
  assert('Redis healthy', j.data?.services?.redis?.status, 'ok');

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log(`${'='.repeat(50)}`);

  conn.end();
});
