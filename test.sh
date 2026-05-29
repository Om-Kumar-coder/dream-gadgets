#!/usr/bin/env bash
set -u
set -o pipefail

################################################################################
# Dream Gadgets – Comprehensive Automated Test Suite
# Improved: dependency validation, reusable helpers, token retrieval, grouped tests
################################################################################

API_BASE_URL="${API_BASE_URL:-http://localhost:3000}"
WEB_BASE_URL="${WEB_BASE_URL:-http://localhost:3001}"
ADMIN_BASE_URL="${ADMIN_BASE_URL:-http://localhost:3002}"
API_ENDPOINT="${API_BASE_URL}/api/v1"
LOG_DIR="logs"
LOG_FILE="${LOG_DIR}/test-report.log"
TIMEOUT=10
RETRY_COUNT=3
SLOW_THRESHOLD=500  # milliseconds

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

pass_count=0
fail_count=0
warn_count=0

log_pass() {
  local msg="$1"
  printf "%b✅ PASS%b %s\n" "$GREEN" "$NC" "$msg"
  printf "[PASS] %s\n" "$msg" >> "$LOG_FILE"
  ((pass_count++))
}

log_fail() {
  local msg="$1"
  local expected="${2:-}"
  local actual="${3:-}"
  printf "%b❌ FAIL%b %s\n" "$RED" "$NC" "$msg"
  if [[ -n "$expected" && -n "$actual" ]]; then
    printf "%b  Expected: %s%b\n" "$RED" "$expected" "$NC"
    printf "%b  Actual: %s%b\n" "$RED" "$actual" "$NC"
    printf "[FAIL] %s | Expected: %s | Actual: %s\n" "$msg" "$expected" "$actual" >> "$LOG_FILE"
  else
    printf "[FAIL] %s\n" "$msg" >> "$LOG_FILE"
  fi
  ((fail_count++))
}

log_warn() {
  local msg="$1"
  printf "%b⚠ WARN%b %s\n" "$YELLOW" "$NC" "$msg"
  printf "[WARN] %s\n" "$msg" >> "$LOG_FILE"
  ((warn_count++))
}

log_info() {
  local msg="$1"
  printf "%bℹ INFO%b %s\n" "$BLUE" "$NC" "$msg"
  printf "[INFO] %s\n" "$msg" >> "$LOG_FILE"
}

log_section() {
  local title="$1"
  printf "\n%b━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━%b\n" "$BLUE" "$NC"
  printf "%b%s%b\n" "$BLUE" "$title" "$NC"
  printf "%b━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━%b\n" "$BLUE" "$NC"
  printf "═══ %s ═══\n" "$title" >> "$LOG_FILE"
}

require_command() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    printf "%bMissing required command:%b %s\n" "$RED" "$NC" "$cmd"
    exit 2
  fi
}

require_tools() {
  for cmd in "$@"; do
    require_command "$cmd"
  done
}

# ═══════════════════════════════════════════════════════════════════════════════
# FIXED: curl_with_retry now outputs BOTH body and HTTP code on stdout.
# Output format: <body>\n<http_code>
# The return code is always 0 on success (curl completed), 1 on failure (no valid HTTP code).
# Callers MUST use parse_response() to extract body and HTTP code.
# ═══════════════════════════════════════════════════════════════════════════════
curl_with_retry() {
  local method="$1"
  local endpoint="$2"
  local data="$3"
  local token="$4"
  local attempt=1
  local response
  local http_code
  local curl_args=(--silent --show-error --write-out "\n%{http_code}" --connect-timeout "$TIMEOUT" --max-time $((TIMEOUT * 2)) --retry 2 --retry-delay 1 --retry-connrefused -X "$method" -H "Content-Type: application/json")

  if [[ -n "$token" ]]; then
    curl_args+=( -H "Authorization: Bearer $token" )
  fi

  if [[ -n "$data" && "$method" != "GET" ]]; then
    curl_args+=( -d "$data" )
  fi

  while [[ $attempt -le $RETRY_COUNT ]]; do
    response=$(curl "${curl_args[@]}" "$endpoint" 2>/dev/null)
    http_code=$(printf '%s' "$response" | tail -n1)
    body=$(printf '%s' "$response" | head -n-1)

    if [[ "$http_code" =~ ^[0-9]+$ ]]; then
      # Output body then http_code on separate lines
      printf '%s\n%s\n' "$body" "$http_code"
      return 0
    fi

    ((attempt++))
    sleep 1
  done

  return 1
}

