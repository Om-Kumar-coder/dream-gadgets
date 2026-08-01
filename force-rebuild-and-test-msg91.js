const { Client } = require('ssh2');

const conn = new Client();
const HOST = '187.127.165.229';
const PASS = '?ESlq-)/e8z3LSgv';
const USER = 'root';
const PROJECT_DIR = '/var/www/dream-gadgets';
const TEST_PHONE = process.argv[2] || '9876543210';

conn.on('ready', () => {
  console.log('=== SSH CONNECTED ===\n');

  const commands = [
    // 1. Confirm old Twilio code is still present in the built dist
    `echo "--- Old Twilio file in dist? ---" && ls ${PROJECT_DIR}/apps/api/dist/modules/auth/services/ 2>&1`,

    // 2. Clear turbo build cache + stale API dist so a REAL rebuild happens
    `cd ${PROJECT_DIR} && rm -rf node_modules/.cache .turbo apps/api/dist && rm -rf apps/api/.next 2>/dev/null; echo "caches cleared"`,

    // 3. Force rebuild all apps (turbo --force bypasses the cache)
    `cd ${PROJECT_DIR} && npm run build -- --force 2>&1 | tail -25`,

    // 4. Verify the new MSG91 service is now compiled into dist
    `echo "--- New MSG91 file in dist? ---" && ls ${PROJECT_DIR}/apps/api/dist/modules/auth/services/ 2>&1 && grep -l "MSG91" ${PROJECT_DIR}/apps/api/dist/modules/auth/services/*.js 2>&1 | head -5`,

    // 5. Restart API
    `cd ${PROJECT_DIR} && pm2 restart dream-gadgets-api --update-env 2>&1 | tail -2`,

    // 6. Wait for boot
    `sleep 8 && curl -s -o /dev/null -w "API health: %{http_code}\\n" http://localhost:3000/api/v1/health`,

    // 7. Send OTP via the public endpoint
    `echo "--- Sending OTP to ${TEST_PHONE} ---" && \
     curl -s -X POST http://localhost:3000/api/v1/auth/send-otp -H "Content-Type: application/json" -d '{"phone":"+${TEST_PHONE}"}' -w "\\nHTTP %{http_code}\\n"`,

    // 8. Check API logs for the MSG91 send result
    `echo "--- API logs (MSG91 / OTP lines) ---" && \
     pm2 logs dream-gadgets-api --lines 60 --nostream 2>&1 | grep -iE "msg91|otp|send-otp" | tail -15 || echo "(no matching log lines)"`,

    // 9. Check Redis for the stored OTP
    `echo "--- Redis otp keys ---" && redis-cli keys 'otp:*' 2>&1 | head -5 || true`,
  ];

  let cmdIndex = 0;
  function runNext() {
    if (cmdIndex >= commands.length) {
      console.log('\n=== FORCE REBUILD + MSG91 TEST COMPLETE ===');
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
        console.log(output.length > 2500 ? output.slice(-2500) : output);
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
