#!/bin/bash

################################################################################
# Dream Gadgets - Setup Test Environment
# Install all required dependencies for testing
################################################################################

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Dream Gadgets - Test Environment Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
  echo "❌ npm is not installed. Please install Node.js first."
  exit 1
fi

echo ""
echo "📦 Installing Playwright testing framework..."
npm install --save-dev @playwright/test

echo ""
echo "📦 Installing Node.js type definitions..."
npm install --save-dev @types/node

echo ""
echo "📦 Installing TypeScript..."
npm install --save-dev typescript

echo ""
echo "✅ Installing test reporters..."
npm install --save-dev @reporter/html @reporter/json

echo ""
echo "✅ All dependencies installed successfully!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Next steps:"
echo ""
echo "1. Run API tests:"
echo "   ./test.sh"
echo ""
echo "2. Run E2E tests:"
echo "   npx playwright test tests/e2e/"
echo ""
echo "3. View E2E HTML report:"
echo "   npx playwright show-report"
echo ""
echo "4. Run all tests with master runner:"
echo "   ./run-all-tests.sh"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
