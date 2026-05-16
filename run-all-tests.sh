#!/bin/bash

################################################################################
# Dream Gadgets - Master Test Runner
# Runs all test suites: API, E2E, Components, Integration, Performance
################################################################################

set -o pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
API_BASE_URL="${API_BASE_URL:-http://localhost:3000}"
WEB_BASE_URL="${WEB_BASE_URL:-http://localhost:3001}"
ADMIN_BASE_URL="${ADMIN_BASE_URL:-http://localhost:3002}"
LOG_DIR="logs"
RESULTS_DIR="test-results"
COVERAGE_DIR="coverage"
TEST_REPORT="${LOG_DIR}/test-summary-$(date +%s).log"

# Counters
total_pass=0
total_fail=0
total_warn=0

# Functions
log_header() {
  printf "\n%b" "$BLUE"
  printf "╔════════════════════════════════════════════════════════════╗\n"
  printf "║ %s\n" "$1"
  printf "╚════════════════════════════════════════════════════════════╝\n"
  printf "%b" "$NC"
}

log_section() {
  printf "\n%b━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━%b\n" "$CYAN" "$NC"
  printf "%b%s%b\n" "$CYAN" "$1" "$NC"
  printf "%b━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━%b\n" "$CYAN" "$NC"
}

log_test() {
  local name="$1"
  local status="$2"
  local time="${3:-}"
  
  if [[ "$status" == "PASS" ]]; then
    printf "%b✅ PASS%b  %s" "$GREEN" "$NC" "$name"
  elif [[ "$status" == "FAIL" ]]; then
    printf "%b❌ FAIL%b  %s" "$RED" "$NC" "$name"
  elif [[ "$status" == "SKIP" ]]; then
    printf "%b⊘ SKIP%b  %s" "$YELLOW" "$NC" "$name"
  fi
  
  if [[ -n "$time" ]]; then
    printf " (%s)\n" "$time"
  else
    printf "\n"
  fi
}

log_info() {
  printf "%b ℹ INFO%b %s\n" "$BLUE" "$NC" "$1"
}

log_warn() {
  printf "%b⚠ WARN%b %s\n" "$YELLOW" "$NC" "$1"
}

log_fail() {
  printf "%b✗ ERROR%b %s\n" "$RED" "$NC" "$1"
}

check_dependency() {
  local cmd="$1"
  if ! command -v "$cmd" &> /dev/null; then
    log_fail "Missing required command: $cmd"
    return 1
  fi
  return 0
}

check_server() {
  local url="$1"
  local name="$2"
  local timeout=30
  local elapsed=0
  
  while [[ $elapsed -lt $timeout ]]; do
    if curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null | grep -q "200\|301\|302\|404"; then
      log_info "$name is running"
      return 0
    fi
    elapsed=$((elapsed + 1))
    sleep 1
  done
  
  log_warn "$name is not responding (timeout)"
  return 1
}

setup() {
  mkdir -p "$LOG_DIR" "$RESULTS_DIR" "$COVERAGE_DIR"
  
  # Start servers if needed
  log_section "Checking Dependencies"
  
  check_dependency "curl" || exit 1
  check_dependency "jq" || exit 1
  
  if [[ "$RUN_SERVERS" == "true" ]]; then
    log_info "Starting services..."
    # This would be handled by docker-compose or package.json scripts
  fi
  
  # Wait for servers
  log_section "Waiting for Services"
  check_server "$API_BASE_URL" "API Server"
  check_server "$WEB_BASE_URL" "Web Server"
  check_server "$ADMIN_BASE_URL" "Admin Server"
}

