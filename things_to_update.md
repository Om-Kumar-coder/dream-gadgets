# Things To Update — Dream Gadgets Project Audit

> **Generated:** July 11, 2026  
> **Audit Type:** Comprehensive Feature Audit  
> **Scope:** Used Price Suggestion, Mobile OTP, WhatsApp Chat, SMTP Email, Splash Screen

---

## Executive Summary

| Metric | Score |
|--------|-------|
| **Overall Project Health** | 🟡 **Good** — Core ERP is solid, customer-facing site has rough edges |
| **Feature Completion** | ~65% across audited features |
| **Production Readiness** | ~60% — Missing resilience, monitoring, and hardening in 3 of 5 features |
| **Critical Issues** | 3 (password reset delivery, no OTP rate limit persistency, no splash screen whatsoever) |
| **Security Concerns** | 2 (dev-mode fallbacks in production-capable code, PII exposure in logs) |

### Priority Task Summary

| Priority | Count | Key Items |
|----------|-------|-----------|
| 🔴 **Critical** | 5 | Password reset only dev-logs; no production email delivery; no splash screen; no price suggestion ML; OTP fallback accepts any 6-digit code in dev |
| 🟠 **High** | 8 | WhatsApp uses sandbox; no email templates; no price guide seeding; no OTP sms cooldown; forgot password doesn't use notification system; no file-based email templates |
| 🟡 **Medium** | 6 | No buyback price integration; no admin price override history; no email queue monitoring UI; no real WhatsApp template messaging; no animation performance optimization |
| 🔵 **Low** | 4 | Frontend loading states inconsistent; some console.log in production paths; missing rate limit admin controls; missing PWA splash |

---

## 1. Used Price Suggestion Engine

### Current Status: 🟡 Partial Implementation

### What Exists

The project has **two separate price suggestion implementations** — one for inventory (historical sale prices) and one for exchange (formula-based). Neither is connected to the customer-facing buyback/sell flow.

### Flow

#### A) Inventory Price Suggestion (Admin — `GET /api/v1/inventory/price-suggestion`)
1. Admin views an inventory item
2. API queries `sale_items` joined with `inventory_items` filtered by `model_id` and `condition`
3. Returns median sale price (via `PERCENTILE_CONT(0.5)`) and count
4. This is used purely as a **reference** for admin pricing decisions — no auto-fill, no suggestion UI

#### B) Exchange Price Suggestion (Admin — `GET /api/v1/exchanges/price-suggestion`)
1. Admin enters `basePrice`, `batteryHealth`, `monthsSinceFirstInvoice`
2. Server runs `calculateExchangePrice()` formula:
   - `batteryFactor`: ≥80% → 1.0, ≥60% → 0.85, else 0.70
   - `ageFactor`: ≤12 months → 1.0, ≤24 → 0.80, else 0.65
   - `price = basePrice × batteryFactor × ageFactor`
3. Returns suggested price

#### C) Customer-Facing Buyback Price (Frontend — `PriceEstimateCard.tsx`)
- **Hardcoded** `BASE_PRICES` map with ~35 device models
- **Hardcoded** `CONDITION_MULTIPLIERS` map
- Calculation is entirely **client-side** — no API call
- Fallback: random price `(Math.random() * 30000) + 5000` for unrecognized models
- Animated count-up effect for presentation

#### D) Exchange Price Guide — `GET /api/v1/exchanges/price-guide`
- Queries `exchange_price_guide` table (which has `model_id`, `condition`, `base_price`)
- Table is **empty** — no seeding script populates it
- Returns `[]` if table doesn't exist

### Architecture

```
[Buyback SellWizard UI]
  → PriceEstimateCard.tsx (client-side hardcoded prices)
  → SellWizard.tsx submits lead via POST /public/buyback/leads
  → NO PRICE IS SENT TO BACKEND (estimatedPrice field not in CreateBuybackLeadDto)

[Admin Inventory UI]
  → GET inventory/price-suggestion?modelId=X&condition=Y
  → Backend queries sale_items for median price
  → Manually used by admin

[Admin Exchange UI]
  → GET exchanges/price-suggestion?basePrice=X&batteryHealth=Y&monthsSinceFirstInvoice=Z
  → Formula-based calculation
  → price-guide endpoint exists but data is empty
```

