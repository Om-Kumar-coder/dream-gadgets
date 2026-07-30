const { Client } = require('ssh2');
const c = new Client();
c.on('ready', () => {
  const steps = [
    'echo "=== Current DB user ==="',
    'sudo -u postgres psql -d dreamgadgets -c "SELECT current_user" 2>&1',
    'echo "=== Get DATABASE_URL user ==="',
    'grep DATABASE_URL /var/www/dream-gadgets/apps/api/.env 2>/dev/null | head -1',
    'echo "=== List all roles ==="',
    'sudo -u postgres psql -d dreamgadgets -c "\\du" 2>&1',
    'echo "=== Grant perms to dreamgadgets user ==="',
    'sudo -u postgres psql -d dreamgadgets -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO CURRENT_USER" 2>&1',
    'echo "=== Grant on sequences ==="',
    'sudo -u postgres psql -d dreamgadgets -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO CURRENT_USER" 2>&1',
    'echo "=== Test EMI endpoint ==="',
    'curl -s http://localhost:3000/api/v1/public/emi/plans?amount=15000',
    'echo',
    'echo "=== Test low amount ==="',
    'curl -s http://localhost:3000/api/v1/public/emi/plans?amount=500',
  ];

  let idx = 0;
  function run() {
    if (idx >= steps.length) { console.log('\n=== ALL DONE ==='); c.end(); return; }
    const step = steps[idx++];
    console.log(`\n${step.substring(0, 60)}`);
    c.exec(step, (e, s) => {
      if (e) { console.log(`  ERR: ${e.message}`); run(); return; }
      s.on('data', d => process.stdout.write(d.toString()));
      s.stderr.on('data', d => process.stdout.write(d.toString()));
      s.on('close', () => run());
    });
  }
  run();
});
c.on('error', e => { console.error(e.message); process.exit(1); });
c.connect({ host:'187.127.165.229', port:22, username:'root', password:'?ESlq-)/e8z3LSgv', readyTimeout:30000 });
