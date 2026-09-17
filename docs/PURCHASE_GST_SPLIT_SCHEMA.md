# Proposal: Purchase-time CGST/SGST/IGST Split (Intra vs Inter-State)

**Status:** Implemented (schema, service, tests — see git history). Open questions
resolved 2026-09-18 (§12). Remaining follow-ups: admin form (§7.6), ITC report
+ GST data-quality flags (§8, §12-Q1), vendor-return tax columns (§12-Q2).
**Date:** 2026-09-17
**Scope:** `apps/api` (purchase module, gst module), one new migration, admin purchase form

---

## 1. Problem

Purchases today record a **flat `taxAmount`** with no intra/inter-state distinction:

```sql
-- "purchases" (migration 002-create-inventory-tables)
"tax_amount" DECIMAL(12,2) NOT NULL DEFAULT 0
```

Consequences:

- **Input Tax Credit (ITC) cannot be filed correctly.** GSTR-2B/3B need ITC split
  into CGST + SGST (intra-state) vs IGST (inter-state) per invoice.
- The split **cannot be reconstructed reliably later** — the vendor's state is not
  stored, so the intra/inter determination at filing time is a guess.
- There are **no line items**: `CreatePurchaseDto` sends `itemIds: string[]` and one
  header-level `taxAmount`, so per-item `taxRate`/HSN data is lost.
- Vendor GSTIN is not snapshotted, so a vendor correcting their registration later
  silently rewrites history.

Sales already handle this correctly at write time
(`calculateGST(price, taxRate, isInterState)` in `common/utils/business-logic.ts`);
purchases never got the equivalent. This proposal brings purchases to parity.

---

## 2. Goals / Non-goals

**Goals**

1. Capture supply type (intra vs inter-state) **at purchase time**, derived from
   data we already have (branch state + vendor state/GSTIN), overridable by the user.
2. Store the explicit CGST/SGST/IGST breakdown (not derived at report time) so ITC
   filing is stable even if branch/vendor data changes later.
3. Introduce a `purchase_items` line-item table with per-item taxable value, tax
   rate, and tax split.
4. Preserve the existing API surface: `purchases.taxAmount` keeps its meaning
   (total tax), existing reports keep working.
5. Backfill existing rows deterministically.

**Non-goals**

- TDS/TCS, composition-scheme vendors, e-invoicing/IRN — noted as future hooks.
- Changing the sales-side GST logic (already correct).
- Vendor master data management (vendors remain free-text + optional client link).

---

## 3. Design Overview

```
┌────────────────────────────────────────────────────────────────────┐
│ Admin purchase form                                                │
│  vendor GSTIN / state ──┐                                          │
│  branch (fixed) ────────┤→ supplyType = inter ? 'inter' : 'intra'   │
│  per-item price + rate  ┘   (user may override, reason logged)     │
└────────────────────────────────────────────────────────────────────┘
          │
          ▼
 purchase_items (per line: taxable, taxRate, cgst, sgst, igst, hsn)
          │ Σ
          ▼
 purchases (header snapshot: vendor_gstin, place_of_supply,
            supply_type, cgst, sgst, igst, tax_amount = Σ)
```

**Core rule (GST Act, mirrored from `gst.service.computeTaxBreakup`):**

- Supplier state (branch) == Place of supply (vendor state) → **CGST + SGST** (rate/2 each)
- Different states → **IGST** (full rate)

We **derive** it, let the user **override** when the derivation is ambiguous, and
**persist the result** so reports never re-derive.

---

## 4. Schema Changes

### 4.1 `purchases` — new columns (all nullable-safe)

