# Dream Gadgets — Authorization Endpoint Matrix

> Every API endpoint mapped to its authentication, permission, and branch scope requirements.  
> Last updated: 19 August 2026

---

## Legend

- ✅ = Auth required + permission enforced
- ⚠️ = Auth required but permission may be missing
- ❌ = No auth (public endpoint)
- 🌐 = Branch-scoped (user can only access own branch data)
- 🔒 = Owner-only / global scope required

---

## Authentication Endpoints (Public)

| Method | Endpoint | Auth | Permission | Branch | Status |
|--------|----------|:----:|:----------:|:------:|:------:|
| POST | /auth/login | ❌ | — | — | ✅ OK |
| POST | /auth/register | ❌ | — | — | ✅ OK |
| POST | /auth/send-otp | ❌ | — | — | ✅ OK |
| POST | /auth/login-otp | ❌ | — | — | ✅ OK |
| POST | /auth/refresh | ❌ | — | — | ✅ OK |
| POST | /auth/logout | ❌ | — | — | ✅ OK |
| POST | /auth/forgot-password | ❌ | — | — | ✅ OK |
| POST | /auth/reset-password | ❌ | — | — | ✅ OK |

## Authenticated User Endpoints

| Method | Endpoint | Auth | Permission | Branch | Status |
|--------|----------|:----:|:----------:|:------:|:------:|
| GET | /auth/me | ✅ | — (own profile) | — | ✅ OK |
| PATCH | /auth/profile | ✅ | — (own profile) | — | ✅ OK |
| POST | /auth/change-password | ✅ | — (own profile) | — | ✅ OK |

## Admin Controller

| Method | Endpoint | Auth | Permission | Branch | Status |
|--------|----------|:----:|:----------:|:------:|:------:|
| GET | /admin/users | ✅ | users.view | 🔒 | ✅ OK |
| POST | /admin/users | ✅ | users.create | 🔒 | ✅ OK |
| PATCH | /admin/users/:id | ✅ | users.edit | 🔒 | ⚠️ No self-escalation check |
| DELETE | /admin/users/:id | ✅ | users.delete | 🔒 | ⚠️ No owner protection |
| GET | /admin/roles | ✅ | settings.view | 🔒 | ✅ OK |
| POST | /admin/roles | ✅ | settings.create | 🔒 | ✅ OK |
| PATCH | /admin/roles/:id/permissions | ✅ | settings.edit | 🔒 | ⚠️ No audit log |
| POST | /admin/roles/:id/invalidate-permissions | ✅ | settings.edit | 🔒 | ✅ OK |
| GET | /admin/branches | ✅ | settings.view | 🔒 | ✅ OK |
| POST | /admin/branches | ✅ | settings.create | 🔒 | ✅ OK |
| PATCH | /admin/branches/:id | ✅ | settings.edit | 🔒 | ✅ OK |
| GET | /admin/settings | ✅ | settings.view | 🔒 | ✅ OK |
| GET | /admin/settings/:key | ✅ | settings.view | 🔒 | ✅ OK |
| PATCH | /admin/settings/:key | ✅ | settings.edit | 🔒 | ✅ OK |
| GET | /admin/banners | ✅ | ❌ MISSING | — | ⚠️ No permission |
| POST | /admin/banners | ✅ | content.create | — | ✅ OK |
| PATCH | /admin/banners/:id | ✅ | content.edit | — | ✅ OK |
| PATCH | /admin/banners/:id/toggle | ✅ | content.edit | — | ✅ OK |
| PATCH | /admin/banners-order | ✅ | content.edit | — | ✅ OK |
| DELETE | /admin/banners/:id | ✅ | content.delete | — | ✅ OK |
| POST | /admin/upload/banner | ✅ | content.create | — | ✅ OK |
| GET | /admin/banners/analytics | ✅ | content.view | — | ✅ OK |
| GET | /admin/brand-heroes | ✅ | settings.view | 🔒 | ✅ OK |
| GET | /admin/brand-heroes/:slug | ✅ | settings.view | 🔒 | ✅ OK |
| PUT | /admin/brand-heroes/:slug | ✅ | settings.edit | 🔒 | ✅ OK |
| GET | /admin/pages | ✅ | ❌ MISSING | — | ⚠️ No permission |
| POST | /admin/pages | ✅ | content.create | — | ✅ OK |
| PATCH | /admin/pages/:id | ✅ | content.edit | — | ✅ OK |
| DELETE | /admin/pages/:id | ✅ | content.delete | — | ✅ OK |

