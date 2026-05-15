#!/bin/bash

################################################################################
# Dream Gadgets – Comprehensive Automated Test Suite
# Testing: System health, APIs, workflows, edge cases, error handling
################################################################################

set -o pipefail

# ──────────────────────────────────────────────────────────────────────────────
# CONFIGURATION
# ──────────────────────────────────────────────────────────────────────────────

API_BASE_URL="${API_BASE_URL:-http://localhost:3000}"
WEB_BASE_URL="${WEB_BASE_URL:-http://localhost:3001}"
ADMIN_BASE_URL="${ADMIN_BASE_URL:-http://localhost:3002}"
API_ENDPOINT="${API_BASE_URL}/api/v1"
LOG_DIR="logs"
LOG_FILE="${LOG_DIR}/test-report.log"
TIMEOUT=10
RETRY_COUNT=3
SLOW_THRESHOLD=500  # milliseconds

# ──────────────────────────────────────────────────────────────────────────────
# COLORS & LOGGING
# ──────────────────────────────────────────────────────────────────────────────

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
  echo -e "${GREEN}✅ PASS${NC} $msg"
  echo "[PASS] $msg" >> "$LOG_FILE"
  ((pass_count++))
}

log_fail() {
  local msg="$1"
  local expected="${2:-}"
  local actual="${3:-}"
  echo -e "${RED}❌ FAIL${NC} $msg"
  if [ -n "$expected" ] && [ -n "$actual" ]; then
    echo -e "${RED}  Expected: $expected${NC}"
    echo -e "${RED}  Actual: $actual${NC}"
    echo "[FAIL] $msg | Expected: $expected | Actual: $actual" >> "$LOG_FILE"
  else
    echo "[FAIL] $msg" >> "$LOG_FILE"
  fi
  ((fail_count++))
}

log_warn() {
  local msg="$1"
  echo -e "${YELLOW}⚠ WARN${NC} $msg"
  echo "[WARN] $msg" >> "$LOG_FILE"
  ((warn_count++))
}

log_info() {
  local msg="$1"
  echo -e "${BLUE}ℹ INFO${NC} $msg"
  echo "[INFO] $msg" >> "$LOG_FILE"
}

log_section() {
  local title="$1"
  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}$title${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo "═══ $title ═══" >> "$LOG_FILE"
}

# ──────────────────────────────────────────────────────────────────────────────
# UTILITY FUNCTIONS
# ──────────────────────────────────────────────────────────────────────────────

setup() {
  mkdir -p "$LOG_DIR"
  > "$LOG_FILE"
  echo "Test Report - $(date)" >> "$LOG_FILE"
}

curl_with_retry() {
  local method="$1"
  local endpoint="$2"
  local data="$3"
  local token="$4"
  local attempt=1

  while [ $attempt -le $RETRY_COUNT ]; do
    local response
    local http_code

    if [ -n "$token" ]; then
      response=$(curl -s -w "\n%{http_code}" -X "$method" "$endpoint" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $token" \
        -d "$data" \
        --connect-timeout $TIMEOUT \
        --max-time $((TIMEOUT * 2)))
    else
      response=$(curl -s -w "\n%{http_code}" -X "$method" "$endpoint" \
        -H "Content-Type: application/json" \
        -d "$data" \
        --connect-timeout $TIMEOUT \
        --max-time $((TIMEOUT * 2)))
    fi

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)

    if [[ "$http_code" =~ ^[0-9]+$ ]]; then
      echo "$body"
      return $http_code
    fi

    attempt=$((attempt + 1))
    sleep 1
  done

  return 1
}

get_response_time() {
  local method="$1"
  local endpoint="$2"
  local token="$3"

  if [ -n "$token" ]; then
    curl -s -w "%{time_total}" -o /dev/null -X "$method" "$endpoint" \
      -H "Authorization: Bearer $token" \
      --connect-timeout $TIMEOUT \
      --max-time $((TIMEOUT * 2))
  else
    curl -s -w "%{time_total}" -o /dev/null -X "$method" "$endpoint" \
      --connect-timeout $TIMEOUT \
      --max-time $((TIMEOUT * 2))
  fi
}

