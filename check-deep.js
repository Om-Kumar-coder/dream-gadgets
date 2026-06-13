const { Client } = require('ssh2');
const conn = new Client();
const HOST = '187.127.165.229';
const PASS = '?ESlq-)/e8z3LSgv';
const USER = 'root';

const cmds = [
  'echo "=== PM2 describe API ===" && pm2 show dream-gadgets-api 2>&1 | head -25',
  'echo "=== API error log tail (exit 0 if clean) ===" && tail -10 /var/www/dream-gadgets/apps/api/pm2-error.log 2>/dev/null; echo "---EOF---"',
  'echo "=== API out log tail ===" && tail -15 /var/www/dream-gadgets/apps/api/pm2-out.log 2>/dev/null; echo "---EOF---"',
  'echo "=== Health check ===" && curl -s http://localhost:3000/api/v1/health 2>&1; echo ""',
  'echo "=== PM2 describe web ===" && pm2 show dream-gadgets-web 2>&1 | head -10',
  'echo "=== Web error log tail ===" && tail -5 /var/www/dream-gadgets/apps/web/pm2-error.log 2>/dev/null; echo "---EOF---"',
  'echo "=== PM2 describe admin ===" && pm2 show dream-gadgets-admin 2>&1 | head -10',
  'echo "=== Admin error log tail ===" && tail -5 /var/www/dream-gadgets/apps/admin/pm2-error.log 2>/dev/null; echo "---EOF---"',
  'echo "=== Check BuybackService in dist ===" && head -30 /var/www/dream-gadgets/apps/api/dist/modules/buyback/buyback.service.js 2>/dev/null | grep -E "InjectRepository|photoRepo"',
];

let i = 0;
conn.on('ready', () => { next(); function next() { if (i >= cmds.length) { conn.end(); return; } conn.exec(cmds[i], (err, s) => { if (err) { console.log('FAIL:', cmds[i].substring(0,60)); i++; next(); return; } let o = ''; s.on('data', d => o += d); s.stderr.on('data', d => o += d); s.on('close', () => { console.log(o.trim()||'(empty)'); console.log(''); i++; next(); }); }); } });
conn.on('error', e => { console.error('SSH Error:', e.message); process.exit(1); });
conn.connect({ host: HOST, port: 22, username: USER, password: PASS, readyTimeout: 15000, keepaliveInterval: 10000 });