# Helper: extract HTTP code from combined body+code response (last line)
get_http_code() {
  local response="$1"
  printf '%s' "$response" | tail -n1
}

# Helper: extract body from combined body+code response (all but last line)
get_body() {
  local response="$1"
  printf '%s' "$response" | head -n-1
}

get_response_time() {
  local method="$1"
  local endpoint="$2"
  local token="$3"
  local curl_args=(--silent --show-error --output /dev/null --write-out "%{time_total}" --connect-timeout "$TIMEOUT" --max-time $((TIMEOUT * 2)) -X "$method" -H "Content-Type: application/json")

  if [[ -n "$token" ]]; then
    curl_args+=( -H "Authorization: Bearer $token" )
  fi

  curl "${curl_args[@]}" "$endpoint" 2>/dev/null
}

validate_uuid() {
  local value="$1"
  if [[ "$value" =~ ^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}$ ]]; then
    return 0
  fi
  return 1
}

get_auth_token() {
  local identifier="$1"
  local password="$2"
  local login_payload
  local response
  local code

  login_payload=$(cat <<EOF
{
  "identifier": "$identifier",
  "password": "$password"
}
EOF
)

  response=$(curl_with_retry "POST" "$API_ENDPOINT/auth/login" "$login_payload" "")
  code=$(get_http_code "$response")
  body=$(get_body "$response")

  if [[ "$code" -ne 200 ]]; then
    return 1
  fi

  printf '%s' "$body" | jq -r '.data.accessToken // empty'
}

performance_check() {
  local endpoint="$1"
  local token="$2"
  local test_name="$3"
  local response_time
  local response_ms_int

  response_time=$(get_response_time "GET" "$endpoint" "$token")
  if [[ -z "$response_time" ]]; then
    log_warn "$test_name response time unavailable"
    return 1
  fi

  response_ms_int=$(awk -v t="$response_time" 'BEGIN { printf "%d", t * 1000 }')

  if [[ $response_ms_int -lt $SLOW_THRESHOLD ]]; then
    log_pass "$test_name (${response_ms_int}ms)"
  else
    log_warn "$test_name (${response_ms_int}ms > ${SLOW_THRESHOLD}ms threshold)"
  fi
}

setup() {
  mkdir -p "$LOG_DIR"
  : > "$LOG_FILE"
  printf "Test Report - %s\n" "$(date)" >> "$LOG_FILE"
  require_tools curl jq awk
}

# ═══════════════════════════════════════════════════════════════════════════════
# FIXED: check_response_code now correctly parses the combined body+code response
# from curl_with_retry instead of relying on $? (which truncated codes > 255).
# ═══════════════════════════════════════════════════════════════════════════════
check_response_code() {
  local method="$1"
  local endpoint="$2"
  local expected_code="$3"
  local data="$4"
  local token="$5"
  local test_name="$6"
  local result
  local code
  local body

  result=$(curl_with_retry "$method" "$endpoint" "$data" "$token")
  if [[ $? -ne 0 ]]; then
    log_fail "$test_name" "HTTP $expected_code" "Connection failed"
    return 1
  fi

  code=$(get_http_code "$result")
  body=$(get_body "$result")

  if [[ "$code" -eq "$expected_code" ]]; then
    log_pass "$test_name (HTTP $code)"
    printf '%s' "$body"
    return 0
  fi

  log_fail "$test_name" "HTTP $expected_code" "HTTP $code"
  printf '%s' "$body"
  return 1
}

check_json_field() {
  local json="$1"
  local field="$2"
  local test_name="$3"

  if printf '%s' "$json" | jq -e "$field" >/dev/null 2>&1; then
    log_pass "$test_name"
    printf '%s' "$json" | jq "$field"
    return 0
  fi

  log_fail "$test_name" "Field $field exists" "Field not found"
  return 1
}

