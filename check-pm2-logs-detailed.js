const { Client } = require('ssh2');

const conn = new Client();
const HOST = '187.127.165.229';
const PASS = '?ESlq-)/e8z3LSgv';
const USER = 'root';
const PROJECT_DIR = '/var/www/dream-gadgets';

const commands = [
  `echo "=== PM2 LIST WITH UPTIME ==="`,
  `pm2 list 2>&1`,
  `echo ""`,
  `echo "=== API FULL LOG (lines 50-100) to check timestamps ==="`,
  `cat ${PROJECT_DIR}/apps/api/pm2-out.log 2>/dev/null | head -100 | tail -51`,
  `echo ""`,
  `echo "=== API ERROR LOG (all lines) ==="`,
  `cat ${PROJECT_DIR}/apps/api/pm2-error.log 2>/dev/null`,
  `echo ""`,
  `echo "=== WEB ERROR LOG (last 30 lines) ==="`,
  `cat ${PROJECT_DIR}/apps/web/pm2-error.log 2>/dev/null | tail -30`,
  `echo ""`,
  `echo "=== WEB OUT LOG (last 30 lines) ==="`,
  `cat ${PROJECT_DIR}/apps/web/pm2-out.log 2>/dev/null | tail -30`,
  `echo ""`,
  `echo "=== API Health check direct ==="`,
  `curl -s http://localhost:3000/api/v1/health 2>&1`,
  `echo ""`,
  `echo "=== PM2 describe api ==="`,
  `pm2 show dream-gadgets-api 2>&1 | head -20`,
  `echo ""`,
  `echo "=== PM2 describe web ==="`,
  `pm2 show dream-gadgets-web 2>&1 | head -20`,
];

let cmdIndex = 0;

conn.on('ready', () => {
  console.log('=== SSH CONNECTED ===\n');
  runNext();
});

function runNext() {
  if (cmdIndex >= commands.length) {
    console.log('\n=== DONE ===');
    conn.end();
    return;
  }

  const cmd = commands[cmdIndex];
  console.log(`${cmd}`);
  
  conn.exec(cmd, (err, stream) => {
    if (err) {
      console.error(`FAILED: ${err.message}`);
      cmdIndex++;
      runNext();
      return;
    }

    let output = '';
    stream.on('data', (data) => { output += data.toString(); });
    stream.stderr.on('data', (data) => { output += data.toString(); });
    stream.on('close', () => {
      console.log(output);
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
  readyTimeout: 30000,
  keepaliveInterval: 10000,
});
