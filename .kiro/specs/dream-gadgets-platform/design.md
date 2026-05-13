# Design Document

## Overview

Dream Gadgets is implemented as a **modular NestJS monolith** for MVP (Phase 1), with a clear module boundary structure that allows extraction into microservices in Phase 2. The frontend is a Next.js monorepo with two apps: `web` (public e-commerce) and `admin` (internal ERP panel).

## Architecture

### High-Level Architecture (MVP)

```
┌─────────────────────────────────────────────────────┐
│              CLIENT LAYER                           │
│  Next.js Web (SSR/SSG)  │  Next.js Admin (CSR)      │
└──────────────┬──────────────────────────────────────┘
               │ HTTPS
┌──────────────▼──────────────────────────────────────┐
│         NestJS Monolith (Port 3000)                 │
│  JWT Auth Middleware │ Rate Limiting │ Helmet        │
│  ┌──────────────────────────────────────────────┐   │
│  │  Modules: Auth │ Inventory │ Order │ Client  │   │
│  │  Transfer │ Exchange │ Report │ Notification │   │
│  │  Payment │ Content │ Admin │ Public          │   │
│  └──────────────────────────────────────────────┘   │
│  BullMQ Workers │ Socket.io Gateway                 │
└──────────────┬──────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────┐
│              Data Layer                             │
│  PostgreSQL 16  │  Redis 7  │  AWS S3 / R2          │
└─────────────────────────────────────────────────────┘
```

### Project Structure

```
dream-gadgets/
  apps/
    api/                        # NestJS monolith
      src/
        modules/
          auth/
          inventory/
          order/
          client/
          transfer/
          exchange/
          payment/
          notification/
          report/
          content/
          admin/
          public/
        common/
          decorators/
          filters/
          guards/
          interceptors/
          pipes/
        config/
        database/
          migrations/
          seeds/
      test/
    web/                        # Next.js public website
      app/
        (public)/
        (auth)/
      components/
      lib/
      hooks/
      store/
      types/
    admin/                      # Next.js admin panel
      app/
        dashboard/
        purchases/
        sales/
        inventory/
        clients/
        transfers/
        exchange/
        orders/
        returns/
        reports/
        users/
        settings/
        content/
      components/
      lib/
      hooks/
      store/
      types/
  packages/
    shared-types/               # Shared TypeScript interfaces
    ui/                         # Shared shadcn/ui components
  docker-compose.yml
  package.json                  # Turborepo root
```

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | NestJS 10.x, TypeScript 5.x |
| Frontend | Next.js 14.x, React 18.x, shadcn/ui, Tailwind CSS |
| Database | PostgreSQL 16.x, TypeORM 0.3.x |
| Cache / Queue | Redis 7.x, BullMQ 5.x |
| Search | PostgreSQL full-text search (tsvector) — Elasticsearch deferred to Phase 2 |
| Realtime | Socket.io 4.x (NestJS Gateway) |
| Storage | AWS S3 / Cloudflare R2 |
| Payments | Razorpay |
| Auth | JWT + Refresh Tokens (bcrypt passwords) |
| PDF | Puppeteer + @react-pdf/renderer |
| Excel | ExcelJS |
| Frontend State | TanStack Query, Zustand, React Hook Form + Zod |
| Validation | class-validator + class-transformer |
| API Docs | Swagger (OpenAPI 3.0) |
| Testing | Jest + Supertest |
| Containerisation | Docker + Docker Compose |
| CI/CD | GitHub Actions |
| Monitoring | Prometheus + Grafana + Sentry |

## Data Models

### Core Entities (TypeORM)

#### User
```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true, nullable: true }) email: string;
  @Column({ unique: true }) phone: string;
  @Column() passwordHash: string;
  @Column() firstName: string;
  @Column({ nullable: true }) lastName: string;
  @ManyToOne(() => Role) role: Role;
  @ManyToOne(() => Branch) branch: Branch;
  @Column({ default: true }) isActive: boolean;
  @Column({ nullable: true }) lastLoginAt: Date;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
```

