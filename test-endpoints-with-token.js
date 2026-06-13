const { Client } = require('ssh2');
const conn = new Client();
const HOST = '187.127.165.229';
const PASS = '?ESlq-)/e8z3LSgv';
const USER = 'root';

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMGNhMmQzOS1hZjE4LTQ0NDItOGNjNy1mM2RiMWZlNTEyMmQiLCJlbWFpbCI6ImFkbWluQHRlc3QuY29tIiwicm9sZSI6InNob3Bfb3duZXIiLCJwZXJtaXNzaW9ucyI6WyJkYXNoYm9hcmQudmlldyIsImRhc2hib2FyZC5jcmVhdGUiLCJkYXNoYm9hcmQuZWRpdCIsImRhc2hib2FyZC5kZWxldGUiLCJkYXNoYm9hcmQuZXhwb3J0IiwiZGFzaGJvYXJkLmFwcHJvdmUiLCJpbnZlbnRvcnkudmlldyIsImludmVudG9yeS5jcmVhdGUiLCJpbnZlbnRvcnkuZWRpdCIsImludmVudG9yeS5kZWxldGUiLCJpbnZlbnRvcnkuZXhwb3J0IiwiaW52ZW50b3J5LmFwcHJvdmUiLCJwdXJjaGFzZXMudmlldyIsInB1cmNoYXNlcy5jcmVhdGUiLCJwdXJjaGFzZXMuZWRpdCIsInB1cmNoYXNlcy5kZWxldGUiLCJwdXJjaGFzZXMuZXhwb3J0IiwicHVyY2hhc2VzLmFwcHJvdmUiLCJzYWxlcy52aWV3Iiwic2FsZXMuY3JlYXRlIiwic2FsZXMuZWRpdCIsInNhbGVzLmRlbGV0ZSIsInNhbGVzLmV4cG9ydCIsInNhbGVzLmFwcHJvdmUiLCJjbGllbnRzLnZpZXciLCJjbGllbnRzLmNyZWF0ZSIsImNsaWVudHMuZWRpdCIsImNsaWVudHMuZGVsZXRlIiwiY2xpZW50cy5leHBvcnQiLCJjbGllbnRzLmFwcHJvdmUiLCJ0cmFuc2ZlcnMudmlldyIsInRyYW5zZmVycy5jcmVhdGUiLCJ0cmFuc2ZlcnMuZWRpdCIsInRyYW5zZmVycy5kZWxldGUiLCJ0cmFuc2ZlcnMuZXhwb3J0IiwidHJhbnNmZXJzLmFwcHJvdmUiLCJleGNoYW5nZS52aWV3IiwiZXhjaGFuZ2UuY3JlYXRlIiwiZXhjaGFuZ2UuZWRpdCIsImV4Y2hhbmdlLmRlbGV0ZSIsImV4Y2hhbmdlLmV4cG9ydCIsImV4Y2hhbmdlLmFwcHJvdmUiLCJvcmRlcnMudmlldyIsIm9yZGVycy5jcmVhdGUiLCJvcmRlcnMuZWRpdCIsIm9yZGVycy5kZWxldGUiLCJvcmRlcnMuZXhwb3J0Iiwib3JkZXJzLmFwcHJvdmUiLCJyZXR1cm5zLnZpZXciLCJyZXR1cm5zLmNyZWF0ZSIsInJldHVybnMuZWRpdCIsInJldHVybnMuZGVsZXRlIiwicmV0dXJucy5leHBvcnQiLCJyZXR1cm5zLmFwcHJvdmUiLCJyZXBvcnRzLnZpZXciLCJyZXBvcnRzLmNyZWF0ZSIsInJlcG9ydHMuZWRpdCIsInJlcG9ydHMuZGVsZXRlIiwicmVwb3J0cy5leHBvcnQiLCJyZXBvcnRzLmFwcHJvdmUiLCJ1c2Vycy52aWV3IiwidXNlcnMuY3JlYXRlIiwidXNlcnMuZWRpdCIsInVzZXJzLmRlbGV0ZSIsInVzZXJzLmV4cG9ydCIsInVzZXJzLmFwcHJvdmUiLCJzZXR0aW5ncy52aWV3Iiwic2V0dGluZ3MuY3JlYXRlIiwic2V0dGluZ3MuZWRpdCIsInNldHRpbmdzLmRlbGV0ZSIsInNldHRpbmdzLmV4cG9ydCIsInNldHRpbmdzLmFwcHJvdmUiLCJjb250ZW50LnZpZXciLCJjb250ZW50LmNyZWF0ZSIsImNvbnRlbnQuZWRpdCIsImNvbnRlbnQuZGVsZXRlIiwiY29udGVudC5leHBvcnQiLCJjb250ZW50LmFwcHJvdmUiLCJidXliYWNrLnZpZXciLCJidXliYWNrLmNyZWF0ZSIsImJ1eWJhY2suZWRpdCIsImJ1eWJhY2suZGVsZXRlIiwiYnV5YmFjay5leHBvcnQiLCJidXliYWNrLmFwcHJvdmUiXSwiYnJhbmNoSWQiOm51bGwsImlhdCI6MTc4MTM2NjcwMywiZXhwIjoxNzgxMzY3NjAzfQ.II5YIID043zTMvO4Yb9sPnMIvJeMsMCuCKDR3Ab6y_s';

const cmds = [
  `echo "=== /auth/me ===" && curl -s -w "\\nHTTP_CODE: %{http_code}\\n" -H "Authorization: Bearer ${TOKEN}" http://localhost:3000/api/v1/auth/me`,
  `echo "=== /clients ===" && curl -s -w "\\nHTTP_CODE: %{http_code}\\n" -H "Authorization: Bearer ${TOKEN}" http://localhost:3000/api/v1/clients`,
  `echo "=== /inventory?limit=10 ===" && curl -s -w "\\nHTTP_CODE: %{http_code}\\n" -H "Authorization: Bearer ${TOKEN}" "http://localhost:3000/api/v1/inventory?limit=10"`,
  `echo "=== API OUT LOG (last 50) ===" && tail -50 /var/www/dream-gadgets/apps/api/pm2-out.log`,
  `echo "=== API ERROR LOG (all) ===" && cat /var/www/dream-gadgets/apps/api/pm2-error.log`,
];

let i = 0;
conn.on('ready', () => { next(); function next() { if (i >= cmds.length) { conn.end(); return; } conn.exec(cmds[i], (err, s) => { if (err) { console.log('FAIL:', cmds[i].substring(0,60)); i++; next(); return; } let o = ''; s.on('data', d => o += d); s.stderr.on('data', d => o += d); s.on('close', () => { console.log(o); i++; next(); }); }); } });
conn.on('error', e => { console.error('SSH Error:', e.message); process.exit(1); });
conn.connect({ host: HOST, port: 22, username: USER, password: PASS, readyTimeout: 20000, keepaliveInterval: 10000 });
