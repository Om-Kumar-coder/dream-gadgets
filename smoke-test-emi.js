const { Client } = require('ssh2');
const c = new Client();
c.on('ready', () => {
  const steps = [
    { label: 'Restart API', cmd: 'pm2 restart dream-gadgets-api --update-env 2>&1 && sleep 5' },
    { label: 'Health check', cmd: 'curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/v1/health' },
    { label: 'Test GET emi/plans?amount=15000', cmd: 'curl -s http://localhost:3000/api/v1/public/emi/plans?amount=15000' },
    { label: 'Test GET emi/plans?amount=500', cmd: 'curl -s http://localhost:3000/api/v1/public/emi/plans?amount=500' },
    { label: 'Test POST emi/calculate', cmd: 'curl -s -X POST http://localhost:3000/api/v1/public/emi/calculate -H "Content-Type: application/json" -d \'{"principal":50000,"tenureMonths":12,"annualRate":14}\'' },
    { label: 'Test filtered by provider', cmd: 'curl -s "http://localhost:3000/api/v1/public/emi/plans?amount=15000&provider=bajaj_finserv"' },
  ];

  let idx = 0;
  function run() {
    if (idx >= steps.length) { console.log('\n=== ALL DONE ==='); c.end(); return; }
    const { label, cmd } = steps[idx++];
    console.log(`\n--- ${label} ---`);
    c.exec(cmd, (err, stream) => {
      if (err) { console.log(`  ERROR: ${err.message}`); run(); return; }
      stream.on('data', d => process.stdout.write(d.toString()));
      stream.stderr.on('data', d => process.stdout.write(d.toString()));
      stream.on('close', () => run());
    });
  }
  run();
});
c.on('error', e => { console.error('SSH Error:', e.message); process.exit(1); });
c.connect({ host:'187.127.165.229', port:22, username:'root', password:'?ESlq-)/e8z3LSgv', readyTimeout:60000 });
