const { Client } = require('ssh2');

const conn = new Client();
const HOST = '187.127.165.229';
const PASS = '?ESlq-)/e8z3LSgv';
const USER = 'root';

const commands = [
  `echo "--- List /var/www/ ---"`,
  `ls -la /var/www/ 2>&1`,
  `echo "--- Try dream-gadgets ---"`,
  `ls -la /var/www/dream-gadgets 2>&1`,
  `echo "--- Find any dream directories ---"`,
  `find /var/www/ -maxdepth 2 -type d 2>&1 | head -20`,
  `echo "--- Check alternative paths ---"`,
  `ls -la /var/www/html/ 2>&1`,
  `echo "--- PM2 list ---"`,
  `pm2 list 2>&1 | head -30`,
  `echo "--- Where is PM2 running from? ---"`,
  `pm2 show dream-gadgets-api 2>&1 | head -20 || echo "No PM2 process found"`,
  `echo "--- Check common project locations ---"`,
  `ls -la /root/ 2>&1 | head -20`,
  `ls -la /home/ 2>&1 | head -20`,
  `ls -la /opt/ 2>&1 | head -20`,
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
  console.log(`\n>>> ${cmd.substring(0, 100)}`);
  
  conn.exec(cmd, (err, stream) => {
    if (err) {
      console.error(`Error: ${err.message}`);
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