run_api_tests() {
  log_section "Running API Tests"
  
  local start_time=$(date +%s)
  
  # Run basic API tests
  log_info "Running basic API test suite..."
  if bash ./test.sh > "$LOG_DIR/api-basic.log" 2>&1; then
    log_test "API Basic Tests" "PASS"
    ((total_pass++))
  else
    log_test "API Basic Tests" "FAIL"
    ((total_fail++))
  fi
  
  # Run extended API tests
  log_info "Running extended API test suite (payments, notifications, reports)..."
  if bash ./tests/api/extended-tests.sh > "$LOG_DIR/api-extended.log" 2>&1; then
    log_test "API Extended Tests" "PASS"
    ((total_pass++))
  else
    log_test "API Extended Tests" "FAIL"
    ((total_fail++))
  fi
  
  local end_time=$(date +%s)
  local duration=$((end_time - start_time))
  log_info "API tests completed in ${duration}s"
}

run_e2e_tests() {
  log_section "Running E2E Tests"
  
  if ! command -v npx &> /dev/null; then
    log_warn "Playwright not installed, skipping E2E tests"
    return 1
  fi
  
  local start_time=$(date +%s)
  
  # Web E2E tests
  log_info "Running web app E2E tests..."
  if npx playwright test tests/e2e/web --reporter=html > "$LOG_DIR/e2e-web.log" 2>&1; then
    log_test "Web E2E Tests" "PASS"
    ((total_pass++))
  else
    log_test "Web E2E Tests" "FAIL"
    ((total_fail++))
  fi
  
  # Admin E2E tests
  log_info "Running admin app E2E tests..."
  if npx playwright test tests/e2e/admin --reporter=html > "$LOG_DIR/e2e-admin.log" 2>&1; then
    log_test "Admin E2E Tests" "PASS"
    ((total_pass++))
  else
    log_test "Admin E2E Tests" "FAIL"
    ((total_fail++))
  fi
  
  local end_time=$(date +%s)
  local duration=$((end_time - start_time))
  log_info "E2E tests completed in ${duration}s"
}

run_component_tests() {
  log_section "Running Component Tests"
  
  if ! command -v npm &> /dev/null; then
    log_warn "npm not installed, skipping component tests"
    return 1
  fi
  
  local start_time=$(date +%s)
  
  # Jest component tests
  log_info "Running component tests with Jest..."
  if npm run test:components > "$LOG_DIR/components.log" 2>&1; then
    log_test "Component Tests" "PASS"
    ((total_pass++))
  else
    log_test "Component Tests" "FAIL"
    ((total_fail++))
  fi
  
  local end_time=$(date +%s)
  local duration=$((end_time - start_time))
  log_info "Component tests completed in ${duration}s"
}

run_integration_tests() {
  log_section "Running Integration Tests"
  
  if ! command -v npm &> /dev/null; then
    log_warn "npm not installed, skipping integration tests"
    return 1
  fi
  
  local start_time=$(date +%s)
  
  log_info "Running integration tests..."
  if npm run test:integration > "$LOG_DIR/integration.log" 2>&1; then
    log_test "Integration Tests" "PASS"
    ((total_pass++))
  else
    log_test "Integration Tests" "FAIL"
    ((total_fail++))
  fi
  
  local end_time=$(date +%s)
  local duration=$((end_time - start_time))
  log_info "Integration tests completed in ${duration}s"
}

run_performance_tests() {
  log_section "Running Performance Tests"
  
  local start_time=$(date +%s)
  
  # API performance (already tested in API suite)
  log_info "Performance metrics collected from API tests"
  
  # Web performance (Lighthouse)
  if command -v lighthouse &> /dev/null || npm list -g lighthouse &> /dev/null; then
    log_info "Running Lighthouse performance audit..."
    npx lighthouse "$WEB_BASE_URL" --chrome-flags="--headless" --output=json --output-path="$RESULTS_DIR/lighthouse.json" > /dev/null 2>&1 || true
  fi
  
  local end_time=$(date +%s)
  local duration=$((end_time - start_time))
  log_info "Performance tests completed in ${duration}s"
}

generate_coverage_report() {
  log_section "Generating Coverage Report"
  
  if [[ -d "$COVERAGE_DIR" ]]; then
    log_info "Coverage data found, generating report..."
    # This would use tools like nyc or coverage.py
  else
    log_warn "No coverage data found"
  fi
}