## Dashboard / Reports

| Method | Endpoint | Auth | Permission | Branch | Status |
|--------|----------|:----:|:----------:|:------:|:------:|
| GET | /report/dashboard | ✅ | dashboard.view | 🌐 | ✅ OK |
| GET | /report/sales | ✅ | reports.view | 🌐 | ✅ OK |
| GET | /report/inventory | ✅ | reports.view | 🌐 | ✅ OK |
| GET | /report/clients | ✅ | reports.view | 🌐 | ✅ OK |
| GET | /report/finance | ✅ | reports.view | 🔒 | ⚠️ Owner-only on frontend only |
| GET | /report/export | ✅ | reports.export | 🌐 | ✅ OK |

## Clients

| Method | Endpoint | Auth | Permission | Branch | Status |
|--------|----------|:----:|:----------:|:------:|:------:|
| GET | /clients | ✅ | clients.view | ⚠️ | ⚠️ No server branch filter |
| POST | /clients | ✅ | clients.create | ⚠️ | ⚠️ No server branch assignment |
| GET | /clients/:id | ✅ | clients.view | ⚠️ | ⚠️ No branch check |
| PATCH | /clients/:id | ✅ | clients.edit | ⚠️ | ⚠️ No branch check |
| DELETE | /clients/:id | ✅ | clients.delete | ⚠️ | ⚠️ No branch check |

## Inventory

| Method | Endpoint | Auth | Permission | Branch | Status |
|--------|----------|:----:|:----------:|:------:|:------:|
| GET | /inventory | ✅ | inventory.view | ⚠️ | ⚠️ No server branch filter |
| POST | /inventory | ✅ | inventory.create | ⚠️ | ⚠️ No branch check |
| PATCH | /inventory/:id | ✅ | inventory.update | ⚠️ | ⚠️ No branch check |
| DELETE | /inventory/:id | ✅ | inventory.delete | ⚠️ | ⚠️ No branch check |

## Sales / POS

| Method | Endpoint | Auth | Permission | Branch | Status |
|--------|----------|:----:|:----------:|:------:|:------:|
| GET | /sales | ✅ | sales.view | ⚠️ | ⚠️ No server branch filter |
| POST | /sales | ✅ | sales.create | ⚠️ | ⚠️ No branch check |
| POST | /sales/:id/void | ✅ | ⚠️ MISSING | ⚠️ | ⚠️ No dedicated void permission |

## Purchases

| Method | Endpoint | Auth | Permission | Branch | Status |
|--------|----------|:----:|:----------:|:------:|:------:|
| GET | /purchases | ✅ | purchases.view | ⚠️ | ⚠️ No server branch filter |
| POST | /purchases | ✅ | purchases.create | ⚠️ | ⚠️ No branch check |
| PATCH | /purchases/:id | ✅ | purchases.update | ⚠️ | ⚠️ No branch check |

## Transfers

| Method | Endpoint | Auth | Permission | Branch | Status |
|--------|----------|:----:|:----------:|:------:|:------:|
| GET | /transfers | ✅ | transfers.view | ⚠️ | ⚠️ No server branch filter |
| POST | /transfers | ✅ | transfers.create | ⚠️ | ⚠️ No branch check |

## Exchange

| Method | Endpoint | Auth | Permission | Branch | Status |
|--------|----------|:----:|:----------:|:------:|:------:|
| GET | /exchange | ✅ | exchange.view | ⚠️ | ⚠️ No server branch filter |
| POST | /exchange | ✅ | exchange.create | ⚠️ | ⚠️ No branch check |

## Orders

| Method | Endpoint | Auth | Permission | Branch | Status |
|--------|----------|:----:|:----------:|:------:|:------:|
| GET | /orders | ✅ | orders.view | ⚠️ | ⚠️ No server branch filter |
| PATCH | /orders/:id | ✅ | orders.update_status | ⚠️ | ⚠️ No branch check |
| POST | /orders/:id/confirm-payment | ✅ | ⚠️ MISSING | ⚠️ | ⚠️ No payment permission |

## Returns