### Files Used

| File | Role |
|------|------|
| `apps/api/src/modules/inventory/inventory.service.ts` (lines 379-397) | `getPriceSuggestion()` — median from sale_items |
| `apps/api/src/modules/inventory/inventory.controller.ts` (lines 38-45) | `GET /inventory/price-suggestion` endpoint |
| `apps/api/src/modules/exchange/exchange.service.ts` (lines 81-90) | `suggestPrice()` — formula-based exchange pricing |
| `apps/api/src/modules/exchange/exchange.controller.ts` (lines 37-55) | `GET /exchanges/price-suggestion` and `GET /exchanges/price-guide` |
| `apps/api/src/common/utils/business-logic.ts` (lines 12-15) | `calculateExchangePrice()` formula |
| `apps/web/components/sell/PriceEstimateCard.tsx` | Client-side hardcoded price estimation |
| `apps/web/components/sell/SellWizard.tsx` | Wizard that collects but doesn't send price |
| `apps/api/src/modules/buyback/buyback.service.ts` | Buyback lead creation (no price field in DTO) |
| `apps/web/components/sell/BrandModelSelector.tsx` | Device selection with hardcoded device list |
| `apps/web/components/sell/ConditionSelector.tsx` | Condition selection UI |
| `apps/api/src/database/migrations/004-create-transfer-exchange-tables.ts` | Creates `exchange_price_guide` table |
| `apps/api/src/database/seeds/004-seed-products.ts` | Seeds products but not price guide |

### Database Tables/Models

| Table | Status | Usage |
|-------|--------|-------|
| `inventory_items` | ✅ Active | Has `purchase_price`, `selling_price`, `online_price`, `wholesale_price` |
| `sale_items` | ✅ Active | Has `unit_price` — used for median suggestion |
| `exchange_devices` | ✅ Active | Has `exchange_price` |
| `exchange_price_guide` | ⚠️ Empty | Schema exists with `model_id`, `condition`, `base_price` — no data |

### APIs

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `GET /api/v1/inventory/price-suggestion` | GET | Admin | Median historical sale price |
| `GET /api/v1/exchanges/price-suggestion` | GET | Admin | Formula-based exchange price |
| `GET /api/v1/exchanges/price-guide` | GET | Admin | Market price guide |
| `POST /public/buyback/leads` | POST | Public | Submit buyback lead (no price sent) |

### Missing Features

| Feature | Impact | Details |
|---------|--------|---------|
| **No ML/AI pricing** | 🔴 High | No machine learning model for price prediction |
| **No market price comparison** | 🔴 High | No integration with olx/quikr/cashify/etc market data |
| **No IMEI-based price lookup** | 🔴 High | IMEI is validated but never used to look up model specs or market value |
| **Client-side price hardcoded** | 🟠 High | Prices in `PriceEstimateCard.tsx` are hardcoded JS objects, outdated quickly |
| **Buyback price not stored** | 🟠 High | `estimatedPrice` collected in wizard but not sent to backend; `CreateBuybackLeadDto` has no price field |
| **No confidence score** | 🟠 Medium | No indication of price reliability (e.g., "based on 3 similar sales") |
| **No admin override audit** | 🟠 Medium | No history of manual price overrides |
| **No regional pricing** | 🟡 Low | Single price across all branches/cities |
| **Price guide table empty** | 🟠 High | `exchange_price_guide` created but never seeded |
| **No bulk price update** | 🟡 Low | No way to update prices for multiple items at once |

### Security Issues

- None identified for pricing specifically

### Performance Issues

- `getPriceSuggestion()` runs a full aggregate query on `sale_items` — should be cached with Redis
- Hardcoded device list requires code deploy to update prices

### Recommended Improvements (Prioritized)

