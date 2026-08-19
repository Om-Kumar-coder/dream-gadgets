# Dream Gadgets — Access Control & RBAC

> **Single source of truth for authorization.**  
> Last updated: 19 August 2026  
> Author: Security audit — Codebuff AI

---

## 1. Authentication Model

| Component | Implementation |
|-----------|---------------|
| Token type | JWT (access + refresh) |
| Access token expiry | 1 hour (configurable via `JWT_EXPIRY`) |
| Refresh token expiry | 7 days |
| Refresh rotation | Yes — single-use family tokens in Redis |
| Reuse detection | Yes — invalidates entire family on reuse |
| Password hashing | bcrypt (12 rounds) |
| Account lockout | 5 failed attempts → 15-minute lockout |
| OTP | MSG91 SMS provider (600s TTL, 5 max attempts) |
| Password reset | Email/SMS with expiring UUID tokens (1h TTL) |

### JWT Payload

```typescript
interface JwtPayload {
  sub: string;           // user UUID
  email: string;
  role: string;          // role name (e.g. "shop_owner")
  permissions: string[]; // ["dashboard.view", "sales.create", ...]
  branchId: string | null;
  iat: number;
  exp: number;
}
```

### Authentication Flow

```
Login → validate credentials → check lockout
  → buildTokens(user) → getUserPermissions(roleId) → sign JWT
  → store refresh token in Redis (family-based rotation)
  → return { accessToken, refreshToken, user }
```

### Refresh Flow

```
Refresh → verify refresh token → check Redis (family exists + token matches)
  → delete old token → buildTokens → return new pair
  → If reuse detected → invalidate ALL families for user → 401
```

### Permission Caching

Permissions are cached in Redis per role: `perms:role:{roleId}` with 15-minute TTL.  
Cache is invalidated when role permissions are updated via admin API.

---

## 2. Roles

Discovered from `001-seed-roles-permissions.ts`:

| Role | Description | Admin Access | All Branches | User Mgmt | Permission Mgmt |
|------|-------------|:------------:|:------------:|:---------:|:---------------:|
| `shop_owner` | Full access to everything | ✅ | ✅ | ✅ | ✅ |
| `store_manager` | Branch-level management | ✅ | ❌ (assigned) | ✅ (create/edit) | ❌ |
| `shop_sales` | POS and basic sales | ✅ | ❌ (assigned) | ❌ | ❌ |
| `store_sales` | Store-level sales | ✅ | ❌ (assigned) | ❌ | ❌ |
| `calling_staff` | Customer service / calling | ✅ | ❌ (assigned) | ❌ | ❌ |
| `employee` | Minimal access (view clients only) | ✅ | ❌ (assigned) | ❌ | ❌ |
| `customer` | Public storefront account | ❌ | N/A | ❌ | ❌ |

### Role Capabilities Matrix

| Capability | shop_owner | store_manager | shop_sales | store_sales | calling_staff | employee |
|------------|:----------:|:-------------:|:----------:|:-----------:|:-------------:|:--------:|
| View dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| View inventory | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Create/edit inventory | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Create purchases | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Create sales (POS) | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Void sales | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View/edit clients | ✅ | ✅ | ✅ | ✅ | ✅ | view only |
| Create transfers | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Create exchanges | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| View/edit orders | ✅ | ✅ | view only | view only | ✅ | ❌ |
| Create returns | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| View reports | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Export reports | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage users | ✅ | ✅ (create/edit) | ❌ | ❌ | ❌ | ❌ |
| Manage settings/roles | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage content/banners | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View/edit buyback | ✅ | ✅ (edit) | view only | view only | ✅ (edit) | ❌ |
| WhatsApp view | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| WhatsApp send | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| WhatsApp edit | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |

---

## 3. Permissions

### Defined Modules & Actions

**Modules:** `dashboard`, `inventory`, `purchases`, `sales`, `clients`, `transfers`, `exchange`, `orders`, `returns`, `reports`, `users`, `settings`, `content`, `buyback`, `whatsapp`

**Actions:** `view`, `create`, `edit`, `delete`, `export`, `approve`, `send`

### Full Permission Matrix (105 permissions = 15 modules × 7 actions)

Every module has all 7 actions defined. Permissions are assigned per role.

### Additional Required Permissions (not in seed but used in controllers)

| Permission | Used By | Required For |
|-----------|---------|-------------|
| `settings.create` | AdminController (roles, branches) | Creating roles and branches |
| `sales.void` | POS void endpoint | Voiding POS sales |
| `payments.view` | Payment endpoints | Viewing payment data |
| `payments.refund` | Refund endpoints | Processing refunds |
| `exchange.manage_price_guide` | Price guide editor | Managing exchange price guide |
| `exchange.view_audits` | Price guide audit log | Viewing price guide change history |
| `notifications.view` | Notification dashboard | Viewing notification status |

---

## 4. Module → Action Matrix (Actual Deployment)

### Dashboard

