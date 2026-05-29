const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  console.log('=== CONNECTED ===\n');
  
  const cmd = [
    'echo "--- Login ---"',
    'TOKEN=$(curl -s http://localhost:3000/api/v1/auth/login -X POST',
    '  -H "Content-Type: application/json"',
    '  -d \'{"identifier":"admin@test.com","password":"Admin@12345"}\' | /usr/bin/jq -r \'.data.accessToken\')',
    'echo "Token: ${TOKEN:0:20}..."',
    '',
    'echo "--- Get first client ---"',
    'CLIENTS=$(curl -s http://localhost:3000/api/v1/clients -H "Authorization: Bearer $TOKEN")',
    'CLIENT_ID=$(echo "$CLIENTS" | /usr/bin/jq -r \'.data[0].id // "none"\')',
    'echo "First client ID: $CLIENT_ID"',
    '',
    'if [ "$CLIENT_ID" != "none" ]; then',
    '  echo "--- Testing PATCH ---"',
    '  curl -s -w "\\nHTTP_CODE: %{http_code}" -X PATCH',
    '    "http://localhost:3000/api/v1/clients/$CLIENT_ID"',
    '    -H "Content-Type: application/json"',
    '    -H "Authorization: Bearer $TOKEN"',
    '    -d \'{"firstName":"Updated","phone":"9999888877"}\'',
    '  echo ""',
    'fi'
  ].join(' \\\n');

  conn.exec(cmd, (err, stream) => {
    if (err) { console.error('Error:', err.message); conn.end(); return; }
    let out = '';
    stream.on('data', d => out += d.toString());
    stream.stderr.on('data', d => out += d.toString());
    stream.on('close', () => { console.log(out); conn.end(); });
  });
});

conn.on('error', e => { console.error('SSH Error:', e.message); process.exit(1); });

conn.connect({
  host: '187.127.165.229',
  port: 22,
  username: 'root',
  password: '?ESlq-)/e8z3LSgv',
  readyTimeout: 20000,
  keepaliveInterval: 10000,
});
