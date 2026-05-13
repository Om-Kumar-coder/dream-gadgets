# Dream Gadgets — System Architecture Blueprint

> Version: 1.0.0 | Status: Production Blueprint | Classification: Internal Technical Reference

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Overall Architecture](#2-overall-architecture)
3. [Tech Stack](#3-tech-stack)
4. [Modules & Features](#4-modules--features)
5. [Frontend Architecture](#5-frontend-architecture)
6. [Backend Architecture](#6-backend-architecture)
7. [Database Schema](#7-database-schema)
8. [API Design](#8-api-design)
9. [Authentication & Authorization](#9-authentication--authorization)
10. [Realtime System](#10-realtime-system)
11. [Background Jobs](#11-background-jobs)
12. [File Storage Strategy](#12-file-storage-strategy)
13. [Payment Integration](#13-payment-integration)
14. [Search & Filtering](#14-search--filtering)
15. [Notification System](#15-notification-system)
16. [Reports & Exports](#16-reports--exports)
17. [Security](#17-security)
18. [Scaling Strategy](#18-scaling-strategy)
19. [Gap Analysis & Critical Findings](#19-gap-analysis--critical-findings)
20. [Deployment Architecture](#20-deployment-architecture)
21. [Dependencies](#21-dependencies)

---

## 1. Executive Summary

Dream Gadgets is a full-stack, multi-branch mobile store management platform combining:
- An internal ERP for purchase, sales, inventory, exchange, and returns
- A public-facing e-commerce website for certified used phones
- A backend admin panel for operations, content, and configuration

The system is designed for multi-branch retail operations with real-time inventory sync, GST-compliant billing, IMEI-level traceability, and a customer-facing online store with Razorpay payments.

**Scale targets (initial):**
- 5–20 branches
- 10,000–100,000 inventory items
- 500–5,000 daily transactions
- 50,000–500,000 registered customers

---

## 2. Overall Architecture

### 2.1 Architecture Pattern

Microservices with an API Gateway. Each domain is an independently deployable NestJS service. Services communicate via REST (synchronous) and BullMQ/Redis (asynchronous events).

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│  Next.js Public Website │ Next.js Admin Panel │ Mobile PWA      │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS
┌────────────────────────────▼────────────────────────────────────┐
│                      API GATEWAY (NestJS)                       │
│  Rate Limiting │ Auth Middleware │ Request Routing │ Logging     │
└──┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬────────────┘
   │      │      │      │      │      │      │      │
   ▼      ▼      ▼      ▼      ▼      ▼      ▼      ▼
 Auth  Inventory Order  Payment Notify Report Transfer Exchange
 Svc    Svc      Svc    Svc     Svc    Svc    Svc     Svc
   │      │      │      │      │      │      │      │
   └──────┴──────┴──────┴──────┴──────┴──────┴──────┘
                         │
              ┌──────────▼──────────┐
              │   Shared Services   │
              │  PostgreSQL │ Redis  │
              │  Elasticsearch      │
              │  S3 / Object Store  │
              └─────────────────────┘
```

### 2.2 Service Inventory

| Service | Responsibility | Port |
|---|---|---|
| api-gateway | Routing, auth validation, rate limiting | 3000 |
| auth-service | JWT, sessions, RBAC, user management | 3001 |
| inventory-service | Items, IMEI, stock, transfers | 3002 |
| order-service | Sales, POS, purchase, returns | 3003 |
| payment-service | Razorpay, payment splits, reconciliation | 3004 |
| notification-service | Email, WhatsApp, push, SMS | 3005 |
| report-service | Analytics, exports, dashboards | 3006 |
| exchange-service | Device exchange, KYC, valuation | 3007 |
| client-service | Customer profiles, EKYC, history | 3008 |
| content-service | Banners, SEO, pages, offers | 3009 |

### 2.3 Inter-Service Communication

- **Synchronous**: REST via internal HTTP (service mesh or direct)
- **Asynchronous**: BullMQ queues on Redis for events (sale created → notify, inventory updated → search index)
- **Realtime**: Socket.io gateway on api-gateway, broadcasting to connected clients


---

## 3. Tech Stack

### 3.1 Full Stack Breakdown

| Layer | Technology | Version | Justification |
|---|---|---|---|
| Backend Framework | NestJS (Node.js) | 10.x | Modular, decorator-based, built-in DI, TypeScript-first, ideal for microservices |
| Language | TypeScript | 5.x | Type safety, better DX, compile-time error catching |
| Frontend Framework | Next.js | 14.x | SSR/SSG for SEO, App Router, React Server Components |
| UI Library | React | 18.x | Component model, ecosystem, concurrent features |
| UI Components | shadcn/ui + Tailwind CSS | latest | Accessible, customizable, utility-first styling |
| Primary Database | PostgreSQL | 16.x | ACID compliance, JSON support, full-text search, GST reporting |
| ORM | TypeORM | 0.3.x | NestJS native integration, migrations, entity decorators |
| Cache | Redis | 7.x | Session store, rate limiting, queue backend, hot data cache |
| Queue | BullMQ | 5.x | Redis-backed, reliable job processing, retries, priorities |
| Search | Elasticsearch | 8.x | IMEI search, full-text product search, faceted filtering |
| Realtime | Socket.io (NestJS Gateway) | 4.x | WebSocket with fallback, rooms, namespaces |
| File Storage | AWS S3 / Cloudflare R2 | — | Scalable object storage, CDN-ready, presigned URLs |
| Payments | Razorpay | latest | India-first, UPI/Card/EMI/Bajaj support, webhook-based |
| Auth | JWT + Refresh Tokens | — | Stateless, scalable, RBAC-compatible |
| Email | Nodemailer + SMTP / SendGrid | — | Transactional email, invoice delivery |
| WhatsApp | WhatsApp Business API / Twilio | — | Order updates, invoice sharing |
| PDF Generation | Puppeteer / @react-pdf/renderer | — | A4 and thermal 80mm invoice rendering |
| Barcode/QR | zxing / jsbarcode | — | IMEI scanning, label printing |
| Excel Export | ExcelJS | — | GST reports, stock reports |
| Validation | class-validator + class-transformer | — | DTO validation in NestJS |
| API Docs | Swagger (OpenAPI 3.0) | — | Auto-generated from NestJS decorators |
| Testing | Jest + Supertest | — | Unit, integration, e2e |
| Containerization | Docker + Docker Compose | — | Dev parity, service isolation |
| Orchestration | Kubernetes (K8s) | — | Production scaling, rolling deploys |
| CI/CD | GitHub Actions | — | Automated test, build, deploy pipeline |
| Monitoring | Prometheus + Grafana | — | Metrics, dashboards, alerting |
| Logging | Winston + ELK Stack | — | Structured logs, centralized search |
| APM | Sentry | — | Error tracking, performance monitoring |
| CDN | Cloudflare | — | Static assets, DDoS protection, edge caching |

### 3.2 Frontend State Management

| Concern | Solution |
|---|---|
| Server state / API data | TanStack Query (React Query) |
| Global UI state | Zustand |
| Forms | React Hook Form + Zod |
| Tables | TanStack Table |
| Charts | Recharts / Chart.js |
| Date handling | date-fns |
| Currency/number formatting | Intl API + custom formatters |

---

## 4. Modules & Features

### 4.A Purchase Entry Module

**Purpose**: Record every device purchased from vendors or customers with full traceability.

**Core Fields:**
- IMEI (primary identifier, unique enforced at DB + application level)
- Brand (master data lookup)
- Model (linked to brand, master data)
- Item Name (auto-generated: `{Model} — {Storage} — {RAM} — {Colour}`, editable)
- Box Type: With Box / Without Box / Accessories Only
- Colour
- Storage (16GB, 32GB, 64GB, 128GB, 256GB, 512GB, 1TB)
- RAM
- PKU Code (internal product key unit)
- Battery Health (0–100%, validated range)
- Country of Origin (India, USA, Japan, etc.)
- Birthday Offer Flag (boolean, triggers discount eligibility)
- HSN Code (GST compliance, master data)
- First Invoice Date* (original purchase date — used for warranty tracking and resale value)
- Condition: Sealed Pack / Open Box / Super Mint / Mint / Good (standardized client values, used for label printing and filtering)
- Purchase Price (ex-tax)
- Wholesale Price (for dealer/bulk sales)
- Box Price (price when sold with box)
- Sale Price (standard retail price)
- Tax Rate (GST %, linked to HSN)
- Tax Amount (computed)
- Total Purchase Price (computed)
- Vendor/Supplier (linked to client/vendor entity)
- Purchase Date
- Invoice Number (vendor invoice)
- Branch (multi-branch support)
- Status: Available / Sold / Transferred / Returned / Booked / Scrapped
- Notes / Remarks
- Photos (multi-image, up to 10)
- Warranty Status & Expiry
- Accessories included (charger, earphones, case — checklist)

**Sub-features:**
- Bulk CSV import for purchase entries
- Auto price suggestion based on model + condition + market data
- IMEI duplicate detection with alert
- Barcode/QR scan for IMEI input
- Print purchase label (condition + IMEI + price)
- Purchase return linkage
- Audit trail (who entered, when, last modified)

### 4.B Sales / POS Billing Module

**Purpose**: Point-of-sale billing with flexible payment splits and invoice generation.

**Core Features:**
- Search items by IMEI, model, brand, PKU code
- Add multiple items to a single bill
- Customer selection or quick-add
- Payment split support:
  - Cash
  - Card (POS terminal reference)
  - Online (UPI/NEFT/IMPS — reference number)
  - Exchange (device trade-in value deducted)
  - Advance (pre-collected deposit)
  - Bajaj EMI (EMI plan selection, tenure, down payment)
  - Multiple splits in one transaction (e.g., 50% cash + 50% card)
- Discount application (flat / percentage, with authorization level)
- GST calculation (CGST + SGST for intra-state, IGST for inter-state)
- Invoice generation:
  - A4 PDF (full GST invoice)
  - Thermal 80mm PDF (receipt format)
  - Email invoice to customer
  - WhatsApp invoice share
- Invoice numbering: customizable prefix + auto-increment + branch code
- Booked item management (advance booking with partial payment)
- Sales hold / park bill
- Void / cancel sale (with authorization)
- Reprint invoice
- Daily cash drawer reconciliation

### 4.C Dashboard Module

**Purpose**: Real-time KPI visibility for owners and managers.

**KPI Cards:**
- Today's Sales (count + value)
- Today's Purchases (count + value)
- Net Income (sales - purchases - returns)
- Active Stock (count + value)
- Booked Items (count + value)
- Pending Returns
- New Clients Today
- Online Orders (pending / shipped)

**Charts & Graphs:**
- Sales trend (7d / 30d / 90d / custom range) — line chart
- Purchase vs Sales comparison — bar chart
- Top selling brands/models — horizontal bar
- Payment method breakdown — pie chart
- Stock aging distribution — histogram
- Branch-wise performance — grouped bar (multi-branch)
- Employee sales leaderboard — ranked list
- GST liability summary — table

**Filters:**
- Date range picker
- Branch selector
- Employee filter

### 4.D Client Management Module

**Purpose**: Full customer lifecycle management.

**Profile Fields:**
- First Name + Last Name (separate fields — maps directly to client form)
- Phone (primary + alternate)
- Email
- Gender (Male / Female / Other)
- Date of Birth (birthday offer trigger)
- Status: Active / Inactive
- Address (street, city, district, state, pincode)
- ID Proof Type + Number (Aadhaar, PAN, Voter ID, Passport)
- EKYC status (verified / pending / rejected)
- Customer type (Walk-in, Online, Corporate, Dealer)
- Assigned branch
- Tags / Labels
- Notes

**EKYC Flow:**
- Upload ID proof front + back
- Selfie capture (optional)
- Manual verification by staff
- Status tracking

**History & Actions:**
- Full purchase history (with invoice links)
- Full sales history
- Exchange history
- Return history
- Outstanding advance/booking amounts
- Print any past invoice
- Initiate return from sale history
- Send email (template-based)
- WhatsApp message
- Birthday offer flag auto-trigger

### 4.E Item Management Module

**Purpose**: Full inventory visibility and control.

**Views & Filters:**
- All items (paginated, sortable)
- No Box filter
- Condition filter (Sealed Pack / Open Box / Super Mint / Mint / Good)
- Status filter (Available / Sold / Booked / Transferred / Returned)
- Brand / Model filter
- Price range filter
- Branch filter
- Online listing toggle (show/hide on website)
- Active / Inactive toggle

**Item Actions:**
- Edit item details
- Add/replace photos (multi-image, drag-and-drop, auto-compress)
- Print condition label
- Print IMEI barcode label
- Transfer to another branch
- Mark as scrapped
- View full history (purchase → sales → returns)
- Toggle online listing
- Set online price (can differ from in-store price)

### 4.F Stock Transfer Module

**Purpose**: Move inventory between branches with full audit trail.

**Transfer States:**
- Draft → Initiated → In Transit → Received / Rejected

**Views:**
- Own Item List — items currently owned by this branch (available stock)
- Transfer Item List — outgoing transfers initiated by this branch
- Items Waiting to Receive — incoming transfers pending confirmation
- Received Item List — completed inbound transfers
- Transfer History — full log of all transfers (in + out)

**Features:**
- Create transfer request (select items by IMEI or batch)
- Assign source and destination branch
- Transfer note / reason
- Receiving branch confirms receipt item by item
- Partial receipt support
- Rejection with reason (item mismatch, damage)
- Transfer history with full audit
- Multi-branch dashboard view
- Pending transfers alert
- Print transfer manifest

### 4.G Exchange Module

**Purpose**: Accept customer device as trade-in against a new purchase.

**Flow:**
1. Customer brings device
2. Staff creates exchange entry:
   - Customer KYC (link to client profile or create new)
   - Device details: Brand, Model, IMEI, Condition, Storage, Colour
   - Condition assessment checklist (screen, body, battery, buttons, camera)
   - Battery health reading
   - Photos of exchanged device
3. Exchange price offered (manual or auto-suggested)
4. Customer accepts → exchange linked to sales invoice
5. Exchanged device added to inventory as purchase entry (condition: refurbished)
6. Exchange value deducted from sale total as payment split

**Additional:**
- Exchange price history per model (market rate tracking)
- Exchange report (monthly volume, average value)
- EKYC mandatory for exchange above threshold amount

### 4.H Online Order Module

**Purpose**: Manage orders placed through the public website.

**Order States:**
- Pending Payment → Payment Confirmed → Processing → Packed → Shipped → Out for Delivery → Delivered → Cancelled → Return Requested → Returned

**Features:**
- Order list with status filters
- Order detail view (items, customer, payment, shipping)
- Assign order to branch/staff
- Update tracking number (manual or courier API)
- Print packing slip
- Print shipping label
- Send order update via WhatsApp / Email
- Cancel order with reason + auto-refund trigger
- Return request processing
- COD order management
- Bulk status update

### 4.I User & Employee Management

**Purpose**: Role-based access control for all staff.

**Built-in Roles:**
| Role | Access Level |
|---|---|
| Shop Owner | Full access, all branches |
| Store Manager | Full access, assigned branch |
| Shop Sales | POS, inventory view, client lookup |
| Store Sales | Same as Shop Sales |
| Calling Staff | Client management, order updates, no billing |
| Employee | Limited, configurable |
| Custom Role | Fully configurable permissions |

**Permission Matrix (per module):**
- View / Create / Edit / Delete / Export / Approve

**Features:**
- Create/edit/deactivate employees
- Assign branch(es)
- Set working hours / shift (optional)
- Employee sales performance tracking
- Login activity log
- Password reset by admin
- Two-factor authentication (optional, per role)
- Custom role builder (drag-and-drop permission assignment)

### 4.J Online Website Features

**Public Pages:**
- Homepage: Hero banner, featured categories, latest gadgets, flash sale timer, testimonials
- Product Listing: Filters (brand, model, price, condition, storage, colour), sort, pagination
- Product Detail: Multi-image gallery, specs, condition report, IMEI (partial), EMI calculator, Add to Cart, WhatsApp inquiry
- Certified Used Phones: Dedicated section with quality badge
- Cart: Item list, quantity (1 per IMEI item), coupon code, order summary
- Checkout: Address, payment method selection, Razorpay integration
- Order Confirmation: Order ID, summary, WhatsApp notification
- My Account: Orders, profile, addresses, wishlist
- About / Contact / Policies: CMS-managed pages
- City/Store Stock: Show which branch has which item in stock
  - API: `GET /inventory/city-stock?model_id={id}` → returns array of `{ branch, city, count, available }`
  - UI: Branch availability chips on product detail page
  - Filter: Customer can filter product listing by city/branch
- Flash Sale: Countdown timer, limited stock badge
- Similar Products: Recommendation engine (same brand/model/price range)
- EMI Calculator: Interactive, Bajaj/bank EMI options
- WhatsApp Chat: Floating button, pre-filled message

**SEO Features:**
- Dynamic meta tags per product
- Structured data (JSON-LD) for products
- Sitemap generation
- Canonical URLs
- Open Graph tags for social sharing

### 4.K Sales Return Module

**Purpose**: Process returns for sold items.

**Flow:**
1. Search by IMEI or invoice number
2. View original sale details
3. Select items to return (partial return supported)
4. Reason for return (defective, customer changed mind, wrong item)
5. Condition check on returned item
6. Refund method selection (original payment method / store credit / cash)
7. Auto-adjust inventory (item status → Available or Scrapped)
8. Generate return invoice / credit note
9. Update customer account

**Rules:**
- Return window configurable (default 7 days)
- Manager approval required above threshold
- Razorpay refund API triggered for online payments

### 4.L Purchase Return Module

**Purpose**: Return purchased items to vendors.

**Flow:**
1. Search by IMEI or purchase invoice
2. View purchase details
3. Select items to return
4. Reason (defective, wrong model, overstock)
5. Update inventory (remove item)
6. Update accounts (debit vendor)
7. Generate purchase return note

### 4.M Logs & Reports Module

**Report Types:**
| Report | Frequency | Format |
|---|---|---|
| Daily Sales Summary | Daily | PDF + Excel |
| Weekly Sales Report | Weekly | Excel |
| Monthly Sales Report | Monthly | PDF + Excel |
| Purchase Report | On-demand | Excel |
| GST Report (GSTR-1 format) | Monthly | Excel |
| Stock Aging Report | On-demand | Excel |
| Customer Report | On-demand | Excel |
| Employee Sales Report | Daily/Monthly | Excel |
| Exchange Report | Monthly | Excel |
| Return Report | Monthly | Excel |
| Inventory Valuation | On-demand | Excel |
| Branch-wise P&L | Monthly | PDF |

**Features:**
- Date range selection
- Branch filter
- Employee filter
- Scheduled email delivery (daily/weekly reports)
- Export to Excel (ExcelJS)
- Export to PDF (Puppeteer)
- Report history (last 90 days stored)


---

## 5. Frontend Architecture

### 5.1 Project Structure

```
apps/
  web/                          # Public-facing Next.js website
    app/
      (public)/
        page.tsx                # Homepage
        products/
          page.tsx              # Product listing
          [slug]/page.tsx       # Product detail
        cart/page.tsx
        checkout/page.tsx
        orders/page.tsx
        account/page.tsx
        about/page.tsx
        contact/page.tsx
      (auth)/
        login/page.tsx
        register/page.tsx
      api/                      # Next.js API routes (BFF layer)
    components/
      ui/                       # shadcn/ui base components
      layout/                   # Header, Footer, Nav
      product/                  # ProductCard, ProductGallery, EMICalc
      cart/                     # CartDrawer, CartItem
      checkout/                 # CheckoutForm, PaymentSelector
      common/                   # SearchBar, Filters, Pagination
    lib/
      api.ts                    # API client (axios/fetch wrapper)
      auth.ts                   # Auth helpers
      utils.ts
    hooks/                      # Custom React hooks
    store/                      # Zustand stores
    types/                      # TypeScript interfaces

  admin/                        # Internal admin panel (Next.js)
    app/
      dashboard/page.tsx
      purchases/
        page.tsx
        new/page.tsx
        [id]/page.tsx
      sales/
        page.tsx
        pos/page.tsx
        [id]/page.tsx
      inventory/page.tsx
      clients/
        page.tsx
        [id]/page.tsx
      transfers/page.tsx
      exchange/page.tsx
      orders/page.tsx
      returns/
        sales/page.tsx
        purchases/page.tsx
      reports/page.tsx
      users/page.tsx
      settings/
        page.tsx
        roles/page.tsx
        branches/page.tsx
        taxes/page.tsx
        invoice/page.tsx
        notifications/page.tsx
      content/
        banners/page.tsx
        pages/page.tsx
        offers/page.tsx
        seo/page.tsx
    components/
      layout/                   # AdminSidebar, AdminHeader, Breadcrumb
      forms/                    # PurchaseForm, SalesForm, ClientForm
      tables/                   # DataTable with TanStack Table
      charts/                   # Dashboard charts (Recharts)
      pos/                      # POS terminal components
      invoice/                  # InvoicePreview, InvoicePrint
    lib/
    hooks/
    store/
    types/
```

### 5.2 Routing Strategy

- **Public website**: Next.js App Router with SSR for product pages (SEO), SSG for static pages
- **Admin panel**: Client-side rendering with route guards (auth middleware)
- **Protected routes**: Middleware checks JWT validity and role permissions before rendering

### 5.3 State Management

| State Type | Tool | Usage |
|---|---|---|
| Server/API data | TanStack Query | All API calls, caching, background refetch |
| Auth state | Zustand + localStorage | User session, role, permissions |
| Cart state | Zustand + localStorage | Cart items, totals |
| POS state | Zustand | Active bill, payment splits, selected items |
| UI state | React useState/useReducer | Modals, drawers, form state |
| Form state | React Hook Form | All forms with Zod validation |

### 5.4 Key Components

**POS Terminal (admin/components/pos/):**
- `ItemSearch` — real-time IMEI/model search with debounce
- `BillItems` — line items with quantity and price
- `PaymentSplitter` — multi-method payment allocation
- `CustomerSelector` — search/create customer inline
- `InvoicePreview` — live preview before print
- `BillActions` — hold, void, complete, print

**Product Detail Page (web/components/product/):**
- `ImageGallery` — multi-image with zoom
- `ConditionBadge` — visual condition indicator
- `EMICalculator` — interactive EMI breakdown
- `StockIndicator` — branch-wise availability
- `SimilarProducts` — recommendation carousel

### 5.5 Performance Optimizations

- Next.js Image component for all product images (WebP, lazy load, blur placeholder)
- React Query stale-while-revalidate for dashboard data
- Virtual scrolling for large inventory lists (TanStack Virtual)
- Code splitting per route (automatic with App Router)
- Service Worker for PWA offline support
- Prefetching on hover for product links

---

## 6. Backend Architecture

### 6.1 NestJS Service Structure (per service)

```
src/
  modules/
    [domain]/
      [domain].module.ts
      [domain].controller.ts
      [domain].service.ts
      [domain].repository.ts
      dto/
        create-[domain].dto.ts
        update-[domain].dto.ts
        query-[domain].dto.ts
      entities/
        [domain].entity.ts
      guards/
        [domain]-permission.guard.ts
      events/
        [domain].events.ts
  common/
    decorators/
    filters/
    guards/
    interceptors/
    pipes/
    middleware/
  config/
  database/
    migrations/
    seeds/
```

### 6.2 API Gateway

Responsibilities:
- JWT validation (verify signature, expiry)
- Role/permission extraction from token
- Request routing to downstream services
- Rate limiting (per IP, per user)
- Request/response logging
- CORS handling
- Request ID injection (for distributed tracing)
- Circuit breaker (fail fast if downstream is down)

### 6.3 Auth Service

**Endpoints:**
- `POST /auth/login` — email/phone + password → JWT + refresh token
- `POST /auth/refresh` — refresh token → new JWT
- `POST /auth/logout` — invalidate refresh token
- `POST /auth/register` — customer self-registration (website)
- `POST /auth/forgot-password` — send reset link
- `POST /auth/reset-password` — apply new password
- `GET /auth/me` — current user profile

**Token Strategy:**
- Access token: 15 minutes expiry, contains userId, role, permissions, branchId
- Refresh token: 7 days expiry, stored in Redis with userId mapping
- Token rotation on refresh
- Refresh token family tracking (detect reuse attacks)

### 6.4 Inventory Service

**Core entities:** InventoryItem, Brand, Model, Category

**Key business logic:**
- IMEI uniqueness check (DB unique constraint + application-level pre-check)
- Status state machine: Available → Sold/Booked/Transferred/Returned/Scrapped
- Auto price suggestion: query historical sales for same model+condition, return median
- Online listing sync: when toggled, push to Elasticsearch index
- Photo management: generate presigned S3 URLs, store references

### 6.5 Order Service

**Sub-modules:** Sales, Purchases, SalesReturn, PurchaseReturn

**Key business logic:**
- Invoice number generation: `{PREFIX}-{BRANCH}-{YEAR}-{SEQ}` (atomic sequence per branch)
- Payment split validation: sum of splits must equal total amount
- GST calculation: determine CGST/SGST vs IGST based on buyer/seller state
- Inventory status update on sale completion (Available → Sold)
- Booking flow: partial payment → status Booked → full payment → Sold
- Return window enforcement: check sale date vs return date

### 6.6 Payment Service

**Responsibilities:**
- Create Razorpay orders
- Verify payment signatures
- Record payment splits
- Trigger refunds
- Reconciliation reports
- Bajaj EMI plan management

### 6.7 Common Patterns

**DTOs with validation:**
```typescript
export class CreatePurchaseDto {
  @IsString()
  @Length(15, 15)
  @Matches(/^\d{15}$/)
  imei: string;

  @IsUUID()
  brandId: string;

  @IsUUID()
  modelId: string;

  @IsEnum(BoxType)
  boxType: BoxType;

  @IsInt()
  @Min(0)
  @Max(100)
  batteryHealth: number;

  @IsDecimal()
  @Min(0)
  purchasePrice: number;
  // ...
}
```

**Guards:**
```typescript
@Injectable()
export class PermissionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.get<string>('permission', context.getHandler());
    const user = context.switchToHttp().getRequest().user;
    return user.permissions.includes(requiredPermission);
  }
}
```

**Interceptors:**
- `LoggingInterceptor` — log all requests with duration
- `TransformInterceptor` — wrap responses in `{ data, meta, status }`
- `CacheInterceptor` — Redis cache for read-heavy endpoints


---

## 7. Database Schema

### 7.1 Core Entities

#### users
```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE,
  phone         VARCHAR(15) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name    VARCHAR(100) NOT NULL,
  last_name     VARCHAR(100),
  role_id       UUID REFERENCES roles(id),
  branch_id     UUID REFERENCES branches(id),
  is_active     BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
```

#### roles
```sql
CREATE TABLE roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  is_system   BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

#### permissions
```sql
CREATE TABLE permissions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module      VARCHAR(100) NOT NULL,
  action      VARCHAR(50) NOT NULL,  -- view, create, edit, delete, export, approve
  description TEXT,
  UNIQUE(module, action)
);
```

#### role_permissions
```sql
CREATE TABLE role_permissions (
  role_id       UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);
```

#### branches
```sql
CREATE TABLE branches (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(200) NOT NULL,
  code        VARCHAR(10) UNIQUE NOT NULL,
  address     TEXT,
  city        VARCHAR(100),
  state       VARCHAR(100),
  pincode     VARCHAR(10),
  phone       VARCHAR(15),
  gstin       VARCHAR(20),
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

#### clients
```sql
CREATE TABLE clients (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name      VARCHAR(100) NOT NULL,
  last_name       VARCHAR(100),
  phone           VARCHAR(15) UNIQUE NOT NULL,
  alternate_phone VARCHAR(15),
  email           VARCHAR(255),
  gender          VARCHAR(20),
  date_of_birth   DATE,
  address         TEXT,
  city            VARCHAR(100),
  district        VARCHAR(100),
  state           VARCHAR(100),
  pincode         VARCHAR(10),
  id_proof_type   VARCHAR(50),
  id_proof_number VARCHAR(100),
  ekyc_status     VARCHAR(20) DEFAULT 'pending',
  ekyc_verified_at TIMESTAMPTZ,
  ekyc_verified_by UUID REFERENCES users(id),
  customer_type   VARCHAR(50) DEFAULT 'walk-in',
  is_active       BOOLEAN DEFAULT true,
  birthday_offer  BOOLEAN DEFAULT false,
  notes           TEXT,
  created_by      UUID REFERENCES users(id),
  branch_id       UUID REFERENCES branches(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

#### brands
```sql
CREATE TABLE brands (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(100) UNIQUE NOT NULL,
  logo_url   VARCHAR(500),
  is_active  BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### models
```sql
CREATE TABLE models (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id    UUID REFERENCES brands(id) NOT NULL,
  name        VARCHAR(200) NOT NULL,
  slug        VARCHAR(200) UNIQUE,
  description TEXT,
  specs       JSONB,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(brand_id, name)
);
```

#### inventory_items
```sql
CREATE TABLE inventory_items (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imei             VARCHAR(15) UNIQUE NOT NULL,
  imei2            VARCHAR(15),
  brand_id         UUID REFERENCES brands(id) NOT NULL,
  model_id         UUID REFERENCES models(id) NOT NULL,
  colour           VARCHAR(100),
  storage          VARCHAR(20),
  box_type         VARCHAR(30) NOT NULL,
  pku_code         VARCHAR(100),
  battery_health   SMALLINT CHECK (battery_health BETWEEN 0 AND 100),
  country_of_origin VARCHAR(100),
  hsn_code         VARCHAR(20),
  -- Condition: 'sealed_pack', 'open_box', 'super_mint', 'mint', 'good'
  condition        VARCHAR(30) NOT NULL,
  -- Auto-generated: "{model} {storage} {ram} {colour}"
  item_name        VARCHAR(300) GENERATED ALWAYS AS (
                     COALESCE(model_name, '') || ' ' ||
                     COALESCE(storage, '') || ' ' ||
                     COALESCE(ram, '') || ' ' ||
                     COALESCE(colour, '')
                   ) STORED,
  ram              VARCHAR(20),
  first_invoice_date DATE,
  purchase_price   DECIMAL(12,2) NOT NULL,
  wholesale_price  DECIMAL(12,2),
  box_price        DECIMAL(12,2),
  tax_rate         DECIMAL(5,2) DEFAULT 0,
  tax_amount       DECIMAL(12,2) DEFAULT 0,
  total_cost       DECIMAL(12,2) NOT NULL,
  selling_price    DECIMAL(12,2),
  online_price     DECIMAL(12,2),
  status           VARCHAR(30) DEFAULT 'available',
  is_online        BOOLEAN DEFAULT false,
  birthday_offer   BOOLEAN DEFAULT false,
  branch_id        UUID REFERENCES branches(id) NOT NULL,
  purchase_id      UUID REFERENCES purchases(id),
  notes            TEXT,
  accessories      JSONB,
  warranty_status  VARCHAR(50),
  warranty_expiry  DATE,
  created_by       UUID REFERENCES users(id),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inventory_imei ON inventory_items(imei);
CREATE INDEX idx_inventory_status ON inventory_items(status);
CREATE INDEX idx_inventory_branch ON inventory_items(branch_id);
CREATE INDEX idx_inventory_model ON inventory_items(model_id);
```

#### item_photos
```sql
CREATE TABLE item_photos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id     UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
  url         VARCHAR(500) NOT NULL,
  key         VARCHAR(500) NOT NULL,
  sort_order  INT DEFAULT 0,
  is_primary  BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

#### purchases
```sql
CREATE TABLE purchases (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number  VARCHAR(50) UNIQUE NOT NULL,
  vendor_id       UUID REFERENCES clients(id),
  vendor_name     VARCHAR(200),
  branch_id       UUID REFERENCES branches(id) NOT NULL,
  total_amount    DECIMAL(12,2) NOT NULL,
  tax_amount      DECIMAL(12,2) DEFAULT 0,
  notes           TEXT,
  status          VARCHAR(30) DEFAULT 'completed',
  created_by      UUID REFERENCES users(id),
  purchase_date   DATE NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

#### sales
```sql
CREATE TABLE sales (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number  VARCHAR(50) UNIQUE NOT NULL,
  client_id       UUID REFERENCES clients(id),
  branch_id       UUID REFERENCES branches(id) NOT NULL,
  subtotal        DECIMAL(12,2) NOT NULL,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  tax_amount      DECIMAL(12,2) DEFAULT 0,
  total_amount    DECIMAL(12,2) NOT NULL,
  payment_status  VARCHAR(30) DEFAULT 'paid',
  sale_type       VARCHAR(30) DEFAULT 'in-store',
  notes           TEXT,
  created_by      UUID REFERENCES users(id),
  sale_date       TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

#### sale_items
```sql
CREATE TABLE sale_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id      UUID REFERENCES sales(id) ON DELETE CASCADE,
  item_id      UUID REFERENCES inventory_items(id),
  imei         VARCHAR(15) NOT NULL,
  description  VARCHAR(500),
  unit_price   DECIMAL(12,2) NOT NULL,
  discount     DECIMAL(12,2) DEFAULT 0,
  tax_rate     DECIMAL(5,2) DEFAULT 0,
  tax_amount   DECIMAL(12,2) DEFAULT 0,
  total        DECIMAL(12,2) NOT NULL,
  hsn_code     VARCHAR(20)
);
```

#### payments
```sql
CREATE TABLE payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id         UUID REFERENCES sales(id),
  online_order_id UUID REFERENCES online_orders(id),
  method          VARCHAR(50) NOT NULL,
  amount          DECIMAL(12,2) NOT NULL,
  reference       VARCHAR(200),
  note            TEXT,
  razorpay_order_id   VARCHAR(200),
  razorpay_payment_id VARCHAR(200),
  razorpay_signature  VARCHAR(500),
  status          VARCHAR(30) DEFAULT 'completed',
  emi_plan        JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

#### stock_transfers
```sql
CREATE TABLE stock_transfers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_number VARCHAR(50) UNIQUE NOT NULL,
  from_branch_id  UUID REFERENCES branches(id) NOT NULL,
  to_branch_id    UUID REFERENCES branches(id) NOT NULL,
  status          VARCHAR(30) DEFAULT 'initiated',
  notes           TEXT,
  initiated_by    UUID REFERENCES users(id),
  received_by     UUID REFERENCES users(id),
  initiated_at    TIMESTAMPTZ DEFAULT NOW(),
  received_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

#### stock_transfer_items
```sql
CREATE TABLE stock_transfer_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_id UUID REFERENCES stock_transfers(id) ON DELETE CASCADE,
  item_id     UUID REFERENCES inventory_items(id),
  imei        VARCHAR(15) NOT NULL,
  status      VARCHAR(30) DEFAULT 'pending',
  notes       TEXT
);
```

#### exchange_devices
```sql
CREATE TABLE exchange_devices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       UUID REFERENCES clients(id),
  sale_id         UUID REFERENCES sales(id),
  brand_id        UUID REFERENCES brands(id),
  model_id        UUID REFERENCES models(id),
  imei            VARCHAR(15),
  colour          VARCHAR(100),
  storage         VARCHAR(20),
  -- Condition: 'sealed_pack', 'open_box', 'super_mint', 'mint', 'good'
  condition       VARCHAR(30),
  battery_health  SMALLINT,
  condition_notes JSONB,
  exchange_price  DECIMAL(12,2) NOT NULL,
  photos          JSONB,
  kyc_verified    BOOLEAN DEFAULT false,
  added_to_inventory BOOLEAN DEFAULT false,
  inventory_item_id UUID REFERENCES inventory_items(id),
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

#### online_orders
```sql
CREATE TABLE online_orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number    VARCHAR(50) UNIQUE NOT NULL,
  client_id       UUID REFERENCES clients(id),
  branch_id       UUID REFERENCES branches(id),
  status          VARCHAR(50) DEFAULT 'pending_payment',
  subtotal        DECIMAL(12,2) NOT NULL,
  shipping_charge DECIMAL(12,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  tax_amount      DECIMAL(12,2) DEFAULT 0,
  total_amount    DECIMAL(12,2) NOT NULL,
  shipping_address JSONB NOT NULL,
  tracking_number VARCHAR(200),
  courier         VARCHAR(100),
  notes           TEXT,
  assigned_to     UUID REFERENCES users(id),
  ordered_at      TIMESTAMPTZ DEFAULT NOW(),
  shipped_at      TIMESTAMPTZ,
  delivered_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

#### returns
```sql
CREATE TABLE returns (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  return_number   VARCHAR(50) UNIQUE NOT NULL,
  return_type     VARCHAR(20) NOT NULL,  -- 'sale' | 'purchase'
  original_id     UUID NOT NULL,
  client_id       UUID REFERENCES clients(id),
  reason          TEXT NOT NULL,
  refund_method   VARCHAR(50),
  refund_amount   DECIMAL(12,2),
  refund_status   VARCHAR(30) DEFAULT 'pending',
  approved_by     UUID REFERENCES users(id),
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

#### notifications
```sql
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id),
  client_id   UUID REFERENCES clients(id),
  type        VARCHAR(50) NOT NULL,
  channel     VARCHAR(20) NOT NULL,  -- email, whatsapp, push, sms
  subject     VARCHAR(500),
  body        TEXT,
  status      VARCHAR(20) DEFAULT 'pending',
  sent_at     TIMESTAMPTZ,
  error       TEXT,
  metadata    JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

#### audit_logs
```sql
CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id),
  action      VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id   UUID,
  old_values  JSONB,
  new_values  JSONB,
  ip_address  INET,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);
```

#### settings
```sql
CREATE TABLE settings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key         VARCHAR(200) UNIQUE NOT NULL,
  value       JSONB NOT NULL,
  description TEXT,
  updated_by  UUID REFERENCES users(id),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
```


---

## 8. API Design

All APIs follow REST conventions. Base URL: `/api/v1`

### 8.1 Auth Endpoints

```
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout
POST   /auth/register
POST   /auth/forgot-password
POST   /auth/reset-password
GET    /auth/me
PATCH  /auth/me
```

### 8.2 Inventory Endpoints

```
GET    /inventory                    # List items (paginated, filtered)
POST   /inventory                    # Create item (purchase entry)
GET    /inventory/:id                # Get item detail
PATCH  /inventory/:id                # Update item
DELETE /inventory/:id                # Soft delete
GET    /inventory/imei/:imei         # Lookup by IMEI
POST   /inventory/:id/photos         # Upload photos
DELETE /inventory/:id/photos/:photoId
PATCH  /inventory/:id/toggle-online  # Toggle online listing
POST   /inventory/bulk-import        # CSV bulk import
GET    /inventory/price-suggestion   # Auto price suggestion ?modelId=&condition=
```

### 8.3 Purchase Endpoints

```
GET    /purchases                    # List purchases
POST   /purchases                    # Create purchase
GET    /purchases/:id                # Get purchase detail
PATCH  /purchases/:id                # Update purchase
GET    /purchases/:id/invoice        # Download invoice PDF
POST   /purchases/:id/return         # Initiate purchase return
```

### 8.4 Sales / POS Endpoints

```
GET    /sales                        # List sales
POST   /sales                        # Create sale
GET    /sales/:id                    # Get sale detail
GET    /sales/:id/invoice            # Download invoice PDF (A4)
GET    /sales/:id/invoice/thermal    # Download thermal receipt
POST   /sales/:id/invoice/email      # Email invoice
POST   /sales/:id/invoice/whatsapp   # WhatsApp invoice
POST   /sales/:id/return             # Initiate sales return
GET    /sales/search                 # Search by IMEI/invoice
```

### 8.5 Client Endpoints

```
GET    /clients                      # List clients
POST   /clients                      # Create client
GET    /clients/:id                  # Get client detail
PATCH  /clients/:id                  # Update client
GET    /clients/:id/history          # Purchase + sales history
POST   /clients/:id/ekyc             # Upload KYC documents
PATCH  /clients/:id/ekyc/verify      # Verify KYC (admin)
POST   /clients/:id/send-email       # Send email to client
POST   /clients/:id/send-whatsapp    # Send WhatsApp message
```

### 8.6 Transfer Endpoints

```
GET    /transfers                    # List transfers
POST   /transfers                    # Create transfer
GET    /transfers/:id                # Get transfer detail
PATCH  /transfers/:id/receive        # Receive items
PATCH  /transfers/:id/reject         # Reject transfer
GET    /transfers/:id/manifest       # Print manifest PDF
```

### 8.7 Exchange Endpoints

```
GET    /exchanges                    # List exchanges
POST   /exchanges                    # Create exchange entry
GET    /exchanges/:id                # Get exchange detail
PATCH  /exchanges/:id                # Update exchange
POST   /exchanges/:id/add-inventory  # Add exchanged device to inventory
GET    /exchanges/price-guide        # Market price guide ?modelId=&condition=
```

### 8.8 Online Order Endpoints

```
GET    /orders                       # List orders (admin)
GET    /orders/:id                   # Get order detail
PATCH  /orders/:id/status            # Update order status
PATCH  /orders/:id/assign            # Assign to branch/staff
POST   /orders/:id/tracking          # Add tracking info
POST   /orders/:id/cancel            # Cancel order
POST   /orders/:id/return            # Process return
GET    /orders/:id/packing-slip      # Print packing slip PDF
```

### 8.9 Public Website Endpoints

```
GET    /public/products              # Product listing (SSR)
GET    /public/products/:slug        # Product detail
GET    /public/brands                # Brand list
GET    /public/search                # Search products
GET    /public/banners               # Homepage banners
GET    /public/offers                # Active offers
POST   /public/cart/checkout         # Initiate checkout
POST   /public/orders                # Place order
GET    /public/orders/:id            # Track order (with token)
```

### 8.10 Report Endpoints

```
GET    /reports/dashboard            # Dashboard KPIs
GET    /reports/sales                # Sales report ?from=&to=&branch=
GET    /reports/purchases            # Purchase report
GET    /reports/gst                  # GST report
GET    /reports/stock-aging          # Stock aging
GET    /reports/inventory-valuation  # Inventory valuation
GET    /reports/employee-sales       # Employee performance
GET    /reports/export/:type         # Export as Excel/PDF
```

### 8.11 Admin / Settings Endpoints

```
GET    /admin/users                  # List users
POST   /admin/users                  # Create user
PATCH  /admin/users/:id              # Update user
DELETE /admin/users/:id              # Deactivate user
GET    /admin/roles                  # List roles
POST   /admin/roles                  # Create role
PATCH  /admin/roles/:id/permissions  # Update role permissions
GET    /admin/branches               # List branches
POST   /admin/branches               # Create branch
PATCH  /admin/settings/:key          # Update setting
GET    /admin/content/banners        # List banners
POST   /admin/content/banners        # Create banner
PATCH  /admin/content/banners/:id    # Update banner
DELETE /admin/content/banners/:id    # Delete banner
GET    /admin/content/pages          # List CMS pages
PATCH  /admin/content/pages/:slug    # Update CMS page
```

### 8.12 Response Format

```typescript
// Success
{
  "status": "success",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}

// Error
{
  "status": "error",
  "error": {
    "code": "IMEI_DUPLICATE",
    "message": "An item with this IMEI already exists",
    "details": { "imei": "123456789012345" }
  }
}
```


---

## 9. Authentication & Authorization

### 9.1 JWT Strategy

```
Login Flow:
  Client → POST /auth/login → Auth Service
  Auth Service validates credentials
  Issues: accessToken (15min) + refreshToken (7d)
  refreshToken stored in Redis: key=refresh:{userId}:{tokenFamily}
  accessToken contains: { sub, email, role, permissions[], branchId, iat, exp }

Refresh Flow:
  Client → POST /auth/refresh (Bearer refreshToken)
  Auth Service validates token in Redis
  Issues new accessToken + rotates refreshToken
  Old refreshToken invalidated (family tracking)

Logout:
  Delete refreshToken from Redis
  Client clears local tokens
```

### 9.2 RBAC Permission Matrix

| Module | Shop Owner | Manager | Shop Sales | Store Sales | Calling Staff | Employee |
|---|---|---|---|---|---|---|
| Dashboard | Full | Branch | View | View | No | No |
| Purchase Entry | Full | Full | Create | Create | No | No |
| Sales / POS | Full | Full | Full | Full | No | No |
| Inventory | Full | Full | View | View | No | No |
| Clients | Full | Full | View+Edit | View+Edit | Full | View |
| Transfers | Full | Full | No | No | No | No |
| Exchange | Full | Full | Full | Full | No | No |
| Online Orders | Full | Full | View | View | View+Edit | No |
| Returns | Full | Approve | Create | Create | No | No |
| Reports | Full | Branch | No | No | No | No |
| Users | Full | Branch | No | No | No | No |
| Settings | Full | No | No | No | No | No |
| Content | Full | No | No | No | No | No |

### 9.3 Permission Granularity

Each module has these actions:
- `view` — read access
- `create` — create new records
- `edit` — modify existing records
- `delete` — soft delete records
- `export` — download reports/exports
- `approve` — approve returns, discounts above threshold

### 9.4 Multi-Branch Access

- `branchId` in JWT restricts data access to assigned branch
- Shop Owner role has `branchId: null` (all branches)
- API Gateway injects branch filter on all queries for non-owner roles
- Branch assignment stored in user record, reflected in token on login

### 9.5 Customer Auth (Website)

- Separate auth flow for public customers
- Register with phone + OTP (or email + password)
- OTP via SMS (Twilio/MSG91)
- Customer JWT has role: `customer`, no admin permissions
- Guest checkout supported (no account required)


---

## 10. Realtime System

### 10.1 WebSocket Architecture

NestJS Gateway (Socket.io) on the API Gateway service. Clients connect with JWT for authentication.

```
Client connects → Gateway validates JWT → assigns to rooms:
  - room: branch:{branchId}       (branch-specific events)
  - room: user:{userId}           (personal notifications)
  - room: admin                   (owner-level events)
```

### 10.2 Event Catalog

| Event | Direction | Payload | Consumers |
|---|---|---|---|
| `sale.created` | Server → Client | `{ saleId, amount, branchId }` | Dashboard, POS |
| `inventory.updated` | Server → Client | `{ itemId, status, branchId }` | Inventory list |
| `order.status_changed` | Server → Client | `{ orderId, status }` | Order management |
| `transfer.received` | Server → Client | `{ transferId, branchId }` | Transfer list |
| `notification.new` | Server → Client | `{ message, type }` | Notification bell |
| `dashboard.refresh` | Server → Client | `{ kpis }` | Dashboard |
| `stock.low_alert` | Server → Client | `{ itemId, count }` | Inventory alerts |
| `payment.confirmed` | Server → Client | `{ orderId, amount }` | Order management |

### 10.3 Dashboard Live Updates

Dashboard KPIs refresh via WebSocket push every 60 seconds or on relevant events:
- New sale → push updated daily sales KPI to branch room
- New purchase → push updated purchase KPI
- Order status change → push online order count update

### 10.4 POS Real-time

- When an item is added to a bill in POS, it's soft-locked (status: `in_cart`) to prevent double-selling
- Lock expires after 15 minutes of inactivity
- Other POS terminals receive `inventory.locked` event and hide the item


---

## 11. Background Jobs

### 11.1 BullMQ Queue Architecture

All queues backed by Redis. Each queue has dedicated workers with retry logic.

### 11.2 Queue Definitions

#### `notification-queue`
| Job | Trigger | Payload | Retry |
|---|---|---|---|
| `send-email` | Sale, order, return | `{ to, subject, template, data }` | 3x with backoff |
| `send-whatsapp` | Sale, order, booking | `{ phone, template, params }` | 3x |
| `send-sms` | OTP, order update | `{ phone, message }` | 3x |
| `send-push` | Order update, alert | `{ userId, title, body }` | 2x |

#### `invoice-queue`
| Job | Trigger | Payload |
|---|---|---|
| `generate-pdf` | Sale created | `{ saleId, type: 'a4' | 'thermal' }` |
| `email-invoice` | Sale created (if email on file) | `{ saleId, clientId }` |

#### `search-queue`
| Job | Trigger | Payload |
|---|---|---|
| `index-item` | Item created/updated | `{ itemId }` |
| `remove-item` | Item sold/deleted | `{ itemId }` |
| `bulk-reindex` | Manual trigger | `{ branchId? }` |

#### `report-queue`
| Job | Schedule | Payload |
|---|---|---|
| `daily-sales-report` | Cron: 11:59 PM | `{ date, branchId }` |
| `weekly-report` | Cron: Sunday 11:59 PM | `{ weekStart, weekEnd }` |
| `monthly-gst-report` | Cron: 1st of month | `{ month, year }` |
| `stock-aging-alert` | Cron: Monday 9 AM | `{ threshold: 90 }` |

#### `payment-queue`
| Job | Trigger | Payload |
|---|---|---|
| `verify-payment` | Razorpay webhook | `{ razorpayOrderId, paymentId }` |
| `process-refund` | Return approved | `{ returnId, amount, paymentId }` |
| `reconcile-payments` | Cron: Daily 2 AM | `{ date }` |

#### `maintenance-queue`
| Job | Schedule | Purpose |
|---|---|---|
| `cleanup-expired-locks` | Every 5 min | Remove expired POS item locks |
| `cleanup-old-sessions` | Daily | Remove expired refresh tokens from Redis |
| `birthday-offers` | Daily 8 AM | Flag clients with birthday today |
| `flash-sale-start` | On schedule | Activate flash sale prices |
| `flash-sale-end` | On schedule | Deactivate flash sale prices |

### 11.3 Job Monitoring

BullMQ Board (or Bull Dashboard) exposed at `/admin/jobs` for monitoring queue health, failed jobs, and retry management.


---

## 12. File Storage Strategy

### 12.1 Storage Provider

Primary: AWS S3 or Cloudflare R2 (S3-compatible, cheaper egress)
CDN: Cloudflare CDN in front of storage bucket

### 12.2 Bucket Structure

```
dream-gadgets-storage/
  inventory/
    {itemId}/
      original/       # Original uploaded images
      compressed/     # WebP compressed versions
      thumbnails/     # 200x200 thumbnails
  kyc/
    {clientId}/
      id-front.jpg
      id-back.jpg
      selfie.jpg
  invoices/
    {year}/{month}/
      {invoiceNumber}.pdf
  reports/
    {year}/{month}/
      {reportType}-{date}.xlsx
  banners/
    {bannerId}/
  exports/
    temp/             # Temporary export files (TTL: 24h)
```

### 12.3 Upload Flow

```
Client → POST /inventory/:id/photos (multipart)
  → API validates file type (JPEG, PNG, WebP only), size (max 10MB)
  → Generate presigned S3 PUT URL
  → Client uploads directly to S3 (bypass server for large files)
  → S3 triggers Lambda/webhook → compress + generate thumbnail
  → Store S3 key in item_photos table
  → Return CDN URL to client
```

### 12.4 Image Processing

- Compression: Sharp (Node.js) — convert to WebP, quality 80
- Thumbnails: 200x200 crop for listing cards
- Max dimensions: 1200x1200 for product images
- Watermarking: optional brand watermark on product images

### 12.5 Security

- Bucket is private (no public access)
- All URLs are CDN URLs (Cloudflare proxied)
- KYC documents: presigned URLs with 1-hour expiry, never public
- Invoice PDFs: presigned URLs with 24-hour expiry

---

## 13. Payment Integration

### 13.1 Razorpay Integration

**Supported payment methods:**
- UPI (GPay, PhonePe, Paytm, BHIM)
- Credit/Debit Cards (Visa, Mastercard, RuPay)
- Net Banking
- Wallets (Paytm, Mobikwik)
- EMI (bank EMI, Bajaj Finserv EMI)
- Pay Later (Simpl, LazyPay)

### 13.2 Online Order Payment Flow

```
1. Customer places order → POST /public/orders
2. Order service creates order (status: pending_payment)
3. Payment service creates Razorpay Order:
   POST https://api.razorpay.com/v1/orders
   { amount: totalInPaise, currency: 'INR', receipt: orderNumber }
4. Return razorpayOrderId to frontend
5. Frontend opens Razorpay checkout modal
6. Customer completes payment
7. Razorpay calls webhook: POST /webhooks/razorpay
8. Payment service verifies signature:
   HMAC-SHA256(razorpayOrderId + '|' + razorpayPaymentId, secret)
9. On success: update payment record, update order status → processing
10. Trigger notification job (order confirmation)
```

### 13.3 Refund Flow

```
1. Return approved by manager
2. Payment service calls Razorpay Refund API:
   POST https://api.razorpay.com/v1/payments/{paymentId}/refund
   { amount: refundAmountInPaise }
3. Razorpay processes refund (2-7 business days)
4. Webhook: payment.refunded → update return record
5. Notify customer via WhatsApp/Email
```

### 13.4 Bajaj EMI Integration

- Bajaj Finserv EMI via Razorpay EMI gateway
- In-store Bajaj EMI: manual entry of EMI plan details (tenure, down payment, EMI amount)
- Store EMI plan reference number in payment record
- EMI plans master data: 3/6/9/12/18/24 months with interest rates

### 13.5 Payment Split Recording

For in-store POS sales with multiple payment methods:
```typescript
// Each split recorded as separate payment record
payments: [
  { method: 'cash', amount: 5000 },
  { method: 'card', amount: 3000, reference: 'TXN123' },
  { method: 'exchange', amount: 2000, exchangeDeviceId: 'uuid' }
]
// Sum must equal sale total (validated server-side)
```

### 13.6 GST Invoice Compliance

- GSTIN of seller (branch) on every invoice
- GSTIN of buyer (if B2B sale)
- HSN code per line item
- CGST + SGST (intra-state) or IGST (inter-state)
- Invoice serial number (branch-wise sequential)
- Digital signature support (future)


---

## 14. Search & Filtering

### 14.1 Elasticsearch Index: `inventory_items`

```json
{
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "imei": { "type": "keyword" },
      "imei2": { "type": "keyword" },
      "brand": { "type": "keyword" },
      "brandName": { "type": "text", "analyzer": "standard" },
      "model": { "type": "keyword" },
      "modelName": {
        "type": "text",
        "analyzer": "standard",
        "fields": { "keyword": { "type": "keyword" } }
      },
      "colour": { "type": "keyword" },
      "storage": { "type": "keyword" },
      "condition": { "type": "keyword" },
      "status": { "type": "keyword" },
      "isOnline": { "type": "boolean" },
      "sellingPrice": { "type": "double" },
      "onlinePrice": { "type": "double" },
      "batteryHealth": { "type": "integer" },
      "branchId": { "type": "keyword" },
      "branchName": { "type": "keyword" },
      "pkuCode": { "type": "keyword" },
      "photos": { "type": "keyword" },
      "createdAt": { "type": "date" }
    }
  }
}
```

### 14.2 Search Queries

**IMEI exact search (POS):**
```json
{ "query": { "term": { "imei": "123456789012345" } } }
```

**Full-text product search (website):**
```json
{
  "query": {
    "multi_match": {
      "query": "iphone 13 128gb",
      "fields": ["modelName^3", "brandName^2", "colour", "storage"],
      "type": "best_fields",
      "fuzziness": "AUTO"
    }
  },
  "filter": [
    { "term": { "isOnline": true } },
    { "term": { "status": "available" } }
  ]
}
```

**Faceted filtering (website sidebar):**
```json
{
  "aggs": {
    "brands": { "terms": { "field": "brand" } },
    "conditions": { "terms": { "field": "condition" } },
    "storage": { "terms": { "field": "storage" } },
    "price_ranges": {
      "range": {
        "field": "onlinePrice",
        "ranges": [
          { "to": 5000 },
          { "from": 5000, "to": 10000 },
          { "from": 10000, "to": 20000 },
          { "from": 20000 }
        ]
      }
    }
  }
}
```

### 14.3 Search Sync Strategy

- On item create/update: enqueue `index-item` job in search-queue
- On item sold/deleted: enqueue `remove-item` job
- Bulk reindex: admin-triggered, processes all items in batches of 500
- Sync lag: < 5 seconds (near real-time via queue)

### 14.4 Admin Inventory Search

Admin panel uses PostgreSQL full-text search for internal inventory (no Elasticsearch needed for admin — lower volume, more complex filters):
```sql
SELECT * FROM inventory_items
WHERE to_tsvector('english', model_name || ' ' || brand_name || ' ' || imei)
  @@ plainto_tsquery('english', $1)
```

---

## 15. Notification System

### 15.1 Channels

| Channel | Provider | Use Cases |
|---|---|---|
| Email | SendGrid / Nodemailer+SMTP | Invoices, order confirmations, reports |
| WhatsApp | WhatsApp Business API / Twilio | Order updates, invoice share, booking confirm |
| SMS | MSG91 / Twilio | OTP, order status |
| Push (Web) | Firebase Cloud Messaging | Order updates, stock alerts (PWA) |
| In-app | WebSocket | Real-time alerts in admin panel |

### 15.2 Notification Templates

All templates stored in database (settings table) and editable from admin panel.

| Template Key | Channel | Variables |
|---|---|---|
| `sale.invoice` | Email + WhatsApp | `{customerName}`, `{invoiceNumber}`, `{amount}`, `{invoiceUrl}` |
| `order.confirmed` | Email + WhatsApp | `{orderNumber}`, `{items}`, `{total}` |
| `order.shipped` | WhatsApp + SMS | `{orderNumber}`, `{trackingNumber}`, `{courier}` |
| `order.delivered` | WhatsApp | `{orderNumber}` |
| `booking.confirmed` | WhatsApp | `{itemName}`, `{advanceAmount}`, `{dueAmount}` |
| `return.processed` | Email + WhatsApp | `{returnNumber}`, `{refundAmount}`, `{refundMethod}` |
| `otp.login` | SMS | `{otp}` |
| `birthday.offer` | WhatsApp | `{customerName}`, `{offerDetails}` |
| `report.daily` | Email | `{date}`, `{reportUrl}` |

### 15.3 WhatsApp Integration

Using WhatsApp Business API (Meta) or Twilio WhatsApp:
- Template messages for transactional notifications (pre-approved by Meta)
- Session messages for customer support conversations
- Media messages for invoice PDF sharing
- Message status webhooks (sent, delivered, read)

### 15.4 Notification Preferences

- Per-customer opt-in/opt-out for marketing messages
- Transactional messages always sent (cannot opt out)
- Admin can configure which events trigger which channels


---

## 16. Reports & Exports

### 16.1 Report Generation Architecture

```
Request → Report Service → Query PostgreSQL → Transform data
  → If Excel: ExcelJS → Buffer → S3 upload → Presigned URL
  → If PDF: Puppeteer → HTML template → PDF → S3 upload → Presigned URL
  → Return download URL (expires in 1 hour)
```

### 16.2 GST Report (GSTR-1 Format)

Fields per line item:
- GSTIN of buyer (if B2B)
- Invoice number, date
- Invoice value
- Place of supply
- Reverse charge (Y/N)
- Invoice type (Regular/SEZ/Export)
- Rate (%)
- Taxable value
- CGST / SGST / IGST amounts

Export format: Excel with separate sheets for B2B, B2C Large, B2C Small, HSN Summary

### 16.3 Stock Aging Report

Items grouped by age buckets:
- 0–30 days
- 31–60 days
- 61–90 days
- 91–180 days
- 180+ days (slow-moving alert)

Includes: IMEI, model, condition, purchase price, current selling price, days in stock, branch

### 16.4 Scheduled Reports

Configured via cron jobs in report-queue:
- Daily sales summary: auto-emailed to owner at midnight
- Weekly performance: emailed to managers every Monday
- Monthly GST: emailed to accountant on 1st of month

---

## 17. Security

### 17.1 Application Security

| Concern | Mitigation |
|---|---|
| SQL Injection | TypeORM parameterized queries, no raw SQL with user input |
| XSS | React auto-escaping, Content Security Policy headers |
| CSRF | SameSite cookies, CSRF tokens for state-changing requests |
| Rate Limiting | Redis-backed rate limiter: 100 req/min per IP, 1000 req/min per user |
| Brute Force | Account lockout after 5 failed logins (15-min lockout) |
| JWT Security | Short expiry (15min), refresh token rotation, family tracking |
| IMEI Tampering | Server-side IMEI validation (Luhn algorithm check) |
| File Upload | Type validation, size limits, virus scan (ClamAV optional) |
| Secrets | Environment variables, AWS Secrets Manager in production |
| HTTPS | TLS 1.3 enforced, HSTS headers |
| Dependency Vulnerabilities | `npm audit` in CI, Dependabot alerts |

### 17.2 Data Security

- Passwords: bcrypt with cost factor 12
- KYC documents: encrypted at rest (S3 SSE-KMS)
- PII in logs: masked (phone: `98****1234`, email: `u***@domain.com`)
- Database: encrypted at rest (RDS encryption)
- Backup: daily automated backups, 30-day retention

### 17.3 Audit Trail

Every create/update/delete operation on sensitive entities (sales, purchases, returns, user management) logged to `audit_logs` table with:
- User ID, action, entity type/ID
- Old values vs new values (JSON diff)
- IP address, user agent
- Timestamp

### 17.4 IMEI Validation

```typescript
function validateIMEI(imei: string): boolean {
  if (!/^\d{15}$/.test(imei)) return false;
  // Luhn algorithm
  let sum = 0;
  for (let i = 0; i < 15; i++) {
    let digit = parseInt(imei[i]);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}
```

### 17.5 API Security Headers

```typescript
// NestJS Helmet configuration
app.use(helmet({
  contentSecurityPolicy: { directives: { defaultSrc: ["'self'"] } },
  hsts: { maxAge: 31536000, includeSubDomains: true },
  noSniff: true,
  xssFilter: true,
}));
```

---

## 18. Scaling Strategy

### 18.1 Horizontal Scaling

Each microservice is stateless and can be scaled independently:
- Auth service: scale based on login traffic
- Inventory service: scale based on POS usage
- Report service: scale based on export demand (CPU-intensive)
- Notification service: scale based on queue depth

### 18.2 Database Scaling

**Phase 1 (0–100K items, 5 branches):**
- Single PostgreSQL instance (RDS db.t3.medium)
- Read replica for reports

**Phase 2 (100K–1M items, 20+ branches):**
- PostgreSQL with read replicas
- Connection pooling via PgBouncer
- Partition `inventory_items` by `branch_id`
- Partition `audit_logs` by month

**Phase 3 (1M+ items):**
- Consider Citus (distributed PostgreSQL) for horizontal sharding
- Archive old audit logs to cold storage

### 18.3 Caching Strategy

| Data | Cache Key | TTL | Invalidation |
|---|---|---|---|
| User permissions | `perms:{userId}` | 5 min | On role change |
| Branch settings | `settings:{branchId}` | 10 min | On settings update |
| Product listing (website) | `products:{filters_hash}` | 2 min | On inventory update |
| Dashboard KPIs | `dashboard:{branchId}:{date}` | 60 sec | On new sale/purchase |
| Brand/Model master | `brands:all` | 1 hour | On master data change |
| Exchange price guide | `exchange:prices:{modelId}` | 30 min | Manual refresh |

### 18.4 CDN Strategy

- All static assets (JS, CSS, images) served via Cloudflare CDN
- Product images cached at edge (1-day TTL)
- API responses: no CDN caching (dynamic data)
- Next.js ISR for product pages (revalidate every 60 seconds)

### 18.5 Queue Scaling

- BullMQ workers scaled based on queue depth
- Separate worker pools per queue (notification workers don't compete with report workers)
- Dead letter queue for failed jobs after max retries


---

## 19. Gap Analysis & Critical Findings

### 19.1 Missing Features (Identified Through Analysis)

#### Inventory & Operations
- **Warranty tracking**: No mention of manufacturer warranty tracking. Need warranty expiry alerts and warranty claim workflow.
- **Accessories inventory**: Chargers, cases, earphones sold separately need their own SKU-based inventory (non-IMEI items).
- **Barcode label printing**: Need integration with label printers (Zebra/Dymo) for IMEI barcodes and condition labels.
- **Price history**: No mechanism to track price changes per item over time. Needed for margin analysis.
- **Supplier management**: Vendors/suppliers need their own entity with contact info, payment terms, outstanding balance.
- **Purchase order (PO)**: Formal PO workflow before purchase entry for corporate procurement.

#### Financial & Accounting
- **Cash drawer management**: Opening balance, closing balance, cash reconciliation per shift.
- **Expense tracking**: Operational expenses (rent, salary, utilities) needed for true P&L.
- **Accounts payable**: Outstanding payments to vendors not tracked.
- **Accounts receivable**: Credit sales / outstanding customer payments not tracked.
- **Multi-currency**: Not needed now but flag for future (international purchases).
- **TDS deduction**: For purchases above ₹30,000 from individuals (Section 194C).

#### Customer & Sales
- **Loyalty program**: Points system for repeat customers. Birthday offers exist but no points/rewards.
- **Coupon/promo codes**: Website checkout mentions coupon but no coupon management system defined.
- **Wishlist**: Mentioned in website features but no backend entity defined.
- **Product reviews & ratings**: Not mentioned. Critical for certified used phone trust.
- **COD (Cash on Delivery)**: Online orders mention COD but payment flow not defined.
- **Shipping integration**: No courier API integration (Shiprocket, Delhivery). Manual tracking only.

#### Technical Gaps
- **Offline POS mode**: If internet goes down, POS should work offline and sync when reconnected. Not addressed.
- **Database migrations strategy**: TypeORM migrations need a versioning and rollback plan.
- **Multi-tenancy**: If Dream Gadgets expands to franchise model, multi-tenant architecture needed.
- **API versioning**: `/api/v1` defined but no deprecation strategy for v2 migration.
- **Health checks**: `/health` endpoints for each service needed for K8s liveness/readiness probes.
- **Distributed tracing**: Request ID propagation across services for debugging. OpenTelemetry recommended.
- **Feature flags**: No feature flag system for gradual rollouts (LaunchDarkly or custom).

#### Compliance & Legal
- **Data retention policy**: How long to keep customer PII, transaction data (GST requires 6 years).
- **GDPR/PDPB compliance**: India's Personal Data Protection Bill — consent management, right to erasure.
- **Invoice digital signature**: GST e-invoicing mandate for businesses above ₹5 crore turnover.
- **E-way bill**: For inter-state stock transfers above ₹50,000 value.

### 19.2 Scaling Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| IMEI search bottleneck at high volume | Medium | High | Elasticsearch index + DB index |
| Report generation blocking API | High | Medium | Async queue-based generation |
| Razorpay webhook replay attacks | Medium | High | Idempotency keys, signature verification |
| Redis single point of failure | Medium | High | Redis Sentinel or Redis Cluster |
| Large file uploads blocking server | Medium | Medium | Direct S3 upload via presigned URLs |
| N+1 queries in inventory listing | High | Medium | Eager loading, query optimization |
| POS double-sell race condition | Medium | High | Optimistic locking + item soft-lock |

### 19.3 Recommended Additions (Priority Order)

1. **Offline POS mode** (PWA + IndexedDB sync) — critical for store operations
2. **Accessories/non-IMEI inventory** — stores sell more than just phones
3. **Coupon management system** — needed for website launch
4. **Product reviews** — trust signal for used phone sales
5. **Shipping API integration** (Shiprocket) — automate tracking
6. **Loyalty points system** — customer retention
7. **Cash drawer reconciliation** — financial accuracy
8. **Supplier management** — accounts payable tracking
9. **E-invoicing (IRN generation)** — GST compliance at scale
10. **Distributed tracing** (OpenTelemetry) — production debugging

### 19.4 Business Logic Definitions (Must Be Implemented)

#### Exchange Pricing Formula
```
exchange_value = base_market_price[model][condition] × battery_factor × age_factor
battery_factor = battery_health >= 80 ? 1.0 : battery_health >= 60 ? 0.85 : 0.70
age_factor     = months_since_first_invoice <= 12 ? 1.0 : <= 24 ? 0.80 : 0.65
```
- Base market prices maintained in `exchange_price_guide` table per model + condition
- Staff can override with manager approval if override > 10% of suggested price

#### Discount Approval Rules
| Discount % | Who Can Approve |
|---|---|
| 0–5% | Shop Sales / Store Sales |
| 5–15% | Store Manager |
| 15%+ | Shop Owner only |
- Discount requests above staff limit trigger approval workflow (notify manager via app)

#### Return Approval Thresholds
| Return Value | Approval Required |
|---|---|
| < ₹5,000 | Any staff |
| ₹5,000–₹25,000 | Store Manager |
| > ₹25,000 | Shop Owner |
- Return window: 7 days default (configurable per branch in settings)
- After return window: manager override required regardless of amount

#### EMI Calculation Logic
```
emi_amount = (principal × monthly_rate × (1 + monthly_rate)^tenure) /
             ((1 + monthly_rate)^tenure - 1)
monthly_rate = annual_rate / 12 / 100
```
- Bajaj EMI: rates fetched from Bajaj Finserv API or maintained in settings table
- Bank EMI: standard rates (0% EMI = merchant bears subvention cost, tracked separately)

#### Warranty Calculation Rules
```
warranty_expiry = first_invoice_date + warranty_period_months
warranty_status = today < warranty_expiry ? 'in_warranty' : 'out_of_warranty'
```
- Sealed Pack: 12 months manufacturer warranty from first_invoice_date
- Open Box / Super Mint: 6 months (configurable)
- Mint / Good: No manufacturer warranty (store warranty optional)
- Store warranty: configurable per sale (30/60/90 days)

### 19.5 Architecture Simplification Note (MVP Phase)

> For the initial MVP / Phase 1 deployment, the following over-engineered components should be deferred:

| Component | MVP Alternative | Defer Until |
|---|---|---|
| Kubernetes | Docker Compose on VPS / AWS Lightsail | Phase 2 (scale) |
| Elasticsearch | PostgreSQL full-text search (`tsvector`) | Phase 2 (>50k items) |
| Microservices | Monorepo NestJS monolith with modules | Phase 2 (team growth) |
| Redis Cluster | Single Redis instance | Phase 2 |
| ELK Stack | Simple Winston file logs | Phase 2 |

**Recommended MVP Stack:**
- Single NestJS app (modular monolith) — all modules in one deployable
- PostgreSQL (single instance with daily backups)
- Redis (single instance — cache + queues)
- Next.js frontend (web + admin in one repo)
- Docker Compose for deployment on VPS
- This reduces dev time by ~40% and infra cost by ~70% for initial launch

---

## 20. Deployment Architecture

### 20.1 Infrastructure Overview

```
Internet → Cloudflare (CDN + DDoS) → Load Balancer (AWS ALB)
  → Kubernetes Cluster (EKS)
    → Namespace: production
      → api-gateway (3 replicas)
      → auth-service (2 replicas)
      → inventory-service (3 replicas)
      → order-service (3 replicas)
      → payment-service (2 replicas)
      → notification-service (2 replicas)
      → report-service (2 replicas)
      → exchange-service (2 replicas)
      → client-service (2 replicas)
      → content-service (1 replica)
    → Namespace: data
      → PostgreSQL (RDS, not in K8s)
      → Redis (ElastiCache, not in K8s)
      → Elasticsearch (OpenSearch, not in K8s)
  → S3 / R2 (object storage)
  → CloudWatch / Prometheus (monitoring)
```

### 20.2 Environments

| Environment | Purpose | Infrastructure |
|---|---|---|
| Development | Local dev | Docker Compose (all services local) |
| Staging | QA + UAT | Single K8s cluster, smaller instances |
| Production | Live | Multi-AZ K8s, RDS Multi-AZ, Redis Cluster |

### 20.3 Docker Compose (Development)

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: dreamgadgets
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: secret
    ports: ["5432:5432"]
    volumes: [postgres_data:/var/lib/postgresql/data]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  elasticsearch:
    image: elasticsearch:8.11.0
    environment:
      discovery.type: single-node
      xpack.security.enabled: "false"
    ports: ["9200:9200"]

  api-gateway:
    build: ./services/api-gateway
    ports: ["3000:3000"]
    depends_on: [postgres, redis]
    environment:
      DATABASE_URL: postgresql://admin:secret@postgres:5432/dreamgadgets
      REDIS_URL: redis://redis:6379

  # ... other services
```

### 20.4 CI/CD Pipeline

```
Push to main branch
  → GitHub Actions triggered
  → Run tests (Jest)
  → Run linting (ESLint)
  → Build Docker images
  → Push to ECR (AWS Container Registry)
  → Deploy to staging (kubectl apply)
  → Run smoke tests
  → Manual approval gate
  → Deploy to production (rolling update)
  → Notify team (Slack)
```

### 20.5 Kubernetes Resources (per service)

```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "100m"
  limits:
    memory: "512Mi"
    cpu: "500m"

# HPA (Horizontal Pod Autoscaler)
minReplicas: 2
maxReplicas: 10
targetCPUUtilizationPercentage: 70
```

### 20.6 Database Backup Strategy

- RDS automated backups: daily, 30-day retention
- Manual snapshots before major deployments
- Point-in-time recovery enabled
- Cross-region backup for disaster recovery


---

## 21. Dependencies

### 21.1 Backend (NestJS Services)

```json
{
  "dependencies": {
    "@nestjs/core": "^10.0.0",
    "@nestjs/common": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/typeorm": "^10.0.0",
    "@nestjs/jwt": "^10.0.0",
    "@nestjs/passport": "^10.0.0",
    "@nestjs/config": "^3.0.0",
    "@nestjs/swagger": "^7.0.0",
    "@nestjs/websockets": "^10.0.0",
    "@nestjs/platform-socket.io": "^10.0.0",
    "@nestjs/bull": "^10.0.0",
    "@nestjs/cache-manager": "^2.0.0",
    "@nestjs/throttler": "^5.0.0",
    "@nestjs/elasticsearch": "^10.0.0",
    "typeorm": "^0.3.0",
    "pg": "^8.11.0",
    "redis": "^4.6.0",
    "bullmq": "^5.0.0",
    "passport": "^0.6.0",
    "passport-jwt": "^4.0.0",
    "passport-local": "^1.0.0",
    "bcrypt": "^5.1.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.0",
    "helmet": "^7.0.0",
    "compression": "^1.7.4",
    "razorpay": "^2.9.0",
    "nodemailer": "^6.9.0",
    "@sendgrid/mail": "^8.0.0",
    "twilio": "^4.19.0",
    "aws-sdk": "^2.1500.0",
    "@aws-sdk/client-s3": "^3.0.0",
    "@aws-sdk/s3-request-presigner": "^3.0.0",
    "sharp": "^0.33.0",
    "puppeteer": "^21.0.0",
    "exceljs": "^4.4.0",
    "jsbarcode": "^3.11.0",
    "qrcode": "^1.5.0",
    "date-fns": "^3.0.0",
    "uuid": "^9.0.0",
    "winston": "^3.11.0",
    "nest-winston": "^1.9.0",
    "@sentry/node": "^7.0.0",
    "cache-manager": "^5.0.0",
    "cache-manager-redis-yet": "^4.0.0",
    "multer": "^1.4.5",
    "csv-parser": "^3.0.0",
    "fast-csv": "^4.3.6"
  },
  "devDependencies": {
    "@nestjs/testing": "^10.0.0",
    "@types/node": "^20.0.0",
    "@types/bcrypt": "^5.0.0",
    "@types/multer": "^1.4.0",
    "@types/nodemailer": "^6.4.0",
    "@types/passport-jwt": "^3.0.0",
    "jest": "^29.0.0",
    "supertest": "^6.3.0",
    "ts-jest": "^29.0.0",
    "typescript": "^5.0.0",
    "eslint": "^8.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "prettier": "^3.0.0"
  }
}
```

### 21.2 Frontend (Next.js)

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@tanstack/react-query": "^5.0.0",
    "@tanstack/react-table": "^8.0.0",
    "@tanstack/react-virtual": "^3.0.0",
    "zustand": "^4.4.0",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",
    "axios": "^1.6.0",
    "socket.io-client": "^4.6.0",
    "recharts": "^2.10.0",
    "date-fns": "^3.0.0",
    "tailwindcss": "^3.3.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "@radix-ui/react-dialog": "^1.0.0",
    "@radix-ui/react-dropdown-menu": "^2.0.0",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-toast": "^1.1.0",
    "@radix-ui/react-tabs": "^1.0.0",
    "lucide-react": "^0.300.0",
    "next-themes": "^0.2.0",
    "react-dropzone": "^14.2.0",
    "react-image-gallery": "^1.3.0",
    "html5-qrcode": "^2.3.0",
    "razorpay": "^2.9.0",
    "@react-pdf/renderer": "^3.1.0",
    "next-pwa": "^5.6.0",
    "next-seo": "^6.4.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0",
    "jest": "^29.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "jest-environment-jsdom": "^29.0.0"
  }
}
```

### 21.3 Infrastructure & DevOps Tools

| Tool | Purpose |
|---|---|
| Docker | Containerization |
| Kubernetes (EKS) | Container orchestration |
| Helm | K8s package management |
| GitHub Actions | CI/CD |
| AWS ECR | Container registry |
| AWS RDS (PostgreSQL) | Managed database |
| AWS ElastiCache (Redis) | Managed Redis |
| AWS OpenSearch | Managed Elasticsearch |
| AWS S3 / Cloudflare R2 | Object storage |
| Cloudflare | CDN, DDoS, DNS |
| Prometheus + Grafana | Metrics & dashboards |
| ELK Stack | Centralized logging |
| Sentry | Error tracking |
| PgBouncer | PostgreSQL connection pooling |
| Nginx | Reverse proxy (if not using ALB) |
| Certbot / ACM | TLS certificates |

### 21.4 Third-Party Services

| Service | Purpose | Tier |
|---|---|---|
| Razorpay | Payments | Required |
| WhatsApp Business API | Messaging | Required |
| SendGrid / SMTP | Email | Required |
| MSG91 / Twilio | SMS / OTP | Required |
| Firebase FCM | Push notifications | Optional |
| Shiprocket | Shipping integration | Recommended |
| Google Analytics | Website analytics | Recommended |
| Hotjar | UX analytics | Optional |
| LaunchDarkly | Feature flags | Optional |

---

## Appendix: Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dreamgadgets
DATABASE_POOL_SIZE=20

# Redis
REDIS_URL=redis://host:6379
REDIS_PASSWORD=

# Elasticsearch
ELASTICSEARCH_URL=http://host:9200

# JWT
JWT_SECRET=<256-bit-random-secret>
JWT_EXPIRY=15m
REFRESH_TOKEN_SECRET=<256-bit-random-secret>
REFRESH_TOKEN_EXPIRY=7d

# AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=ap-south-1
S3_BUCKET=dream-gadgets-storage
CDN_BASE_URL=https://cdn.dreamgadgets.in

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# Email
SENDGRID_API_KEY=
EMAIL_FROM=noreply@dreamgadgets.in

# WhatsApp
WHATSAPP_API_URL=
WHATSAPP_API_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=

# SMS
MSG91_AUTH_KEY=
MSG91_SENDER_ID=DRMGDG

# App
NODE_ENV=production
PORT=3000
APP_URL=https://dreamgadgets.in
ADMIN_URL=https://admin.dreamgadgets.in
API_URL=https://api.dreamgadgets.in

# Sentry
SENTRY_DSN=
```

---

*Document maintained by: Engineering Team*
*Last updated: 2025*
*Version: 1.0.0*
