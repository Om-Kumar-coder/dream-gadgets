const { Client } = require('ssh2');

const conn = new Client();
const HOST = '187.127.165.229';
const PASS = '?ESlq-)/e8z3LSgv';
const USER = 'root';
const PROJECT_DIR = '/var/www/dream-gadgets';

conn.on('ready', () => {
  console.log('=== SSH CONNECTED ===\n');

  const commands = [
    `echo "--- PM2 Status ---" && pm2 list 2>&1 | head -15`,
    `echo "--- Disk Usage ---" && df -h / 2>&1 | tail -2`,
    `echo "--- Memory ---" && free -m 2>&1 | head -3`,
    `echo "--- Git Pull ---" && cd ${PROJECT_DIR} && git pull 2>&1`,
    `echo "--- Docker Status ---" && cd ${PROJECT_DIR} && docker compose ps 2>&1 | head -15`,
    `echo "--- Restart Services ---" && cd ${PROJECT_DIR} && docker compose restart 2>&1 | head -5`,
    `echo "--- Services Status ---" && sleep 3 && docker compose ps 2>&1 | head -15`,
    `echo "--- Final PM2 ---" && pm2 list 2>&1 | head -10`,
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
