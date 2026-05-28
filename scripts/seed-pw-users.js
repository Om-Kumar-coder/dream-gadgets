#!/usr/bin/env node
const bcrypt = require('bcrypt');
const { execSync } = require('child_process');

const ENV = { PGPASSWORD: '?ESlq-)/e8z3LSgv' };
const DB = ['psql', '-U', 'dg_user', '-d', 'dreamgadgets', '-h', 'localhost'];

function sql(query) {
  execSync([...DB, '-c', query].join(' '), { env: ENV, stdio: 'inherit' });
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
           is_active=true, failed_login_attempts=0, locked_until=NULL;`);
    console.log(`  Created: ${email} / Test@12345`);
  }

  console.log('Done! Test users seeded successfully.');
}

main().catch(console.error);
