const { Client } = require('ssh2');

const conn = new Client();
const HOST = '187.127.165.229';
const PASS = '?ESlq-)/e8z3LSgv';
const USER = 'root';
const PROJECT_DIR = '/var/www/dream-gadgets';

const deployCommands = [
  `echo "=== Checking current directory ==="`,
  `pwd`,
  `echo "=== Node.js & NPM ==="`,
  `node -v && npm -v`,
  `echo "=== Git pull ==="`,
  `cd ${PROJECT_DIR} && git stash 2>&1 && git pull 2>&1`,
  `echo "=== Installing dependencies ==="`,
  `cd ${PROJECT_DIR} && npm install 2>&1 | tail -10`,
  `echo "=== Running migrations ==="`,
  `cd ${PROJECT_DIR}/apps/api && node migrate.js 2>&1`,
  `echo "=== Building all apps (from ${PROJECT_DIR}) ==="`,
  `cd ${PROJECT_DIR} && npm run build 2>&1 | tail -30`,
  `echo "=== PM2 reload ==="`,
  `cd ${PROJECT_DIR} && pm2 reload all 2>&1`,
  `echo "=== Waiting 15s for services ==="`,
  `sleep 15`,
  `echo "=== Health Check: API ==="`,
  `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/v1/health 2>/dev/null; echo ""`,
  `echo "=== Health Check: Web ==="`,
  `curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 2>/dev/null; echo ""`,
  `echo "=== Health Check: Admin ==="`,
  `curl -s -o /dev/null -w "%{http_code}" http://localhost:3002/admin/login 2>/dev/null; echo ""`,
  `echo "=== PM2 Status ==="`,
  `pm2 list 2>&1 | head -15`,
  `echo "=== Nginx Status ==="`,
  `systemctl is-active nginx`,
  `echo "=== Public URL test ==="`,
  `curl -s -o /dev/null -w "HTTP %{http_code}" http://localhost 2>/dev/null; echo ""`,
  `echo "=== API logs (last 5) ==="`,
  `pm2 logs dream-gadgets-api --lines 5 --nostream 2>&1 || true`,
  `echo ""`,
  `echo "=== DEPLOYMENT COMPLETE ==="`,
];

let cmdIndex = 0;

conn.on('ready', () => {
  console.log('=== SSH CONNECTED ===\n');
  runNext();
});

function runNext() {
  if (cmdIndex >= deployCommands.length) {
    console.log('\n=== DEPLOYMENT FINISHED SUCCESSFULLY ===');
    conn.end();
    return;
  }

  const cmd = deployCommands[cmdIndex];
  console.log(`\n>>> ${cmd.substring(0, 120)}...`);
  
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
      console.log(output.length > 1200 ? output.slice(-1200) : output);
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
