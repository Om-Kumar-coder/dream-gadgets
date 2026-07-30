const { Client } = require('ssh2');
const conn = new Client();
const HOST = '187.127.165.229';
const PASS = '?ESlq-)/e8z3LSgv';
const USER = 'root';
const DIR = '/var/www/dream-gadgets';

const steps = [
  { label: 'Git pull', cmd: `cd ${DIR} && git stash 2>/dev/null; git pull 2>&1 | tail -3` },
  { label: 'Build API', cmd: `cd ${DIR}/apps/api && npx nest build 2>&1 | tail -5` },
  { label: 'Run compiled migrations', cmd: `cd ${DIR}/apps/api && node migrate.js 2>&1` },
  { label: 'Verify EMI tables', cmd: `sudo -u postgres psql -d dreamgadgets -t -c "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE 'emi_%'"` },
  { label: 'Verify providers', cmd: `sudo -u postgres psql -d dreamgadgets -t -c "SELECT id, name, slug FROM emi_providers ORDER BY sort_order"` },
  { label: 'Verify plans', cmd: `sudo -u postgres psql -d dreamgadgets -t -c "SELECT p.name AS prov, pl.label, pl.tenure_months, pl.annual_rate FROM emi_plans pl JOIN emi_providers p ON p.id=pl.provider_id ORDER BY p.sort_order, pl.sort_order"` },
  { label: 'Restart API', cmd: `pm2 restart dream-gadgets-api --update-env 2>&1 && sleep 3 && pm2 status dream-gadgets-api 2>&1 | grep dream-gadgets-api` },
  { label: 'Health check', cmd: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/v1/health` },
  { label: 'Test emi/plans', cmd: `curl -s http://localhost:3000/api/v1/public/emi/plans?amount=15000` },
  { label: 'Test emi/calculate', cmd: `curl -s -X POST http://localhost:3000/api/v1/public/emi/calculate -H "Content-Type: application/json" -d '{"principal":50000,"tenureMonths":12,"annualRate":14}'` },
];

conn.on('ready', async () => {
  console.log('=== SSH CONNECTED ===');
  for (let i = 0; i < steps.length; i++) {
    const { label, cmd } = steps[i];
    console.log(`\n[${i + 1}/${steps.length}] ${label}`);
    await new Promise((resolve) => {
      conn.exec(cmd, (err, stream) => {
        if (err) { console.log(`  ERROR: ${err.message}`); resolve(); return; }
        let buf = '';
        stream.on('data', d => { const s = d.toString(); buf += s; process.stdout.write(s); });
        stream.stderr.on('data', d => process.stdout.write(d.toString()));
        stream.on('close', (code) => { resolve(); });
      });
    });
  }
  console.log('\n=== ALL DONE ===');
  conn.end();
});
conn.on('error', e => { console.error('SSH Error:', e.message); process.exit(1); });
conn.connect({ host: HOST, port: 22, username: USER, password: PASS, readyTimeout: 120000, keepaliveInterval: 10000 });
