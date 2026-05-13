# Implementation Tasks

## Task List

- [x] 1. Project Scaffolding & Infrastructure
  - [x] 1.1 Initialise Turborepo monorepo with apps/api, apps/web, apps/admin, packages/shared-types, packages/ui
  - [x] 1.2 Configure NestJS monolith (apps/api) with TypeORM, Redis, BullMQ, Socket.io, Swagger, Helmet, class-validator
  - [x] 1.3 Configure Next.js 14 for apps/web (public website) with Tailwind CSS, shadcn/ui, TanStack Query, Zustand
  - [x] 1.4 Configure Next.js 14 for apps/admin with same frontend stack
  - [x] 1.5 Set up Docker Compose with PostgreSQL 16, Redis 7, and the API service
  - [x] 1.6 Configure GitHub Actions CI pipeline (lint, test, build)
  - [x] 1.7 Set up environment variable management (.env.example, config module in NestJS)

- [x] 2. Database Schema & Migrations
  - [x] 2.1 Create TypeORM migrations for core tables: users, roles, permissions, role_permissions, branches
  - [x] 2.2 Create migrations for: brands, models, inventory_items, item_photos
  - [x] 2.3 Create migrations for: clients, purchases, sales, sale_items, payments
  - [x] 2.4 Create migrations for: stock_transfers, stock_transfer_items, exchange_devices
  - [x] 2.5 Create migrations for: online_orders, returns, notifications, audit_logs, settings
  - [x] 2.6 Create seed data: default roles, permissions, system settings, sample branch

- [ ] 3. Authentication Module
  - [x] 3.1 Implement AuthModule with JWT strategy, local strategy, refresh token rotation
  - [x] 3.2 Implement POST /auth/login (email/phone + password → JWT + refresh token)
  - [x] 3.3 Implement POST /auth/refresh (refresh token rotation with family tracking in Redis)
  - [x] 3.4 Implement POST /auth/logout (invalidate refresh token)
  - [x] 3.5 Implement POST /auth/register (customer self-registration with phone OTP)
  - [x] 3.6 Implement POST /auth/forgot-password and POST /auth/reset-password
  - [x] 3.7 Implement GET /auth/me and PATCH /auth/me
  - [x] 3.8 Implement account lockout after 5 failed login attempts (Redis-backed, 15-min TTL)
  - [x] 3.9 Implement PermissionGuard and BranchFilterInterceptor
  - [x] 3.10 Write unit tests for auth service and property-based test for JWT payload structure

- [x] 4. Core Business Logic (Shared Utilities)
  - [x] 4.1 Implement and test validateIMEI (Luhn algorithm)
  - [x] 4.2 Implement and test calculateExchangePrice (battery_factor × age_factor formula)
  - [x] 4.3 Implement and test calculateGST (CGST/SGST vs IGST)
  - [x] 4.4 Implement and test validatePaymentSplits (sum === total)
  - [x] 4.5 Implement and test calculateWarrantyExpiry (condition-based months)
  - [x] 4.6 Implement and test getRequiredDiscountRole and getRequiredReturnRole
  - [x] 4.7 Write property-based tests for all business logic functions (fast-check)

- [x] 5. Inventory Module
  - [x] 5.1 Implement InventoryModule with Brand, Model, InventoryItem, ItemPhoto entities
  - [x] 5.2 Implement POST /inventory (create purchase entry with IMEI validation + duplicate check)
  - [x] 5.3 Implement GET /inventory (paginated list with filters: condition, status, brand, model, branch, price range)
  - [x] 5.4 Implement GET /inventory/:id and GET /inventory/imei/:imei
  - [x] 5.5 Implement PATCH /inventory/:id (edit item, audit log)
  - [x] 5.6 Implement item status state machine with valid transition enforcement
  - [x] 5.7 Implement photo upload: presigned S3 URL generation, POST /inventory/:id/photos, DELETE photo
  - [x] 5.8 Implement PATCH /inventory/:id/toggle-online (sync to search index via BullMQ)
  - [x] 5.9 Implement POST /inventory/bulk-import (CSV parsing, validation, error report)
  - [x] 5.10 Implement GET /inventory/price-suggestion (median of historical sales for model+condition)
  - [x] 5.11 Implement GET /inventory/city-stock (branch availability for a model)
  - [x] 5.12 Write unit and integration tests for inventory module

