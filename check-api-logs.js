const { Client } = require('ssh2');

const conn = new Client();
const HOST = '187.127.165.229';
const PASS = '?ESlq-)/e8z3LSgv';
const USER = 'root';
const PROJECT_DIR = '/var/www/dream-gadgets';

const commands = [
  `echo "=== PM2 Status ==="`,
  `pm2 list 2>&1`,
  `echo "=== API Error Log (last 80 lines) ==="`,
  `cat ${PROJECT_DIR}/apps/api/pm2-error.log 2>/dev/null | tail -80`,
  `echo "=== API Out Log (last 30 lines) ==="`,
  `cat ${PROJECT_DIR}/apps/api/pm2-out.log 2>/dev/null | tail -30`,
  `echo "=== Trying direct NestJS start to see error ==="`,
  `cd ${PROJECT_DIR}/apps/api && node -e "try { require('./dist/main'); } catch(e) { console.error('STARTUP ERROR:', e.message, e.stack?.substring(0, 2000)); }" 2>&1 | head -50`,
  `echo "=== Checking dist/main.js exists ==="`,
  `ls -la ${PROJECT_DIR}/apps/api/dist/main.js 2>&1`,
  `echo "=== Checking package.json for dependencies ==="`,
  `cat ${PROJECT_DIR}/apps/api/package.json | head -60`,
  `echo "=== Checking Node version ==="`,
  `node -v`,
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
  console.log(`\n${cmd}`);
  
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