| Method | Endpoint | Auth | Permission | Branch | Status |
|--------|----------|:----:|:----------:|:------:|:------:|
| GET | /returns | ✅ | returns.view | ⚠️ | ⚠️ No server branch filter |
| POST | /returns | ✅ | returns.create | ⚠️ | ⚠️ No branch check |

## Coupons

| Method | Endpoint | Auth | Permission | Branch | Status |
|--------|----------|:----:|:----------:|:------:|:------:|
| GET | /coupons | ✅ | ❌ MISSING | — | ⚠️ Module not in seed |
| POST | /coupons | ✅ | ❌ MISSING | — | ⚠️ Module not in seed |

## EMI

| Method | Endpoint | Auth | Permission | Branch | Status |
|--------|----------|:----:|:----------:|:------:|:------:|
| GET | /emi/plans | ❌ | — | — | ✅ OK (public) |
| GET | /emi/providers | ❌ | — | — | ✅ OK (public) |
| GET | /emi/admin/plans | ✅ | ❌ MISSING | — | ⚠️ Module not in seed |
| POST | /emi/admin/plans | ✅ | ❌ MISSING | — | ⚠️ Module not in seed |

## WhatsApp

| Method | Endpoint | Auth | Permission | Branch | Status |
|--------|----------|:----:|:----------:|:------:|:------:|
| GET | /whatsapp | ✅ | whatsapp.view | — | ✅ OK |
| GET | /whatsapp/:id | ✅ | whatsapp.view | — | ✅ OK |
| GET | /whatsapp/:id/messages | ✅ | whatsapp.view | — | ✅ OK |
| PATCH | /whatsapp/:id | ✅ | whatsapp.edit | — | ✅ OK |
| POST | /whatsapp/send | ✅ | whatsapp.send | — | ✅ OK |
| GET | /whatsapp/stats | ✅ | whatsapp.view | — | ✅ OK |
| POST | /public/whatsapp/webhook | ❌ | — | — | ✅ OK (webhook) |
| GET | /public/whatsapp/webhook | ❌ | — | — | ✅ OK (verification) |

## Buyback

| Method | Endpoint | Auth | Permission | Branch | Status |
|--------|----------|:----:|:----------:|:------:|:------:|
| POST | /public/buyback/leads | ❌ | — | — | ✅ OK (public) |
| POST | /public/buyback/estimate-price | ❌ | — | — | ✅ OK (rate-limited) |
| POST | /public/buyback/leads/:id/photos | ❌ | — | — | ✅ OK (public) |
| GET | /buyback/stats | ✅ | buyback.view | — | ✅ OK |
| GET | /buyback/leads | ✅ | buyback.view | — | ✅ OK |
| GET | /buyback/leads/:id | ✅ | buyback.view | — | ✅ OK |
| PATCH | /buyback/leads/:id | ✅ | buyback.edit | — | ✅ OK |

## Payment

| Method | Endpoint | Auth | Permission | Branch | Status |
|--------|----------|:----:|:----------:|:------:|:------:|
| GET | /payments/pending-refunds | ✅ | ❌ MISSING | — | ⚠️ No payment permission |
| POST | /payments/refund | ✅ | ❌ MISSING | — | ⚠️ No payment permission |

## Notification

| Method | Endpoint | Auth | Permission | Branch | Status |
|--------|----------|:----:|:----------:|:------:|:------:|
| GET | /notifications | ✅ | ❌ MISSING | — | ⚠️ No notification permission |
| POST | /notifications/retry/:id | ✅ | ❌ MISSING | — | ⚠️ No notification permission |

## Health (Public)

| Method | Endpoint | Auth | Permission | Branch | Status |
|--------|----------|:----:|:----------:|:------:|:------:|
| GET | /health | ❌ | — | — | ✅ OK |

---

## Summary

| Category | Count |
|----------|-------|
| Total endpoints | ~80 |
| Auth + permission enforced | ~50 |
| Auth but permission missing | ~12 |
| No auth (public) | ~15 |
| Branch-scoped (server-side) | ~3 |
| Branch-scoped (query param only) | ~20 |

### Critical Findings

1. **12 endpoints use permissions not defined in seed** — `settings.create`, `sales.void`, `payments.*`, `emi.*`, `coupons.*`, `notifications.*`
2. **Branch scoping is query-param-based, not server-enforced** — any authenticated user can access any branch's data
3. **No self-escalation prevention** — users can theoretically edit their own role
4. **No payment/refund permissions** — financial operations lack authorization
