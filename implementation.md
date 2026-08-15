# Dream Gadgets — Implementation Status

> **Updated:** August 15, 2026
> This is the single source of truth for project status. Supersedes the removed
> audit/status docs (`things_to_update.md`, `FINAL_AUDIT.md`, `BUGS_FIXED.md`,
> `9 June Report.md`, `System_Status_Report.md`, `INSTALLATION_COMPLETE.md`).

---

## Overall Score: **~92/100** 🟢

| Category | Score | Notes |
|----------|-------|-------|
| Feature completion | ~95% | Core ERP + storefront done; server-side pricing, order auto-notify, OTP login, price-guide CRUD all shipped Aug 15 |
| Code quality | ~85% | Clean NestJS modules, queues, Redis; some hardcoded values & duplicated formatters remain |
| Security | ~85% | JWT rotation, lockout, PII masking, rate limits, dev-mode fallbacks now env-gated |
| Performance | ~88% | Redis caching on price suggestions + buyback estimates; BullMQ queue |
| Production readiness | ~70% | Health endpoint with DB/Redis/queue status; still no Sentry/alerting, zero web/admin tests |
| Maintainability | ~78% | Good monorepo; remaining hardcoded frontend data (branches, WhatsApp number) |

---

## ✅ What Is Implemented

### Admin ERP (`apps/admin` + `apps/api`)
- **Purchases / Sales (POS) / Inventory / Accessories** — full CRUD, bulk import, IMEI tracking, online toggles, Redis-cached price suggestion
- **Clients, Transfers, Exchange, Buyback leads, Returns, Coupons, EMI, Refunds, GST reports, Reports** — complete modules
- **Online Orders** — Razorpay payments, refunds, cancellation with auto-refund, public order tracking, **auto-notify customers on every status change (email + WhatsApp via queue)** ✅
- **Users & Roles** — permission-based access (`RequirePermission`), branch-scoped users
- **Banners, Brand Heroes, Announcement Bar, WhatsApp Inbox/Templates/Campaigns, Settings (branches/roles/content)**
- **Price Guide editor** (`/admin/price-guide`) — full CRUD on `exchange_price_guide` (per-model per-condition base prices) + **override audit log** (who changed what, when) ✅
- **Notifications dashboard** — queue status, sent/failed lists, retry failed (already present, verified) ✅
- **Realtime updates** via WebSocket/socket.io (`useRealtimeUpdates`)
- **Stores pages** — `/admin/branches` list + `/admin/branches/[id]` per-store inventory ✅

### Public Storefront (`apps/web`)
- Products (filters: brand/condition/price), product detail, checkout, order tracking
- **Auth** — password login, **passwordless OTP login tab** (`/login` toggle: Password | OTP, dev-mode code shown locally) ✅, register with OTP, forgot/reset password
- Sell/Buyback wizard with **server-side price estimation** (`POST /public/buyback/estimate-price`, Redis-cached) ✅
- **Store-specific product pages** — `/stores/chetla`, `/stores/jadavpur`, `/stores/champahati` ✅
- **Splash screen** with brand logo + animated progress ✅; new light/dark logo assets everywhere (header, footer, favicons) ✅
- Content pages, SEO JSON-LD schemas, sitemap

### Backend / Infrastructure
- JWT with refresh-token rotation + reuse detection, account lockout (5 fails → 15 min), rate-limited OTP (Twilio Verify)
- BullMQ notification queue with retry/backoff; email (SMTP) + WhatsApp (Twilio) + SMS channels
- **Dev-mode OTP/WhatsApp/Email fallbacks gated behind an explicit env flag** — production never silently "succeeds" ✅
- **`GET /public/health` now reports DB / Redis / queue status** for uptime checks ✅
- Monorepo (npm workspaces), NestJS API + Next.js web/admin, PostgreSQL + TypeORM, Redis, Docker/PM2 deploy
- PWA: admin manifest basePath-correct + maskable/apple-touch icons; web apple-touch-icon fixed ✅

---

## 🧭 What's Left to Reach 100%

### 🟠 Priority 1 — Notifications polish
| # | Task | Why | Effort |
|---|------|-----|--------|
| 1 | Move email/WhatsApp templates from TS string literals to files + admin preview/editor | Current templates are hardcoded in `notification.service.ts` | 2–3 days |
| 2 | Email verification flow (optional email on register) | Email is collected but never verified | 1 day |
| 3 | WhatsApp Business profile upgrade + two-way webhook + pre-approved templates | Provider-level work (Twilio sandbox today); inbox is one-way | 2–4 days |

### 🟡 Priority 2 — Dedupe & hardcode cleanup
| # | Task | Why | Effort |
|---|------|-----|--------|
| 4 | Centralize phone-number formatting + API response shape (`{ data }`) | Duplicated across services; inconsistent formats | 1 day |
| 5 | Move hardcoded frontend data (branches, WhatsApp number) to API/env | `/stores` and contact info require code deploys to update | 1–2 days |

### 🟡 Priority 3 — Quality & hardening
| # | Task | Why | Effort |
|---|------|-----|--------|
| 6 | Test coverage: web + admin (0 tests today); expand API specs | Critical flows unprotected | 4–6 days |
| 7 | Sentry/error tracking + alerting on top of the new health endpoint | No error visibility in production | 1–2 days |
| 8 | CI pipeline (lint → typecheck → test → build) | No automated gates on commits | 1–2 days |
| 9 | SPF/DKIM/DMARC for email domain + rate limits | Deliverability & abuse protection | 1 day |