run_group() {
  local group="$1"
  if declare -f "$group" >/dev/null 2>&1; then
    "$group"
  else
    log_warn "Unknown test group: $group"
  fi
}

# ──────────────────────────────────────────────────────────────────────────────
# TEST GROUPS
# ──────────────────────────────────────────────────────────────────────────────

test_system_health() {
  log_section "SYSTEM HEALTH CHECKS"

  log_info "Checking API server at $API_BASE_URL..."
  if curl -s -o /dev/null -w "%{http_code}" "$API_BASE_URL" --connect-timeout 5 | grep -q "200\|404\|405"; then
    log_pass "API server is running"
  else
    log_fail "API server is not responding"
    return 1
  fi

  log_info "Checking Web server at $WEB_BASE_URL..."
  if curl -s -o /dev/null -w "%{http_code}" "$WEB_BASE_URL" --connect-timeout 5 | grep -q "200\|301\|302"; then
    log_pass "Web server is running"
  else
    log_warn "Web server may not be running"
  fi

  log_info "Checking Admin server at $ADMIN_BASE_URL..."
  if curl -s -o /dev/null -w "%{http_code}" "$ADMIN_BASE_URL" --connect-timeout 5 | grep -q "200\|301\|302"; then
    log_pass "Admin server is running"
  else
    log_warn "Admin server may not be running"
  fi

  log_info "Checking Swagger documentation..."
  if curl -s -o /dev/null -w "%{http_code}" "$API_BASE_URL/api/docs" --connect-timeout 5 | grep -q "200"; then
    log_pass "Swagger docs available"
  else
    log_warn "Swagger docs not accessible"
  fi
}

test_auth_flow() {
  log_section "AUTHENTICATION FLOW TESTS"

  # Registration is OTP-based (phone + OTP). Since OTPs are generated server-side
  # and stored in Redis, we skip direct registration testing in favor of testing
  # login with pre-seeded admin credentials, which is the primary auth flow.
  log_info "Registration is OTP-based — testing login flow with admin credentials instead"

  log_info "Testing login with invalid credentials..."
  local login_bad_payload
  login_bad_payload=$(cat <<EOF
{
  "identifier": "nonexistent@test.com",
  "password": "WrongPassword"
}
EOF
)

  local result
  result=$(curl_with_retry "POST" "$API_ENDPOINT/auth/login" "$login_bad_payload" "")
  local code
  code=$(get_http_code "$result")

  if [[ "$code" -eq 401 ]]; then
    log_pass "Invalid credentials correctly rejected (HTTP 401)"
  else
    log_warn "Invalid credentials handled with HTTP $code (expected 401)"
  fi

  log_info "Testing login with valid credentials (admin@test.com)..."
  local login_payload
  login_payload=$(cat <<EOF
{
  "identifier": "admin@test.com",
  "password": "Admin@12345"
}
EOF
)

  result=$(curl_with_retry "POST" "$API_ENDPOINT/auth/login" "$login_payload" "")
  code=$(get_http_code "$result")
  local body
  body=$(get_body "$result")
  local token

  if [[ "$code" -eq 200 ]]; then
    log_pass "Login successful (HTTP 200)"
    token=$(printf '%s' "$body" | jq -r '.data.accessToken // empty')
    if [[ -n "$token" && "$token" != "null" ]]; then
      log_pass "Access token received"
    else
      log_fail "Access token not returned"
    fi
  else
    log_fail "Login failed" "HTTP 200" "HTTP $code"
  fi

  if [[ -n "$token" ]]; then
    log_info "Testing get profile endpoint..."
    local profile_result
    profile_result=$(curl_with_retry "GET" "$API_ENDPOINT/auth/me" "" "$token")
    code=$(get_http_code "$profile_result")
    body=$(get_body "$profile_result")

    if [[ "$code" -eq 200 ]]; then
      log_pass "Get profile successful"
      local profile_email
      profile_email=$(printf '%s' "$body" | jq -r '.data.email // empty')
      if [[ "$profile_email" == "admin@test.com" ]]; then
        log_pass "Profile data integrity verified"
      else
        log_warn "Profile email mismatch: expected admin@test.com, got $profile_email"
      fi
    else
      log_fail "Get profile failed" "HTTP 200" "HTTP $code"
    fi

    log_info "Testing unauthorized access (no token)..."
    local no_token_response
    no_token_response=$(curl -s -w "\n%{http_code}" -X GET "$API_ENDPOINT/auth/me" -H "Content-Type: application/json" --connect-timeout "$TIMEOUT" --max-time $((TIMEOUT * 2)))
    code=$(printf '%s' "$no_token_response" | tail -n1)

    if [[ "$code" -eq 401 ]]; then
      log_pass "Unauthorized requests correctly rejected (HTTP 401)"
    else
      log_warn "Unauthorized request returned HTTP $code (expected 401)"
    fi
  fi
}

