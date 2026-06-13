const { Client } = require('ssh2');
const conn = new Client();
const HOST = '187.127.165.229';
const PASS = '?ESlq-)/e8z3LSgv';
const USER = 'root';

const cmds = [
  'pm2 list 2>&1 | head -15',
  'grep -c "can\\\'t resolve dependencies" /var/www/dream-gadgets/apps/api/pm2-error.log 2>/dev/null; echo "count_of_di_errors"',
  'grep -c "InjectRepository(BuybackPhoto)" /var/www/dream-gadgets/apps/api/dist/modules/buyback/buyback.service.js 2>/dev/null; echo "fix_present_check"',
  'grep -E "Nest application|Started|Listening" /var/www/dream-gadgets/apps/api/pm2-out.log 2>/dev/null | tail -5',
  'curl -s http://localhost:3000/api/v1/health 2>&1 | head -5',
  'echo "END_OF_CHECK"',
];

let i = 0;
conn.on('ready', () => {
  next();
  function next() {
    if (i >= cmds.length) { conn.end(); return; }
    conn.exec(cmds[i], (err, s) => {
      if (err) { console.log('FAIL:', cmds[i]); i++; next(); return; }
      let out = '';
      s.on('data', d => out += d);
      s.stderr.on('data', d => out += d);
      s.on('close', () => { console.log(out.trim()); i++; next(); });
    });
  }
});
conn.on('error', e => { console.error('SSH Error:', e.message); process.exit(1); });
conn.connect({ host: HOST, port: 22, username: USER, password: PASS, readyTimeout: 15000, keepaliveInterval: 10000 });