#### InventoryItem
```typescript
@Entity('inventory_items')
export class InventoryItem {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true, length: 15 }) imei: string;
  @Column({ nullable: true, length: 15 }) imei2: string;
  @ManyToOne(() => Brand) brand: Brand;
  @ManyToOne(() => Model) model: Model;
  @Column({ nullable: true }) colour: string;
  @Column({ nullable: true }) storage: string;
  @Column({ nullable: true }) ram: string;
  @Column() boxType: string; // with_box | without_box | accessories_only
  @Column({ nullable: true }) pkuCode: string;
  @Column({ nullable: true, type: 'smallint' }) batteryHealth: number;
  @Column({ nullable: true }) countryOfOrigin: string;
  @Column({ nullable: true }) hsnCode: string;
  @Column() condition: string; // sealed_pack | open_box | super_mint | mint | good
  @Column({ nullable: true }) itemName: string;
  @Column({ nullable: true }) firstInvoiceDate: Date;
  @Column('decimal', { precision: 12, scale: 2 }) purchasePrice: number;
  @Column('decimal', { precision: 12, scale: 2, nullable: true }) wholesalePrice: number;
  @Column('decimal', { precision: 12, scale: 2, nullable: true }) boxPrice: number;
  @Column('decimal', { precision: 5, scale: 2, default: 0 }) taxRate: number;
  @Column('decimal', { precision: 12, scale: 2, default: 0 }) taxAmount: number;
  @Column('decimal', { precision: 12, scale: 2 }) totalCost: number;
  @Column('decimal', { precision: 12, scale: 2, nullable: true }) sellingPrice: number;
  @Column('decimal', { precision: 12, scale: 2, nullable: true }) onlinePrice: number;
  @Column({ default: 'available' }) status: string;
  @Column({ default: false }) isOnline: boolean;
  @Column({ default: false }) birthdayOffer: boolean;
  @ManyToOne(() => Branch) branch: Branch;
  @ManyToOne(() => Purchase, { nullable: true }) purchase: Purchase;
  @Column({ nullable: true, type: 'text' }) notes: string;
  @Column({ nullable: true, type: 'jsonb' }) accessories: object;
  @Column({ nullable: true }) warrantyStatus: string;
  @Column({ nullable: true }) warrantyExpiry: Date;
  @ManyToOne(() => User) createdBy: User;
  @OneToMany(() => ItemPhoto, p => p.item) photos: ItemPhoto[];
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
```

#### Sale
```typescript
@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) invoiceNumber: string;
  @ManyToOne(() => Client, { nullable: true }) client: Client;
  @ManyToOne(() => Branch) branch: Branch;
  @Column('decimal', { precision: 12, scale: 2 }) subtotal: number;
  @Column('decimal', { precision: 12, scale: 2, default: 0 }) discountAmount: number;
  @Column('decimal', { precision: 12, scale: 2, default: 0 }) taxAmount: number;
  @Column('decimal', { precision: 12, scale: 2 }) totalAmount: number;
  @Column({ default: 'paid' }) paymentStatus: string;
  @Column({ default: 'in-store' }) saleType: string;
  @Column({ nullable: true, type: 'text' }) notes: string;
  @ManyToOne(() => User) createdBy: User;
  @Column({ type: 'timestamptz', default: () => 'NOW()' }) saleDate: Date;
  @OneToMany(() => SaleItem, i => i.sale) items: SaleItem[];
  @OneToMany(() => Payment, p => p.sale) payments: Payment[];
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
```

### Key Enums

```typescript
export enum ItemStatus {
  AVAILABLE = 'available',
  SOLD = 'sold',
  TRANSFERRED = 'transferred',
  RETURNED = 'returned',
  BOOKED = 'booked',
  SCRAPPED = 'scrapped',
  IN_CART = 'in_cart',
}

export enum ItemCondition {
  SEALED_PACK = 'sealed_pack',
  OPEN_BOX = 'open_box',
  SUPER_MINT = 'super_mint',
  MINT = 'mint',
  GOOD = 'good',
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  ONLINE = 'online',
  EXCHANGE = 'exchange',
  ADVANCE = 'advance',
  BAJAJ_EMI = 'bajaj_emi',
}

export enum TransferStatus {
  DRAFT = 'draft',
  INITIATED = 'initiated',
  IN_TRANSIT = 'in_transit',
  RECEIVED = 'received',
  REJECTED = 'rejected',
}

export enum OnlineOrderStatus {
  PENDING_PAYMENT = 'pending_payment',
  PAYMENT_CONFIRMED = 'payment_confirmed',
  PROCESSING = 'processing',
  PACKED = 'packed',
  SHIPPED = 'shipped',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  RETURN_REQUESTED = 'return_requested',
  RETURNED = 'returned',
}
```