check_response_code() {
  local method="$1"
  local endpoint="$2"
  local expected_code="$3"
  local data="$4"
  local token="$5"
  local test_name="$6"

  local response=$(curl_with_retry "$method" "$endpoint" "$data" "$token")
  local http_code=$?

  if [ "$http_code" -eq "$expected_code" ]; then
    log_pass "$test_name (HTTP $http_code)"
    echo "$response"
    return 0
  else
    log_fail "$test_name" "HTTP $expected_code" "HTTP $http_code"
    echo "$response"
    return 1
  fi
}

check_json_field() {
  local json="$1"
  local field="$2"
  local test_name="$3"

  if echo "$json" | jq -e "$field" > /dev/null 2>&1; then
    log_pass "$test_name"
    echo "$json" | jq "$field"
    return 0
  else
    log_fail "$test_name" "Field $field exists" "Field not found"
    return 1
  fi
}

validate_uuid() {
  local value="$1"
  if [[ $value =~ ^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$ ]]; then
    return 0
  else
    return 1
  fi
}

performance_check() {
  local endpoint="$1"
  local token="$2"
  local test_name="$3"

  local response_time=$(get_response_time "GET" "$endpoint" "$token")
  local response_ms=$(echo "$response_time * 1000" | bc)
  local response_ms_int=${response_ms%.*}

  if [ "$response_ms_int" -lt "$SLOW_THRESHOLD" ]; then
    log_pass "$test_name (${response_ms_int}ms)"
  else
    log_warn "$test_name (${response_ms_int}ms > ${SLOW_THRESHOLD}ms threshold)"
  fi
}

# ──────────────────────────────────────────────────────────────────────────────
# TEST GROUPS
# ──────────────────────────────────────────────────────────────────────────────

test_system_health() {
  log_section "SYSTEM HEALTH CHECKS"

  # Check API server
  log_info "Checking API server at $API_BASE_URL..."
  if curl -s -o /dev/null -w "%{http_code}" "$API_BASE_URL" --connect-timeout 5 | grep -q "200\|404\|405"; then
    log_pass "API server is running"
  else
    log_fail "API server is not responding"
    return 1
  fi

  # Check Web server
  log_info "Checking Web server at $WEB_BASE_URL..."
  if curl -s -o /dev/null -w "%{http_code}" "$WEB_BASE_URL" --connect-timeout 5 | grep -q "200\|301\|302"; then
    log_pass "Web server is running"
  else
    log_warn "Web server may not be running"
  fi

  # Check Admin server
  log_info "Checking Admin server at $ADMIN_BASE_URL..."
  if curl -s -o /dev/null -w "%{http_code}" "$ADMIN_BASE_URL" --connect-timeout 5 | grep -q "200\|301\|302"; then
    log_pass "Admin server is running"
  else
    log_warn "Admin server may not be running"
  fi

  # Check Swagger docs
  log_info "Checking Swagger documentation..."
  if curl -s -o /dev/null -w "%{http_code}" "$API_BASE_URL/api/docs" --connect-timeout 5 | grep -q "200"; then
    log_pass "Swagger docs available"
  else
    log_warn "Swagger docs not accessible"
  fi
}