- [x] 6. Purchase Module
  - [x] 6.1 Implement PurchaseModule with Purchase entity
  - [x] 6.2 Implement POST /purchases (create purchase, link inventory items)
  - [x] 6.3 Implement GET /purchases (list with filters), GET /purchases/:id
  - [x] 6.4 Implement PATCH /purchases/:id
  - [x] 6.5 Implement GET /purchases/:id/invoice (generate PDF via Puppeteer)
  - [x] 6.6 Write tests for purchase module

- [x] 7. Sales / POS Module
  - [x] 7.1 Implement SalesModule with Sale, SaleItem entities
  - [x] 7.2 Implement invoice number generation (atomic sequence per branch: {PREFIX}-{BRANCH}-{YEAR}-{SEQ})
  - [x] 7.3 Implement POST /sales (create sale: item search, payment splits, GST, inventory status update)
  - [x] 7.4 Implement payment split validation (sum must equal total)
  - [x] 7.5 Implement discount authorization enforcement (role-based thresholds)
  - [x] 7.6 Implement GET /sales (list), GET /sales/:id
  - [x] 7.7 Implement invoice PDF generation: A4 (GET /sales/:id/invoice) and thermal 80mm (GET /sales/:id/invoice/thermal)
  - [x] 7.8 Implement POST /sales/:id/invoice/email and POST /sales/:id/invoice/whatsapp
  - [x] 7.9 Implement POST /sales/:id/void (with authorization, audit log, inventory restore)
  - [x] 7.10 Implement POS item soft-lock (in_cart status, Redis TTL 15 min, Socket.io broadcast)
  - [x] 7.11 Write unit, integration, and property-based tests for sales module

- [x] 8. Client Module
  - [x] 8.1 Implement ClientModule with Client entity
  - [x] 8.2 Implement POST /clients, GET /clients (list with search), GET /clients/:id, PATCH /clients/:id
  - [x] 8.3 Implement GET /clients/:id/history (purchases, sales, exchanges, returns)
  - [x] 8.4 Implement EKYC flow: POST /clients/:id/ekyc (upload docs), PATCH /clients/:id/ekyc/verify
  - [x] 8.5 Implement POST /clients/:id/send-email and POST /clients/:id/send-whatsapp
  - [x] 8.6 Write tests for client module

- [x] 9. Stock Transfer Module
  - [x] 9.1 Implement TransferModule with StockTransfer, StockTransferItem entities
  - [x] 9.2 Implement POST /transfers (create transfer, validate items belong to source branch)
  - [x] 9.3 Implement GET /transfers (list with status filters), GET /transfers/:id
  - [x] 9.4 Implement PATCH /transfers/:id/receive (item-by-item confirmation, partial receipt)
  - [x] 9.5 Implement PATCH /transfers/:id/reject (with reason)
  - [x] 9.6 Implement GET /transfers/:id/manifest (PDF)
  - [x] 9.7 Write tests for transfer module

- [x] 10. Exchange Module
  - [x] 10.1 Implement ExchangeModule with ExchangeDevice entity
  - [x] 10.2 Implement POST /exchanges (create exchange entry with condition assessment)
  - [x] 10.3 Implement exchange price suggestion endpoint using calculateExchangePrice formula
  - [x] 10.4 Implement POST /exchanges/:id/add-inventory (add exchanged device to inventory)
  - [x] 10.5 Implement GET /exchanges (list), GET /exchanges/:id, PATCH /exchanges/:id
  - [x] 10.6 Implement GET /exchanges/price-guide (market price guide per model+condition)
  - [x] 10.7 Write tests for exchange module

