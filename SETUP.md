# Dream Gadgets - Test Setup Guide

**Last Updated:** May 16, 2026

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** >= 20.0.0 ([Install](https://nodejs.org/))
- **npm** >= 11.8.0 (included with Node.js)
- **Git** (for version control)

### Installation (2 minutes)

```bash
# 1. Navigate to project directory
cd "Dream Gadgets"

# 2. Install all dependencies
npm install

# 3. Verify installation
npx playwright --version
npm run test:api --help
```

---

## 📦 Dependencies Installed

After running `npm install`, you'll have:

### Testing Frameworks
- **@playwright/test** - E2E & component testing framework
- **@types/node** - Node.js type definitions
- **jest** - Unit & component testing
- **@types/jest** - Jest type definitions
- **ts-jest** - TypeScript support for Jest

### Build Tools
- **typescript** - TypeScript compiler
- **turbo** - Monorepo build orchestration

### Code Quality
- **prettier** - Code formatter

---

## ⚙️ Configuration Files

### TypeScript Configuration
The project includes multiple TypeScript configs:

- **`tsconfig.base.json`** - Base configuration for the monorepo
- **`tsconfig.json`** - Root configuration (extends base, includes tests)
- **`apps/*/tsconfig.json`** - Individual app configurations
- **`packages/*/tsconfig.json`** - Shared package configurations

**To verify TypeScript is working:**
```bash
npx tsc --noEmit
```

### Playwright Configuration
- **`playwright.config.ts`** - E2E test settings
  - Browser configs (Chrome, Firefox, Safari, mobile)
  - Test reporter setup
  - Auto-server startup
  - Screenshot/video on failure

**To verify Playwright config:**
```bash
npx playwright test --list
```

---

## 🧪 Running Tests

### API Tests (5 minutes)

```bash
# Basic API tests
./test.sh

# Extended API tests (payments, notifications, reports)
./tests/api/extended-tests.sh

# Specific test group
./tests/api/extended-tests.sh payments
./tests/api/extended-tests.sh notifications
./tests/api/extended-tests.sh reports
./tests/api/extended-tests.sh orders

# Via npm
npm run test:api
npm run test:api:extended
```

### E2E Tests (15-20 minutes)

```bash
# All E2E tests
npm run test:e2e
# or
npx playwright test tests/e2e/

# Web app tests only
npm run test:e2e:web
npx playwright test tests/e2e/web/

# Admin app tests only
npm run test:e2e:admin
npx playwright test tests/e2e/admin/

# Specific test file
npx playwright test tests/e2e/web/auth.spec.ts

# Specific test by name
npx playwright test -g "should login successfully"

# With specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox

# Headed mode (see browser)
npx playwright test tests/e2e/ --headed

# Debug mode (interactive)
npm run test:debug
npx playwright test --debug

# View HTML report
npm run test:report
npx playwright show-report
```

### All Tests (30-45 minutes)

```bash
# Master runner with all tests
npm run test:all

# or manually
./run-all-tests.sh

# Specific test type
./run-all-tests.sh api
./run-all-tests.sh e2e
./run-all-tests.sh components
./run-all-tests.sh integration

# With coverage
./run-all-tests.sh --coverage

# Debug mode
./run-all-tests.sh --debug
```

---

## 🌐 Environment Variables

### Test URLs
Set these before running tests:

```bash
# Default values (used if not set)
export API_BASE_URL="http://localhost:3000"
export WEB_BASE_URL="http://localhost:3001"
export ADMIN_BASE_URL="http://localhost:3002"
```

### Development Servers
To start servers for testing:

```bash
# Terminal 1: Start all services
npm run dev

# Terminal 2: Or start individually
npm run dev:api
npm run dev:web
npm run dev:admin
```

---

## 📊 Test Reports

### E2E Reports (Playwright)
Generated automatically in `test-results/`:

```bash
# View interactive HTML report
npm run test:report

# View JSON results
cat test-results/json/results.json

# View JUnit XML (for CI/CD)
cat test-results/junit/results.xml
```

### API Reports
Generated in `logs/`:

```bash
# Recent test report
cat logs/test-report.log

# Extended API tests
cat logs/api-extended.log

# Specific test run
cat logs/test-summary-*.log
```

### Coverage Reports
Generated in `coverage/`:

```bash
# Open HTML coverage report
open coverage/index.html
```

---

## 🔧 Troubleshooting

### "Cannot find module '@playwright/test'"
**Solution:**
```bash
npm install --save-dev @playwright/test
```

### "Cannot find name 'process'"
**Solution:**
```bash
npm install --save-dev @types/node
# Make sure tsconfig.json has "types": ["node", ...]
```

### "Playwright browsers not installed"
**Solution:**
```bash
npx playwright install
npx playwright install --with-deps  # Install system dependencies too
```

### "Servers not responding"
**Solution:**
```bash
# Start services in separate terminals
npm run dev:api
npm run dev:web
npm run dev:admin

# Or use docker-compose
docker-compose up -d
```

### "Port already in use"
**Solution:**
```bash
# Find and kill process on port
lsof -i :3000  # for API
lsof -i :3001  # for Web
lsof -i :3002  # for Admin

kill -9 <PID>
```

### "TypeScript compilation errors"
**Solution:**
```bash
# Clear cache and rebuild
rm -rf dist/ .turbo/
npm run build
```

---

## 📝 Test Scripts Reference

### Quick Commands
```bash
# Start all development servers
npm run dev

# Run all tests
npm run test:all

# View last test report
npm run test:report

# Format code
npm format

# Lint code
npm run lint
```

### Full Test Commands
```bash
# API Tests
npm run test:api                    # Basic API tests
npm run test:api:extended           # Extended API tests

# E2E Tests
npm run test:e2e                    # All E2E tests
npm run test:e2e:web                # Web app E2E tests
npm run test:e2e:admin              # Admin app E2E tests

# Component & Integration
npm run test:components             # Component tests
npm run test:integration            # Integration tests

# Debug & Reports
npm run test:debug                  # Debug mode
npm run test:report                 # View HTML report
```

---

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - run: npm run test:api
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: test-results/
```

---

## 📚 Additional Resources

### Official Documentation
- [Playwright Documentation](https://playwright.dev)
- [Jest Documentation](https://jestjs.io)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

### Test Files
- API Tests: `test.sh`, `tests/api/extended-tests.sh`
- E2E Tests: `tests/e2e/web/*.spec.ts`, `tests/e2e/admin/*.spec.ts`
- Test Plan: `TEST_PLAN.md`
- Test Summary: `TEST_SUITE_SUMMARY.md`

### Configuration
- Playwright: `playwright.config.ts`
- TypeScript: `tsconfig.json`
- Package Manager: `package.json`

---

## ✅ Verification Checklist

After setup, verify everything works:

```bash
# ✅ Check Node.js version
node --version  # Should be >= 20.0.0

# ✅ Check npm version
npm --version   # Should be >= 11.8.0

# ✅ Verify dependencies installed
npm ls @playwright/test
npm ls typescript

# ✅ Verify TypeScript compilation
npx tsc --noEmit

# ✅ List available tests
npx playwright test --list

# ✅ Run a quick test
./test.sh

# ✅ Run E2E smoke test
npx playwright test tests/e2e/web/auth.spec.ts -g "should display login"
```

If all commands pass ✅, you're ready to run the full test suite!

---

**Need help?** Check the specific test logs:
- API logs: `logs/test-report.log`
- E2E logs: `test-results/html/index.html`
- This guide: Keep it handy for reference!
