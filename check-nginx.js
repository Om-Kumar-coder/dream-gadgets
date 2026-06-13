const { Client } = require('ssh2');
const conn = new Client();
const HOST = '187.127.165.229';
const PASS = '?ESlq-)/e8z3LSgv';
const USER = 'root';

const cmds = [
  'echo "=== NGINX SITES-ENABLED ===" && ls -la /etc/nginx/sites-enabled/ 2>&1',
  'echo "=== NGINX CONFIG ===" && cat /etc/nginx/sites-enabled/* 2>&1 | head -80',
  'echo "=== CURL LOCALHOST ===" && curl -s -I http://localhost 2>&1 | head -10',
  'echo "=== CURL LOCALHOST:3001 ===" && curl -s -I http://localhost:3001 2>&1 | head -10',
  'echo "=== CHECK /ETC/HOSTS ===" && grep dreamgadgets /etc/hosts 2>&1',
  'echo "=== DIG DREAMGADGETS.IN ===" && (dig dreamgadgets.in +short 2>&1 || nslookup dreamgadgets.in 2>&1 | head -10)',
];

let i = 0;
conn.on('ready', () => { next(); function next() { if (i >= cmds.length) { conn.end(); return; } conn.exec(cmds[i], (err, s) => { if (err) { console.log('FAIL:', cmds[i].substring(0,60)); i++; next(); return; } let o = ''; s.on('data', d => o += d); s.stderr.on('data', d => o += d); s.on('close', () => { console.log(o.trim()||'(empty)'); console.log(''); i++; next(); }); }); } });
conn.on('error', e => { console.error('SSH Error:', e.message); process.exit(1); });
conn.connect({ host: HOST, port: 22, username: USER, password: PASS, readyTimeout: 15000, keepaliveInterval: 10000 });