---

## Done This Cycle (Aug 15 — the "to 100%" push)

- **Order-status auto-notify**: `OnlineOrderService.updateStatus` enqueues a customer-facing email + WhatsApp for every status change; `order_status` template rewritten to be customer-friendly ✅
- **Redis caching**: `getPriceSuggestion` (inventory) + `estimatePrice` (buyback) now cached with TTL, invalidated on relevant writes ✅
- **Price Guide CRUD + audit**: migration `032` (price guide overrides + audit table), `GET/POST/DELETE /exchanges/price-guide*` endpoints, admin `/price-guide` page, sidebar nav ✅
- **OTP login**: `POST /auth/login-otp` + `/auth/login-otp/verify` (passwordless, token-issuing), web login page Password/OTP toggle ✅
- **Env-gated fallbacks**: email/WhatsApp/SMS channels refuse to "send" outside dev-mode unless providers are configured ✅
- **Health endpoint**: `/public/health` now includes DB/Redis/queue status ✅
- **PWA/branding**: admin manifest + icons + SW under `/admin` basePath; web apple-touch-icon fixed ✅
- **Full fitted logo**: splash + loading keep the 90%-width full logo (`min(90vw, 72vh)`); the header shows the complete `logo-header-light.png` (margins trimmed, content uncropped) fitted at 100×48px mobile / 116×56px desktop — left-aligned, search centered, actions right; mobile nav drawer + search overlay portaled to `<body>` so they no longer get trapped/clipped by the scrolled header's `backdrop-blur` containing block ✅
- **Store pages single source of truth**: fixed `/stores/[slug]` returning "Store Not Found" for every store (nested `data.data` envelope bug); `/stores` listing and home "Our Branches" now fetch from `/public/branches` instead of hardcoded data — one store list (DB) drives all pages ✅
- **Branches master data**: migration `033` adds Barrackpore (BARRACK), Salt Lake (SALT_LAKE), Howrah (HOWRAH) branches — idempotent `ON CONFLICT (code)` upsert so re-runs are safe; all 7 stores now live in the DB ✅
- **Per-store product counts**: `/public/branches` and `/admin/branches` now return `productCount` (inventory items per branch via subquery); web `/stores` cards and admin store cards show live product counts ✅
- **Admin login multi-click fix**: root cause found via nginx access logs — 60+ `POST /auth/login` all returning 200 while the user stayed stuck on the login page. The admin service worker intercepted the same-origin login POST and fed the 200 into `cache.put()` (Cache API rejects non-GET) → catch returned a synthetic 503 "Offline" to the page. Fix (`dcdada8`): SW never intercepts non-GET requests (cache bumped to v2 so it activates on next load); api clients (admin + web) no longer attach a stale session token to auth endpoints; login pages now show the real backend error message ✅
- **Guarded storefront SW (`10d95f8`)**: the web app had a PWA manifest but no service worker. Added `public/sw.js` with the mandatory guard baked in — same-origin only, non-GET never intercepted, navigations + `/api/` traffic passed through uncached (prices/stock/pages can never go stale), only static assets/Next chunks are stale-while-revalidate cached; registered via `ServiceWorkerRegister` in the root layout. Guard pattern documented at the top of both SW files so future SW edits follow it. Audit result: admin SW (v2) carries the guard; `apiOffline` is unused dead code — no other SW corruption vectors ✅

### Live verification (Aug 15, dreamgadgets.in)

- **Buyback estimator** verified end-to-end: S23/mint → ₹48,750, iPhone 15 Pro Max/good → ₹66,000, OnePlus 12/fair → ₹26,000 — all from `price_guide` (high confidence); screen 0.6× and battery 0.65× adjustments confirmed live
- **Found & fixed live bug**: `BATTERY_FACTORS` had a mixed-case key (`'Below 50%'`) but `factorFor` lowercased only the input → the "Below 50%" battery option silently fell through to ×1. Fixed with case-insensitive map matching (`1a5e94e`), deployed & verified (₹22,800–25,350 on fresh cache keys)
- **Store pages**: `/stores/{main,chetla,jadavpur,champahati}` all 200 with products; bad slug renders "Store Not Found" (served as HTTP 200 by nginx — minor SEO nit)
- **Admin price-guide editor**: `/admin/price-guide` auth-redirects (307 → login), all `/exchanges/price-guide*` endpoints 401 without token ✅
- **OTP login**: send/verify endpoints live, rate-limited, no account enumeration, clean errors; login page Password/OTP toggle present in served HTML + bundle ✅

All three apps typecheck clean (`tsc --noEmit`).

---

## How to Run

```bash
# API (PostgreSQL + Redis required)
cd apps/api && npm run migration:run && npm run seed && npm run dev

# Web storefront
cd apps/web && npm run dev          # http://localhost:3001

# Admin ERP
cd apps/admin && npm run dev        # http://localhost:3002

# Typecheck each app
npx tsc --noEmit -p apps/web/tsconfig.json
npx tsc --noEmit -p apps/admin/tsconfig.json
npx tsc --noEmit -p apps/api/tsconfig.json
```