1. **🔴 Move price estimation to backend API** — Create `POST /public/buyback/estimate-price` endpoint
2. **🔴 Seed `exchange_price_guide` table** — Add migration/seeds with base prices per model+condition
3. **🟠 Add price field to buyback leads** — Store estimated price in `buyback_leads` table
4. **🟠 Cache price suggestions** — Use Redis with TTL for `getPriceSuggestion()` results
5. **🟠 Connect SellWizard to price API** — Replace hardcoded prices with backend call
6. **🟠 Add IMEI-based model detection** — Look up model from IMEI via API
7. **🟡 Admin price history** — Audit log for manual price changes on inventory items
8. **🟡 Price guide admin editor** — CRUD UI for `exchange_price_guide` entries
9. **🟡 Regional price overrides** — Allow branch-level price adjustments
10. **🔵 Inventory valuation report** — Already partially exists in report service, enhance with market value comparison

| Priority | Effort |
|----------|--------|
| 🔴 High | 3-5 days |
| 🟠 Medium | 5-8 days |
| 🟡 Low | 3-5 days |

---

## 2. Mobile OTP Authentication

### Current Status: 🟢 Functional with dev-mode fallback

### Flow

#### Registration OTP Flow:
1. User enters phone on `/register` page
2. Frontend calls `POST /auth/send-otp` with `{ phone }`
3. Backend `AuthService.sendOtp()` → `TwilioVerifyService.sendOtp()`
4. **If Twilio configured**: Creates Twilio Verify verification via SMS channel
5. **If not configured**: Dev-mode — logs OTP, returns `success: true`
6. User enters OTP on step 2 of registration form
7. Frontend calls `POST /auth/register` with `{ phone, otp, firstName, email, password }`
8. `AuthService.register()` → `TwilioVerifyService.verifyOtp()`
9. **Dev-mode**: Accepts **any 6-digit numeric code** (`/^\d{6}$/`)
10. **Production**: Calls Twilio Verify `verificationChecks.create()`
11. On success, creates user with hashed password + returns JWT tokens

#### Login: **No OTP** — uses email/phone + password
- `POST /auth/login` with `{ identifier, password }`
- Account lockout after 5 failed attempts (15-minute TTL via Redis)
- No OTP-based login option

#### Forgot Password:
- `POST /auth/forgot-password` — only **logs token in dev mode** (`console.log`)
- No actual email/SMS delivery of reset token
- Token stored in Redis with 1-hour TTL

### Architecture

```
[Register Page]
  → POST /auth/send-otp ──→ TwilioVerifyService.sendOtp()
  → POST /auth/register  ──→ TwilioVerifyService.verifyOtp() → Create user → Return JWT

[Login Page]
  → POST /auth/login ──→ LocalStrategy → AuthService.validateUser() → JWT

[Forgot Password]
  → POST /auth/forgot-password ──→ Redis setResetToken → console.log in dev (NO delivery)
```

### Files Used

| File | Role |
|------|------|
| `apps/api/src/modules/auth/auth.service.ts` | Core auth logic: register, login, forgot/reset password, OTP verification |
| `apps/api/src/modules/auth/auth.controller.ts` | Auth endpoints: login, register, send-otp, forgot/reset password |
| `apps/api/src/modules/auth/services/twilio-verify.service.ts` | Twilio Verify integration + dev-mode fallback |
| `apps/api/src/modules/auth/auth.module.ts` | Module wiring |
| `apps/api/src/modules/auth/dto/register.dto.ts` | Register DTO with phone, OTP validation |
| `apps/api/src/modules/auth/dto/login.dto.ts` | Login DTO (identifier + password) |
| `apps/api/src/modules/auth/dto/reset-password.dto.ts` | ForgotPassword, ResetPassword, UpdateProfile DTOs |
| `apps/api/src/modules/auth/entities/user.entity.ts` | User entity with phone, email, notification prefs |
| `apps/api/src/modules/auth/strategies/jwt.strategy.ts` | JWT strategy |
| `apps/api/src/modules/auth/strategies/local.strategy.ts` | Local strategy (email/phone + password) |
| `apps/api/src/common/redis/redis.service.ts` | Redis for OTP tokens, lockout, refresh tokens |
| `apps/web/app/register/page.tsx` | Registration UI with OTP step |
| `apps/web/app/login/page.tsx` | Login UI (no OTP) |