| Column | Type | Default | Notes |
|---|---|---|---|
| `supply_type` | `VARCHAR(10)` `'intra' \| 'inter'` | `'intra'` | Derived or user-set |
| `supply_type_source` | `VARCHAR(10)` `'derived' \| 'manual'` | `'derived'` | Audit: was it overridden? |
| `vendor_gstin` | `VARCHAR(15)` | `NULL` | Snapshot at purchase time (validated against `GSTIN_FORMAT`) |
| `vendor_state_code` | `VARCHAR(2)` | `NULL` | First 2 digits of vendor GSTIN, or vendor state name mapped via `STATE_CODES` |
| `place_of_supply` | `VARCHAR(2)` | `NULL` | State code; defaults to vendor state code for purchases |
| `is_reverse_charge` | `BOOLEAN` | `false` | RCM purchases (ITC rules differ) |
| `is_itc_eligible` | `BOOLEAN` | `true` | Blocked credits (e.g. certain goods) set false |
| `cgst_amount` | `DECIMAL(12,2)` | `0` | Persisted split |
| `sgst_amount` | `DECIMAL(12,2)` | `0` | Persisted split |
| `igst_amount` | `DECIMAL(12,2)` | `0` | Persisted split |

`tax_amount` stays and remains the **total tax** = `cgst + sgst + igst` (no rename,
no breaking change). A CHECK constraint enforces the identity:

```sql
CHECK (ROUND(cgst_amount + sgst_amount + igst_amount, 2) = ROUND(tax_amount, 2))
```

> **Why persist the split at all?** `gst.service.ts` currently derives the split at
> report time. That works for sales only because customer state is on every sale.
> For purchases the vendor state is *not* stored today — deriving at report time
> means every filing re-guesses. Snapshots are the standard accounting practice.

### 4.2 New table: `purchase_items`

```sql
CREATE TABLE "purchase_items" (
  "id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "purchase_id"   UUID NOT NULL REFERENCES "purchases"("id") ON DELETE CASCADE,
  "item_id"       UUID REFERENCES "inventory_items"("id"),  -- NULL for non-stock lines
  "description"   VARCHAR(300) NOT NULL,
  "hsn_code"      VARCHAR(10),
  "quantity"      DECIMAL(12,3) NOT NULL DEFAULT 1,
  "unit_price"    DECIMAL(12,2) NOT NULL DEFAULT 0,   -- taxable value per unit
  "tax_rate"      DECIMAL(5,2)  NOT NULL DEFAULT 0,   -- %
  "taxable_value" DECIMAL(12,2) NOT NULL DEFAULT 0,   -- quantity * unit_price
  "cgst_amount"   DECIMAL(12,2) NOT NULL DEFAULT 0,
  "sgst_amount"   DECIMAL(12,2) NOT NULL DEFAULT 0,
  "igst_amount"   DECIMAL(12,2) NOT NULL DEFAULT 0,
  "tax_amount"    DECIMAL(12,2) NOT NULL DEFAULT 0,   -- line total tax
  "line_total"    DECIMAL(12,2) NOT NULL DEFAULT 0,   -- taxable_value + tax_amount
  "created_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX "idx_purchase_items_purchase" ON "purchase_items"("purchase_id");
CREATE INDEX "idx_purchase_items_item"     ON "purchase_items"("item_id");
```

`item_id` is nullable to support expense/service lines (packaging, repairs) that
don't map to an inventory item — GST filings need these even though stock does not.

### 4.3 Unchanged

- `inventory_items` keeps its existing `purchase_price`, `tax_amount`, `total_cost`,
  `tax_rate` columns — the purchase flow continues to populate them; no schema
  change there.
- `purchases.tax_amount`, `total_amount`, `invoice_number` semantics unchanged.

---

## 5. Migration

Next sequential number in `apps/api/src/database/migrations` (repo pattern: raw SQL,
`up`/`down`, numbered prefix). Sketched as `0XX-purchase-gst-split.ts`:

```ts
export class PurchaseGstSplit1710000000002 implements MigrationInterface {
  async up(q: QueryRunner) {
    await q.query(`ALTER TABLE "purchases"
      ADD COLUMN "supply_type"         VARCHAR(10)  NOT NULL DEFAULT 'intra',
      ADD COLUMN "supply_type_source"  VARCHAR(10)  NOT NULL DEFAULT 'derived',
      ADD COLUMN "vendor_gstin"        VARCHAR(15),
      ADD COLUMN "vendor_state_code"   VARCHAR(2),
      ADD COLUMN "place_of_supply"     VARCHAR(2),
      ADD COLUMN "is_reverse_charge"   BOOLEAN      NOT NULL DEFAULT false,
      ADD COLUMN "is_itc_eligible"     BOOLEAN      NOT NULL DEFAULT true,
      ADD COLUMN "cgst_amount"         DECIMAL(12,2) NOT NULL DEFAULT 0,
      ADD COLUMN "sgst_amount"         DECIMAL(12,2) NOT NULL DEFAULT 0,
      ADD COLUMN "igst_amount"         DECIMAL(12,2) NOT NULL DEFAULT 0`);

    // CHECK constraint added AFTER backfill (below), so legacy rows pass.
    await q.query(`
      CREATE TABLE "purchase_items" ( ...as §4.2... )`);
  }

  async down(q: QueryRunner) {
    await q.query(`DROP TABLE IF EXISTS "purchase_items"`);
    await q.query(`ALTER TABLE "purchases"
      DROP COLUMN "supply_type", DROP COLUMN "supply_type_source",
      DROP COLUMN "vendor_gstin", DROP COLUMN "vendor_state_code",
      DROP COLUMN "place_of_supply", DROP COLUMN "is_reverse_charge",
      DROP COLUMN "is_itc_eligible", DROP COLUMN "cgst_amount",
      DROP COLUMN "sgst_amount", DROP COLUMN "igst_amount"`);
  }
}
```

---

## 6. Backfill Strategy (existing rows)

Existing purchases have no vendor state → the intra/inter split is unknowable.
The backfill must match **current reporting behavior** so GSTR numbers don't shift:
`gst.service.computeTaxBreakup(_, _, isInterState=false)` splits tax 50/50 CGST/SGST.

```sql
UPDATE "purchases" SET
  "supply_type"        = 'intra',
  "supply_type_source" = 'derived',
  "cgst_amount"        = ROUND("tax_amount" / 2, 2),
  "sgst_amount"        = ROUND("tax_amount" / 2, 2),
  "igst_amount"        = 0;
```

- Assumption is explicit and auditable via `supply_type_source`.
- If a `vendor_gstin` later becomes known for a legacy row (edited in admin), the
  split can be re-derived and corrected — a manual accounting action, not automatic.
- One-purchase-per-invoice rows where the vendor was genuinely inter-state will be
  wrong until corrected; the amount of ITC is identical (only the bucket moves),
  and GSTR-3B reconciliation flags them. Acceptable for legacy data.

---

## 7. Code Changes

### 7.1 Reuse, don't reinvent

`calculateGST(amount, taxRate, isInterState)` in `common/utils/business-logic.ts`
already returns `{ cgst, sgst, igst, total }` with the exact semantics needed —
the purchase service uses it directly (same contract the sales service relies on;
it has property-based test coverage in `business-logic.spec.ts`).

Vendor GSTIN validation reuses `GSTIN_FORMAT` from
`modules/admin/branch-gstin.validation.ts` — currently only used for branches,
same format applies to vendors. The first **2 digits of a GSTIN are the state
code**, which gives us `vendor_state_code` even when only the GSTIN is known.

### 7.2 Derivation order (`purchase.service.create`)

```
vendorStateCode =
  1. dto.vendorStateCode                       (explicit from UI)
  2. dto.vendorGstin.slice(0, 2)               (GSTIN digits)
  3. STATE_CODES[vendor.state]                 (vendor linked to client w/ state)
  4. null

placeOfSupply = dto.placeOfSupply ?? vendorStateCode
supplyType    = placeOfSupply && branchStateCode && placeOfSupply !== branchStateCode
                ? 'inter' : 'intra'          — nulls degrade to 'intra'
                (matches gst.service.isInterState(null, x) → false behavior)
```

