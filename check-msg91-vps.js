const { Client } = require('ssh2');

const conn = new Client();
const HOST = '187.127.165.229';
const PASS = '?ESlq-)/e8z3LSgv';
const USER = 'root';
const PROJECT_DIR = '/var/www/dream-gadgets';

conn.on('ready', () => {
  console.log('=== SSH CONNECTED ===\n');

  const commands = [
    // MSG91 env vars — mask the values so secrets never print
    `echo "--- MSG91 env vars (masked) ---" && grep -E "^MSG91_" ${PROJECT_DIR}/apps/api/.env 2>/dev/null | sed -E 's/=(.*)/=<masked len:\\1>/' || echo "no MSG91 vars found in apps/api/.env"`,
    `echo "--- MSG91/OTP in config (app.config) ---" && grep -rE "MSG91|otp" ${PROJECT_DIR}/apps/api/dist/config/*.js 2>/dev/null | head -5 || true`,
    `echo "--- Git state ---" && cd ${PROJECT_DIR} && git log --oneline -5 && git status --short | head -10`,
    `echo "--- PM2 status ---" && pm2 list 2>&1 | head -15`,
    `echo "--- API recent logs (MSG91/OTP/error grep) ---" && pm2 logs dream-gadgets-api --lines 200 --nostream 2>&1 | grep -iE "msg91|otp|error|failed" | tail -25 || echo "(no matching log lines)"`,
    `echo "--- Redis OTP keys ---" && redis-cli keys 'otp:*' 2>&1 | head -5 || true`,
    `echo "--- API health ---" && curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/v1/health 2>/dev/null || echo "no response"`,
  ];

  let cmdIndex = 0;
  function runNext() {
    if (cmdIndex >= commands.length) {
      console.log('\n=== INSPECTION COMPLETE ===');
      conn.end();
      return;
    }
    const cmd = commands[cmdIndex];
    console.log(`\n>>> ${cmd.substring(0, 90)}...`);
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
        console.log(output.length > 3000 ? output.slice(-3000) : output);
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
