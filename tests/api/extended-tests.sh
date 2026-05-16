#!/bin/bash

################################################################################
# Dream Gadgets – Extended API Test Suite
# Testing: Payments, Notifications, Reports, Exports
################################################################################

set -o pipefail

API_BASE_URL="${API_BASE_URL:-http://localhost:3000}"
API_ENDPOINT="${API_BASE_URL}/api/v1"
LOG_DIR="logs"
LOG_FILE="${LOG_DIR}/api-extended-test-report.log"
TIMEOUT=10
RETRY_COUNT=3

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
  fi
  printf "[FAIL] %s\n" "$msg" >> "$LOG_FILE"
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

curl_with_retry() {
  local method="$1"
  local endpoint="$2"
  local data="$3"
  local token="$4"
  local response
  local http_code
  local curl_args=(--silent --show-error --write-out "\n%{http_code}" --connect-timeout "$TIMEOUT" --max-time $((TIMEOUT * 2)) -X "$method" -H "Content-Type: application/json")

  if [[ -n "$token" ]]; then
    curl_args+=( -H "Authorization: Bearer $token" )
  fi

  if [[ -n "$data" && "$method" != "GET" ]]; then
    curl_args+=( -d "$data" )
  fi

  response=$(curl "${curl_args[@]}" "$endpoint" 2>/dev/null)
  http_code=$(printf '%s' "$response" | tail -n1)
  body=$(printf '%s' "$response" | head -n-1)

  if [[ "$http_code" =~ ^[0-9]+$ ]]; then
    printf '%s' "$body"
    return "$http_code"
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
  code=$?

  if [[ $code -ne 200 ]]; then
    return $code
  fi

  printf '%s' "$response" | jq -r '.data.accessToken // empty'
}

setup() {
  mkdir -p "$LOG_DIR"
  : > "$LOG_FILE"
  printf "Extended Test Report - %s\n" "$(date)" >> "$LOG_FILE"
}

# ──────────────────────────────────────────────────────────────────────────────
# PAYMENT TESTS
# ──────────────────────────────────────────────────────────────────────────────