`branchStateCode` comes from `branch.state` via the existing `STATE_CODES` map in
`gst.service.ts` (promote that map + `getStateCode` into
`common/utils/state-codes.ts` so both modules share it).

### 7.3 DTO (`CreatePurchaseDto` additions)

```ts
@ApiPropertyOptional() @IsOptional() @IsString()
vendorGstin?: string;          // validated against GSTIN_FORMAT when present

@ApiPropertyOptional() @IsOptional() @Matches(/^[0-9]{2}$/)
vendorStateCode?: string;      // explicit override

@ApiPropertyOptional() @IsOptional() @IsIn(['intra', 'inter'])
supplyType?: 'intra' | 'inter';   // manual override → supply_type_source = 'manual'

@ApiPropertyOptional() @IsOptional() @IsBoolean()
isReverseCharge?: boolean;

@ApiPropertyOptional() @IsOptional() @IsBoolean()
isItcEligible?: boolean;

@ApiPropertyOptional() @IsArray() @ValidateNested({ each: true })
@Type(() => CreatePurchaseItemDto)
items?: CreatePurchaseItemDto[];   // preferred; itemIds still accepted (legacy)
```

`CreatePurchaseItemDto`: `itemId?`, `description`, `hsnCode?`, `quantity?`,
`unitPrice`, `taxRate?`, `taxableValue?` (defaults to `quantity * unitPrice`).

**Back-compat:** if only `itemIds` + header `taxAmount` are sent (current admin
form), the service creates one purchase_items line per item — taxable value from
`item.purchase_price` (falling back to `total_cost - tax_amount`), `taxRate` from
`item.tax_rate`, and the line taxes derived from the resolved `supplyType`. Existing
clients keep working unmodified.

### 7.4 Service logic (create flow)

```ts
const lines = resolveLines(dto, items);            // §7.3 back-compat
const supplyType = dto.supplyType ?? deriveSupplyType(...);
for (const line of lines) {
  const taxable = line.taxableValue;
  const gst = calculateGST(taxable, line.taxRate, supplyType === 'inter');
  line.cgst = gst.cgst; line.sgst = gst.sgst; line.igst = gst.igst;   // per line
}
const totals = sumLines(lines);
// header: tax_amount = totals.total, cgst/sgst/igst = totals.*,
//         total_amount = Σ line_total  (replaces Σ item.total_cost when lines given)
```

**Validation rules** (throw `BadRequestException` with `code`, matching house style):

| code | rule |
|---|---|
| `TAX_SPLIT_MISMATCH` | `Σ line tax` vs header `taxAmount` (if provided) differ > ₹0.01 |
| `VENDOR_GSTIN_INVALID` | provided GSTIN fails `GSTIN_FORMAT` |
| `SUPPLY_TYPE_UNRESOLVED` | manual `supplyType` omitted and derivation found **no** vendor state **and** `taxAmount > 0` → require explicit choice (UI shows a toggle) |
| `NO_ITEMS` | existing — at least one line |

`is_itc_eligible=false` or `is_reverse_charge=true` lines are stored as-is and
excluded from regular ITC in reporting (§8).

### 7.5 Entities

- `Purchase` entity: add the 10 columns (§4.1).
- New `PurchaseItem` entity; register `PurchaseItem` in `TypeOrmModule.forFeature`
  in `purchase.module.ts`.

### 7.6 Admin UI (`apps/admin/app/(admin)/purchases/new/page.tsx`)

- Vendor GSTIN input → auto-fills state code → sets the intra/inter toggle
  (editable; shows "Derived from GSTIN" vs "Manual").
- Items table gains per-line tax rate; header "Tax" becomes read-only
  Σ (CGST/SGST/IGST shown under a collapsible breakdown).
- When derivation is unresolved (§7.4), require the toggle before submit.

---

## 8. Reporting Enablement (follow-up, not in this change)

With splits persisted, a GSTR-2B/3B-style ITC report becomes a straightforward
aggregate — proposed as a separate endpoint after this lands:

```sql
SELECT date_trunc('month', purchase_date) AS period,
       SUM(cgst_amount) FILTER (WHERE is_itc_eligible AND NOT is_reverse_charge) AS itc_cgst,
       SUM(sgst_amount) FILTER (WHERE is_itc_eligible AND NOT is_reverse_charge) AS itc_sgst,
       SUM(igst_amount) FILTER (WHERE is_itc_eligible AND NOT is_reverse_charge) AS itc_igst
FROM purchases
WHERE status = 'completed'
GROUP BY 1 ORDER BY 1;
```

Per §12-Q1, the same endpoint also returns a `dataQuality` block listing
purchases with unknown vendor state but non-zero tax (`vendor_state_code IS NULL
AND tax_amount > 0 AND supply_type_source = 'derived'`) so they can be corrected
before filing. Per §12-Q3, intra-state union-territory supplies contribute to
`itc_sgst` (UTGST is stored in `sgst_amount`).

`gst.service.ts` stays sales-only (GSTR-1) in this change; purchase ITC reporting
is additive.

---

## 9. Edge Cases & Decisions

| # | Case | Decision |
|---|---|---|
| 1 | Vendor state unknown + tax > 0 | Require manual `supplyType` (`SUPPLY_TYPE_UNRESOLVED`) |
| 2 | Vendor state unknown + tax = 0 | Default `intra`; nothing to split |
| 3 | RCM purchase (`is_reverse_charge`) | Taxes recorded but excluded from regular ITC report |
| 4 | Union territory suppliers | UTs use CGST + UTGST; we store UTGST in `sgst_amount` (standard practice — filing software maps it) |
| 5 | Vendor corrects GSTIN after the fact | Snapshot on the purchase row is immutable; new purchases use the new GSTIN |
| 6 | `taxRate` missing on inventory item | Line tax rate defaults 0; UI warns "rate not set — tax computed at 0%" rather than blocking |
| 7 | Mixed intra/inter lines on one invoice | Not supported (place of supply is per-invoice); rejected with `TAX_SPLIT_MISMATCH`-style error if a manual per-line override attempts it |
| 8 | Legacy `itemIds`-only clients | Auto line creation (§7.3) — no API break |
| 9 | Rounding | `calculateGST` per line, then Σ for header; 2-decimal; header CHECK enforces consistency |
| 10 | `taxInclusive` pricing (MRP includes tax) | Out of scope now; column set leaves room (`unit_price` stays taxable-value) |

---

## 10. Testing Plan

- **Unit (`purchase.service.spec.ts`)**: intra vs inter derivation (GSTIN prefix,
  explicit code, client state, unresolved), split math vs `calculateGST`,
  back-compat `itemIds` path, all validation error codes, header/line sum identity.
- **Migration**: up/down on a seeded DB; CHECK passes after backfill.
- **Regression**: existing purchase suite must pass unchanged (back-compat).
- **Manual QA**: create purchase with inter-state vendor; verify admin list, and
  (post-follow-up) ITC report buckets.

---

## 11. Rollout Checklist

1. Shared `state-codes.ts` util extracted (gst.service refactor, no behavior change).
2. Migration + entity + DTO + service changes (§4–§7).
3. Backfill + CHECK constraint (§5, §6).
4. Admin form updates (§7.6).
5. Test suite + typecheck + build green.
6. Follow-up PR: ITC reporting endpoint (§8).

---

## 12. Open Questions — RESOLVED

Resolved 2026-09-18 after a code review of the returns module. Each resolution
records the deciding evidence and the resulting action.

### Q1. Flag legacy rows with unknown vendor state, or let them silently stay `intra`?

**Decision: flag them — a lightweight "GST data quality" report shipped alongside
the §8 ITC report.** They must not silently stay `intra`.

**Why:**