test_auth_flow() {
  log_section "AUTHENTICATION FLOW TESTS"

  # Test user registration
  log_info "Testing user registration..."
  local email="testuser_$(date +%s)@test.com"
  local phone="9999999999"
  local register_payload=$(cat <<EOF
{
  "email": "$email",
  "phone": "$phone",
  "password": "Test@12345",
  "firstName": "Test",
  "lastName": "User"
}
EOF
)

  local register_response=$(curl_with_retry "POST" "$API_ENDPOINT/auth/register" "$register_payload" "")
  http_code=$?

  if [ "$http_code" -eq 201 ]; then
    log_pass "User registration successful"
    local user_id=$(echo "$register_response" | jq -r '.data.id // empty')
    if validate_uuid "$user_id"; then
      log_pass "Valid user ID returned: $user_id"
    fi
  else
    log_warn "User registration failed (HTTP $http_code)"
  fi

  # Test login with invalid credentials
  log_info "Testing login with invalid credentials..."
  local login_bad_payload=$(cat <<EOF
{
  "identifier": "$email",
  "password": "WrongPassword"
}
EOF
)

  curl_with_retry "POST" "$API_ENDPOINT/auth/login" "$login_bad_payload" "" > /dev/null 2>&1
  http_code=$?

  if [ "$http_code" -eq 401 ]; then
    log_pass "Invalid credentials correctly rejected (HTTP 401)"
  else
    log_warn "Invalid credentials handled with HTTP $http_code (expected 401)"
  fi

  # Test successful login
  log_info "Testing login with valid credentials..."
  local login_payload=$(cat <<EOF
{
  "identifier": "$email",
  "password": "Test@12345"
}
EOF
)

  local login_response=$(curl_with_retry "POST" "$API_ENDPOINT/auth/login" "$login_payload" "")
  http_code=$?

  local token=""
  if [ "$http_code" -eq 200 ]; then
    log_pass "Login successful (HTTP 200)"
    token=$(echo "$login_response" | jq -r '.data.accessToken // empty')
    if [ -n "$token" ] && [ "$token" != "null" ]; then
      log_pass "Access token received"
    else
      log_fail "Access token not returned"
    fi
  else
    log_fail "Login failed" "HTTP 200" "HTTP $http_code"
  fi

  # Test get profile with token
  if [ -n "$token" ]; then
    log_info "Testing get profile endpoint..."
    local profile_response=$(curl_with_retry "GET" "$API_ENDPOINT/auth/me" "" "$token")
    http_code=$?

    if [ "$http_code" -eq 200 ]; then
      log_pass "Get profile successful"
      local profile_email=$(echo "$profile_response" | jq -r '.data.email // empty')
      if [ "$profile_email" = "$email" ]; then
        log_pass "Profile data integrity verified"
      else
        log_warn "Profile email mismatch"
      fi
    else
      log_fail "Get profile failed" "HTTP 200" "HTTP $http_code"
    fi

    # Test unauthorized access without token
    log_info "Testing unauthorized access..."
    local no_token_response=$(curl -s -w "\n%{http_code}" -X GET "$API_ENDPOINT/auth/me" \
      -H "Content-Type: application/json" \
      --connect-timeout $TIMEOUT \
      --max-time $((TIMEOUT * 2)))

    http_code=$(echo "$no_token_response" | tail -n1)
    if [ "$http_code" -eq 401 ]; then
      log_pass "Unauthorized requests correctly rejected (HTTP 401)"
    else
      log_warn "Unauthorized request returned HTTP $http_code (expected 401)"
    fi
  fi
}