## API Design

All endpoints are prefixed with `/api/v1`. Standard response envelope:

```typescript
// Success
{ "status": "success", "data": {...}, "meta": { "page": 1, "limit": 20, "total": 150 } }

// Error
{ "status": "error", "error": { "code": "IMEI_DUPLICATE", "message": "...", "details": {} } }
```

### Key Endpoint Groups

| Group | Base Path |
|---|---|
| Auth | `/auth` |
| Inventory | `/inventory` |
| Purchases | `/purchases` |
| Sales / POS | `/sales` |
| Clients | `/clients` |
| Transfers | `/transfers` |
| Exchanges | `/exchanges` |
| Online Orders | `/orders` |
| Public Website | `/public` |
| Reports | `/reports` |
| Admin / Settings | `/admin` |
| Webhooks | `/webhooks` |

### Auth Endpoints
```
POST /auth/login
POST /auth/refresh
POST /auth/logout
POST /auth/register
POST /auth/forgot-password
POST /auth/reset-password
GET  /auth/me
PATCH /auth/me
```

### Inventory Endpoints
```
GET    /inventory                     # List (paginated, filtered)
POST   /inventory                     # Create (purchase entry)
GET    /inventory/:id
PATCH  /inventory/:id
GET    /inventory/imei/:imei          # IMEI lookup
POST   /inventory/:id/photos
DELETE /inventory/:id/photos/:photoId
PATCH  /inventory/:id/toggle-online
POST   /inventory/bulk-import
GET    /inventory/price-suggestion    # ?modelId=&condition=
```

### Sales Endpoints
```
GET    /sales
POST   /sales
GET    /sales/:id
GET    /sales/:id/invoice             # A4 PDF
GET    /sales/:id/invoice/thermal     # Thermal PDF
POST   /sales/:id/invoice/email
POST   /sales/:id/invoice/whatsapp
POST   /sales/:id/void
POST   /sales/:id/return
```

### Public Website Endpoints
```
GET  /public/products                 # SSR product listing
GET  /public/products/:slug           # Product detail
GET  /public/brands
GET  /public/search
GET  /public/banners
GET  /public/offers
POST /public/cart/checkout
POST /public/orders
GET  /public/orders/:id               # Order tracking
GET  /inventory/city-stock            # ?model_id= → [{branch, city, count, available}]
```

## Key Business Logic

### IMEI Validation (Luhn Algorithm)
```typescript
export function validateIMEI(imei: string): boolean {
  if (!/^\d{15}$/.test(imei)) return false;
  let sum = 0;
  for (let i = 0; i < 15; i++) {
    let digit = parseInt(imei[i]);
    if (i % 2 === 1) { digit *= 2; if (digit > 9) digit -= 9; }
    sum += digit;
  }
  return sum % 10 === 0;
}
```

### Exchange Price Calculation
```typescript
export function calculateExchangePrice(
  basePrice: number,
  batteryHealth: number,
  monthsSinceFirstInvoice: number,
): number {
  const batteryFactor = batteryHealth >= 80 ? 1.0 : batteryHealth >= 60 ? 0.85 : 0.70;
  const ageFactor = monthsSinceFirstInvoice <= 12 ? 1.0 : monthsSinceFirstInvoice <= 24 ? 0.80 : 0.65;
  return Math.round(basePrice * batteryFactor * ageFactor);
}
```

### GST Calculation
```typescript
export function calculateGST(
  amount: number,
  taxRate: number,
  isInterState: boolean,
): { cgst: number; sgst: number; igst: number; total: number } {
  const taxAmount = (amount * taxRate) / 100;
  if (isInterState) {
    return { cgst: 0, sgst: 0, igst: taxAmount, total: taxAmount };
  }
  return { cgst: taxAmount / 2, sgst: taxAmount / 2, igst: 0, total: taxAmount };
}
```

