import { DataSource } from 'typeorm';

/**
 * BUG-19 — the `settings` table seeds `discount.threshold_manager`,
 * `discount.threshold_owner`, `return.approval_threshold_manager` and
 * `return.approval_threshold_owner`, but the authorization helpers hardcoded
 * 5/15 (%) and 5000/25000 (₹): an operator who changed a threshold in the
 * admin Settings UI saw no effect anywhere.
 *
 * These loaders read the settings at the point of use and fall back to the
 * historical defaults whenever the row is missing, malformed, or the settings
 * table cannot be read — authorization must never fail open or crash the
 * sale/return flow over a missing tuning value.
 */

export interface ThresholdPair {
  manager: number;
  owner: number;
}

export const DEFAULT_DISCOUNT_THRESHOLDS: ThresholdPair = { manager: 5, owner: 15 };
export const DEFAULT_RETURN_THRESHOLDS: ThresholdPair = { manager: 5000, owner: 25000 };

async function loadSettingNumber(
  dataSource: DataSource,
  key: string,
  fallback: number,
): Promise<number> {
  try {
    const rows: any[] = await dataSource.query(`SELECT value FROM settings WHERE key = $1`, [key]);
    const raw = rows?.[0]?.value;
    // settings.value is jsonb: the seed writes JSON numbers (5, 5000). Accept
    // a numeric string too, but treat null/objects/garbage as "not set".
    const parsed = typeof raw === 'string' ? safeJsonParse(raw) : raw;
    if (typeof parsed !== 'number' || !Number.isFinite(parsed) || parsed < 0) return fallback;
    return parsed;
  } catch {
    return fallback;
  }
}

function safeJsonParse(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    const n = Number(value);
    return Number.isFinite(n) ? n : NaN;
  }
}

/** Discount approval thresholds (percent) — keys `discount.threshold_*`. */
export async function loadDiscountThresholds(dataSource: DataSource): Promise<ThresholdPair> {
  const [manager, owner] = await Promise.all([
    loadSettingNumber(dataSource, 'discount.threshold_manager', DEFAULT_DISCOUNT_THRESHOLDS.manager),
    loadSettingNumber(dataSource, 'discount.threshold_owner', DEFAULT_DISCOUNT_THRESHOLDS.owner),
  ]);
  if (manager > owner) {
    // Nonsense configuration (owner below manager) would make every discount
    // owner-level or sales-level depending on order — keep the defaults.
    return { ...DEFAULT_DISCOUNT_THRESHOLDS };
  }
  return { manager, owner };
}

/** Return approval thresholds (INR) — keys `return.approval_threshold_*`. */
export async function loadReturnThresholds(dataSource: DataSource): Promise<ThresholdPair> {
  const [manager, owner] = await Promise.all([
    loadSettingNumber(dataSource, 'return.approval_threshold_manager', DEFAULT_RETURN_THRESHOLDS.manager),
    loadSettingNumber(dataSource, 'return.approval_threshold_owner', DEFAULT_RETURN_THRESHOLDS.owner),
  ]);
  if (manager > owner) {
    return { ...DEFAULT_RETURN_THRESHOLDS };
  }
  return { manager, owner };
}
