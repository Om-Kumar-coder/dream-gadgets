# BUGS_FIXED.md — Phase 2 Bug Fixes

> **Date:** July 11, 2026

## Bug 1: Admin Auth Tokens Never Synced to localStorage

**Severity:** Critical — Admin API calls had no auth token after login

**Root Cause:** The `apps/admin/store/auth.store.ts` (zustand persist store) stored tokens in its internal state and synced to `localStorage` under `admin-auth-storage` key via the persist middleware. However, the `apps/admin/lib/api.ts` axios interceptor read from `localStorage.getItem('admin_access_token')` — a completely different key. The admin store's `setTokens()` never wrote to `admin_access_token`, so every API call after login had no `Authorization: Bearer` header.

The **web auth store** (`apps/web/store/auth.store.ts`) had a `syncToLocalStorage()` function that correctly wrote to `access_token` / `refresh_token` keys, but the admin store was missing this.

**Files Changed:**
- `apps/admin/store/auth.store.ts` — Added `syncToLocalStorage()` function, called from `setTokens()` and `logout()`

**Solution:** Replicated the sync pattern from the web store into the admin store so `admin_access_token` and `admin_refresh_token` are always written to `localStorage` when tokens are set or cleared.

---

## Bug 2: `console.log` / `console.warn` in Production Code Paths

**Severity:** Medium — Production logging should use structured Logger, not raw console

**Root Cause:** Several production code paths in `payment.service.ts` and `main.ts` used `console.log()` and `console.warn()` instead of the NestJS `Logger` service. This meant production logs lacked proper context, timestamps, and log levels.

**Files Changed:**
- `apps/api/src/modules/payment/payment.service.ts` — 5 instances fixed:
  1. `console.log('[Payment] No payment record...')` → `this.logger.log(...)`
  2. `console.warn('[Payment] Redis unavailable...')` → `this.logger.warn(...)`
  3. `console.log('[Payment] Unhandled webhook event...')` → `this.logger.warn(...)`
  4. `console.warn('[Refund] Failed to persist refund...')` → `this.logger.warn(...)`
  5. `.catch(() => {})` → `.catch((err) => this.logger.warn(...))` (was silently swallowing errors)
- `apps/api/src/main.ts` — 1 instance fixed:
  6. `console.log('Dream Gadgets API running...')` → `logger.log(...)`

---

## Bug 3: 350+ Lines of Duplicate Product Card JSX on Homepage

**Severity:** Medium — Maintainability issue, large bundle

**Root Cause:** The homepage (`apps/web/app/page.tsx`) rendered 5 product sections (Trending, Deal of the Day, Hot Deals, Recommended Products) each with ~90 lines of nearly identical inline JSX. The only differences were variant (grid vs. square aspect ratio) and data slice. This made the page ~900+ lines and hard to maintain.

**Files Created:**
- `apps/web/components/product/ProductCard.tsx` — New reusable component

**Files Changed:**
- `apps/web/app/page.tsx` — Replaced 4× inline JSX blocks with `<ProductCard>` component; removed 4 helper functions now inside ProductCard; reduced page by ~350 lines

**Solution:** Extracted a `ProductCard` component with:
- Default export `ProductCardDefault` — accepts raw product API data object (used by homepage)
- Named export `ProductCard` — accepts individual props (used by brands/[slug] and products pages)
- Two variants: `'grid'` (4:3 aspect, hover overlay) and `'square'` (1:1 aspect)
- Built-in helpers: `computeDiscount()`, `formatPrice()`, `getQualityClass()`, `getProductImage()`
- Optional: rating stars, review count, out-of-stock badge, quick-add button

---

## Bug 4: Dual "Back to Sign In" Button on Forgot Password View

**Severity:** Low — Duplicate UI element

**Root Cause:** The login page's forgot-password view had an outer "← Back to Sign In" button in its footer, while the `ForgotPasswordForm` component already renders a "← Back to Sign In" button in both its form state (via `onBack` prop) and its sent state. This resulted in two identical buttons appearing.

**Files Changed:**
- `apps/web/app/login/page.tsx` — Removed the outer "← Back to Sign In" button from the forgot-password view footer; kept "Back to Home" link

---

## Summary

| # | Bug | Severity | Type |
|---|-----|----------|------|
| 1 | Admin auth tokens never synced to localStorage | Critical | Authentication |
| 2 | console.log in production code paths | Medium | Logging |
| 3 | 350+ lines duplicate JSX on homepage | Medium | Maintainability |
| 4 | Dual "Back to Sign In" button | Low | UI/UX |