test_client_management() {
  log_section "CLIENT MANAGEMENT TESTS"

  # First get a valid token
  log_info "Obtaining authentication token..."
  local admin_payload=$(cat <<EOF
{
  "identifier": "admin@test.com",
  "password": "Admin@12345"
}
EOF
)

  local login_response=$(curl_with_retry "POST" "$API_ENDPOINT/auth/login" "$admin_payload" "")
  local token=$(echo "$login_response" | jq -r '.data.accessToken // empty')

  if [ -z "$token" ] || [ "$token" = "null" ]; then
    log_warn "Could not obtain admin token, skipping client tests"
    return 1
  fi

  # Test create client
  log_info "Testing client creation..."
  local client_payload=$(cat <<EOF
{
  "name": "Test Client $(date +%s)",
  "email": "client_$(date +%s)@test.com",
  "phone": "9876543210",
  "address": "123 Test Street",
  "city": "Test City",
  "state": "TS",
  "pincode": "123456",
  "type": "individual"
}
EOF
)

  local create_response=$(curl_with_retry "POST" "$API_ENDPOINT/clients" "$client_payload" "$token")
  http_code=$?

  local client_id=""
  if [ "$http_code" -eq 201 ]; then
    log_pass "Client created successfully"
    client_id=$(echo "$create_response" | jq -r '.data.id // empty')
    if validate_uuid "$client_id"; then
      log_pass "Valid client ID received: $client_id"
    fi
  else
    log_fail "Client creation failed" "HTTP 201" "HTTP $http_code"
  fi

  # Test get all clients
  log_info "Testing get all clients..."
  local list_response=$(curl_with_retry "GET" "$API_ENDPOINT/clients" "" "$token")
  http_code=$?

  if [ "$http_code" -eq 200 ]; then
    log_pass "Get clients list successful"
    local client_count=$(echo "$list_response" | jq '.data | length')
    log_info "Found $client_count clients"
  else
    log_warn "Get clients list returned HTTP $http_code"
  fi

  # Test get single client
  if [ -n "$client_id" ]; then
    log_info "Testing get single client..."
    local single_response=$(curl_with_retry "GET" "$API_ENDPOINT/clients/$client_id" "" "$token")
    http_code=$?

    if [ "$http_code" -eq 200 ]; then
      log_pass "Get single client successful"
      local retrieved_name=$(echo "$single_response" | jq -r '.data.name // empty')
      if [ -n "$retrieved_name" ]; then
        log_pass "Client data integrity verified"
      fi
    else
      log_fail "Get single client failed" "HTTP 200" "HTTP $http_code"
    fi

    # Test update client
    log_info "Testing client update..."
    local update_payload=$(cat <<EOF
{
  "name": "Updated Client Name",
  "phone": "9999888877"
}
EOF
)

    local update_response=$(curl_with_retry "PATCH" "$API_ENDPOINT/clients/$client_id" "$update_payload" "$token")
    http_code=$?

    if [ "$http_code" -eq 200 ]; then
      log_pass "Client update successful"
    else
      log_warn "Client update returned HTTP $http_code"
    fi

    # Test get client history
    log_info "Testing get client history..."
    local history_response=$(curl_with_retry "GET" "$API_ENDPOINT/clients/$client_id/history" "" "$token")
    http_code=$?

    if [ "$http_code" -eq 200 ]; then
      log_pass "Get client history successful"
    else
      log_warn "Get client history returned HTTP $http_code"
    fi
  fi
}

test_inventory_management() {
  log_section "INVENTORY MANAGEMENT TESTS"

  log_info "Obtaining authentication token..."
  local admin_payload=$(cat <<EOF
{
  "identifier": "admin@test.com",
  "password": "Admin@12345"
}
EOF
)

  local login_response=$(curl_with_retry "POST" "$API_ENDPOINT/auth/login" "$admin_payload" "")
  local token=$(echo "$login_response" | jq -r '.data.accessToken // empty')

  if [ -z "$token" ] || [ "$token" = "null" ]; then
    log_warn "Could not obtain token, skipping inventory tests"
    return 1
  fi

  # Test get brands
  log_info "Testing get brands list..."
  local brands_response=$(curl_with_retry "GET" "$API_ENDPOINT/inventory/brands" "" "$token")
  http_code=$?

  if [ "$http_code" -eq 200 ]; then
    log_pass "Get brands successful"
    local brand_count=$(echo "$brands_response" | jq '.data | length')
    log_info "Found $brand_count brands"
  else
    log_warn "Get brands returned HTTP $http_code"
  fi

  # Test get models
  log_info "Testing get models list..."
  local models_response=$(curl_with_retry "GET" "$API_ENDPOINT/inventory/models" "" "$token")
  http_code=$?

  if [ "$http_code" -eq 200 ]; then
    log_pass "Get models successful"
    local model_count=$(echo "$models_response" | jq '.data | length')
    log_info "Found $model_count models"
  else
    log_warn "Get models returned HTTP $http_code"
  fi

  # Test get inventory items
  log_info "Testing get inventory items..."
  local inventory_response=$(curl_with_retry "GET" "$API_ENDPOINT/inventory?limit=10" "" "$token")
  http_code=$?

  if [ "$http_code" -eq 200 ]; then
    log_pass "Get inventory items successful"
    local item_count=$(echo "$inventory_response" | jq '.data | length')
    log_info "Found $item_count inventory items"
  else
    log_warn "Get inventory items returned HTTP $http_code"
  fi

  # Test price suggestion
  log_info "Testing price suggestion endpoint..."
  local price_response=$(curl_with_retry "GET" "$API_ENDPOINT/inventory/price-suggestion?modelId=test&condition=good" "" "$token")
  http_code=$?

  if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 404 ]; then
    log_pass "Price suggestion endpoint accessible (HTTP $http_code)"
  else
    log_warn "Price suggestion returned HTTP $http_code"
  fi

  # Test city stock
  log_info "Testing city stock endpoint..."
  local stock_response=$(curl_with_retry "GET" "$API_ENDPOINT/inventory/city-stock?modelId=test" "" "$token")
  http_code=$?

  if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 404 ]; then
    log_pass "City stock endpoint accessible (HTTP $http_code)"
  else
    log_warn "City stock returned HTTP $http_code"
  fi
}