- [x] 11. Sales Return Module
  - [x] 11.1 Implement SalesReturnModule with Return entity
  - [x] 11.2 Implement POST /sales/:id/return (partial return, reason, refund method)
  - [x] 11.3 Enforce return window (7-day default, configurable) and approval thresholds
  - [x] 11.4 Implement inventory status update on return (Available or Scrapped)
  - [x] 11.5 Implement Razorpay refund trigger for online payment returns
  - [x] 11.6 Generate return invoice / credit note PDF
  - [x] 11.7 Write tests for return module

- [x] 12. Purchase Return Module
  - [x] 12.1 Implement POST /purchases/:id/return (select items, reason, remove from inventory)
  - [x] 12.2 Generate purchase return note PDF
  - [x] 12.3 Write tests for purchase return module

- [x] 13. Payment Module
  - [x] 13.1 Implement PaymentModule with Payment entity
  - [x] 13.2 Implement Razorpay order creation (POST /payments/razorpay/order)
  - [x] 13.3 Implement Razorpay webhook handler (POST /webhooks/razorpay) with HMAC-SHA256 signature verification
  - [x] 13.4 Implement idempotency for webhook events (prevent duplicate processing)
  - [x] 13.5 Implement Razorpay refund API integration
  - [x] 13.6 Write tests for payment module

- [x] 14. Notification Module
  - [x] 14.1 Implement NotificationModule with BullMQ notification-queue
  - [x] 14.2 Implement email sending (SendGrid / Nodemailer SMTP)
  - [x] 14.3 Implement WhatsApp message sending (WhatsApp Business API / Twilio)
  - [x] 14.4 Implement SMS sending (MSG91 / Twilio)
  - [x] 14.5 Implement notification template system (templates stored in settings table, editable from admin)
  - [x] 14.6 Implement in-app notifications via Socket.io
  - [x] 14.7 Write tests for notification module

- [x] 15. Report Module
  - [x] 15.1 Implement ReportModule with BullMQ report-queue
  - [x] 15.2 Implement GET /reports/dashboard (KPI aggregations)
  - [x] 15.3 Implement sales, purchase, GST (GSTR-1), stock aging, inventory valuation, employee sales reports
  - [x] 15.4 Implement Excel export (ExcelJS) for all report types
  - [x] 15.5 Implement PDF export (Puppeteer) for sales summary and P&L reports
  - [x] 15.6 Implement async report generation: enqueue job → upload to S3 → return presigned URL
  - [x] 15.7 Implement scheduled reports (cron jobs via BullMQ): daily, weekly, monthly GST
  - [x] 15.8 Write tests for report module

- [x] 16. Admin Module
  - [x] 16.1 Implement user management: POST /admin/users, PATCH /admin/users/:id, DELETE /admin/users/:id
  - [x] 16.2 Implement role management: GET/POST /admin/roles, PATCH /admin/roles/:id/permissions
  - [x] 16.3 Implement branch management: GET/POST /admin/branches, PATCH /admin/branches/:id
  - [x] 16.4 Implement settings management: GET/PATCH /admin/settings/:key
  - [x] 16.5 Implement content management: banners, CMS pages, offers (CRUD endpoints)
  - [x] 16.6 Write tests for admin module

- [x] 17. Realtime (Socket.io Gateway)
  - [x] 17.1 Implement NestJS WebSocket Gateway with JWT authentication
  - [x] 17.2 Implement room assignment on connection (branch, user, admin rooms)
  - [x] 17.3 Emit events on: sale.created, inventory.updated, order.status_changed, transfer.received, notification.new, dashboard.refresh, payment.confirmed
  - [x] 17.4 Implement POS item lock/unlock events (inventory.locked, inventory.unlocked)
  - [x] 17.5 Write tests for WebSocket gateway