### Invoice Number Generation
```typescript
// Atomic sequence per branch using PostgreSQL sequence
// Format: {PREFIX}-{BRANCH_CODE}-{YEAR}-{SEQ}
// e.g., DG-MUM-2025-00001
```

### Payment Split Validation
```typescript
export function validatePaymentSplits(splits: PaymentSplit[], total: number): boolean {
  const sum = splits.reduce((acc, s) => acc + s.amount, 0);
  return Math.abs(sum - total) < 0.01; // allow for floating point rounding
}
```

### Warranty Calculation
```typescript
export function calculateWarrantyExpiry(
  firstInvoiceDate: Date,
  condition: ItemCondition,
): Date | null {
  const months = condition === ItemCondition.SEALED_PACK ? 12
    : (condition === ItemCondition.OPEN_BOX || condition === ItemCondition.SUPER_MINT) ? 6
    : null;
  if (!months) return null;
  return addMonths(firstInvoiceDate, months);
}
```

### Discount Authorization
```typescript
export function getRequiredDiscountRole(discountPercent: number): string {
  if (discountPercent <= 5) return 'sales';
  if (discountPercent <= 15) return 'manager';
  return 'owner';
}
```

### Return Approval Threshold
```typescript
export function getRequiredReturnRole(returnAmount: number): string {
  if (returnAmount < 5000) return 'any';
  if (returnAmount <= 25000) return 'manager';
  return 'owner';
}
```

## Authentication & Authorization Design

### JWT Payload
```typescript
interface JwtPayload {
  sub: string;        // userId
  email: string;
  role: string;
  permissions: string[]; // ['inventory.view', 'sales.create', ...]
  branchId: string | null; // null = all branches (owner)
  iat: number;
  exp: number;
}
```

### Permission Guard
```typescript
@Injectable()
export class PermissionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.get<string>('permission', context.getHandler());
    const user = context.switchToHttp().getRequest().user;
    return !required || user.permissions.includes(required);
  }
}
```

### Branch Filter Interceptor
All list queries for non-owner roles automatically receive a `branchId` filter injected by the API layer.

## Realtime System Design

### Socket.io Rooms
- `branch:{branchId}` — branch-specific events
- `user:{userId}` — personal notifications
- `admin` — owner-level events

### Event Catalog
| Event | Trigger | Consumers |
|---|---|---|
| `sale.created` | Sale completed | Dashboard, POS |
| `inventory.updated` | Item status changed | Inventory list |
| `inventory.locked` | Item added to POS cart | Other POS terminals |
| `order.status_changed` | Online order updated | Order management |
| `transfer.received` | Transfer confirmed | Transfer list |
| `notification.new` | Any notification | Notification bell |
| `dashboard.refresh` | KPI change | Dashboard |
| `payment.confirmed` | Razorpay webhook | Order management |

### POS Item Soft-Lock
When an item is added to a POS bill, its status is set to `in_cart` with a 15-minute TTL stored in Redis (`pos:lock:{itemId}`). A maintenance job cleans up expired locks every 5 minutes.

## Background Jobs (BullMQ)

### Queue Definitions
| Queue | Jobs |
|---|---|
| `notification` | send-email, send-whatsapp, send-sms, send-push |
| `invoice` | generate-pdf, email-invoice |
| `search` | index-item, remove-item, bulk-reindex |
| `report` | daily-sales-report (cron), weekly-report (cron), monthly-gst-report (cron), stock-aging-alert (cron) |
| `payment` | verify-payment, process-refund, reconcile-payments |
| `maintenance` | cleanup-expired-locks (every 5min), cleanup-old-sessions (daily), birthday-offers (daily 8AM), flash-sale-start/end (scheduled) |

## File Storage Design

### Upload Flow
1. Client requests presigned S3 PUT URL from API
2. Client uploads directly to S3 (bypasses server)
3. S3 event triggers image processing (Sharp: WebP, quality 80, max 1200×1200, 200×200 thumbnail)
4. S3 key stored in `item_photos` table
5. CDN URL returned to client

