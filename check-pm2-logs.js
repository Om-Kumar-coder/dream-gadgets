const { Client } = require('ssh2');

const conn = new Client();
const HOST = '187.127.165.229';
const PASS = '?ESlq-)/e8z3LSgv';
const USER = 'root';
const PROJECT_DIR = '/var/www/dream-gadgets';

const commands = [
  `echo "=== PM2 Status ==="`,
  `pm2 list 2>&1`,
  `echo ""`,
  `echo "=== API Error Logs (last 40 lines) ==="`,
  `cat ${PROJECT_DIR}/apps/api/pm2-error.log 2>/dev/null | tail -40`,
  `echo ""`,
  `echo "=== API Out Logs (last 40 lines) ==="`,
  `cat ${PROJECT_DIR}/apps/api/pm2-out.log 2>/dev/null | tail -40`,
  `echo ""`,
  `echo "=== Web Error Logs (last 40 lines) ==="`,
  `cat ${PROJECT_DIR}/apps/web/pm2-error.log 2>/dev/null | tail -40`,
  `echo ""`,
  `echo "=== Web Out Logs (last 40 lines) ==="`,
  `cat ${PROJECT_DIR}/apps/web/pm2-out.log 2>/dev/null | tail -40`,
  `echo ""`,
  `echo "=== Admin Error Logs (last 40 lines) ==="`,
  `cat ${PROJECT_DIR}/apps/admin/pm2-error.log 2>/dev/null | tail -40`,
  `echo ""`,
  `echo "=== Admin Out Logs (last 40 lines) ==="`,
  `cat ${PROJECT_DIR}/apps/admin/pm2-out.log 2>/dev/null | tail -40`,
  `echo ""`,
  `echo "=== Combined PM2 logs (last 60 lines) ==="`,
  `pm2 logs --lines 60 --nostream 2>&1 || true`,
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