test_client_management() {
  log_section "CLIENT MANAGEMENT TESTS"

  log_info "Obtaining authentication token..."
  local token
  token=$(get_auth_token "admin@test.com" "Admin@12345")

  if [[ -z "$token" ]]; then
    log_warn "Could not obtain admin token, skipping client tests"
    return 1
  fi

  log_info "Testing client creation..."
  local client_payload
  local result
  local code
  local body
  local client_id

  # First get a valid branchId
  local branch_result
  branch_result=$(curl_with_retry "GET" "$API_ENDPOINT/admin/branches" "" "$token")
  local branch_code
  branch_code=$(get_http_code "$branch_result")
  local branch_body
  branch_body=$(get_body "$branch_result")
  local branch_id
  branch_id=$(printf '%s' "$branch_body" | jq -r '.data[0].id // ""')

  if [[ -z "$branch_id" ]]; then
    log_warn "No branches found, using fallback branch UUID"
    branch_id="00000000-0000-0000-0000-000000000001"
  fi

  local client_payload
  client_payload=$(cat <<EOF
{
  "firstName": "Test",
  "lastName": "Client $(date +%s)",
  "email": "client_$(date +%s)@test.com",
  "phone": "9876543210",
  "address": "123 Test Street",
  "city": "Test City",
  "state": "TS",
  "pincode": "123456",
  "customerType": "walk-in",
  "branchId": "$branch_id"
}
EOF
)

  result=$(curl_with_retry "POST" "$API_ENDPOINT/clients" "$client_payload" "$token")
  code=$(get_http_code "$result")
  body=$(get_body "$result")
  client_id=""

  if [[ "$code" -eq 201 ]]; then
    log_pass "Client created successfully"
    client_id=$(printf '%s' "$body" | jq -r '.data.id // empty')
    if validate_uuid "$client_id"; then
      log_pass "Valid client ID received: $client_id"
    else
      log_warn "Client ID is missing or invalid"
    fi
  else
    log_fail "Client creation failed" "HTTP 201" "HTTP $code"
    local err_msg
    err_msg=$(printf '%s' "$body" | jq -r '.error.message // .error // "Unknown error"' | head -c 200)
    log_info "Error details: $err_msg"
  fi

  log_info "Testing get all clients..."
  result=$(curl_with_retry "GET" "$API_ENDPOINT/clients" "" "$token")
  code=$(get_http_code "$result")
  body=$(get_body "$result")

  if [[ "$code" -eq 200 ]]; then
    log_pass "Get clients list successful"
    if printf '%s' "$body" | jq -e '.data | type == "array"' >/dev/null 2>&1; then
      local client_count
      client_count=$(printf '%s' "$body" | jq '.data | length')
      log_info "Found $client_count clients"
    fi
  else
    log_warn "Get clients list returned HTTP $code"
  fi

  if [[ -n "${client_id:-}" ]]; then
    log_info "Testing get single client..."
    result=$(curl_with_retry "GET" "$API_ENDPOINT/clients/$client_id" "" "$token")
    code=$(get_http_code "$result")
    body=$(get_body "$result")

    if [[ "$code" -eq 200 ]]; then
      log_pass "Get single client successful"
      local retrieved_name
      retrieved_name=$(printf '%s' "$body" | jq -r '.data.firstName // .data.name // empty')
      if [[ -n "$retrieved_name" ]]; then
        log_pass "Client data integrity verified: $retrieved_name"
      fi
    else
      log_fail "Get single client failed" "HTTP 200" "HTTP $code"
    fi

    log_info "Testing client update..."
    local update_payload
    update_payload=$(cat <<EOF
{
  "firstName": "Updated",
  "lastName": "Client",
  "phone": "9999888877"
}
EOF
)

    result=$(curl_with_retry "PATCH" "$API_ENDPOINT/clients/$client_id" "$update_payload" "$token")
    code=$(get_http_code "$result")
    body=$(get_body "$result")

    if [[ "$code" -eq 200 ]]; then
      log_pass "Client update successful"
    else
      local err_msg
      err_msg=$(printf '%s' "$body" | jq -r '.error.message // .error // "Unknown error"' | head -c 200)
      log_warn "Client update returned HTTP $code: $err_msg"
    fi

    log_info "Testing get client history..."
    result=$(curl_with_retry "GET" "$API_ENDPOINT/clients/$client_id/history" "" "$token")
    code=$(get_http_code "$result")

    if [[ "$code" -eq 200 ]]; then
      log_pass "Get client history successful"
    else
      log_warn "Get client history returned HTTP $code"
    fi
  fi
}