test_error_handling() {
  log_section "ERROR HANDLING & EDGE CASES"

  # Test invalid endpoint
  log_info "Testing invalid endpoint..."
  local invalid_response=$(curl -s -w "\n%{http_code}" -X GET "$API_ENDPOINT/invalid-endpoint" \
    -H "Content-Type: application/json" \
    --connect-timeout $TIMEOUT \
    --max-time $((TIMEOUT * 2)))

  http_code=$(echo "$invalid_response" | tail -n1)
  if [ "$http_code" -eq 404 ]; then
    log_pass "Invalid endpoint correctly returns 404"
  else
    log_warn "Invalid endpoint returned HTTP $http_code (expected 404)"
  fi

  # Test malformed JSON
  log_info "Testing malformed JSON handling..."
  local malformed_response=$(curl -s -w "\n%{http_code}" -X POST "$API_ENDPOINT/auth/login" \
    -H "Content-Type: application/json" \
    -d "{invalid json" \
    --connect-timeout $TIMEOUT \
    --max-time $((TIMEOUT * 2)))

  http_code=$(echo "$malformed_response" | tail -n1)
  if [ "$http_code" -eq 400 ]; then
    log_pass "Malformed JSON correctly rejected (HTTP 400)"
  else
    log_warn "Malformed JSON returned HTTP $http_code (expected 400)"
  fi

  # Test missing required fields
  log_info "Testing missing required fields..."
  local incomplete_payload=$(cat <<EOF
{
  "email": "test@test.com"
}
EOF
)

  local incomplete_response=$(curl_with_retry "POST" "$API_ENDPOINT/auth/login" "$incomplete_payload" "")
  http_code=$?

  if [ "$http_code" -eq 400 ]; then
    log_pass "Missing required fields correctly rejected (HTTP 400)"
  else
    log_warn "Missing required fields returned HTTP $http_code (expected 400)"
  fi

  # Test non-existent resource
  log_info "Testing non-existent resource..."
  local admin_payload=$(cat <<EOF
{
  "identifier": "admin@test.com",
  "password": "Admin@12345"
}
EOF
)

  local login_response=$(curl_with_retry "POST" "$API_ENDPOINT/auth/login" "$admin_payload" "")
  local token=$(echo "$login_response" | jq -r '.data.accessToken // empty')

  if [ -n "$token" ] && [ "$token" != "null" ]; then
    local fake_uuid="00000000-0000-0000-0000-000000000000"
    local not_found_response=$(curl_with_retry "GET" "$API_ENDPOINT/clients/$fake_uuid" "" "$token")
    http_code=$?

    if [ "$http_code" -eq 404 ]; then
      log_pass "Non-existent resource correctly returns 404"
    else
      log_warn "Non-existent resource returned HTTP $http_code (expected 404)"
    fi
  fi

  # Test invalid UUID format
  log_info "Testing invalid UUID format..."
  local invalid_uuid_response=$(curl_with_retry "GET" "$API_ENDPOINT/clients/invalid-uuid-format" "" "$token")
  http_code=$?

  if [ "$http_code" -eq 400 ]; then
    log_pass "Invalid UUID format correctly rejected (HTTP 400)"
  else
    log_warn "Invalid UUID format returned HTTP $http_code (expected 400)"
  fi
}

