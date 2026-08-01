const { Client } = require('ssh2');

const conn = new Client();
const HOST = '187.127.165.229';
const PASS = '?ESlq-)/e8z3LSgv';
const USER = 'root';
const PROJECT_DIR = '/var/www/dream-gadgets';

// MSG91 credentials provided by the user
const AUTH_KEY = '555831AWkKId0NRc86a6e29a3P1';
const TEMPLATE_ID = '6a6e38737511c5f7bd080372';
const OTP_TTL = '600';
const TEST_PHONE = process.argv[2] || '9876543210';

conn.on('ready', () => {
  console.log('=== SSH CONNECTED ===\n');

  const commands = [
    // 1. Update .env — replace existing lines or append if missing
    `cd ${PROJECT_DIR}/apps/api && cp .env .env.bak-$(date +%s) && \
     (grep -q '^MSG91_AUTH_KEY=' .env && sed -i 's|^MSG91_AUTH_KEY=.*|MSG91_AUTH_KEY=${AUTH_KEY}|' .env || echo 'MSG91_AUTH_KEY=${AUTH_KEY}' >> .env) && \
     (grep -q '^MSG91_TEMPLATE_ID=' .env && sed -i 's|^MSG91_TEMPLATE_ID=.*|MSG91_TEMPLATE_ID=${TEMPLATE_ID}|' .env || echo 'MSG91_TEMPLATE_ID=${TEMPLATE_ID}' >> .env) && \
     (grep -q '^MSG91_OTP_TTL=' .env && sed -i 's|^MSG91_OTP_TTL=.*|MSG91_OTP_TTL=${OTP_TTL}|' .env || echo 'MSG91_OTP_TTL=${OTP_TTL}' >> .env) && \
     echo "MSG91 vars present: $(grep -c '^MSG91_' .env) lines (values masked)"`,

    // 2. Restart API with updated env
    `cd ${PROJECT_DIR} && pm2 restart dream-gadgets-api --update-env 2>&1 | tail -3`,

    // 3. Wait for API to boot
    `sleep 8 && curl -s -o /dev/null -w "API health: %{http_code}\\n" http://localhost:3000/api/v1/health`,

    // 4. Send OTP via the public endpoint
    `echo "--- Sending OTP to ${TEST_PHONE} ---" && \
     curl -s -X POST http://localhost:3000/api/v1/auth/send-otp -H "Content-Type: application/json" -d '{"phone":"+${TEST_PHONE}"}' -w "\\nHTTP %{http_code}\\n"`,

    // 5. Check API logs for the MSG91 send result
    `echo "--- API logs (MSG91 / OTP lines) ---" && \
     pm2 logs dream-gadgets-api --lines 60 --nostream 2>&1 | grep -iE "msg91|otp|send-otp" | tail -15 || echo "(no matching log lines)"`,

    // 6. Check Redis for the stored OTP
    `echo "--- Redis otp keys ---" && redis-cli keys 'otp:*' 2>&1 | head -5 || true`,
  ];

  let cmdIndex = 0;
  function runNext() {
    if (cmdIndex >= commands.length) {
      console.log('\n=== MSG91 CONFIG + TEST COMPLETE ===');
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
