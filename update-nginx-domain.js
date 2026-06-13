const { Client } = require('ssh2');
const conn = new Client();
const HOST = '187.127.165.229';
const PASS = '?ESlq-)/e8z3LSgv';
const USER = 'root';

const cmds = [
  `sed -i 's/server_name 187.127.165.229;/server_name dreamgadgets.in www.dreamgadgets.in 187.127.165.229;/' /etc/nginx/sites-available/dream-gadgets`,
  `echo "=== VERIFY CONFIG ===" && grep server_name /etc/nginx/sites-available/dream-gadgets`,
  `echo "=== TEST CONFIG ===" && nginx -t 2>&1`,
  `echo "=== RELOAD NGINX ===" && systemctl reload nginx 2>&1`,
  `echo "=== CURL TEST ===" && curl -s -o /dev/null -w "HTTP %{http_code}" http://localhost 2>&1`,
];

let i = 0;
conn.on('ready', () => { next(); function next() { if (i >= cmds.length) { conn.end(); return; } conn.exec(cmds[i], (err, s) => { if (err) { console.log('FAIL:', cmds[i].substring(0,60)); i++; next(); return; } let o = ''; s.on('data', d => o += d); s.stderr.on('data', d => o += d); s.on('close', () => { console.log(o.trim()||'(empty)'); i++; next(); }); }); } });
conn.on('error', e => { console.error('SSH Error:', e.message); process.exit(1); });
conn.connect({ host: HOST, port: 22, username: USER, password: PASS, readyTimeout: 15000, keepaliveInterval: 10000 });