- [x] 18. Search (PostgreSQL Full-Text Search)
  - [x] 18.1 Add tsvector column and GIN index to inventory_items for full-text search
  - [x] 18.2 Implement admin inventory search using plainto_tsquery
  - [x] 18.3 Implement public product search with filters and faceted aggregations (SQL-based)
  - [x] 18.4 Implement BullMQ search-queue workers for index sync (no-op for MVP, ready for Elasticsearch Phase 2)
  - [x] 18.5 Write tests for search functionality

- [x] 19. Admin Frontend (Next.js)
  - [x] 19.1 Implement auth pages: login, with JWT storage and route guards
  - [x] 19.2 Implement Dashboard page with KPI cards, charts (Recharts), and WebSocket live updates
  - [x] 19.3 Implement Purchase Entry form (all fields, IMEI scanner, photo upload, auto price suggestion)
  - [x] 19.4 Implement POS / Sales page (item search, bill builder, payment splitter, invoice preview)
  - [x] 19.5 Implement Inventory list page (filters, pagination, inline actions)
  - [x] 19.6 Implement Client management pages (list, detail, EKYC, history)
  - [x] 19.7 Implement Stock Transfer pages (create, receive, history, manifest)
  - [x] 19.8 Implement Exchange pages (create exchange, price guide, add to inventory)
  - [x] 19.9 Implement Online Orders management page
  - [x] 19.10 Implement Returns pages (sales return, purchase return)
  - [x] 19.11 Implement Reports page (filters, export buttons, download links)
  - [x] 19.12 Implement User & Role management pages
  - [x] 19.13 Implement Settings pages (branches, taxes, invoice config, notifications, content)

- [x] 20. Public Website Frontend (Next.js)
  - [x] 20.1 Implement Homepage (hero banner, featured categories, flash sale timer, testimonials)
  - [x] 20.2 Implement Product Listing page (filters sidebar, sort, pagination, city/branch filter)
  - [x] 20.3 Implement Product Detail page (image gallery, specs, condition badge, EMI calculator, branch availability chips, Add to Cart, WhatsApp inquiry)
  - [x] 20.4 Implement Cart page (item list, coupon code, order summary)
  - [x] 20.5 Implement Checkout page (address, Razorpay payment integration)
  - [x] 20.6 Implement Order Confirmation and Order Tracking pages
  - [x] 20.7 Implement My Account pages (orders, profile, addresses, wishlist)
  - [x] 20.8 Implement SEO: dynamic meta tags, JSON-LD structured data, sitemap, Open Graph
  - [x] 20.9 Implement PWA support (service worker, offline fallback)
  - [x] 20.10 Implement WhatsApp floating chat button

- [x] 21. Security Hardening
  - [x] 21.1 Configure Helmet (CSP, HSTS, noSniff, xssFilter)
  - [x] 21.2 Configure Redis-backed rate limiting (100 req/min per IP, 1000 req/min per user)
  - [x] 21.3 Implement PII masking in Winston logger
  - [x] 21.4 Implement audit log middleware for all sensitive entity mutations
  - [x] 21.5 Configure S3 bucket policies (private bucket, KYC SSE-KMS encryption)
  - [x] 21.6 Add npm audit and Dependabot to CI pipeline

- [x] 22. Deployment & DevOps
  - [x] 22.1 Write production Dockerfiles for API, web, and admin apps
  - [x] 22.2 Write Docker Compose for development (postgres, redis, api, web, admin)
  - [x] 22.3 Configure GitHub Actions: test → build → push to ECR → deploy to staging
  - [x] 22.4 Write Kubernetes manifests (Deployments, Services, HPA, ConfigMaps, Secrets)
  - [x] 22.5 Configure Prometheus metrics endpoint and Grafana dashboards
  - [x] 22.6 Configure Sentry error tracking in API and frontend apps
  - [x] 22.7 Set up database backup strategy (RDS automated backups, 30-day retention)