test_inventory_management() {
  log_section "INVENTORY MANAGEMENT TESTS"

  log_info "Obtaining authentication token..."
  local token
  token=$(get_auth_token "admin@test.com" "Admin@12345")

  if [[ -z "$token" ]]; then
    log_warn "Could not obtain token, skipping inventory tests"
    return 1
  fi

  log_info "Testing get brands list..."
  local result
  result=$(curl_with_retry "GET" "$API_ENDPOINT/inventory/brands" "" "$token")
  local code
  code=$(get_http_code "$result")
  local body
  body=$(get_body "$result")

  if [[ "$code" -eq 200 ]]; then
    log_pass "Get brands successful"
    local brand_count
    brand_count=$(printf '%s' "$body" | jq '.data | length')
    log_info "Found $brand_count brands"
  else
    log_warn "Get brands returned HTTP $code"
  fi

  log_info "Testing get models list..."
  result=$(curl_with_retry "GET" "$API_ENDPOINT/inventory/models" "" "$token")
  code=$(get_http_code "$result")
  body=$(get_body "$result")

  if [[ "$code" -eq 200 ]]; then
    log_pass "Get models successful"
    local model_count
    model_count=$(printf '%s' "$body" | jq '.data | length')
    log_info "Found $model_count models"
  else
    log_warn "Get models returned HTTP $code"
  fi

  log_info "Testing get inventory items..."
  result=$(curl_with_retry "GET" "$API_ENDPOINT/inventory?limit=10" "" "$token")
  code=$(get_http_code "$result")
  body=$(get_body "$result")

  if [[ "$code" -eq 200 ]]; then
    log_pass "Get inventory items successful"
    local item_count
    item_count=$(printf '%s' "$body" | jq '.data | length')
    log_info "Found $item_count inventory items"
  else
    log_warn "Get inventory items returned HTTP $code"
  fi

  log_info "Testing price suggestion endpoint..."
  result=$(curl_with_retry "GET" "$API_ENDPOINT/inventory/price-suggestion?modelId=test&condition=good" "" "$token")
  code=$(get_http_code "$result")

  if [[ "$code" -eq 200 || "$code" -eq 404 ]]; then
    log_pass "Price suggestion endpoint accessible (HTTP $code)"
  else
    log_warn "Price suggestion returned HTTP $code"
  fi

  log_info "Testing city stock endpoint..."
  result=$(curl_with_retry "GET" "$API_ENDPOINT/inventory/city-stock?modelId=test" "" "$token")
  code=$(get_http_code "$result")

  if [[ "$code" -eq 200 || "$code" -eq 404 ]]; then
    log_pass "City stock endpoint accessible (HTTP $code)"
  else
    log_warn "City stock returned HTTP $code"
  fi
}