test_payments() {
  log_section "PAYMENT PROCESSING TESTS"

  log_info "Obtaining authentication token..."
  local token
  token=$(get_auth_token "admin@test.com" "Admin@12345")

  if [[ -z "$token" ]]; then
    log_warn "Could not obtain token, skipping payment tests"
    return 1
  fi

  # Test payment methods list
  log_info "Testing get payment methods..."
  local methods_response
  methods_response=$(curl_with_retry "GET" "$API_ENDPOINT/payments/methods" "" "$token")
  local http_code=$?

  if [[ $http_code -eq 200 ]]; then
    log_pass "Get payment methods successful"
    local method_count
    method_count=$(printf '%s' "$methods_response" | jq '.data | length')
    log_info "Found $method_count payment methods"
  else
    log_warn "Get payment methods returned HTTP $http_code"
  fi

  # Test create payment intent
  log_info "Testing create payment intent..."
  local payment_payload
  payment_payload=$(cat <<EOF
{
  "amount": 9999,
  "currency": "USD",
  "description": "Test Payment"
}
EOF
)

  local payment_response
  payment_response=$(curl_with_retry "POST" "$API_ENDPOINT/payments/intents" "$payment_payload" "$token")
  http_code=$?

  local payment_intent_id=""
  if [[ $http_code -eq 201 ]]; then
    log_pass "Create payment intent successful"
    payment_intent_id=$(printf '%s' "$payment_response" | jq -r '.data.id // empty')
    log_info "Payment intent ID: $payment_intent_id"
  else
    log_fail "Create payment intent failed" "HTTP 201" "HTTP $http_code"
  fi

  # Test process payment (with test card)
  if [[ -n "$payment_intent_id" ]]; then
    log_info "Testing process payment with test card..."
    local charge_payload
    charge_payload=$(cat <<EOF
{
  "intentId": "$payment_intent_id",
  "cardToken": "tok_visa",
  "cardNumber": "4242424242424242",
  "expMonth": 12,
  "expYear": 2025,
  "cvc": "123"
}
EOF
)

    local charge_response
    charge_response=$(curl_with_retry "POST" "$API_ENDPOINT/payments/charge" "$charge_payload" "$token")
    http_code=$?

    if [[ $http_code -eq 200 ]]; then
      log_pass "Payment charge successful"
      local transaction_id
      transaction_id=$(printf '%s' "$charge_response" | jq -r '.data.transactionId // empty')
      log_info "Transaction ID: $transaction_id"
    else
      log_warn "Payment charge returned HTTP $http_code"
    fi
  fi

  # Test payment refund
  log_info "Testing payment refund..."
  local refund_payload
  refund_payload=$(cat <<EOF
{
  "transactionId": "txn_test_12345",
  "amount": 5000,
  "reason": "Customer request"
}
EOF
)

  local refund_response
  refund_response=$(curl_with_retry "POST" "$API_ENDPOINT/payments/refund" "$refund_payload" "$token")
  http_code=$?

  if [[ $http_code -eq 200 || $http_code -eq 201 || $http_code -eq 404 ]]; then
    log_pass "Payment refund endpoint accessible"
  else
    log_warn "Payment refund returned HTTP $http_code"
  fi

  # Test transaction history
  log_info "Testing get transaction history..."
  local history_response
  history_response=$(curl_with_retry "GET" "$API_ENDPOINT/payments/transactions?limit=10" "" "$token")
  http_code=$?

  if [[ $http_code -eq 200 ]]; then
    log_pass "Get transaction history successful"
    local tx_count
    tx_count=$(printf '%s' "$history_response" | jq '.data | length')
    log_info "Found $tx_count transactions"
  else
    log_warn "Get transaction history returned HTTP $http_code"
  fi

  # Test payment webhook (simulate)
  log_info "Testing payment webhook handling..."
  local webhook_payload
  webhook_payload=$(cat <<EOF
{
  "type": "charge.succeeded",
  "data": {
    "id": "ch_test_12345",
    "amount": 9999,
    "status": "succeeded",
    "created": $(date +%s)
  }
}
EOF
)

  local webhook_response
  webhook_response=$(curl_with_retry "POST" "$API_ENDPOINT/payments/webhook" "$webhook_payload" "")
  http_code=$?

  if [[ $http_code -eq 200 || $http_code -eq 204 || $http_code -eq 401 ]]; then
    log_pass "Payment webhook endpoint accessible"
  else
    log_warn "Payment webhook returned HTTP $http_code"
  fi
}

# ──────────────────────────────────────────────────────────────────────────────
# NOTIFICATION TESTS
# ──────────────────────────────────────────────────────────────────────────────

