const { Client } = require('ssh2');
const conn = new Client();
const HOST = '187.127.165.229';
const PASS = '?ESlq-)/e8z3LSgv';
const USER = 'root';

const cmds = [
  // Get fresh token
  `echo "=== LOGIN ===" && TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login -H "Content-Type: application/json" -d '{"identifier":"admin@test.com","password":"Admin@12345"}' | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)`,
  // Test all 3 endpoints
  `echo "=== /auth/me ===" && curl -s -w "\\nHTTP: %{http_code}\\n" -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/v1/auth/me`,
  `echo "=== /clients ===" && curl -s -w "\\nHTTP: %{http_code}\\n" -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/v1/clients`,
  `echo "=== /inventory?limit=10 ===" && curl -s -w "\\nHTTP: %{http_code}\\n" -H "Authorization: Bearer $TOKEN" "http://localhost:3000/api/v1/inventory?limit=10"`,
  `echo "=== API ERROR LOG ===" && tail -10 /root/.pm2/logs/dream-gadgets-api-error.log 2>/dev/null`,
];

let i = 0;
conn.on('ready', () => { let TOKEN = ''; 
  function next() { 
    if (i >= cmds.length) { conn.end(); return; } 
    const fullCmd = cmds[i].replace('$TOKEN', TOKEN);
    conn.exec(fullCmd, (err, s) => { 
      if (err) { console.log('FAIL:', i); i++; next(); return; } 
      let o = ''; 
      s.on('data', d => { 
        const str = d.toString();
        o += str;
        // Capture token from login response
        if (i === 0) {
          const match = str.match(/"accessToken":"([^"]+)"/);
          if (match) TOKEN = match[1];
        }
      }); 
      s.stderr.on('data', d => o += d); 
      s.on('close', () => { console.log(o); i++; next(); }); 
    }); 
  } 
  next(); 
});
conn.on('error', e => { console.error('SSH Error:', e.message); process.exit(1); });
conn.connect({ host: HOST, port: 22, username: USER, password: PASS, readyTimeout: 20000, keepaliveInterval: 10000 });