### Database Tables

| Table | Columns Used |
|-------|-------------|
| `users` | `id`, `phone` (unique), `email`, `password_hash`, `first_name`, `last_name`, `role_id`, `is_active`, etc. |
| `roles` | Role lookup for customer registration |
| `notifications` | (not used for OTP delivery) |

### Security Analysis

| Issue | Severity | Details |
|-------|----------|---------|
| **Dev-mode accepts any 6-digit code** | 🟠 High | `twilio-verify.service.ts` line 56-58: If Twilio not configured, accepts **any** `/^\d{6}$/` code. If this code path is reachable in production with misconfigured Twilio, anyone can register |
| **Forgot password delivery missing** | 🔴 Critical | `auth.service.ts` line 272: Only `console.log` in dev — **no production delivery** |
| **Rate limiting on OTP** | 🟢 Good | `@Throttle({ ttl: 60000, limit: 3 })` on send-otp endpoint |
| **Rate limiting on register** | 🟢 Good | `@Throttle({ ttl: 60000, limit: 5 })` on register endpoint |
| **Account lockout** | 🟢 Good | 5 failed attempts → 15-min lockout via Redis |
| **OTP expiry** | 🟡 Medium | Twilio Verify handles expiry server-side; dev mode has no expiry |
| **Password hashing** | 🟢 Good | bcrypt with 12 rounds |
| **Refresh token rotation** | 🟢 Excellent | Token family + reuse detection |
| **No OTP for login** | 🟡 Medium | Only password-based login; OTP login (magic link) is missing |
| **PII masking** | 🟢 Good | `pii-masker.ts` masks phone/email in logs |

### Missing Features

| Feature | Impact |
|---------|--------|
| **OTP-based login** | Medium — users want "login with OTP" option |
| **Password reset delivery** | Critical — no email/SMS sent |
| **OTP cooldown timer (UI)** | Low — frontend doesn't show resend countdown |
| **SMS delivery via notification system** | Medium — OTP goes through Twilio Verify, not the existing SMS service |
| **Multiple OTP channels** | Low — only SMS, no voice or WhatsApp OTP |
| **Email verification on registration** | Low — email is optional, not verified |

### Recommended Improvements (Prioritized)

1. **🔴 Implement forgot password delivery via notification system** — Send reset link via email/SMS
2. **🟠 Add OTP-based login option** — Separate endpoint for OTP login (no password needed)
3. **🟠 Add cooldown state management** — Frontend OTP resend timer (30-60s)
4. **🟡 Add admin controls for OTP settings** — Configurable expiry, cooldown, max attempts
5. **🟡 Remove dev-mode fallback or gate it behind explicit env flag** — Prevent accidental production use
6. **🔵 Add email verification flow** — Verify optional email after registration

---

## 3. WhatsApp Chat Integration

### Current Status: 🟡 Partial — Basic send capability, no rich features

### What Exists

#### Backend WhatsApp Service (`WhatsAppService`)
- Uses Twilio WhatsApp API via `client.messages.create()`
- Properly formats Indian phone numbers (10-digit → +91)
- Dev-mode fallback when Twilio not configured
- Configurable from number via `TWILIO_WHATSAPP_FROM` env var

#### Notification System Integration
- `NotificationService.sendWhatsApp()` — queue-based WhatsApp delivery
- Respects user opt-out (`whatsappEnabled` column on `users` table)
- Template resolution with variable substitution
- BullMQ queue with retry (5 attempts, exponential backoff)

#### Frontend Components
- `WhatsAppButton.tsx` — floating green button in bottom-right corner
- Uses `wa.me` link with hardcoded message
- `Footer.tsx` — WhatsApp icon linking to `wa.me`
- `Header.tsx` — no WhatsApp integration

#### Admin Endpoints
- `POST /sales/:id/invoice/whatsapp` — send invoice via WhatsApp
- `POST /clients/:id/send-whatsapp` — send message to client
- `POST /auth/register` — no WhatsApp OTP option

### Flow