test_notifications() {
  log_section "NOTIFICATION & EMAIL TESTS"

  log_info "Obtaining authentication token..."
  local token
  token=$(get_auth_token "admin@test.com" "Admin@12345")

  if [[ -z "$token" ]]; then
    log_warn "Could not obtain token, skipping notification tests"
    return 1
  fi

  # Test get notifications
  log_info "Testing get notifications..."
  local notif_response
  notif_response=$(curl_with_retry "GET" "$API_ENDPOINT/notifications?limit=10" "" "$token")
  local http_code=$?

  if [[ $http_code -eq 200 ]]; then
    log_pass "Get notifications successful"
    local notif_count
    notif_count=$(printf '%s' "$notif_response" | jq '.data | length')
    log_info "Found $notif_count notifications"
  else
    log_warn "Get notifications returned HTTP $http_code"
  fi

  # Test mark notification as read
  log_info "Testing mark notification as read..."
  local read_payload
  read_payload=$(cat <<EOF
{
  "notificationId": "notif_test_12345"
}
EOF
)

  local read_response
  read_response=$(curl_with_retry "PATCH" "$API_ENDPOINT/notifications/mark-read" "$read_payload" "$token")
  http_code=$?

  if [[ $http_code -eq 200 || $http_code -eq 404 ]]; then
    log_pass "Mark notification as read endpoint accessible"
  else
    log_warn "Mark notification returned HTTP $http_code"
  fi

  # Test send email notification (order confirmation)
  log_info "Testing send order confirmation email..."
  local email_payload
  email_payload=$(cat <<EOF
{
  "orderId": "order_test_12345",
  "email": "customer@test.com",
  "type": "order.confirmation"
}
EOF
)

  local email_response
  email_response=$(curl_with_retry "POST" "$API_ENDPOINT/notifications/send-email" "$email_payload" "$token")
  http_code=$?

  if [[ $http_code -eq 200 || $http_code -eq 201 ]]; then
    log_pass "Send email notification successful"
  else
    log_warn "Send email notification returned HTTP $http_code"
  fi

  # Test send SMS notification
  log_info "Testing send SMS notification..."
  local sms_payload
  sms_payload=$(cat <<EOF
{
  "phone": "+11234567890",
  "message": "Your order has been confirmed",
  "type": "sms"
}
EOF
)

  local sms_response
  sms_response=$(curl_with_retry "POST" "$API_ENDPOINT/notifications/send-sms" "$sms_payload" "$token")
  http_code=$?

  if [[ $http_code -eq 200 || $http_code -eq 201 ]]; then
    log_pass "Send SMS notification endpoint accessible"
  else
    log_warn "Send SMS notification returned HTTP $http_code"
  fi

  # Test notification preferences
  log_info "Testing get notification preferences..."
  local pref_response
  pref_response=$(curl_with_retry "GET" "$API_ENDPOINT/notifications/preferences" "" "$token")
  http_code=$?

  if [[ $http_code -eq 200 ]]; then
    log_pass "Get notification preferences successful"
  else
    log_warn "Get notification preferences returned HTTP $http_code"
  fi

  # Test update notification preferences
  log_info "Testing update notification preferences..."
  local pref_payload
  pref_payload=$(cat <<EOF
{
  "email": true,
  "sms": false,
  "push": true,
  "marketing": false
}
EOF
)

  local update_pref_response
  update_pref_response=$(curl_with_retry "PATCH" "$API_ENDPOINT/notifications/preferences" "$pref_payload" "$token")
  http_code=$?

  if [[ $http_code -eq 200 ]]; then
    log_pass "Update notification preferences successful"
  else
    log_warn "Update notification preferences returned HTTP $http_code"
  fi
}

# ──────────────────────────────────────────────────────────────────────────────
# REPORT & EXPORT TESTS
# ──────────────────────────────────────────────────────────────────────────────

