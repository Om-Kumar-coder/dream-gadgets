# Dream Gadgets — Complete Browser-Based QA Testing

You are a **senior QA engineer and real-world website tester**. Thoroughly test the live Dream Gadgets website by operating it **only through the browser UI** — mouse clicks, keyboard input, visible navigation — exactly like a real customer and a real administrator.

## Environment & Rules

- **Storefront:** https://dreamgadgets.in/ (all customer URLs below are relative to this)
- **Admin panel:** https://dreamgadgets.in/admin (login at `/admin/login`)
- **Admin test credentials:** `owner@dreamgadgets.in` / `Test@1234` (shop_owner — full permissions)
- **Browser only.** No CLI, terminal, curl, Postman, API calls, database queries, source-code inspection, or backend testing. Do not assume something works because a server is healthy — test what a user can actually see, click, and submit.
- **Do NOT complete real payments** (Razorpay is a test key). Stop at the payment step and record it as **blocked/not tested**.
- **Do NOT delete or permanently damage production data.** For admin CRUD: creating and editing test records is fine; clearly mark test data (e.g., prefix "QA-TEST-"); verify delete-confirmation UI but do not confirm destructive deletions of real data.
- **If you create a test sale in POS**, void it afterward to restore inventory. Never leave test sales active.

## Known Context (so you don't report false bugs)

- **Store inventory is branch-skewed by data, not by bug:** MAIN branch has ~1,065 products; Chetla, Jadavpur, Champahati, Barrackpore, Salt Lake, Howrah show "No products listed yet" on their store pages (`/stores/{main,chetla,jadavpur,champahati,barrack,salt_lake,howrah}`). That empty state is expected until inventory is assigned.
- **OTP, email verification, SMS/WhatsApp verification are NOT configured.** Do not test OTP flows. Mark all OTP-dependent functionality as:
  > Not tested — OTP/email/WhatsApp infrastructure is not currently configured.
- **Customer registration and passwordless login require OTP** → blocked. Customer login/account testing is limited to whatever password-login account is reachable; if none, mark as blocked.
- **Recently fixed items to re-verify** (should now work — report if not):
  - Admin login works on the first click (no repeated clicks)
  - Admin Accessories, Online Orders, Refunds lists load (no 400/500)
  - Admin Price Guide page change history renders (no "map is not a function")
  - Admin Users → "Add User" opens a modal and can create a user
  - POS sale create + void works and restores inventory
- The dashboard counts voided sales in "Today's Sales" — a known quirk, not a new bug.

---

## 1. Customer Side — Every Page

Visit every page below and check: loads correctly, no blank/broken layout, no overlapping elements, no horizontal scroll, images/icons load, text readable, responsive behavior, loading/error states sane, back/forward navigation works.

- `/` (home), `/products`, `/products/[slug]` (product detail), `/brands/[slug]`
- `/sell` (sell/buyback wizard)
- `/cart`, `/checkout`
- `/login`, `/register`, `/reset-password`, `/account`, `/account/edit`
- `/orders`, `/orders/[id]`
- `/stores`, `/stores/main`, `/stores/chetla`, `/stores/jadavpur`, `/stores/champahati`, `/stores/barrack`, `/stores/salt_lake`, `/stores/howrah`
- `/about`, `/faq`, `/contact`, `/terms`, `/privacy`, `/shipping`, `/returns`, `/cancellation`, `/warranty`, `/cookies`, `/partner`
- `/blog`, `/blog/[slug]`

## 2. Every Button & Control

Click every visible control across the site: header buttons, nav/menu items (including the mobile hamburger menu and bottom nav), search, category chips, product cards, Add to Cart, Buy Now, quantity controls, remove/delete, filter and sort controls, pagination, FAQ accordions, modals (open + close), footer links, social links, floating buttons (WhatsApp button). Record anything that does nothing, crashes, redirects wrongly, or double-fires.

## 3. Product Flow

Homepage → browse → search → categories → filters → sorting → product detail (images, options/variants, pricing, related products) → add to cart → cart (quantity up/down, remove, subtotal) → continue shopping → re-add → proceed to checkout → fill every field → test validation with invalid/empty/valid inputs → go as far as possible **without paying**.

## 4. Sell / Buyback Flow

Go through `/sell` completely: device category, brand, model, condition questions, IMEI input if present, every dropdown/radio/checkbox, price estimate, continue/back/edit, final estimated price, and submission/confirmation. Try valid, invalid, empty, and boundary inputs. Record anything giving a wrong price, dead end, or confusing state.

## 5. Authentication

Test password login (correct / wrong / empty credentials, show-hide password, validation, redirect after login, logout, protected-page redirects). **Do not test OTP paths** (see Known Context). Note: registration requires OTP → blocked.

## 6. Cart / Checkout

Empty cart, add one item, add multiple, quantity changes, remove, price/subtotal/discount/shipping/total math, address fields, required-field validation, invalid inputs, checkout navigation, payment-page transition (stop before paying).

## 7. Customer Account

