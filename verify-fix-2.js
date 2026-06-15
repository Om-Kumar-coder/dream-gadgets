const { Client } = require('ssh2');
const conn = new Client();
const HOST = '187.127.165.229';
const PASS = '?ESlq-)/e8z3LSgv';
const USER = 'root';

const cmds = [
  `echo "GETTING TOKEN..." && TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login -H "Content-Type: application/json" -d '{"identifier":"admin@test.com","password":"Admin@12345"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['accessToken'])") && echo "TOKEN: $TOKEN" && echo "---"`,
];

// We'll get the token and save it, then run commands in a second connection
let savedToken = '';

conn.on('ready', () => {
  conn.exec(cmds[0], (err, stream) => {
    if (err) { console.log('FAIL'); conn.end(); return; }
    let o = '';
    stream.on('data', d => { 
      const s = d.toString();
      o += s; 
      // Try to extract token from output
      const m = s.match(/TOKEN: (.+)/);
      if (m) savedToken = m[1];
    });
    stream.stderr.on('data', d => o += d);
    stream.on('close', () => {
      console.log(o);
      
      // Now test endpoints with the saved token
      if (!savedToken) {
        console.log('FAILED TO GET TOKEN');
        conn.end();
        return;
      }
      
      const tests = [
        `curl -s -w "\\nHTTP_CODE: %{http_code}\\n" -H "Authorization: Bearer ${savedToken}" http://localhost:3000/api/v1/auth/me`,
        `curl -s -w "\\nHTTP_CODE: %{http_code}\\n" -H "Authorization: Bearer ${savedToken}" http://localhost:3000/api/v1/clients`,
        `curl -s -w "\\nHTTP_CODE: %{http_code}\\n" -H "Authorization: Bearer ${savedToken}" "http://localhost:3000/api/v1/inventory?limit=10"`,
        `echo "=== ERROR LOG (last 5 lines) ===" && tail -5 /root/.pm2/logs/dream-gadgets-api-error.log 2>/dev/null`,
      ];
      
      let i = 0;
      function nextTest() {
        if (i >= tests.length) { conn.end(); return; }
        conn.exec(tests[i], (err, s) => {
          if (err) { console.log('FAIL:', i); i++; nextTest(); return; }
          let out = '';
          s.on('data', d => out += d);
          s.stderr.on('data', d => out += d);
          s.on('close', () => { console.log(out); i++; nextTest(); });
        });
      }
      nextTest();
    });
  });
});

conn.on('error', e => { console.error('SSH Error:', e.message); process.exit(1); });
conn.connect({ host: HOST, port: 22, username: USER, password: PASS, readyTimeout: 20000, keepaliveInterval: 10000 });
