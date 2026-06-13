const { Client } = require('ssh2');
const conn = new Client();
const HOST = '187.127.165.229';
const PASS = '?ESlq-)/e8z3LSgv';
const USER = 'root';

const cmds = [
  'cat /etc/nginx/sites-enabled/* 2>&1 | grep -A5 "api\\|proxy_pass\\|location" | head -30',
  'curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/v1/health 2>&1',
  'curl -s -o /dev/null -w "%{http_code}" http://localhost/api/v1/health 2>&1',
  'curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 2>&1',
  'curl -s -o /dev/null -w "%{http_code}" http://localhost:3002/admin/login 2>&1',
];

let i = 0;
conn.on('ready', () => { next(); function next() { if (i >= cmds.length) { conn.end(); return; } conn.exec(cmds[i], (err, s) => { if (err) { console.log('FAIL:', cmds[i].substring(0,60)); i++; next(); return; } let o = ''; s.on('data', d => o += d); s.stderr.on('data', d => o += d); s.on('close', () => { console.log(o.trim()||'(empty)'); i++; next(); }); }); } });
conn.on('error', e => { console.error('SSH Error:', e.message); process.exit(1); });
conn.connect({ host: HOST, port: 22, username: USER, password: PASS, readyTimeout: 15000, keepaliveInterval: 10000 });