| Action | Owner | Manager | Shop Sales | Store Sales | Calling | Employee |
|--------|:-----:|:-------:|:----------:|:-----------:|:-------:|:--------:|
| View | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |

**Note:** Financial data (Net Income) is hidden from non-owner users on the frontend. Backend returns `netIncome=0` for non-owner users.

### Inventory

| Action | Owner | Manager | Shop Sales | Store Sales | Calling | Employee |
|--------|:-----:|:-------:|:----------:|:-----------:|:-------:|:--------:|
| View | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Create | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Edit | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Delete | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

### Sales / POS

| Action | Owner | Manager | Shop Sales | Store Sales | Calling | Employee |
|--------|:-----:|:-------:|:----------:|:-----------:|:-------:|:--------:|
| View | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Create | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Edit | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Void | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

### Purchases

| Action | Owner | Manager | Shop Sales | Store Sales | Calling | Employee |
|--------|:-----:|:-------:|:----------:|:-----------:|:-------:|:--------:|
| View | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Create | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Edit | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

### Clients

| Action | Owner | Manager | Shop Sales | Store Sales | Calling | Employee |
|--------|:-----:|:-------:|:----------:|:-----------:|:-------:|:--------:|
| View | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Edit | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Export | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

### Transfers

| Action | Owner | Manager | Shop Sales | Store Sales | Calling | Employee |
|--------|:-----:|:-------:|:----------:|:-----------:|:-------:|:--------:|
| View | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Create | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Edit | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

### Exchange

| Action | Owner | Manager | Shop Sales | Store Sales | Calling | Employee |
|--------|:-----:|:-------:|:----------:|:-----------:|:-------:|:--------:|
| View | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Create | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Edit | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Approve | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

### Orders

| Action | Owner | Manager | Shop Sales | Store Sales | Calling | Employee |
|--------|:-----:|:-------:|:----------:|:-----------:|:-------:|:--------:|
| View | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Edit | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |

### Returns

| Action | Owner | Manager | Shop Sales | Store Sales | Calling | Employee |
|--------|:-----:|:-------:|:----------:|:-----------:|:-------:|:--------:|
| View | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Create | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Approve | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

### Reports

| Action | Owner | Manager | Shop Sales | Store Sales | Calling | Employee |
|--------|:-----:|:-------:|:----------:|:-----------:|:-------:|:--------:|
| View | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Export | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

### Users

| Action | Owner | Manager | Shop Sales | Store Sales | Calling | Employee |
|--------|:-----:|:-------:|:----------:|:-----------:|:-------:|:--------:|
| View | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Create | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Edit | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Delete | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Settings (Roles, Branches, System Config)

| Action | Owner | Manager | Shop Sales | Store Sales | Calling | Employee |
|--------|:-----:|:-------:|:----------:|:-----------:|:-------:|:--------:|
| View | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Create | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Edit | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Content (Banners, Pages)

| Action | Owner | Manager | Shop Sales | Store Sales | Calling | Employee |
|--------|:-----:|:-------:|:----------:|:-----------:|:-------:|:--------:|
| View | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Create | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Edit | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Delete | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Buyback

| Action | Owner | Manager | Shop Sales | Store Sales | Calling | Employee |
|--------|:-----:|:-------:|:----------:|:-----------:|:-------:|:--------:|
| View | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Edit | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |

### WhatsApp

| Action | Owner | Manager | Shop Sales | Store Sales | Calling | Employee |
|--------|:-----:|:-------:|:----------:|:-----------:|:-------:|:--------:|
| View | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Edit | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Send | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |

---

## 5. Branch / Store Scoping

### Rules

- `shop_owner` → GLOBAL scope (sees all branches)
- All other roles → BRANCH scope (see only assigned branch)
- Branch assignment is stored in `users.branch_id`
- Branch ID is included in JWT claims

### Enforcement

**Currently enforced at:**
- Dashboard KPI report (backend checks `user.role` to decide scope)
- Report controller (uses `@CurrentUser()` to get branchId)

**NOT currently enforced (gaps):**
- Most CRUD endpoints do not verify the user's branch matches the resource branch
- Clients, inventory, sales, purchases, transfers — no server-side branch filtering
- Cross-branch data access is possible by manipulating branchId in requests

### Branch Scoping Rules

| Module | Branch Scoped? | Enforcement |
|--------|:--------------:|-------------|
| Dashboard | ✅ | Backend (role-based) |
| Inventory | ⚠️ Partial | Query param, not enforced |
| Sales | ⚠️ Partial | Query param, not enforced |
| Purchases | ⚠️ Partial | Query param, not enforced |
| Clients | ⚠️ Partial | Query param, not enforced |
| Transfers | ⚠️ Partial | Query param, not enforced |
| Orders | ⚠️ Partial | Query param, not enforced |
| Reports | ✅ | Backend (role-based) |
| Users | ✅ | Owner/Manager only |

---

## 6. Sensitive Operations

### Financial

