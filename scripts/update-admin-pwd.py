#!/usr/bin/env python3
import subprocess
import sys

# Read the hash from file
with open('/tmp/password_hash.txt') as f:
    password_hash = f.read().strip()

print(f"Hash length: {len(password_hash)}")
print(f"Hash starts with: {password_hash[:10]}...")

# Update the database
sql = f"UPDATE users SET password_hash = '{password_hash}' WHERE email = 'admin@test.com';"
env = {'PGPASSWORD': "?ESlq-)/e8z3LSgv"}
result = subprocess.run(
    ['psql', '-U', 'dg_user', '-d', 'dreamgadgets', '-h', 'localhost', '-c', sql],
    env=env,
    capture_output=True,
    text=True
)

print(f"Return code: {result.returncode}")
print(f"stdout: {result.stdout}")
print(f"stderr: {result.stderr}")

if result.returncode == 0:
    print("Password updated successfully!")
    sys.exit(0)
else:
    print("Failed to update password")
    sys.exit(1)
