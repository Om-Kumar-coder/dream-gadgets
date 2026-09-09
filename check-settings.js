#!/usr/bin/env node
const { Client } = require('ssh2');
function runCmd(conn, cmd) {
  return new Promise((resolve) => {
    conn.exec(cmd, (err, stream) => {
      let out = '';
      stream.on('data', d => out += d.toString());
      stream.on('end', () => resolve(out));
    });
  });
}
(async () => {
  const c = new Client();
  await new Promise((r, j) => { c.on('ready', r).on('error', j); c.connect({ host: '187.127.165.229', port: 22, username: 'root', password: '?ESlq-)/e8z3LSgv', readyTimeout: 20000 }); });
  console.log(await runCmd(c, `psql "postgresql://dg_user:%3FESlq-)%2Fe8z3LSgv@localhost:5432/dreamgadgets" -t -A -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'settings' ORDER BY ordinal_position"`));
  c.end();
})();
