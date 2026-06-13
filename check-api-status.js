const { Client } = require('ssh2');

const conn = new Client();
const HOST = '187.127.165.229';
const PASS = '?ESlq-)/e8z3LSgv';
const USER = 'root';

const commands = [
  `echo "=== PM2 Status ===" && pm2 list 2>&1`,
  `echo "=== API Health Check ===" && curl -s http://localhost:3000/api/v1/health 2>&1`,
  `echo "=== API Out Log (last 20 lines) ===" && tail -20 /var/www/dream-gadgets/apps/api/pm2-out.log 2>/dev/null`,
  `echo "=== API Error Log ===" && tail -20 /var/www/dream-gadgets/apps/api/pm2-error.log 2>/dev/null`,
  `echo "=== Web Error Log ===" && tail -10 /var/www/dream-gadgets/apps/web/pm2-error.log 2>/dev/null`,  
  `echo "=== Web Out Log (last 10) ===" && tail -10 /var/www/dream-gadgets/apps/web/pm2-out.log 2>/dev/null`,
  `echo "=== Admin Out Log (last 10) ===" && tail -10 /var/www/dream-gadgets/apps/admin/pm2-out.log 2>/dev/null`,
  `echo "=== Admin Error Log ===" && tail -10 /var/www/dream-gadgets/apps/admin/pm2-error.log 2>/dev/null`,
  `echo "=== Web curl test ===" && curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 2>/dev/null; echo ""`,
  `echo "=== Admin curl test ===" && curl -s -o /dev/null -w "%{http_code}" http://localhost:3002/admin/login 2>/dev/null; echo ""`,
  `echo "=== PM2 Logs (last 20 combined) ===" && pm2 logs --lines 20 --nostream 2>&1 || true`,
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
  console.log(`\n${cmd.substring(0, 100)}`);
  
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
