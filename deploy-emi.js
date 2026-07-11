const { Client } = require('ssh2');
const conn = new Client();

const HOST = '187.127.165.229';
const PASS = '?ESlq-)/e8z3LSgv';
const USER = 'root';
const DIR = '/var/www/dream-gadgets';

const steps = [
  // Step 1: Clean API dist and rebuild
  {
    label: 'Clean API dist',
    cmd: `rm -rf ${DIR}/apps/api/dist && echo "dist cleaned"`
  },
  {
    label: 'Build API',
    cmd: `cd ${DIR} && npm run build --filter=api 2>&1 | tail -20`
  },
  // Step 2: Run migrations
  {
    label: 'Run migrations',
    cmd: `cd ${DIR}/apps/api && npx ts-node -r tsconfig-paths/register run-migrations.ts 2>&1`
  },
  // Step 3: Verify tables
  {
    label: 'Verify EMI tables',
    cmd: `sudo -u postgres psql -d dreamgadgets -t -c "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE 'emi_%'"`
  },
  // Step 4: Verify seed data
  {
    label: 'Verify EMI providers',
    cmd: `sudo -u postgres psql -d dreamgadgets -t -c "SELECT id, name, slug FROM emi_providers ORDER BY sort_order"`
  },
  {
    label: 'Verify EMI plans',
    cmd: `sudo -u postgres psql -d dreamgadgets -t -c "SELECT p.name, pl.label, pl.tenure_months, pl.annual_rate FROM emi_plans pl JOIN emi_providers p ON p.id=pl.provider_id ORDER BY p.sort_order, pl.sort_order"`
  },
  // Step 5: Restart API
  {
    label: 'Restart API',
    cmd: `pm2 restart dream-gadgets-api --update-env 2>&1 && sleep 3`
  },
  // Step 6: Test endpoints
  {
    label: 'Health check',
    cmd: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/v1/health`
  },
  {
    label: 'Test GET emi/plans',
    cmd: `curl -s http://localhost:3000/api/v1/public/emi/plans?amount=15000 2>&1`
  },
  {
    label: 'Test GET emi/plans (low amount)',
    cmd: `curl -s http://localhost:3000/api/v1/public/emi/plans?amount=500 2>&1`
  },
  {
    label: 'Test POST emi/calculate',
    cmd: `curl -s -X POST http://localhost:3000/api/v1/public/emi/calculate -H "Content-Type: application/json" -d '{"principal":50000,"tenureMonths":12,"annualRate":14}' 2>&1`
  },
  {
    label: 'Test GET emi/plans with provider filter',
    cmd: `curl -s "http://localhost:3000/api/v1/public/emi/plans?amount=15000&provider=bajaj_finserv" 2>&1`
  }
];

conn.on('ready', async () => {
  console.log('=== SSH CONNECTED ===');
  
  for (let i = 0; i < steps.length; i++) {
    const { label, cmd } = steps[i];
    console.log(`\n${'='.repeat(60)}`);
    console.log(`[Step ${i + 1}/${steps.length}] ${label}`);
    console.log(`${'='.repeat(60)}`);

    await new Promise((resolve) => {
      conn.exec(cmd, { pty: { term: 'vt100', rows: 40, cols: 200 } }, (err, stream) => {
        if (err) {
          console.log(`ERROR: ${err.message}`);
          resolve(undefined);
          return;
        }
        let out = '';
        stream.on('data', (d) => { out += d.toString(); process.stdout.write(d.toString()); });
        stream.stderr.on('data', (d) => { process.stdout.write(d.toString()); });
        stream.on('close', (code) => {
          console.log(`[Exit: ${code}]`);
          resolve(undefined);
        });
      });
    });
  }

  console.log('\n' + '='.repeat(60));
  console.log('=== ALL DONE ===');
  conn.end();
});

conn.on('error', (err) => {
  console.error('SSH Error:', err.message);
  process.exit(1);
});

conn.connect({
  host: HOST,
  port: 22,
  username: USER,
  password: PASS,
  readyTimeout: 120000,
  keepaliveInterval: 10000,
});