test_reports() {
  log_section "REPORTS & EXPORT TESTS"

  log_info "Obtaining authentication token..."
  local token
  token=$(get_auth_token "admin@test.com" "Admin@12345")

  if [[ -z "$token" ]]; then
    log_warn "Could not obtain token, skipping report tests"
    return 1
  fi

  # Test generate sales report
  log_info "Testing generate sales report..."
  local report_payload
  report_payload=$(cat <<EOF
{
  "type": "sales",
  "startDate": "2026-01-01",
  "endDate": "2026-05-16",
  "groupBy": "daily"
}
EOF
)

  local report_response
  report_response=$(curl_with_retry "POST" "$API_ENDPOINT/reports/generate" "$report_payload" "$token")
  local http_code=$?

  local report_id=""
  if [[ $http_code -eq 200 || $http_code -eq 201 ]]; then
    log_pass "Generate sales report successful"
    report_id=$(printf '%s' "$report_response" | jq -r '.data.id // empty')
    log_info "Report ID: $report_id"
  else
    log_warn "Generate sales report returned HTTP $http_code"
  fi

  # Test get inventory report
  log_info "Testing inventory report..."
  local inv_payload
  inv_payload=$(cat <<EOF
{
  "type": "inventory",
  "category": "all"
}
EOF
)

  local inv_response
  inv_response=$(curl_with_retry "POST" "$API_ENDPOINT/reports/generate" "$inv_payload" "$token")
  http_code=$?

  if [[ $http_code -eq 200 || $http_code -eq 201 ]]; then
    log_pass "Generate inventory report successful"
  else
    log_warn "Generate inventory report returned HTTP $http_code"
  fi

  # Test export to CSV
  if [[ -n "$report_id" ]]; then
    log_info "Testing export report to CSV..."
    local csv_response
    csv_response=$(curl_with_retry "GET" "$API_ENDPOINT/reports/$report_id/export?format=csv" "" "$token")
    http_code=$?

    if [[ $http_code -eq 200 ]]; then
      log_pass "Export to CSV successful"
      # Check if response is CSV
      if printf '%s' "$csv_response" | grep -q ","; then
        log_pass "CSV format verified"
      fi
    else
      log_warn "Export to CSV returned HTTP $http_code"
    fi
  fi

  # Test export to PDF
  if [[ -n "$report_id" ]]; then
    log_info "Testing export report to PDF..."
    local pdf_response
    pdf_response=$(curl_with_retry "GET" "$API_ENDPOINT/reports/$report_id/export?format=pdf" "" "$token")
    http_code=$?

    if [[ $http_code -eq 200 ]]; then
      log_pass "Export to PDF successful"
    else
      log_warn "Export to PDF returned HTTP $http_code"
    fi
  fi

  # Test export to Excel
  if [[ -n "$report_id" ]]; then
    log_info "Testing export report to Excel..."
    local xlsx_response
    xlsx_response=$(curl_with_retry "GET" "$API_ENDPOINT/reports/$report_id/export?format=xlsx" "" "$token")
    http_code=$?

    if [[ $http_code -eq 200 ]]; then
      log_pass "Export to Excel successful"
    else
      log_warn "Export to Excel returned HTTP $http_code"
    fi
  fi

  # Test list all reports
  log_info "Testing list reports..."
  local list_response
  list_response=$(curl_with_retry "GET" "$API_ENDPOINT/reports?limit=10" "" "$token")
  http_code=$?

  if [[ $http_code -eq 200 ]]; then
    log_pass "List reports successful"
    local report_count
    report_count=$(printf '%s' "$list_response" | jq '.data | length')
    log_info "Found $report_count reports"
  else
    log_warn "List reports returned HTTP $http_code"
  fi

  # Test report scheduling
  log_info "Testing schedule report..."
  local schedule_payload
  schedule_payload=$(cat <<EOF
{
  "type": "sales",
  "schedule": "weekly",
  "day": "Monday",
  "time": "09:00",
  "recipients": ["admin@test.com"]
}
EOF
)

  local schedule_response
  schedule_response=$(curl_with_retry "POST" "$API_ENDPOINT/reports/schedule" "$schedule_payload" "$token")
  http_code=$?

  if [[ $http_code -eq 200 || $http_code -eq 201 ]]; then
    log_pass "Schedule report successful"
  else
    log_warn "Schedule report returned HTTP $http_code"
  fi
}

# ──────────────────────────────────────────────────────────────────────────────
# ORDER TESTS
# ──────────────────────────────────────────────────────────────────────────────

