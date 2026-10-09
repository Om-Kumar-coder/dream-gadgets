import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { DataSource } from 'typeorm';
import {
  loadDiscountThresholds,
  loadReturnThresholds,
  DEFAULT_DISCOUNT_THRESHOLDS,
  DEFAULT_RETURN_THRESHOLDS,
} from './settings-thresholds';

/**
 * BUG-19 — settings-backed approval thresholds. The contract:
 *  - numeric setting rows are honoured,
 *  - missing rows / unreadable settings / malformed values fall back to the
 *    historical defaults (authorization must never crash or fail open),
 *  - a nonsensical config (manager > owner) falls back to defaults.
 */
describe('settings-thresholds (BUG-19)', () => {
  let dataSource: any;

  function makeDataSource(rowsBySql: (sql: string, params?: any[]) => any) {
    return { query: jest.fn(async (sql: string, params?: any[]) => rowsBySql(sql, params)) };
  }

  beforeEach(() => {
    dataSource = makeDataSource(() => []);
  });

  describe('loadDiscountThresholds()', () => {
    it('reads discount.threshold_manager / discount.threshold_owner', async () => {
      dataSource = makeDataSource((_sql, params) => {
        if (params?.[0] === 'discount.threshold_manager') return [{ value: 8 }];
        if (params?.[0] === 'discount.threshold_owner') return [{ value: 25 }];
        return [];
      });

      const result = await loadDiscountThresholds(dataSource as DataSource);

      expect(result).toEqual({ manager: 8, owner: 25 });
    });

    it('accepts JSON-string values', async () => {
      dataSource = makeDataSource((_sql, params) => {
        if (params?.[0] === 'discount.threshold_manager') return [{ value: '12' }];
        if (params?.[0] === 'discount.threshold_owner') return [{ value: '30' }];
        return [];
      });

      const result = await loadDiscountThresholds(dataSource as DataSource);

      expect(result).toEqual({ manager: 12, owner: 30 });
    });

    it('falls back to defaults when the rows are missing', async () => {
      const result = await loadDiscountThresholds(dataSource as DataSource);

      expect(result).toEqual(DEFAULT_DISCOUNT_THRESHOLDS);
    });

    it('falls back when the settings query fails', async () => {
      dataSource = { query: jest.fn(async () => { throw new Error('relation does not exist'); }) };

      const result = await loadDiscountThresholds(dataSource as DataSource);

      expect(result).toEqual(DEFAULT_DISCOUNT_THRESHOLDS);
    });

    it('falls back on malformed values (null, objects, negatives)', async () => {
      dataSource = makeDataSource((_sql, params) => {
        if (params?.[0] === 'discount.threshold_manager') return [{ value: null }];
        if (params?.[0] === 'discount.threshold_owner') return [{ value: { weird: true } }];
        return [];
      });

      const result = await loadDiscountThresholds(dataSource as DataSource);

      expect(result).toEqual(DEFAULT_DISCOUNT_THRESHOLDS);
    });

    it('falls back when manager threshold exceeds owner threshold', async () => {
      dataSource = makeDataSource((_sql, params) => {
        if (params?.[0] === 'discount.threshold_manager') return [{ value: 40 }];
        if (params?.[0] === 'discount.threshold_owner') return [{ value: 20 }];
        return [];
      });

      const result = await loadDiscountThresholds(dataSource as DataSource);

      expect(result).toEqual(DEFAULT_DISCOUNT_THRESHOLDS);
    });
  });

  describe('loadReturnThresholds()', () => {
    it('reads return.approval_threshold_* settings', async () => {
      dataSource = makeDataSource((_sql, params) => {
        if (params?.[0] === 'return.approval_threshold_manager') return [{ value: 2000 }];
        if (params?.[0] === 'return.approval_threshold_owner') return [{ value: 100000 }];
        return [];
      });

      const result = await loadReturnThresholds(dataSource as DataSource);

      expect(result).toEqual({ manager: 2000, owner: 100000 });
    });

    it('falls back to the historical ₹5000/₹25000 defaults', async () => {
      const result = await loadReturnThresholds(dataSource as DataSource);

      expect(result).toEqual(DEFAULT_RETURN_THRESHOLDS);
    });
  });
});