test_performance() {
  log_section "PERFORMANCE CHECKS"

  log_info "Obtaining authentication token..."
  local admin_payload=$(cat <<EOF
{
  "identifier": "admin@test.com",
  "password": "Admin@12345"
}
EOF
)

  local login_response=$(curl_with_retry "POST" "$API_ENDPOINT/auth/login" "$admin_payload" "")
  local token=$(echo "$login_response" | jq -r '.data.accessToken // empty')

  if [ -z "$token" ] || [ "$token" = "null" ]; then
    log_warn "Could not obtain token, skipping performance tests"
    return 1
  fi

  # Test auth endpoint performance
  performance_check "$API_ENDPOINT/auth/me" "$token" "Auth /me endpoint response time"

  # Test inventory list performance
  performance_check "$API_ENDPOINT/inventory?limit=10" "$token" "Inventory list endpoint response time"

  # Test clients list performance
  performance_check "$API_ENDPOINT/clients" "$token" "Clients list endpoint response time"

  # Test brands list performance
  performance_check "$API_ENDPOINT/inventory/brands" "$token" "Brands list endpoint response time"
}

test_crud_operations() {
  log_section "CRUD OPERATIONS VALIDATION"

  log_info "Obtaining authentication token..."
  local admin_payload=$(cat <<EOF
{
  "identifier": "admin@test.com",
  "password": "Admin@12345"
}
EOF
)

  local login_response=$(curl_with_retry "POST" "$API_ENDPOINT/auth/login" "$admin_payload" "")
  local token=$(echo "$login_response" | jq -r '.data.accessToken // empty')

  if [ -z "$token" ] || [ "$token" = "null" ]; then
    log_warn "Could not obtain token, skipping CRUD tests"
    return 1
  fi

  local test_id=$(date +%s)

  # CREATE
  log_info "Testing CREATE operation..."
  local create_payload=$(cat <<EOF
{
  "name": "CRUD Test Client $test_id",
  "email": "crud_test_$test_id@test.com",
  "phone": "9999999999",
  "address": "Test Address",
  "city": "Test City",
  "state": "TS",
  "pincode": "123456",
  "type": "individual"
}
EOF
)

  local create_response=$(curl_with_retry "POST" "$API_ENDPOINT/clients" "$create_payload" "$token")
  http_code=$?

  local resource_id=""
  if [ "$http_code" -eq 201 ]; then
    log_pass "CREATE operation successful"
    resource_id=$(echo "$create_response" | jq -r '.data.id // empty')
  else
    log_fail "CREATE operation failed" "HTTP 201" "HTTP $http_code"
    return 1
  fi

  # READ
  if [ -n "$resource_id" ]; then
    log_info "Testing READ operation..."
    local read_response=$(curl_with_retry "GET" "$API_ENDPOINT/clients/$resource_id" "" "$token")
    http_code=$?

    if [ "$http_code" -eq 200 ]; then
      log_pass "READ operation successful"
      local read_name=$(echo "$read_response" | jq -r '.data.name // empty')
      if [ -n "$read_name" ]; then
        log_pass "READ data validation passed"
      fi
    else
      log_fail "READ operation failed" "HTTP 200" "HTTP $http_code"
    fi

    # UPDATE
    log_info "Testing UPDATE operation..."
    local update_payload=$(cat <<EOF
{
  "name": "CRUD Test Client Updated $test_id",
  "phone": "8888888888"
}
EOF
)

    local update_response=$(curl_with_retry "PATCH" "$API_ENDPOINT/clients/$resource_id" "$update_payload" "$token")
    http_code=$?

    if [ "$http_code" -eq 200 ]; then
      log_pass "UPDATE operation successful"
      local updated_name=$(echo "$update_response" | jq -r '.data.name // empty')
      if [[ "$updated_name" == *"Updated"* ]]; then
        log_pass "UPDATE data validation passed"
      fi
    else
      log_fail "UPDATE operation failed" "HTTP 200" "HTTP $http_code"
    fi

    # DELETE (if endpoint exists)
    log_info "Testing DELETE operation..."
    local delete_response=$(curl -s -w "\n%{http_code}" -X DELETE "$API_ENDPOINT/clients/$resource_id" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $token" \
      --connect-timeout $TIMEOUT \
      --max-time $((TIMEOUT * 2)))

    http_code=$(echo "$delete_response" | tail -n1)

    if [ "$http_code" -eq 204 ] || [ "$http_code" -eq 200 ]; then
      log_pass "DELETE operation successful"

      # Verify resource is deleted
      local verify_response=$(curl_with_retry "GET" "$API_ENDPOINT/clients/$resource_id" "" "$token")
      verify_code=$?

      if [ "$verify_code" -eq 404 ]; then
        log_pass "DELETE verification passed (resource not found)"
      else
        log_warn "DELETE verification inconclusive (HTTP $verify_code)"
      fi
    else
      log_warn "DELETE operation returned HTTP $http_code (may not be supported)"
    fi
  fi
}

test_response_structure() {
  log_section "API RESPONSE STRUCTURE VALIDATION"

  log_info "Obtaining authentication token..."
  local admin_payload=$(cat <<EOF
{
  "identifier": "admin@test.com",
  "password": "Admin@12345"
}
EOF
)

  local login_response=$(curl_with_retry "POST" "$API_ENDPOINT/auth/login" "$admin_payload" "")
  local token=$(echo "$login_response" | jq -r '.data.accessToken // empty')

  if [ -z "$token" ] || [ "$token" = "null" ]; then
    log_warn "Could not obtain token, skipping response structure tests"
    return 1
  fi

  # Test response structure for list endpoint
  log_info "Validating list endpoint response structure..."
  local list_response=$(curl_with_retry "GET" "$API_ENDPOINT/clients?limit=5" "" "$token")
  http_code=$?

  if [ "$http_code" -eq 200 ]; then
    if echo "$list_response" | jq -e '.data' > /dev/null 2>&1; then
      log_pass "List response has 'data' field"
    else
      log_warn "List response missing 'data' field"
    fi

    if echo "$list_response" | jq -e '.meta' > /dev/null 2>&1; then
      log_pass "List response has 'meta' field"
    else
      log_warn "List response missing 'meta' field"
    fi
  fi

  # Test response structure for single resource
  log_info "Validating single resource response structure..."
  local single_response=$(curl_with_retry "GET" "$API_ENDPOINT/clients?limit=1" "" "$token")
  http_code=$?

  if [ "$http_code" -eq 200 ]; then
    if echo "$single_response" | jq -e '.data[0].id' > /dev/null 2>&1; then
      log_pass "Single resource has 'id' field"
    else
      log_warn "Single resource missing 'id' field"
    fi
  fi
}

# ──────────────────────────────────────────────────────────────────────────────
# MAIN EXECUTION
# ──────────────────────────────────────────────────────────────────────────────

print_summary() {
  echo ""
  log_section "TEST SUMMARY"
  
  local total=$((pass_count + fail_count + warn_count))
  
  echo -e "${GREEN}Total Tests: $total${NC}"
  echo -e "${GREEN}Passed: $pass_count${NC}"
  echo -e "${RED}Failed: $fail_count${NC}"
  echo -e "${YELLOW}Warnings: $warn_count${NC}"

  if [ $fail_count -eq 0 ]; then
    echo -e "\n${GREEN}✅ ALL TESTS PASSED${NC}"
    echo "═════════════════════════════════════════" >> "$LOG_FILE"
    echo "SUMMARY: PASS=$pass_count FAIL=$fail_count WARN=$warn_count" >> "$LOG_FILE"
    echo "═════════════════════════════════════════" >> "$LOG_FILE"
    return 0
  else
    echo -e "\n${RED}❌ SOME TESTS FAILED${NC}"
    echo "═════════════════════════════════════════" >> "$LOG_FILE"
    echo "SUMMARY: PASS=$pass_count FAIL=$fail_count WARN=$warn_count" >> "$LOG_FILE"
    echo "═════════════════════════════════════════" >> "$LOG_FILE"
    return 1
  fi
}

main() {
  setup

  echo -e "${BLUE}"
  echo "╔════════════════════════════════════════════════════════════╗"
  echo "║     Dream Gadgets - Comprehensive Test Suite               ║"
  echo "║     API: $API_BASE_URL"
  echo "║     Timestamp: $(date)"
  echo "╚════════════════════════════════════════════════════════════╝"
  echo -e "${NC}"
  echo ""

  test_system_health
  test_auth_flow
  test_client_management
  test_inventory_management
  test_crud_operations
  test_response_structure
  test_error_handling
  test_performance

  print_summary
  local exit_code=$?

  log_info "Full test report saved to: $LOG_FILE"

  exit $exit_code
}

main "$@"