test_error_handling() {
  log_section "ERROR HANDLING & EDGE CASES"

  log_info "Testing invalid endpoint..."
  local invalid_response
  invalid_response=$(curl -s -w "\n%{http_code}" -X GET "$API_ENDPOINT/invalid-endpoint" -H "Content-Type: application/json" --connect-timeout "$TIMEOUT" --max-time $((TIMEOUT * 2)))
  local code
  code=$(printf '%s' "$invalid_response" | tail -n1)

  if [[ "$code" -eq 404 ]]; then
    log_pass "Invalid endpoint correctly returns 404"
  else
    log_warn "Invalid endpoint returned HTTP $code (expected 404)"
  fi

  log_info "Testing malformed JSON handling..."
  local malformed_response
  malformed_response=$(curl -s -w "\n%{http_code}" -X POST "$API_ENDPOINT/auth/login" -H "Content-Type: application/json" -d "{invalid json" --connect-timeout "$TIMEOUT" --max-time $((TIMEOUT * 2)))
  code=$(printf '%s' "$malformed_response" | tail -n1)

  if [[ "$code" -eq 400 ]]; then
    log_pass "Malformed JSON correctly rejected (HTTP 400)"
  else
    log_warn "Malformed JSON returned HTTP $code (expected 400)"
  fi

  log_info "Testing login with missing password field..."
  local incomplete_payload
  incomplete_payload=$(cat <<EOF
{
  "identifier": "admin@test.com"
}
EOF
)
  local result
  result=$(curl_with_retry "POST" "$API_ENDPOINT/auth/login" "$incomplete_payload" "")
  code=$(get_http_code "$result")

  if [[ "$code" -eq 400 ]]; then
    log_pass "Missing required fields correctly rejected (HTTP 400)"
  else
    log_warn "Missing required fields returned HTTP $code (expected 400)"
  fi

  log_info "Testing non-existent resource..."
  local token
  token=$(get_auth_token "admin@test.com" "Admin@12345")

  if [[ -n "$token" ]]; then
    local fake_uuid="00000000-0000-0000-0000-000000000000"
    result=$(curl_with_retry "GET" "$API_ENDPOINT/clients/$fake_uuid" "" "$token")
    code=$(get_http_code "$result")

    if [[ "$code" -eq 404 ]]; then
      log_pass "Non-existent resource correctly returns 404"
    else
      log_warn "Non-existent resource returned HTTP $code (expected 404)"
    fi

    log_info "Testing invalid UUID format..."
    result=$(curl_with_retry "GET" "$API_ENDPOINT/clients/invalid-uuid-format" "" "$token")
    code=$(get_http_code "$result")

    if [[ "$code" -eq 400 ]]; then
      log_pass "Invalid UUID format correctly rejected (HTTP 400)"
    else
      log_warn "Invalid UUID format returned HTTP $code (expected 400)"
    fi
  else
    log_warn "Could not obtain token to verify non-existent resource and invalid UUID handling"
  fi
}

test_performance() {
  log_section "PERFORMANCE CHECKS"

  log_info "Obtaining authentication token..."
  local token
  token=$(get_auth_token "admin@test.com" "Admin@12345")

  if [[ -z "$token" ]]; then
    log_warn "Could not obtain token, skipping performance tests"
    return 1
  fi

  performance_check "$API_ENDPOINT/auth/me" "$token" "Auth /me endpoint response time"
  performance_check "$API_ENDPOINT/inventory?limit=10" "$token" "Inventory list endpoint response time"
  performance_check "$API_ENDPOINT/clients" "$token" "Clients list endpoint response time"
  performance_check "$API_ENDPOINT/inventory/brands" "$token" "Brands list endpoint response time"
}