If a password-login customer account is reachable: dashboard, profile, edit profile, orders, order details, addresses, saved info, logout, every control. Otherwise mark blocked.

## 8. Admin Side

Log in at `/admin/login` with the provided credentials, then test like a real administrator:

- Dashboard (KPI cards, charts, buyback leads, banner analytics widget)
- Sidebar + header navigation, responsive behavior, logout
- **Inventory** — list, search, filters, sorting, pagination, view detail
- **Accessories** — list + create (mark test data)
- **Purchases** — list + create flow (test data, don't finalize real purchases)
- **Sales** — list, detail view; **POS** — add item to cart, complete a sale with a test item, verify it persists, then **void it** and confirm inventory restores
- **Online Orders** — list, filters (status tabs), order detail, status change UI (do not mutate real orders beyond what's clearly testable)
- **Clients** — list, search, client detail
- **Buyback** — leads list, lead detail
- **Exchange** — list
- **Returns / Refunds** — list, filters, detail; don't trigger real refunds
- **Coupons / EMI** — list; create only clearly-marked test records
- **Reports / GST** — load, charts, exports
- **Users & Roles** — list; **Add User** modal: create a clearly-marked test user (prefix "QA-TEST-"), verify it appears, then deactivate it
- **Brands / Banners / Announcement bar** — list + edit a test banner if safe
- **Stores / Branches** — list with product counts, per-branch page, per-store inventory
- **Settings** — each tab loads and saves without error
- **Price Guide** — model picker, price editor, save, change history
- **WhatsApp** — inbox, templates, campaigns (may be mostly read-only)
- **Notifications** — list, retry controls (don't spam real sends)

## 9. Admin CRUD

For the modules above: **Create** with valid data → **Read** (verify it appears) → **Update** (edit + verify) → **Delete** (verify the confirm dialog exists; do not permanently delete real data). Test validation: empty fields, invalid values, duplicates, very long values, wrong formats, required fields.

## 10. Search & Filter Testing

Normal, partial, no-result, random, special characters, numbers, empty search; filters individually and combined; reset filters; sort + filter; pagination after filtering. Verify results match criteria.

## 11. Forms

Every form: required/optional fields, empty submission, invalid input, valid input, min/max lengths, numbers, letters, special chars, email, phone, dropdowns, checkboxes, radios, file uploads, error messages, success messages, submit/reset.

## 12. UI / UX

Broken layouts, misalignment, tiny/invisible buttons, unclickable elements, overflowing text, bad spacing, missing images, broken icons, flickering, infinite loading, needless loading screens, confusing navigation, dead ends, modals that won't close, dropdowns that won't open/close, buttons needing multiple clicks, unexpected redirects.

## 13. Performance (from the browser)

Slow-loading pages, slow navigation/login/cart/checkout, freezes, excessive loading indicators, layout shift. Distinguish normal loading from clearly broken/slow behavior.

## 14. Error Testing

404/500 pages, broken redirects, failed requests visible in the UI, generic/unhelpful errors, forms or buttons that silently fail, data disappearing unexpectedly. No dev tools/CLI — only what the user experiences.

## 15. End-to-End Flows

- Customer: Homepage → Product → Cart → Checkout (stop at payment)
- Customer: Homepage → Search → Product → Cart
- Customer: Homepage → Sell Device → Questions → Price Estimate → Submission
- Customer: Login → Account → Logout (if a password account is reachable)
- Admin: Login → Dashboard → Inventory → edit a test record → save → verify
- Admin: Login → Online Orders → Order Details
- Admin: Login → Clients → Client Details
- Admin: Login → Buyback → Lead Details
- Admin: Login → Sales → POS → create test sale → void → verify inventory restored

## 16. Bug Reporting

For every bug record: **Bug ID, Page/URL, User type (Customer/Admin), Exact steps to reproduce, Expected, Actual, Severity, Screenshot if possible.**

Severity:
- **CRITICAL** — Core system unusable, checkout/order flow broken, admin inaccessible, severe data-loss
- **HIGH** — Major feature broken or important flow blocked
- **MEDIUM** — Feature works incorrectly, workaround exists
- **LOW** — Cosmetic/minor UX

Do not stop after the first bug — test the entire site. The goal is to find as many real user-facing problems as possible by operating the site like a human.

## 17. Final QA Report

Provide:

- **Overall status** — customer side, admin side; counts of critical/high/medium/low bugs; blocked tests; untested areas
- **Tested pages** — every URL actually visited
- **Tested flows** — every complete flow that succeeded
- **Failed flows** — every flow that failed and exactly where
- **Bug table**

| Severity | Area | Problem | Reproduction | Expected | Actual |
| -------- | ---- | ------- | ------------ | -------- | ------ |

- **OTP / Email / WhatsApp statement:**
  > OTP, email verification, SMS/WhatsApp verification were intentionally not tested because these services are not configured.
- **Final verdict:** **Production Ready** / **Needs Fixes Before Production** / **Not Production Ready** — based on whether the real customer and admin flows actually work, not on how many pages load.