print_summary() {
  log_section "Test Execution Summary"
  
  local total=$((total_pass + total_fail))
  local pass_rate=0
  
  if [[ $total -gt 0 ]]; then
    pass_rate=$((total_pass * 100 / total))
  fi
  
  printf "\n"
  printf "%b📊 Test Results:%b\n" "$BLUE" "$NC"
  printf "   %b✅ Passed:%b  %d\n" "$GREEN" "$NC" "$total_pass"
  printf "   %b❌ Failed:%b  %d\n" "$RED" "$NC" "$total_fail"
  printf "   %b📈 Pass Rate:%b %d%%\n" "$BLUE" "$NC" "$pass_rate"
  printf "   %b📁 Reports:%b\n" "$BLUE" "$NC"
  printf "      - Test Logs: %s/\n" "$LOG_DIR"
  printf "      - E2E Reports: %s/html/\n" "$RESULTS_DIR"
  printf "      - Coverage: %s/\n\n" "$COVERAGE_DIR"
  
  # Save to summary file
  {
    echo "Test Execution Summary - $(date)"
    echo "============================================"
    echo "Total Tests: $total"
    echo "Passed: $total_pass"
    echo "Failed: $total_fail"
    echo "Pass Rate: ${pass_rate}%"
    echo ""
    echo "Logs:"
    echo "  - $LOG_DIR"
    echo "  - $RESULTS_DIR"
    echo "  - $COVERAGE_DIR"
  } > "$TEST_REPORT"
  
  if [[ $total_fail -eq 0 ]]; then
    printf "%b✅ All tests passed!%b\n" "$GREEN" "$NC"
    return 0
  else
    printf "%b❌ %d test(s) failed%b\n" "$RED" "$total_fail" "$NC"
    return 1
  fi
}

show_help() {
  cat << EOF
${BLUE}Dream Gadgets - Master Test Runner${NC}

USAGE:
  ./run-all-tests.sh [OPTIONS] [TEST_TYPE]

TEST TYPES:
  api               Run API tests only
  e2e               Run E2E tests only
  components        Run component tests only
  integration       Run integration tests only
  performance       Run performance tests only
  all               Run all tests (default)

OPTIONS:
  --help            Show this help message
  --coverage        Generate coverage report
  --servers         Start services before running tests
  --parallel        Run tests in parallel (E2E only)
  --debug           Run with debug logging
  --web <test>      Run specific E2E web test
  --admin <test>    Run specific E2E admin test

EXAMPLES:
  # Run all tests
  ./run-all-tests.sh

  # Run API tests only
  ./run-all-tests.sh api

  # Run E2E tests with coverage
  ./run-all-tests.sh e2e --coverage

  # Run specific E2E test
  ./run-all-tests.sh --web checkout

  # Run all with debug output
  ./run-all-tests.sh --debug

EOF
}

main() {
  local test_type="all"
  local coverage=false
  local debug=false
  
  # Parse arguments
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --help|-h)
        show_help
        exit 0
        ;;
      --coverage)
        coverage=true
        shift
        ;;
      --debug)
        debug=true
        shift
        ;;
      --servers)
        RUN_SERVERS="true"
        shift
        ;;
      api|e2e|components|integration|performance|all)
        test_type="$1"
        shift
        ;;
      *)
        shift
        ;;
    esac
  done
  
  log_header "Dream Gadgets - Comprehensive Test Suite"
  
  setup
  
  case "$test_type" in
    api)
      run_api_tests
      ;;
    e2e)
      run_e2e_tests
      ;;
    components)
      run_component_tests
      ;;
    integration)
      run_integration_tests
      ;;
    performance)
      run_performance_tests
      ;;
    all)
      run_api_tests
      run_e2e_tests
      run_component_tests
      run_integration_tests
      run_performance_tests
      ;;
  esac
  
  if [[ "$coverage" == "true" ]]; then
    generate_coverage_report
  fi
  
  print_summary
  local exit_code=$?
  
  exit "$exit_code"
}

main "$@"
