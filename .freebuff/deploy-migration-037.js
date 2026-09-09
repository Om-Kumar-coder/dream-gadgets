const { Client } = require('ssh2');
const HOST = '187.127.165.229', USER = 'root', PASS = '?ESlq-)/e8z3LSgv';
const APP = '/var/www/dream-gadgets';
const c = new Client();

const commands = [
  `cd ${APP} && git pull --ff-only origin main 2>&1 | tail -4`,
  `echo '=== building api ==='; cd ${APP}/apps/api && npm run build 2>&1 | tail -6`,
  `echo '=== running migrations ==='; cd ${APP}/apps/api && node migrate.js 2>&1 | grep -vE '^query:|^        |^$' | tail -18`,
  `cd ${APP} && pm2 restart dream-gadgets-api 2>&1 | tail -4`,
  `sleep 5; curl -s -o /dev/null -w 'api:%{http_code}\\n' http://localhost:3000/api/v1/health`,
];

let idx = 0;
c.on('ready', () => {
  const run = () => {
    if (idx >= commands.length) { c.end(); return; }
    const cmd = commands[idx++];
    c.exec(cmd, (err, stream) => {
      if (err) { console.error('exec err:', err.message); run(); return; }
      let out = '';
      stream.on('data', (d) => { out += d.toString(); });
      stream.stderr.on('data', (d) => { out += d.toString(); });
      stream.on('close', (code) => { process.stdout.write(out + (code !== 0 ? `\n[exit ${code}]\n` : '')); run(); });
    });
  };
  run();
}).on('error', (e) => { console.error('ssh err:', e.message); process.exit(1); }).connect({ host: HOST, port: 22, username: USER, password: PASS });