```
[WhatsApp Button Click]
  → Opens wa.me/{phone}?text={message}
  → Directly goes to user's WhatsApp app

[Send WhatsApp Invoice - Admin]
  → POST /sales/:id/invoice/whatsapp
  → SalesService.whatsappInvoice() logs message
  → No actual WhatsApp API call! (only console.log)

[Notification System Send]
  → NotificationService.sendWhatsApp()
  → WhatsAppService.send() → Twilio API
  → BullMQ queue with retries
```

### Files Used

| File | Role |
|------|------|
| `apps/api/src/modules/notification/channels/whatsapp.service.ts` | Core WhatsApp sending via Twilio API |
| `apps/api/src/modules/notification/notification.service.ts` | Queue-based WhatsApp delivery |
| `apps/api/src/modules/notification/notification.module.ts` | Module wiring |
| `apps/api/src/modules/notification/processors/notification.processor.ts` | Queue processor |
| `apps/api/src/modules/sales/sales.service.ts` (line 560) | `whatsappInvoice()` — only console.log, no actual send |
| `apps/api/src/modules/sales/sales.controller.ts` (line 106-114) | Invoice WhatsApp endpoint |
| `apps/api/src/modules/client/client.service.ts` (line 199-205) | Client WhatsApp — only console.log |
| `apps/web/components/layout/WhatsAppButton.tsx` | Floating WhatsApp button |
| `apps/web/components/layout/Footer.tsx` | Footer WhatsApp link |
| `apps/web/app/cancellation/page.tsx` | Mentions WhatsApp as cancellation channel |
| `apps/web/app/returns/page.tsx` | Mentions WhatsApp for returns |
| `apps/api/src/database/seeds/002-seed-settings-branch.ts` | Templates for WhatsApp notifications |

### Configuration

| Env Variable | Status | Purpose |
|-------------|--------|---------|
| `TWILIO_ACCOUNT_SID` | ❌ Optional | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | ❌ Optional | Twilio auth token |
| `TWILIO_WHATSAPP_FROM` | ❌ Optional | WhatsApp sender number (default: `+14155238886` — Twilio sandbox) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | ⚠️ Hardcoded | Used in WhatsAppButton.tsx (default: `919876543210`) |

### Missing Features

| Feature | Impact | Details |
|---------|--------|---------|
| **Template messages** | 🟠 High | WhatsApp templates for order confirmations, shipping updates, invoices — only in seed data, not used |
| **Order notifications** | 🟠 High | No automatic WhatsApp message when order status changes |
| **Abandoned cart recovery** | 🟡 Medium | No WhatsApp reminders |
| **Buyback follow-up** | 🟡 Medium | No WhatsApp auto-reply to buyback leads |
| **Two-way chat** | 🟡 Low | No incoming webhook handler for WhatsApp replies |
| **Media messages** | 🟡 Low | Can't send PDF invoices or images via WhatsApp |
| **WhatsApp opt-in management** | 🟡 Medium | No double opt-in flow required by WhatsApp Business API |
| **Invoice actual send** | 🟠 High | `whatsappInvoice()` only logs — doesn't call WhatsAppService |

### Security Issues

- Twilio sandbox number is hardcoded as default — production should require explicit config
- No WhatsApp webhook validation (no incoming webhook at all)

### Recommended Improvements (Prioritized)

1. **🟠 Fix `whatsappInvoice()` and `sendWhatsapp()`** — Connect to actual `WhatsAppService.send()`
2. **🟠 Upgrade from Twilio Sandbox to approved WhatsApp Business Profile**
3. **🟠 Set up WhatsApp webhook** — Handle incoming messages, delivery receipts
4. **🟠 Build WhatsApp template management** — Register and use pre-approved templates
5. **🟡 Auto-notify order updates** — Send WhatsApp when order status changes
6. **🟡 Add buyback follow-up automation** — Auto-reply to buyback leads with pricing info
7. **🔵 Abandoned cart WhatsApp recovery**

---

## 4. SMTP Email System

### Current Status: 🟡 Functional core, no templates, no production delivery

### What Exists

