const { Client } = require('ssh2');

const conn = new Client();
const HOST = '187.127.165.229';
const PASS = '?ESlq-)/e8z3LSgv';
const USER = 'root';
const PROJECT_DIR = '/var/www/dream-gadgets';

conn.on('ready', () => {
  console.log('=== SSH CONNECTED ===\n');

  const commands = [
    // 1. VPS git state
    `echo "--- git log ---" && cd ${PROJECT_DIR} && git log --oneline -5 2>&1 && echo "--- git status ---" && git status --short 2>&1 | head -10 && echo "--- git branch ---" && git branch -v 2>&1`,

    // 2. Check if our commit exists locally on VPS
    `cd ${PROJECT_DIR} && git cat-file -t 80affe7 2>&1; echo "---"`,

    // 3. tsconfig.build.json on VPS
    `echo "--- tsconfig.build.json ---" && cat ${PROJECT_DIR}/apps/api/tsconfig.build.json 2>&1`,

    // 4. Stash list (was something stashed during deploy?)
    `cd ${PROJECT_DIR} && git stash list 2>&1 | head -5`,

    // 5. Full nest build output (verbose, not truncated)
    `echo "--- FULL nest build ---" && cd ${PROJECT_DIR}/apps/api && npx nest build 2>&1 | head -60`,
  ];

  let cmdIndex = 0;
  function runNext() {
    if (cmdIndex >= commands.length) {
      console.log('\n=== GIT DIAGNOSIS COMPLETE ===');
      conn.end();
      return;
    }
    const cmd = commands[cmdIndex];
    console.log(`\n>>> ${cmd.substring(0, 100)}...`);
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
        console.log(output.length > 3500 ? output.slice(-3500) : output);
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
