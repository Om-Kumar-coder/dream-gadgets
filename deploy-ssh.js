const { Client } = require('ssh2');

const conn = new Client();
const HOST = '187.127.165.229';
const PASS = '?ESlq-)/e8z3LSgv';
const USER = 'root';
const PROJECT_DIR = '/var/www/dream-gadgets';

conn.on('ready', () => {
  console.log('=== SSH CONNECTED ===\n');

  const commands = [
    `echo "--- Initial PM2 Status ---" && pm2 list 2>&1 | head -15`,
    `echo "--- Disk Usage ---" && df -h / 2>&1 | tail -2`,
    `echo "--- Memory ---" && free -m 2>&1 | head -3`,
    `echo "--- Stashing local changes ---" && cd ${PROJECT_DIR} && git stash 2>&1`,
    `echo "--- Git Pull ---" && cd ${PROJECT_DIR} && git pull 2>&1`,
    `echo "--- Installing dependencies ---" && cd ${PROJECT_DIR} && npm install 2>&1 | tail -5`,
    `echo "--- Building all apps ---" && cd ${PROJECT_DIR} && npm run build 2>&1 | tail -10`,
    `echo "--- Updating Nginx config ---" && cd ${PROJECT_DIR} && bash deploy.sh nginx 2>&1`,
    `echo "--- Restarting PM2 ---" && cd ${PROJECT_DIR} && pm2 reload all 2>&1`,
    `echo "--- Waiting for services to stabilize ---" && sleep 5`,
    `echo "--- Health Check: API ---" && curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/v1/health 2>/dev/null || echo "API not responding"`,
    `echo "--- Health Check: Web ---" && curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 2>/dev/null || echo "Web not responding"`,
    `echo "--- Health Check: Admin ---" && curl -s -o /dev/null -w "%{http_code}" http://localhost:3002/admin/login 2>/dev/null || echo "Admin not responding"`,
    `echo "--- Final PM2 Status ---" && pm2 list 2>&1 | head -15`,
    `echo "--- Recent API logs (last 10 lines) ---" && pm2 logs dream-gadgets-api --lines 10 --nostream 2>&1 || true`,
  ];

  let cmdIndex = 0;

  function runNext() {
    if (cmdIndex >= commands.length) {
      console.log('\n=== DEPLOYMENT COMPLETE ===');
      conn.end();
      return;
    }

    const cmd = commands[cmdIndex];
    console.log(`\n>>> Running: ${cmd.substring(0, 80)}...`);
    
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
        console.log(output);
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