- The migration backfill (§6) wrote `supply_type_source = 'derived'` for every
  legacy row *without ever seeing vendor state* — so the column alone cannot
  distinguish "correctly derived" from "assumed". The audit trail is ambiguous
  by design for backfilled data.
- §7.4 deliberately lets legacy `itemIds` clients degrade to intra when vendor
  state is unknown, and the backfill does the same. That means new purchases
  continue to accrue into the same silent-degradation bucket. Without a flag,
  nothing ever surfaces these rows for correction — an inter-state vendor's IGC
  ITC keeps landing in the CGST/SGST buckets until someone notices by hand.
- The amount of ITC is identical (only the bucket moves), but a GSTR-3B
  reconciliation against the vendor's GSTR-1 will flag mismatches — better that
  the app flags them first.

**Action (scoped into the §8 follow-up, not separate work):** the ITC report
endpoint also returns a `dataQuality` block with the count + list of purchases
where `vendor_state_code IS NULL AND tax_amount > 0 AND supply_type_source =
'derived'`, so the admin UI can badge "N purchases need vendor GSTIN/state".
Correction path: edit the purchase (vendor GSTIN/state fields are updatable via
`UpdatePurchaseDto`), which the accountant then re-buckets at filing time.

### Q2. Purchase-level credit notes (vendor returns) — new sibling table now, or rely on the existing returns flow?

**Decision: defer the sibling table; extend the existing `returns` flow instead —
as a follow-up after the ITC report, driven by a real filing need.**

**Why (from the code review):**

- The premise of "defer until vendor returns are a real workflow" turned out to
  be stale: `createPurchaseReturn()` (modules/returns/return.service.ts §12.1)
  already exists, is exposed in the controller, and is covered by tests. Vendor
  returns ARE a real workflow in this codebase.
- However, it is **not CDNR-ready**: the `returns` table has no CGST/SGST/IGST
  columns, and `createPurchaseReturn` sets `refundAmount = purchase.totalAmount`
  (full invoice) with no per-line, no partial-return, and no tax reversal. A
  purchase-level credit-note table would duplicate the return lifecycle
  (numbering, approval, status, events) that `returns` already owns.
- Buying CDNR reporting is a reporting concern, not a storage concern: GSTR-2
  CDNR rows need the original invoice number/date, reversed tax split, and
  reason — all derivable by joining `returns` (returnType='purchase') to
  `purchases` once tax columns exist on the return.

**Action:** do **not** create a sibling `purchase_credit_notes` table. Instead,
when vendor-return reporting becomes a filing requirement, add
`cgst_amount/sgst_amount/igst_amount/tax_amount` + `place_of_supply` columns to
`returns` (same snapshot pattern as §4.1) and populate them in
`createPurchaseReturn` proportionally to the returned lines. Track it as its own
follow-up ticket; keep it out of §8's ITC scope (ITC first — credits only matter
once ITC exists to reverse).

### Q3. UTGST-in-`sgst_amount` mapping

**Decision: keep UTGST stored in `sgst_amount` — no schema change. It is the
standard convention and is what filing software expects.**

**Why:**

- The GST statute treats UTGST identically to SGST for intra-UT supplies; every
  major filing platform (ClearTax, Masters India, IRIS, Zoho) maps UTGST to the
  SGST column of GSTR-2/3B. Storing it separately would force a merge at export
  time for zero benefit.
- The schema already records what a user would need to un-map it if ever
  required: `place_of_supply` (UT state codes 04 Chandigarh, 26
  Dadra–Nagar Haveli & Daman–Diu, 31 Lakshadweep, 34 Puducherry, 35
  Andaman & Nicobar, 38 Ladakh) identifies union-territory supplies.

**Action:** document the convention on the entity (already noted on
`Purchase.sgstAmount`: "Persisted SGST/**UTGST** portion") and add a note to the
§8 ITC report spec that UT supplies read from `sgst_amount`. **Human follow-up
remains:** the accountant should confirm before the first filing that the
CA-facing export labels this column "SGST/UTGST" — that is a labeling task in
the report, not a schema decision.