#### Backend Email Service (`EmailService`)
- Nodemailer-based SMTP sender
- Configurable host, port, auth, security
- Dev-mode fallback when SMTP not configured
- 10s connection/greeting timeout, 15s socket timeout

#### Notification System Integration
- `NotificationService.sendEmail()` — queue-based email delivery
- Respects `emailEnabled` user preference
- HTML email content built via template substitution (`{{varName}}` pattern)
- BullMQ queue with exponential backoff retry (max 5 attempts)

#### Default Templates (Hardcoded in `NotificationService`)
| Template Key | Subject | Body |
|-------------|---------|------|
| `invoice_delivery` | "Your Invoice from Dream Gadgets" | HTML with invoice number, amount |
| `order_status` | "Order Update - {{orderNumber}}" | HTML status update |
| `otp` | "Your OTP for Dream Gadgets" | OTP in HTML |
| `birthday_offer` | "Happy Birthday from Dream Gadgets!" | Birthday offer |
| `buyback_lead` | "New Buyback Request — {{brand}} {{model}}" | Admin notification |
| `refund_processed` | "Refund Initiated — {{orderNumber}}" | Refund details |

#### Invoice Email Endpoint (Admin)
- `POST /sales/:id/invoice/email` — queues invoice email
- **Only console.log** — doesn't actually send via EmailService

#### Client Email Endpoint (Admin)
- `POST /clients/:id/send-email` — queues email to client
- **Only console.log** — doesn't actually send

#### Email in Auth Flow
- `forgotPassword()` — **No email delivery** (only console.log in dev)
- Registration email notification — **Not implemented**

### Architecture

```
[Admin Action triggers email]
  → NotificationService.sendEmail()
  → Queue job → NotificationProcessor → EmailService.send()
  → Nodemailer → SMTP server → Recipient

OR

  → SalesService.emailInvoice() // ONLY console.log
  → ClientService.sendEmail()   // ONLY console.log
```

### Environment Variables

| Variable | Status | Purpose |
|----------|--------|---------|
| `SMTP_HOST` | ❌ Required | SMTP server hostname |
| `SMTP_PORT` | ⚠️ Default 587 | SMTP port |
| `SMTP_SECURE` | ⚠️ Default false | TLS enable |
| `SMTP_USER` | ❌ Required | SMTP username |
| `SMTP_PASS` | ❌ Required | SMTP password |
| `SMTP_FROM` | ⚠️ Default | Sender address |

### Missing Features

| Feature | Impact | Details |
|---------|--------|---------|
| **HTML email templates as files** | 🟠 High | Templates are hardcoded strings in TypeScript — should be `.hbs` or `.mjml` files |
| **Invoice email actual send** | 🔴 Critical | `emailInvoice()` only logs — doesn't call `EmailService.send()` |
| **Forgot password email delivery** | 🔴 Critical | No email sent — only `console.log` |
| **Order confirmation email** | 🟠 High | No automatic email when order is created |
| **Client email actual send** | 🟠 High | `sendEmail()` only logs |
| **Email queue monitoring UI** | 🟡 Medium | No admin dashboard for email delivery status |
| **Bulk/Newsletter support** | 🟡 Low | No bulk email sending |
| **Email template preview** | 🟡 Low | No admin UI to preview templates |
| **Resend verification email** | 🟡 Low | No email verification flow at all |

### Security

- No SPF/DKIM/DMARC configuration mentioned
- SMTP credentials stored in env vars — good practice
- No email sending rate limiting (beyond global rate limiter)
- PII masking in logs: ✅ `pii-masker.ts` masks email addresses

### Recommended Improvements (Prioritized)

1. **🔴 Connect `emailInvoice()` and `sendEmail()` to actual `EmailService.send()`**
2. **🔴 Implement forgot password email delivery** — Use notification system
3. **🟠 Move templates to `.hbs` files** — Proper template files with preview capability
4. **🟠 Auto-send order confirmation email** — On order status change to `payment_confirmed`
5. **🟠 Add email verification flow** — Verify email after registration
6. **🟡 Email dashboard in admin** — View sent/failed emails, retry failed
7. **🟡 Configure SPF/DKIM** — Improve deliverability
8. **🔵 Newsletter feature** — Option to send promotions to opted-in users