### Bucket Structure
```
dream-gadgets-storage/
  inventory/{itemId}/original/ compressed/ thumbnails/
  kyc/{clientId}/
  invoices/{year}/{month}/
  reports/{year}/{month}/
  banners/
  exports/temp/   (TTL: 24h)
```

## Caching Strategy

| Data | Cache Key | TTL |
|---|---|---|
| User permissions | `perms:{userId}` | 5 min |
| Branch settings | `settings:{branchId}` | 10 min |
| Product listing | `products:{filters_hash}` | 2 min |
| Dashboard KPIs | `dashboard:{branchId}:{date}` | 60 sec |
| Brand/Model master | `brands:all` | 1 hour |
| Exchange price guide | `exchange:prices:{modelId}` | 30 min |

## Correctness Properties

### Property 1: IMEI Uniqueness
Every inventory item must have a unique IMEI. No two items in the system can share the same IMEI.

**Validates: Requirements 2.1, 2.2**

```typescript
// Property: forAll(imei) => at most one inventory item exists with that IMEI
// Test: generate random valid IMEIs, attempt to insert duplicates, verify rejection
```

### Property 2: Payment Split Completeness
For any completed sale, the sum of all payment splits must equal the sale total amount.

**Validates: Requirements 3.2**

```typescript
// Property: forAll(sale) => sum(sale.payments.map(p => p.amount)) === sale.totalAmount
// Test: generate random sales with random splits, verify sum invariant
```

### Property 3: IMEI Luhn Validity
Every IMEI stored in the system must pass the Luhn algorithm check.

**Validates: Requirements 2.2, 16.2**

```typescript
// Property: forAll(item in inventory) => validateIMEI(item.imei) === true
```

### Property 4: Exchange Price Bounds
The calculated exchange price must always be between 0 and the base market price (inclusive).

**Validates: Requirements 6.1**

```typescript
// Property: forAll(basePrice >= 0, batteryHealth in [0,100], months >= 0)
//   => 0 <= calculateExchangePrice(basePrice, batteryHealth, months) <= basePrice
```

### Property 5: GST Calculation Consistency
For any sale, CGST + SGST + IGST must equal the total tax amount, and either (CGST > 0 AND SGST > 0 AND IGST === 0) for intra-state, or (CGST === 0 AND SGST === 0 AND IGST > 0) for inter-state.

**Validates: Requirements 3.1**

```typescript
// Property: forAll(amount, taxRate, isInterState)
//   => cgst + sgst + igst === totalTax
//   AND (isInterState ? igst > 0 && cgst === 0 && sgst === 0
//                     : cgst > 0 && sgst > 0 && igst === 0)
```

### Property 6: Item Status State Machine
An inventory item's status can only transition through valid states. Invalid transitions must be rejected.

**Validates: Requirements 4.4**

```typescript
// Valid transitions:
// available → sold | booked | transferred | in_cart | scrapped
// booked → sold | available
// in_cart → available | sold
// transferred → available (at destination)
// sold → returned
// returned → available | scrapped
// Property: forAll(item, newStatus) => if transition is invalid, system rejects it
```

### Property 7: Discount Authorization Monotonicity
A higher discount percentage always requires an equal or higher authorization level.

**Validates: Requirements 3.4**

```typescript
// Property: forAll(d1, d2 where d1 < d2)
//   => authLevel(d1) <= authLevel(d2)
// where authLevel: sales=0, manager=1, owner=2
```

### Property 8: Return Window Enforcement
A return cannot be processed after the configured return window has expired without manager override.

**Validates: Requirements 9.1**

```typescript
// Property: forAll(sale, returnRequest)
//   => if daysSince(sale.saleDate) > returnWindowDays AND !hasManagerOverride
//      => return is rejected
```

## Testing Strategy

- **Unit tests**: Jest for all business logic functions (IMEI validation, exchange price, GST, payment splits, state machine)
- **Integration tests**: Supertest for API endpoints with a test PostgreSQL database
- **Property-based tests**: fast-check for the correctness properties listed above
- **E2E tests**: Playwright for critical user flows (POS sale, online order, stock transfer)

Testing framework: **Jest** with **fast-check** for property-based testing.
