const { Client } = require('ssh2');
const HOST = '187.127.165.229', USER = 'root', PASS = '?ESlq-)/e8z3LSgv';
const APP = '/var/www/dream-gadgets';
const c = new Client();

const commands = [
  `cd ${APP} && git pull --ff-only origin main 2>&1 | tail -5`,
  `cd ${APP} && npm install --no-audit --no-fund 2>&1 | tail -3`,
  `echo '=== building api ==='; cd ${APP}/apps/api && npm run build 2>&1 | tail -6`,
  `echo '=== running migrations ==='; cd ${APP}/apps/api && node migrate.js 2>&1 | tail -14`,
  `echo '=== building web ==='; cd ${APP}/apps/web && npx next build 2>&1 | tail -8`,
  `cd ${APP} && pm2 restart dream-gadgets-api dream-gadgets-web dream-gadgets-admin 2>&1 | tail -6`,
  `sleep 6; echo '=== health ==='; curl -s -o /dev/null -w 'api:%{http_code}\\n' http://localhost:3000/api/v1/health; curl -s -o /dev/null -w 'web:%{http_code}\\n' http://localhost:3001; curl -s -o /dev/null -w 'admin:%{http_code}\\n' http://localhost:3002/admin/login; echo '=== svg asset ==='; curl -s -o /dev/null -w 'hero1:%{http_code} %{content_type}\\n' https://dreamgadgets.in/banners/hero-1.svg; curl -s -o /dev/null -w 'brandhero:%{http_code} %{content_type}\\n' https://dreamgadgets.in/brand-hero/apple.svg`,
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
