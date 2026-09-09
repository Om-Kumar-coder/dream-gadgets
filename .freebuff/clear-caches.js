const { Client } = require('ssh2');
const HOST = '187.127.165.229', USER = 'root', PASS = '?ESlq-)/e8z3LSgv';
const c = new Client();

const script = `
set -e
cd /var/www/dream-gadgets/apps/api
RD=$(grep -E '^(REDIS_URL|REDIS_URI)=' .env | head -1 | cut -d= -f2-)
if [ -n "$RD" ]; then
  N=$(redis-cli -u "$RD" --scan --pattern 'perms:role:*' 2>/dev/null | wc -l)
  echo "perms:role keys found: $N"
  redis-cli -u "$RD" --scan --pattern 'perms:role:*' 2>/dev/null | while read k; do redis-cli -u "$RD" del "$k" > /dev/null; done
  echo "permission cache cleared"
else
  echo "no REDIS_URL found"
fi
rm -rf /var/www/dream-gadgets/apps/web/.next/cache
echo "web fetch cache cleared"
pm2 restart dream-gadgets-web 2>&1 | tail -2
sleep 5
curl -s -o /dev/null -w 'web:%{http_code}\n' http://localhost:3001
`;

c.on('ready', () => {
  c.exec(script, (err, stream) => {
    if (err) { console.error('exec err:', err.message); c.end(); return; }
    let out = '';
    stream.on('data', (d) => { out += d.toString(); });
    stream.stderr.on('data', (d) => { out += d.toString(); });
    stream.on('close', (code) => { process.stdout.write(out + (code !== 0 ? `\n[exit ${code}]\n` : '')); c.end(); });
  });
}).on('error', (e) => { console.error('ssh err:', e.message); process.exit(1); }).connect({ host: HOST, port: 22, username: USER, password: PASS });