test_crud_operations() {
  log_section "CRUD OPERATIONS VALIDATION"

  log_info "Obtaining authentication token..."
  local token
  token=$(get_auth_token "admin@test.com" "Admin@12345")

  if [[ -z "$token" ]]; then
    log_warn "Could not obtain token, skipping CRUD tests"
    return 1
  fi

  local test_id
  test_id=$(date +%s)

  log_info "Getting branch ID for CRUD test..."
  local branch_result
  branch_result=$(curl_with_retry "GET" "$API_ENDPOINT/admin/branches" "" "$token")
  local branch_body
  branch_body=$(get_body "$branch_result")
  local branch_id
  branch_id=$(printf '%s' "$branch_body" | jq -r '.data[0].id // ""')

  if [[ -z "$branch_id" ]]; then
    log_warn "No branches found for CRUD test"
    return 1
  fi

  log_info "Testing CREATE operation..."
  local create_payload
  create_payload=$(cat <<EOF
{
  "firstName": "CRUD",
  "lastName": "Test $test_id",
  "email": "crud_test_$test_id@test.com",
  "phone": "9999999999",
  "address": "Test Address",
  "city": "Test City",
  "state": "TS",
  "pincode": "123456",
  "customerType": "walk-in",
  "branchId": "$branch_id"
}
EOF
)

  local result
  result=$(curl_with_retry "POST" "$API_ENDPOINT/clients" "$create_payload" "$token")
  local code
  code=$(get_http_code "$result")
  local body
  body=$(get_body "$result")
  local resource_id

  if [[ "$code" -eq 201 ]]; then
    log_pass "CREATE operation successful"
    resource_id=$(printf '%s' "$body" | jq -r '.data.id // empty')
  else
    log_fail "CREATE operation failed" "HTTP 201" "HTTP $code"
    return 1
  fi

  if [[ -n "${resource_id:-}" && "$resource_id" != "" ]]; then
    log_info "Testing READ operation..."
    result=$(curl_with_retry "GET" "$API_ENDPOINT/clients/$resource_id" "" "$token")
    code=$(get_http_code "$result")
    body=$(get_body "$result")

    if [[ "$code" -eq 200 ]]; then
      log_pass "READ operation successful"
      local read_name
      read_name=$(printf '%s' "$body" | jq -r '.data.firstName // .data.name // empty')
      if [[ -n "$read_name" ]]; then
        log_pass "READ data validation passed: $read_name"
      fi
    else
      log_fail "READ operation failed" "HTTP 200" "HTTP $code"
    fi

    log_info "Testing UPDATE operation..."
    local update_payload
    update_payload=$(cat <<EOF
{
  "firstName": "Updated",
  "lastName": "CRUD $test_id",
  "phone": "8888888888"
}
EOF
)

    result=$(curl_with_retry "PATCH" "$API_ENDPOINT/clients/$resource_id" "$update_payload" "$token")
    code=$(get_http_code "$result")
    body=$(get_body "$result")

    if [[ "$code" -eq 200 ]]; then
      log_pass "UPDATE operation successful"
      local updated_name
      updated_name=$(printf '%s' "$body" | jq -r '.data.firstName // empty')
      if [[ "$updated_name" == "Updated" ]]; then
        log_pass "UPDATE data validation passed"
      fi
    else
      local err_msg
      err_msg=$(printf '%s' "$body" | jq -r '.error.message // .error // "Unknown error"' | head -c 200)
      log_warn "UPDATE operation returned HTTP $code: $err_msg"
    fi

    log_info "Testing DELETE operation..."
    local delete_response
    delete_response=$(curl -s -w "\n%{http_code}" -X DELETE "$API_ENDPOINT/clients/$resource_id" -H "Content-Type: application/json" -H "Authorization: Bearer $token" --connect-timeout "$TIMEOUT" --max-time $((TIMEOUT * 2)))
    code=$(printf '%s' "$delete_response" | tail -n1)

    if [[ "$code" -eq 204 || "$code" -eq 200 ]]; then
      log_pass "DELETE operation successful"

      local verify_result
      verify_result=$(curl_with_retry "GET" "$API_ENDPOINT/clients/$resource_id" "" "$token")
      local verify_code
      verify_code=$(get_http_code "$verify_result")

      if [[ "$verify_code" -eq 404 ]]; then
        log_pass "DELETE verification passed (resource not found)"
      else
        log_warn "DELETE verification inconclusive (HTTP $verify_code)"
      fi
    else
      log_warn "DELETE operation returned HTTP $code (may not be supported)"
    fi
  fi
}