---

## 5. Splash Screen

### Current Status: 🔴 Not Implemented

### What Exists

**Nothing resembling a splash screen exists in either the web or admin app.**

However, the following related loading/initialization mechanisms exist:

#### Web App (`apps/web`)
- **`app/providers.tsx`** — Contains `AuthHydrator` component that calls `hydrate()` on mount
- **No splash or loading screen** before hydration completes
- **`app/layout.tsx`** — Uses `<Suspense>` with `HeaderFallback` for header only
- Auth token persistence is done via `useEffect` (async, no loading state)
- The app renders the full page immediately while auth hydrates asynchronously

#### Admin App (`apps/admin`)
- **`app/providers.tsx`** — Wraps in `OfflineProvider` which initializes IndexedDB on mount
- **No splash screen** — `OfflineProvider` handles initialization with try/catch but no visible loading state
- Service worker registration happens via `ServiceWorkerRegister` component (no splash)

#### Startup Sequence (Web App)

```
1. Browser loads HTML (Next.js SSR)
2. JS bundle loads
3. Providers mount:
   a. QueryClient created (synchronous)
   b. AuthHydrator mount → useEffect → hydrate → check localStorage token → validate
   c. RealtimeProvider mount → connect socket
4. Layout renders immediately (no splash)
5. HeaderFallback shows during Suspense
6. Page content streams
7. Auth hydrates → UI updates (user menu, etc.)
```

### Splash Screen Files

| Would-be File | Status |
|--------------|--------|
| `apps/web/components/common/SplashScreen.tsx` | ❌ Does not exist |
| `apps/admin/components/SplashScreen.tsx` | ❌ Does not exist |
| Any PWA splash configuration | ❌ Not in manifest.json |
| Startup animation CSS | ❌ Does not exist |

### UX Issues

| Issue | Impact |
|-------|--------|
| **No branded splash** | Low — app loads fast enough without one |
| **Auth flash** | Medium — user sees "Login" button briefly then it changes to user menu |
| **No loading state during hydration** | Medium — no feedback during token validation |
| **No PWA splash screen** | Low — manifest doesn't define splash background/color properly |
| **Offline init invisible** | Medium — admin IndexedDB initialization is invisible to user |

### Missing Features

| Feature | Impact |
|---------|--------|
| **Branded splash/loading screen** | Low for web, Medium for PWA |
| **Auth initialization loading state** | Medium — prevents UI flashing |
| **PWA splash configuration** | Low — `manifest.json` minimal |
| **Loading progress indicator** | Low |
| **Preloader for critical API data** | Low |

### Recommended Improvements (Prioritized)

1. **🟡 Add auth initialization loading state** — Show minimal branded loading while token validates
2. **🟡 Fix manifest.json** — Add proper PWA splash colors and background
3. **🟡 Prevent auth flash** — Don't render login button until hydration completes
4. **🔵 Optional splash screen** — Only if PWA install is a priority

---

## Shared Problems

### Cross-Cutting Issues

| Issue | Affected Features | Details |
|-------|------------------|---------|
| **Dev-mode fallbacks in production-capable code** | OTP, WhatsApp, Email | All three channels silently work in "dev mode" when services aren't configured — could lead to production data loss |
| **Console.log in production paths** | Email, WhatsApp | `whatsappInvoice()`, `emailInvoice()`, `sendWhatsapp()`, `sendEmail()` all use `console.log` instead of actual sending |
| **No centralized error handling for notifications** | WhatsApp, Email | Errors are caught and logged but not reported to monitoring |
| **Inconsistent API response format** | All | Some endpoints return `{ data: ... }`, others return directly, some return `{ status: 'success', data: ... }` |
| **Missing tests for notification delivery** | Email, WhatsApp, OTP | No unit/integration tests for actual delivery |
| **Hardcoded values** | Pricing, WhatsApp, Branches | Device prices in frontend, WhatsApp number, branch details |
| **No feature flags** | All | No way to enable/disable features per environment without config changes |

### Duplicate Code

