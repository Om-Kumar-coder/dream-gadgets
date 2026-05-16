# Dream Gadgets - Installation & Quick Start Guide

> **⏱️ Time to complete: ~5 minutes**

---

## Step 1️⃣: Verify Prerequisites

Before you begin, make sure you have:

```bash
# Check Node.js (should be >= 20.0.0)
node --version

# Check npm (should be >= 11.8.0)  
npm --version

# Check Git
git --version
```

If any are missing, install from:
- **Node.js**: https://nodejs.org/ (includes npm)
- **Git**: https://git-scm.com/

---

## Step 2️⃣: Install Dependencies

From the project root (`Dream Gadgets/`):

```bash
# Install all dependencies (node_modules, @playwright/test, etc.)
npm install

# This installs:
# ✅ @playwright/test - E2E testing framework
# ✅ @types/node - Node.js type definitions
# ✅ jest - Unit testing framework
# ✅ typescript - TypeScript compiler
# ✅ turbo - Monorepo orchestrator
```

**Verify installation:**
```bash
npx playwright --version
# Should output: Playwright 1.40.0 (or similar)
```

---

## Step 3️⃣: Start Development Servers

In separate terminal windows:

```bash
# Terminal 1: Start all services
npm run dev

# OR start individually:
# Terminal 1: API Server
npm run dev:api    # http://localhost:3000

# Terminal 2: Web App
npm run dev:web    # http://localhost:3001

# Terminal 3: Admin App
npm run dev:admin  # http://localhost:3002
```

Wait for all services to be ready (watch for "Ready in X.XXs" messages).

---

## Step 4️⃣: Run Tests

### Option A: Quick Test (5 minutes)
```bash
# Run API tests only
npm run test:api

# Expected output:
# ✅ PASS - API server is running
# ✅ PASS - User registration successful
# ...
# Test Summary: PASS=XX FAIL=0 WARN=X
```

### Option B: E2E Tests (15 minutes)
```bash
# Run web app E2E tests
npm run test:e2e:web

# OR run in headed mode (see browser)
npx playwright test tests/e2e/web --headed
```

### Option C: Full Test Suite (30-45 minutes)
```bash
# Run everything
npm run test:all

# This runs:
# 1. Basic API tests (5 min)
# 2. Extended API tests (5 min)
# 3. Web E2E tests (10 min)
# 4. Admin E2E tests (10 min)
```

---

## Step 5️⃣: View Test Results

### View E2E Report
```bash
# Open interactive HTML report
npm run test:report

# or
npx playwright show-report
```

### Check API Test Logs
```bash
# View last test run
cat logs/test-report.log

# Follow live output
tail -f logs/test-report.log
```

---

## 🎯 Common Commands

```bash
# Development
npm run dev              # Start all services
npm run build            # Build all apps

# Testing
npm run test:api         # API tests
npm run test:e2e         # E2E tests
npm run test:all         # All tests
npm run test:debug       # Debug mode (interactive)
npm run test:report      # View HTML report

# Code Quality
npm run lint             # Lint all code
npm format               # Format all code

# Monorepo-specific
npm run dev:web          # Web app only
npm run dev:admin        # Admin app only
npm run dev:api          # API only
```

---

## ❓ Troubleshooting

### "Command not found: npm"
**Problem:** Node.js not installed  
**Solution:** Install from https://nodejs.org/

### "Cannot find module '@playwright/test'"
**Problem:** Dependencies not installed  
**Solution:**
```bash
npm install
```

### "Cannot find name 'process'"
**Problem:** TypeScript configuration missing  
**Solution:**
```bash
# Already fixed in tsconfig.json, just verify:
cat tsconfig.json | grep -A2 '"types"'
# Should include "node"
```

### "Port 3000 already in use"
**Problem:** Server already running or port conflict  
**Solution:**
```bash
# Kill process on port 3000
lsof -i :3000
kill -9 <PID>

# Or use different port
API_BASE_URL=http://localhost:3000 npm run dev:api
```

### "Browsers not installed for Playwright"
**Problem:** Playwright browsers missing  
**Solution:**
```bash
npx playwright install
# Installs: chromium, firefox, webkit
```

### "Tests fail with 'Connection refused'"
**Problem:** Development servers not running  
**Solution:**
```bash
# In separate terminal, start servers
npm run dev

# Wait for "Ready" messages, then run tests
npm run test:api
```

---

## ✨ What Gets Tested

### API Tests (67 tests)
- ✅ Authentication (login, register, logout)
- ✅ Clients (CRUD operations)
- ✅ Inventory (products, stock, pricing)
- ✅ Orders (create, update, track)
- ✅ Payments (charge, refund, webhooks)
- ✅ Notifications (email, SMS, preferences)
- ✅ Reports (generate, export, schedule)
- ✅ Error Handling (400, 401, 404 responses)
- ✅ Performance (response times)

### E2E Tests (46 tests)
#### Web App (25 tests)
- ✅ User registration & login
- ✅ Product browsing & search
- ✅ Shopping cart operations
- ✅ Checkout flow
- ✅ Payment processing
- ✅ Order tracking

#### Admin App (21 tests)
- ✅ Dashboard & KPIs
- ✅ Client management
- ✅ Inventory management
- ✅ Order management
- ✅ Report generation
- ✅ User permissions

---

## 📊 Expected Results

When all tests pass, you'll see:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ All tests passed!

📊 Test Results:
   ✅ Passed: 113
   ❌ Failed: 0
   📈 Pass Rate: 100%

📁 Reports:
   - Test Logs: logs/
   - E2E Reports: test-results/html/
   - Coverage: coverage/
```

---

## 🚀 Next Steps

### After Successful Setup:

1. **Run specific test groups:**
   ```bash
   ./test.sh test_auth_flow
   ./tests/api/extended-tests.sh payments
   npx playwright test -g "should checkout"
   ```

2. **Debug failing tests:**
   ```bash
   npm run test:debug
   npx playwright test --debug tests/e2e/web/auth.spec.ts
   ```

3. **Generate coverage reports:**
   ```bash
   npm run test:all -- --coverage
   ```

4. **Integrate with CI/CD:**
   - See `.github/workflows/` for GitHub Actions examples
   - See `TEST_PLAN.md` for comprehensive testing strategy

---

## 📚 Documentation

For more detailed information, see:

- **`SETUP.md`** - Detailed setup guide with troubleshooting
- **`TEST_PLAN.md`** - Comprehensive testing strategy & roadmap
- **`TEST_SUITE_SUMMARY.md`** - Overview of all 113 tests
- **`README.md`** - Project overview

---

## 💡 Pro Tips

### Run tests in parallel (faster)
```bash
npx playwright test tests/e2e/ --workers=4
```

### Run single test file
```bash
npx playwright test tests/e2e/web/auth.spec.ts
```

### Run test by name pattern
```bash
npx playwright test -g "login"  # Runs all tests with "login" in name
```

### Update test snapshots
```bash
npx playwright test --update-snapshots
```

### View detailed test info
```bash
npx playwright test --reporter=html
npx playwright show-report
```

---

## ✅ Setup Verification Checklist

Before running important tests, verify:

- [ ] Node.js >= 20.0.0 installed
- [ ] `npm install` completed successfully
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] Playwright installed: `npx playwright --version`
- [ ] Development servers started (`npm run dev`)
- [ ] Can run simple test: `npm run test:api`
- [ ] Can view E2E report: `npm run test:report`

---

**🎉 Ready to test!**

Start with: `npm run test:api` to verify your setup is working.

