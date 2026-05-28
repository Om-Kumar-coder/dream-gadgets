const bcrypt = require('bcrypt');
const { execSync } = require('child_process');

async function main() {
  const hash = await bcrypt.hash('Admin@12345', 10);
  console.log('Generated hash:', hash);
  
  const sql = `UPDATE users SET password_hash = '${hash}' WHERE email = 'admin@test.com';`;
  console.log('SQL:', sql);
  
  execSync(
    `PGPASSWORD='?ESlq-)/e8z3LSgv' psql -U dg_user -d dreamgadgets -h localhost -c "${sql}"`,
    { stdio: 'inherit' }
  );
  console.log('Password updated successfully!');
}

main().catch(console.error);