| Issue | Locations |
|-------|-----------|
| Phone number formatting logic duplicated | `twilio-verify.service.ts`, `whatsapp.service.ts`, `sms.service.ts` — all format Indian phone numbers |
| Template substitution logic duplicated | `notification.service.ts` has `substituteVars()`, potential duplication elsewhere |
| Email/WhatsApp invoice stubs | Both `emailInvoice()` and `whatsappInvoice()` in `sales.service.ts` are stubs |

### Dead Code / Unused

| Item | Location | Notes |
|------|----------|-------|
| `exchange_price_guide` table | Database | Created but never populated |
| `birthday_offer` template | `notification.service.ts` | No code triggers birthday offers |
| `settings` template lookup | `notification.service.ts` | Lazy loads from settings table but never stored there |
| `searchQueue` | `inventory.service.ts` | Set with `setSearchQueue()` — never connected |

### Race Conditions

| Issue | Details |
|-------|---------|
| Buyback photo upload vs lead creation | Photos are uploaded in parallel after lead creation — if lead creation fails, photos are orphaned |
| Auth hydration vs RealtimeProvider | No guarantee auth token is valid before socket connection establishes |

---

## Recommended Development Order

| Order | Task | Priority | Estimated Effort |
|-------|------|----------|-----------------|
| **1** | Fix forgot password delivery (use notification system) | 🔴 Critical | 1-2 days |
| **2** | Connect invoice email/WhatsApp to actual services | 🔴 Critical | 1 day |
| **3** | Create price estimation API endpoint | 🟠 High | 2-3 days |
| **4** | Implement OTP-based login | 🟠 High | 1-2 days |
| **5** | Move email templates to files | 🟠 High | 2-3 days |
| **6** | Upgrade WhatsApp from sandbox to business profile | 🟠 High | 1-2 days |
| **7** | Seed exchange_price_guide + connect buyback price | 🟠 High | 2-3 days |
| **8** | Add auto-order notifications (email + WhatsApp) | 🟠 High | 2-3 days |
| **9** | Add admin notification dashboard with retry | 🟡 Medium | 2-3 days |
| **10** | Add auth loading state + fix flash | 🟡 Medium | 1 day |
| **11** | Centralize phone formatting utility | 🟡 Medium | 0.5 day |
| **12** | Add cache layer for price suggestions | 🟡 Medium | 1 day |
| **13** | PWA splash configuration | 🔵 Low | 0.5 day |
| **14** | Buyback WhatsApp follow-up automation | 🔵 Low | 2 days |
| **15** | Abandoned cart recovery | 🔵 Low | 2-3 days |

---

## Final Score

| Category | Score | Notes |
|----------|-------|-------|
| **Feature Completion** | 65% | OTP and WhatsApp core work; pricing and email need production hardening; splash doesn't exist |
| **Code Quality** | 75% | Good NestJS structure, clean components, but some stubs and console.log |
| **Architecture** | 80% | Well-modularized backend, proper queue system, decent separation of concerns |
| **Security** | 70% | Good JWT rotation, lockout, PII masking; dev fallbacks and missing password reset delivery are concerning |
| **Performance** | 75% | Redis caching used, queue for async tasks; missing cache on price suggestions |
| **Maintainability** | 70% | Good TS usage, but hardcoded values, duplicated formatters, and stubs reduce maintainability |
| **Production Readiness** | 60% | Dev fallbacks in all notification channels would cause silent failures; monitoring is minimal |
| **Developer Experience** | 75% | Good monorepo structure, clear module layout; missing comprehensive tests |

### Overall Score: **71/100** 🟡

The project has a solid foundation with good architecture decisions (NestJS modules, BullMQ queues, Redis caching, JWT rotation). The main gaps are in production-hardening the notification channels (OTP, Email, WhatsApp all have dev-mode code paths that could mask failures), missing delivery for critical flows (forgot password, invoice sending), and the pricing engine being entirely client-side hardcoded. The splash screen is the least impactful gap. Addressing the top 5 items in the recommended order would bring the score to ~85/100.

---

*End of Audit — July 11, 2026*