| Operation | Required Permission | Audit Logged? |
|-----------|-------------------|:-------------:|
| Create sale | `sales.create` | ✅ |
| Void sale | `sales.void` (needed) | ✅ |
| Process refund | `payments.refund` (needed) | ✅ |
| View payments | `payments.view` (needed) | ❌ |
| EMI modification | `emi.edit` (needed) | ❌ |
| Price guide change | `exchange.manage_price_guide` (needed) | ✅ (audit table) |

### Inventory

| Operation | Required Permission | Audit Logged? |
|-----------|-------------------|:-------------:|
| Stock adjustment | `inventory.edit` | ✅ (audit table) |
| Stock transfer | `transfers.create` | ✅ |
| Mark sold | `sales.create` | ✅ |
| Delete inventory | `inventory.delete` | ❌ |

### Users

| Operation | Required Permission | Audit Logged? |
|-----------|-------------------|:-------------:|
| Create user | `users.create` | ❌ |
| Disable user | `users.delete` | ❌ |
| Change role | `users.edit` | ❌ |
| Change permissions | `settings.edit` | ❌ |
| Reset password | `settings.edit` | ❌ |

### Pricing

| Operation | Required Permission | Audit Logged? |
|-----------|-------------------|:-------------:|
| Modify price guide | `exchange.manage_price_guide` (needed) | ✅ |
| Override price | `exchange.update_price` (needed) | ✅ (audit table) |

---

## 7. Customer / Public Access

### Public Endpoints (no auth required)

- `POST /public/buyback/leads` — submit buyback lead
- `POST /public/buyback/estimate-price` — get buyback estimate
- `POST /public/buyback/leads/:id/photos` — upload buyback photos
- `GET /public/products` — product catalog
- `GET /public/products/:id` — product detail
- `GET /public/branches` — branch listing
- `GET /public/banners` — active banners
- `POST /auth/login` — admin login
- `POST /auth/register` — customer registration
- `POST /auth/send-otp` — OTP request
- `POST /auth/login-otp` — OTP login
- `POST /auth/refresh` — token refresh

### Customer Endpoints (JWT required, own data only)

- `GET /auth/me` — own profile
- `PATCH /auth/profile` — update own profile
- `POST /auth/change-password` — change own password

### IDOR Protection Status

| Endpoint | IDOR Protected? |
|----------|:--------------:|
| Customer → own profile | ✅ (JWT-derived) |
| Customer → own orders | ⚠️ Not verified |
| Customer → own buyback | ⚠️ Not verified |

---

## 8. Known Authorization Gaps (Priority-Ordered)

### CRITICAL

1. **No `sales.void` permission** — void is a sensitive financial operation but has no dedicated permission. Currently uses `sales.edit` which is too broad.
2. **No payment/refund permissions** — `payments.view` and `payments.refund` are not defined. Financial operations lack proper authorization.
3. **Missing branch scoping on most endpoints** — branch-scoped users can access cross-branch data by changing `branchId` in requests.
4. **User self-escalation not prevented** — no server-side check prevents a user from editing their own role or permissions.

### HIGH

5. **`settings.create` not in permission seed** — controller uses it for creating roles/branches but it's not seeded for any role except potentially through `shop_owner` having all actions.
6. **Missing module permissions** — `coupons`, `emi`, `gst`, `notifications`, `price_guide`, `accessories` are not in the permission seed.
7. **No audit logging for user management** — user creation, role changes, and permission changes are not audit-logged.
8. **List endpoints without auth** — `GET /admin/banners` and `GET /admin/pages` have no auth guard.

### MEDIUM

9. **Frontend permission mismatch** — sidebar maps permissions like `emi.view` but `emi` module is not in the permission seed.
10. **No ownership isolation on mutations** — admin users can edit/delete any record regardless of who created it.
11. **Password hash not excluded from some user queries** — `listUsers` may return password hashes if not careful.

### LOW

12. **Permission cache staleness** — 15-minute TTL means revoked permissions take up to 15 minutes to propagate.
13. **No rate limiting on admin endpoints** — only buyback estimate has rate limiting.

---

## 9. Security Decisions

| Decision | Rationale |
|----------|-----------|
| JWT access token: 1h | Balance between UX and security |
| Refresh token: 7d with rotation | Prevents long-lived stale tokens |
| bcrypt 12 rounds | Industry standard |
| 5-attempt lockout, 15min | Prevents brute force |
| Permission caching 15min | Reduce DB load, permissions rarely change |
| Public buyback estimate rate-limited | 30 requests/min per IP |
| No admin endpoint rate limiting | TODO — add in production hardening |

---

## 10. Change History

| Date | Change | Author |
|------|--------|--------|
| 2026-08-19 | Initial RBAC audit and documentation | Codebuff AI |
| 2026-08-19 | Removed DEBUG bypass from PermissionGuard | Codebuff AI |
| 2026-08-19 | Extended JWT expiry from 15m to 1h | Codebuff AI |
| 2026-08-19 | Added owner-only financial data protection | Codebuff AI |
| 2026-08-19 | Added permission-gated sidebar navigation | Codebuff AI |
