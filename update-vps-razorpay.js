const { Client } = require('ssh2');

const conn = new Client();
const HOST = '187.127.165.229';
const PASS = '?ESlq-)/e8z3LSgv';
const USER = 'root';
const PROJECT_DIR = '/var/www/dream-gadgets';

const RAZORPAY_KEY_ID = 'rzp_test_TBP0rpLZuAm8Tu';
const RAZORPAY_KEY_SECRET = 'W92XsGohdhj3HhYPF6oyOpzj';

const commands = [
  `echo "=== Current Razorpay settings in API .env ==="`,
  `grep -n 'RAZORPAY' ${PROJECT_DIR}/apps/api/.env`,
  `echo ""`,
  `echo "=== Updating API .env ==="`,
  `sed -i 's|^RAZORPAY_KEY_ID=.*|RAZORPAY_KEY_ID=${RAZORPAY_KEY_ID}|' ${PROJECT_DIR}/apps/api/.env`,
  `sed -i 's|^RAZORPAY_KEY_SECRET=.*|RAZORPAY_KEY_SECRET=${RAZORPAY_KEY_SECRET}|' ${PROJECT_DIR}/apps/api/.env`,
  `echo "=== Updated API .env ==="`,
  `grep -n 'RAZORPAY' ${PROJECT_DIR}/apps/api/.env`,
  `echo ""`,
  `echo "=== Current Razorpay setting in Web .env.local ==="`,
  `grep -n 'RAZORPAY' ${PROJECT_DIR}/apps/web/.env.local || echo "Not found"`,
  `echo ""`,
  `echo "=== Updating Web .env.local ==="`,
  `sed -i 's|^NEXT_PUBLIC_RAZORPAY_KEY_ID=.*|NEXT_PUBLIC_RAZORPAY_KEY_ID=${RAZORPAY_KEY_ID}|' ${PROJECT_DIR}/apps/web/.env.local`,
  `echo "=== Updated Web .env.local ==="`,
  `grep -n 'RAZORPAY' ${PROJECT_DIR}/apps/web/.env.local`,
  `echo ""`,
  `echo "=== Restarting API via PM2 ==="`,
  `pm2 restart dream-gadgets-api`,
  `echo ""`,
  `echo "=== Waiting 8s for API to start ==="`,
  `sleep 8`,
  `echo ""`,
  `echo "=== Verifying API health ==="`,
  `curl -s -o /dev/null -w "API HTTP Status: %{http_code}\n" http://localhost:3000/api/v1/health`,
  `echo ""`,
  `echo "=== PM2 status ==="`,
  `pm2 list | head -10`,
  `echo ""`,
  `echo "=== API logs (last 5) ==="`,
  `pm2 logs dream-gadgets-api --lines 5 --nostream 2>&1 || true`,
  `echo ""`,
  `echo "=== CHECKOUT FLOW TEST: Create Razorpay order ==="`,
  `curl -s -X POST http://localhost:3000/api/v1/payments/razorpay/order \
    -H "Content-Type: application/json" \
    -d '{"amount": 2899900, "currency": "INR", "receipt": "test-order-001"}' \
    -w "\nHTTP Status: %{http_code}\n" 2>/dev/null || echo "Order creation endpoint not reachable"`,
  `echo ""`,
  `echo "=== DONE ==="`,
];

let cmdIndex = 0;

conn.on('ready', () => {
  console.log('=== SSH CONNECTED ===\n');
  runNext();
});

function runNext() {
  if (cmdIndex >= commands.length) {
    console.log('\n=== ALL DONE ===');
    conn.end();
    return;
  }

  const cmd = commands[cmdIndex];
  console.log(`>>> ${cmd.substring(0, 150)}`);
  
  conn.exec(cmd, (err, stream) => {
    if (err) {
      console.error(`Command failed: ${err.message}`);
      cmdIndex++;
      runNext();
      return;
    }

    let output = '';
    stream.on('data', (data) => { output += data.toString(); });
    stream.stderr.on('data', (data) => { output += data.toString(); });
    stream.on('close', () => {
      console.log(output.trim());
      cmdIndex++;
      runNext();
    });
  });
}

conn.on('error', (err) => {
  console.error('SSH Error:', err.message);
  process.exit(1);
});

conn.connect({
  host: HOST,
  port: 22,
  username: USER,
  password: PASS,
  readyTimeout: 60000,
  keepaliveInterval: 10000,
});
