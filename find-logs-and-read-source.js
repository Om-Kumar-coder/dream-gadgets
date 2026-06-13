const { Client } = require('ssh2');
const conn = new Client();
const HOST = '187.127.165.229';
const PASS = '?ESlq-)/e8z3LSgv';
const USER = 'root';
const DIR = '/var/www/dream-gadgets';

const cmds = [
  `echo "=== FIND ALL PM2 LOG FILES ===" && find ${DIR} -name "pm2*.log" -o -name "*-error.log" -o -name "*-out.log" 2>/dev/null | head -20`,
  `echo "=== FIND LOGS IN ~/.pm2 ===" && ls -la ~/.pm2/logs/ 2>/dev/null | head -20`,
  `echo "=== PM2 SHOW API ===" && pm2 show dream-gadgets-api 2>&1 | grep -i "log\\|out\\|error\\|path"`,
  `echo "=== TRY TO CURL WITH MORE DETAIL ===" && curl -sv -H "Authorization: Bearer PLACEHOLDER" http://localhost:3000/api/v1/auth/me 2>&1 | tail -20`,
];

let i = 0;
conn.on('ready', () => { next(); function next() { if (i >= cmds.length) { conn.end(); return; } conn.exec(cmds[i], (err, s) => { if (err) { console.log('FAIL:', cmds[i].substring(0,60)); i++; next(); return; } let o = ''; s.on('data', d => o += d); s.stderr.on('data', d => o += d); s.on('close', () => { console.log(o); i++; next(); }); }); } });
conn.on('error', e => { console.error('SSH Error:', e.message); process.exit(1); });
conn.connect({ host: HOST, port: 22, username: USER, password: PASS, readyTimeout: 20000, keepaliveInterval: 10000 });
