const { Client } = require('ssh2');

const conn = new Client();
const HOST = '187.127.165.229';
const PASS = '?ESlq-)/e8z3LSgv';
const USER = 'root';
const PROJECT_DIR = '/var/www/dream-gadgets';

conn.on('ready', () => {
  console.log('=== SSH CONNECTED ===\n');

  const commands = [
    // 1. Check turbo.json outputs config
    `echo "--- turbo.json ---" && cat ${PROJECT_DIR}/turbo.json 2>&1`,

    // 2. Run the API build directly with full output (no pipe masking exit code)
    `echo "--- Running nest build in apps/api ---" && cd ${PROJECT_DIR}/apps/api && npx nest build 2>&1 | tail -40; echo "NEST BUILD EXIT: $?"`,

    // 3. Check if dist was produced
    `echo "--- dist check ---" && ls ${PROJECT_DIR}/apps/api/dist/ 2>&1 | head -10; ls ${PROJECT_DIR}/apps/api/dist/modules/auth/services/ 2>&1 | head -10`,

    // 4. If dist exists, restart and health check
    `echo "--- restart API ---" && cd ${PROJECT_DIR} && pm2 restart dream-gadgets-api --update-env 2>&1 | tail -2 && sleep 8 && curl -s -o /dev/null -w "API health: %{http_code}\\n" http://localhost:3000/api/v1/health`,

    // 5. Check PM2 status
    `pm2 list 2>&1 | head -12`,
  ];

  let cmdIndex = 0;
  function runNext() {
    if (cmdIndex >= commands.length) {
      console.log('\n=== DIAGNOSIS COMPLETE ===');
      conn.end();
      return;
    }
    const cmd = commands[cmdIndex];
    console.log(`\n>>> ${cmd.substring(0, 100)}...`);
    conn.exec(cmd, (err, stream) => {
      if (err) {
        console.error(`Command failed: ${err.message}`);
        cmdIndex++;
        runNext();
        return;
      }
      let output = '';
      stream.on('data', (d) => (output += d.toString()));
      stream.stderr.on('data', (d) => (output += d.toString()));
      stream.on('close', () => {
        console.log(output.length > 4000 ? output.slice(-4000) : output);
        cmdIndex++;
        runNext();
      });
    });
  }

  runNext();
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
  readyTimeout: 20000,
  keepaliveInterval: 10000,
});
