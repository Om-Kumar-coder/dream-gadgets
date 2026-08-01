const { Client } = require('ssh2');

const conn = new Client();
const HOST = '187.127.165.229';
const PASS = '?ESlq-)/e8z3LSgv';
const USER = 'root';
const PROJECT_DIR = '/var/www/dream-gadgets';

conn.on('ready', () => {
  console.log('=== SSH CONNECTED ===\n');

  const commands = [
    // 0. Resources
    `echo "--- disk ---" && df -h / 2>&1 | tail -2 && echo "--- memory ---" && free -m 2>&1 | head -2`,

    // 1. Fetch + hard reset to origin/main (latest code, incl. MSG91)
    `echo "--- git fetch ---" && cd ${PROJECT_DIR} && git fetch origin 2>&1 | tail -3 && echo "--- git reset --hard origin/main ---" && git reset --hard origin/main 2>&1 | tail -3 && echo "--- git log ---" && git log --oneline -3`,

    // 2. Reinstall deps from root
    `echo "--- npm install ---" && cd ${PROJECT_DIR} && npm install 2>&1 | tail -6`,

    // 3. Check build script + full nest build with captured exit code
    `echo "--- api build script ---" && cd ${PROJECT_DIR}/apps/api && node -e "console.log(require('./package.json').scripts.build)" && echo "--- nest build ---" && npx nest build 2>&1 | head -50; echo "NEST_EXIT=$?"`,

    // 4. Verify dist exists now
    `echo "--- dist check ---" && ls ${PROJECT_DIR}/apps/api/dist/ 2>&1 | head -6 && echo "--- auth services ---" && ls ${PROJECT_DIR}/apps/api/dist/modules/auth/services/ 2>&1 | head -8`,

    // 5. Restart API + health check
    `echo "--- restart ---" && cd ${PROJECT_DIR} && pm2 restart dream-gadgets-api --update-env 2>&1 | tail -2 && sleep 10 && curl -s -o /dev/null -w "API health: %{http_code}\\n" http://localhost:3000/api/v1/health`,

    // 6. Web + Admin health
    `curl -s -o /dev/null -w "Web: %{http_code}\\n" http://localhost:3001 2>/dev/null; curl -s -o /dev/null -w "Admin: %{http_code}\\n" http://localhost:3002/admin/login 2>/dev/null`,

    // 7. PM2 status
    `pm2 list 2>&1 | head -12`,
  ];

  let cmdIndex = 0;
  function runNext() {
    if (cmdIndex >= commands.length) {
      console.log('\n=== RESTORE COMPLETE ===');
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
        console.log(output.length > 3500 ? output.slice(-3500) : output);
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
