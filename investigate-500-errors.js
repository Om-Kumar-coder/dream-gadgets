const { Client } = require('ssh2');
const conn = new Client();
const HOST = '187.127.165.229';
const PASS = '?ESlq-)/e8z3LSgv';
const USER = 'root';

const cmds = [
  // Test all 3 failing endpoints directly
  'echo "=== TEST /auth/me ===" && curl -s -H "Authorization: Bearer test" http://localhost:3000/api/v1/auth/me 2>&1 | head -5',
  'echo "=== TEST /clients ===" && curl -s -H "Authorization: Bearer test" http://localhost:3000/api/v1/clients 2>&1 | head -5',
  'echo "=== TEST /inventory ===" && curl -s -H "Authorization: Bearer test" http://localhost:3000/api/v1/inventory 2>&1 | head -5',
  // Check API logs for recent errors
  'echo "=== API ERROR LOG (last 30 lines) ===" && tail -30 /var/www/dream-gadgets/apps/api/pm2-error.log 2>/dev/null',
  'echo "=== API OUT LOG (last 30 lines) ===" && tail -30 /var/www/dream-gadgets/apps/api/pm2-out.log 2>/dev/null',
  // Try with proper auth token
  'echo "=== GET AUTH TOKEN ===" && TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login -H "Content-Type: application/json" -d "{\"identifier\":\"admin@test.com\",\"password\":\"Admin@12345\"}" | grep -o "\"accessToken\":\"[^\"]*\"" | cut -d"\"" -f4) && echo "TOKEN: $TOKEN" && echo "=== AUTHENTICATED /auth/me ===" && curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/v1/auth/me 2>&1 | head -10 && echo "=== AUTHENTICATED /clients ===" && curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/v1/clients 2>&1 | head -10 && echo "=== AUTHENTICATED /inventory ===" && curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/v1/inventory 2>&1 | head -10',
];

let i = 0;
conn.on('ready', () => { next(); function next() { if (i >= cmds.length) { conn.end(); return; } conn.exec(cmds[i], (err, s) => { if (err) { console.log('FAIL:', cmds[i].substring(0,60)); i++; next(); return; } let o = ''; s.on('data', d => o += d); s.stderr.on('data', d => o += d); s.on('close', () => { console.log(o); i++; next(); }); }); } });
conn.on('error', e => { console.error('SSH Error:', e.message); process.exit(1); });
conn.connect({ host: HOST, port: 22, username: USER, password: PASS, readyTimeout: 30000, keepaliveInterval: 10000 });
