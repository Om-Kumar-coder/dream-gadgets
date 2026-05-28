#!/usr/bin/env node
const bcrypt = require('bcrypt');
const { spawnSync } = require('child_process');

const ENV = { PGPASSWORD: '?ESlq-)/e8z3LSgv' };

function sql(query) {
  const result = spawnSync('psql', ['-U', 'dg_user', '-d', 'dreamgadgets', '-h', 'localhost', '-c', query], { env: ENV, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error('psql exited with code ' + result.status);
}

async function main() {
  const hash = await bcrypt.hash('Test@12345', 10);
  const role = 'f020603d-bf53-49aa-86ab-6628a9a1dc43'; // shop_owner

  const users = [
    ['pw_auth1@test.com', '9999999901', 'Auth', 'User1'],
    ['pw_auth2@test.com', '9999999902', 'Auth', 'User2'],
    ['pw_shopper@test.com', '9999999903', 'Shopper', 'Test'],
  ];

  for (const [email, phone, first, last] of users) {
    sql(`INSERT INTO users (email, phone, password_hash, first_name, last_name, role_id, is_active)
         VALUES ('${email}', '${phone}', '${hash}', '${first}', '${last}', '${role}', true)
         ON CONFLICT (phone) DO UPDATE SET
           email='${email}', password_hash='${hash}', role_id='${role}',
           is_active=true;`);
    console.log('Created: ' + email + ' / Test@12345');
  }

  console.log('Done!');
}

main().catch(console.error);