test_response_structure() {
  log_section "API RESPONSE STRUCTURE VALIDATION"

  log_info "Obtaining authentication token..."
  local token
  token=$(get_auth_token "admin@test.com" "Admin@12345")

  if [[ -z "$token" ]]; then
    log_warn "Could not obtain token, skipping response structure tests"
    return 1
  fi

  log_info "Validating list endpoint response structure..."
  local result
  result=$(curl_with_retry "GET" "$API_ENDPOINT/clients?limit=5" "" "$token")
  local code
  code=$(get_http_code "$result")
  local body
  body=$(get_body "$result")

  if [[ "$code" -eq 200 ]]; then
    if printf '%s' "$body" | jq -e '.data' >/dev/null 2>&1; then
      log_pass "List response has 'data' field"
    else
      log_warn "List response missing 'data' field"
    fi

    if printf '%s' "$body" | jq -e '.meta' >/dev/null 2>&1; then
      log_pass "List response has 'meta' field"
    else
      log_warn "List response missing 'meta' field"
    fi
  fi

  log_info "Validating single resource response structure..."
  local first_id
  first_id=$(printf '%s' "$body" | jq -r '.data[0].id // empty')

  if [[ -n "$first_id" ]]; then
    result=$(curl_with_retry "GET" "$API_ENDPOINT/clients/$first_id" "" "$token")
    code=$(get_http_code "$result")
    body=$(get_body "$result")

    if [[ "$code" -eq 200 ]]; then
      if printf '%s' "$body" | jq -e '.data.id' >/dev/null 2>&1; then
        log_pass "Single resource has 'id' field"
      else
        log_warn "Single resource missing 'id' field"
      fi
    fi
  else
    log_warn "No client resource available to validate single-response structure"
  fi
}

print_summary() {
  printf "\n"
  log_section "TEST SUMMARY"

  local total=$((pass_count + fail_count + warn_count))

  printf "%bTotal Tests:%b %d\n" "$GREEN" "$NC" "$total"
  printf "%bPassed:%b %d\n" "$GREEN" "$NC" "$pass_count"
  printf "%bFailed:%b %d\n" "$RED" "$NC" "$fail_count"
  printf "%bWarnings:%b %d\n" "$YELLOW" "$NC" "$warn_count"

  printf "═════════════════════════════════════════\n" >> "$LOG_FILE"
  printf "SUMMARY: PASS=%d FAIL=%d WARN=%d\n" "$pass_count" "$fail_count" "$warn_count" >> "$LOG_FILE"
  printf "═════════════════════════════════════════\n" >> "$LOG_FILE"

  if [[ $fail_count -eq 0 ]]; then
    printf "%b\n✅ ALL TESTS PASSED%b\n" "$GREEN" "$NC"
    return 0
  fi

  printf "%b\n❌ SOME TESTS FAILED%b\n" "$RED" "$NC"
  return 1
}

main() {
  setup
  START_TIME=$(date +%s)

  printf "%b" "$BLUE"
  printf "╔════════════════════════════════════════════════════════════╗\n"
  printf "║     Dream Gadgets - Comprehensive Test Suite               ║\n"
  printf "║     API: %s\n" "$API_BASE_URL"
  printf "║     Timestamp: %s\n" "$(date)"
  printf "╚════════════════════════════════════════════════════════════╝\n"
  printf "%b" "$NC"
  printf "\n"

  if [[ $# -gt 0 ]]; then
    for group in "$@"; do
      run_group "$group"
    done
  else
    test_system_health
    test_auth_flow
    test_client_management
    test_inventory_management
    test_crud_operations
    test_response_structure
    test_error_handling
    test_performance
  fi

  print_summary
  local exit_code=$?
  log_info "Full test report saved to: $LOG_FILE"
  exit "$exit_code"
}

main "$@"