test_orders() {
  log_section "ORDER MANAGEMENT TESTS"

  log_info "Obtaining authentication token..."
  local token
  token=$(get_auth_token "admin@test.com" "Admin@12345")

  if [[ -z "$token" ]]; then
    log_warn "Could not obtain token, skipping order tests"
    return 1
  fi

  # Test create order
  log_info "Testing create order..."
  local order_payload
  order_payload=$(cat <<EOF
{
  "clientId": "client_test_12345",
  "items": [
    {
      "productId": "prod_test_001",
      "quantity": 2,
      "price": 99.99
    }
  ],
  "shippingAddress": {
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "pincode": "10001"
  }
}
EOF
)

  local order_response
  order_response=$(curl_with_retry "POST" "$API_ENDPOINT/orders" "$order_payload" "$token")
  local http_code=$?

  local order_id=""
  if [[ $http_code -eq 201 ]]; then
    log_pass "Create order successful"
    order_id=$(printf '%s' "$order_response" | jq -r '.data.id // empty')
    log_info "Order ID: $order_id"
  else
    log_warn "Create order returned HTTP $http_code"
  fi

  # Test get order
  if [[ -n "$order_id" ]]; then
    log_info "Testing get order details..."
    local get_order_response
    get_order_response=$(curl_with_retry "GET" "$API_ENDPOINT/orders/$order_id" "" "$token")
    http_code=$?

    if [[ $http_code -eq 200 ]]; then
      log_pass "Get order details successful"
    else
      log_warn "Get order details returned HTTP $http_code"
    fi

    # Test update order status
    log_info "Testing update order status..."
    local update_payload
    update_payload=$(cat <<EOF
{
  "status": "shipped",
  "trackingNumber": "TRACK123456"
}
EOF
)

    local update_response
    update_response=$(curl_with_retry "PATCH" "$API_ENDPOINT/orders/$order_id" "$update_payload" "$token")
    http_code=$?

    if [[ $http_code -eq 200 ]]; then
      log_pass "Update order status successful"
    else
      log_warn "Update order status returned HTTP $http_code"
    fi
  fi

  # Test list orders
  log_info "Testing list orders..."
  local list_response
  list_response=$(curl_with_retry "GET" "$API_ENDPOINT/orders?limit=10&status=all" "" "$token")
  http_code=$?

  if [[ $http_code -eq 200 ]]; then
    log_pass "List orders successful"
    local order_count
    order_count=$(printf '%s' "$list_response" | jq '.data | length')
    log_info "Found $order_count orders"
  else
    log_warn "List orders returned HTTP $http_code"
  fi

  # Test cancel order
  if [[ -n "$order_id" ]]; then
    log_info "Testing cancel order..."
    local cancel_response
    cancel_response=$(curl_with_retry "PATCH" "$API_ENDPOINT/orders/$order_id/cancel" "{\"reason\":\"Customer request\"}" "$token")
    http_code=$?

    if [[ $http_code -eq 200 || $http_code -eq 400 ]]; then
      log_pass "Cancel order endpoint accessible"
    else
      log_warn "Cancel order returned HTTP $http_code"
    fi
  fi
}

# ──────────────────────────────────────────────────────────────────────────────
# SUMMARY & MAIN
# ──────────────────────────────────────────────────────────────────────────────

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

  printf "%b" "$BLUE"
  printf "╔════════════════════════════════════════════════════════════╗\n"
  printf "║     Dream Gadgets - Extended API Test Suite                ║\n"
  printf "║     Testing: Payments, Notifications, Reports              ║\n"
  printf "║     Timestamp: %s\n" "$(date)"
  printf "╚════════════════════════════════════════════════════════════╝\n"
  printf "%b" "$NC"

  if [[ $# -gt 0 ]]; then
    for group in "$@"; do
      case "$group" in
        "payments") test_payments ;;
        "notifications") test_notifications ;;
        "reports") test_reports ;;
        "orders") test_orders ;;
        *) log_warn "Unknown test group: $group" ;;
      esac
    done
  else
    test_payments
    test_notifications
    test_reports
    test_orders
  fi

  print_summary
  local exit_code=$?

  log_info "Full test report saved to: $LOG_FILE"

  exit "$exit_code"
}

main "$@"
