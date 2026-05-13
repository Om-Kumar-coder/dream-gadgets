import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { SearchService } from './search.service';

// ─── Mock DataSource ──────────────────────────────────────────────────────────

function makeDataSource(queryResult: any[] = []): any {
  return {
    query: jest.fn(async () => queryResult) as any,
  };
}

// ─── Test suite ───────────────────────────────────────────────────────────────

describe('SearchService', () => {
  let service: SearchService;
  let dataSource: any;
  let configService: any;

  beforeEach(async () => {
    dataSource = makeDataSource();
    configService = {
      get: jest.fn((key: string) => {
        const config: Record<string, any> = {
          'redis.url': undefined,
          REDIS_URL: undefined,
        };
        return config[key];
      }) as any,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: getDataSourceToken(), useValue: dataSource },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
  });

  // ─── 18.2 Admin inventory search ─────────────────────────────────────────────

  describe('searchInventory()', () => {
    it('should return paginated results', async () => {
      dataSource.query
        .mockResolvedValueOnce([{ total: 5 }])
        .mockResolvedValueOnce([
          { id: 'item-1', brand_name: 'Apple', model_name: 'iPhone 14', imei: '123456789012345' },
        ]);

      const result = await service.searchInventory('iPhone', { page: 1, limit: 10 });

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(5);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should use plainto_tsquery for full-text search', async () => {
      dataSource.query.mockResolvedValue([{ total: 0 }]);

      await service.searchInventory('iPhone 14 Pro', {});

      const queryCall = dataSource.query.mock.calls[0][0] as string;
      expect(queryCall).toContain('plainto_tsquery');
      expect(queryCall).toContain('search_vector');
    });

    it('should apply condition filter', async () => {
      dataSource.query.mockResolvedValue([{ total: 0 }]);

      await service.searchInventory('', { condition: 'mint' });

      const queryCall = dataSource.query.mock.calls[0][0] as string;
      expect(queryCall).toContain('condition');
    });

    it('should apply status filter', async () => {
      dataSource.query.mockResolvedValue([{ total: 0 }]);

      await service.searchInventory('', { status: 'available' });

      const queryCall = dataSource.query.mock.calls[0][0] as string;
      expect(queryCall).toContain('status');
    });

    it('should apply branchId filter', async () => {
      dataSource.query.mockResolvedValue([{ total: 0 }]);

      await service.searchInventory('', { branchId: 'branch-uuid-1' });

      const queryCall = dataSource.query.mock.calls[0][0] as string;
      expect(queryCall).toContain('branch_id');
    });

    it('should apply price range filters', async () => {
      dataSource.query.mockResolvedValue([{ total: 0 }]);

      await service.searchInventory('', { minPrice: 10000, maxPrice: 50000 });

      const queryCall = dataSource.query.mock.calls[0][0] as string;
      expect(queryCall).toContain('selling_price');
    });

    it('should return empty results gracefully when DB fails', async () => {
      dataSource.query.mockImplementation(async () => { throw new Error('DB error'); });

      const result = await service.searchInventory('iPhone', {});

      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should use default pagination when not specified', async () => {
      dataSource.query.mockResolvedValue([{ total: 0 }]);

      const result = await service.searchInventory('', {});

      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });
  });

  // ─── 18.3 Public product search ───────────────────────────────────────────────

  describe('searchPublicProducts()', () => {
    it('should filter by is_online=true and status=available', async () => {
      dataSource.query.mockResolvedValue([{ total: 0 }]);

      await service.searchPublicProducts('', {});

      const queryCall = dataSource.query.mock.calls[0][0] as string;
      expect(queryCall).toContain('is_online = true');
      expect(queryCall).toContain("status = 'available'");
    });

    it('should return paginated results for public search', async () => {
      dataSource.query
        .mockResolvedValueOnce([{ total: 3 }])
        .mockResolvedValueOnce([
          { id: 'item-1', brand_name: 'Samsung', model_name: 'Galaxy S23', online_price: 45000 },
        ])
        .mockResolvedValueOnce([]) // condition facets
        .mockResolvedValueOnce([]); // storage facets

      const result = await service.searchPublicProducts('Samsung', { page: 1, limit: 10 });

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(3);
    });

    it('should apply colour filter with ILIKE', async () => {
      dataSource.query.mockResolvedValue([{ total: 0 }]);

      await service.searchPublicProducts('', { colour: 'black' });

      const queryCall = dataSource.query.mock.calls[0][0] as string;
      expect(queryCall).toContain('ILIKE');
    });

    it('should apply storage filter', async () => {
      dataSource.query.mockResolvedValue([{ total: 0 }]);

      await service.searchPublicProducts('', { storage: '128GB' });

      const queryCall = dataSource.query.mock.calls[0][0] as string;
      expect(queryCall).toContain('storage');
    });

    it('should return empty results gracefully when DB fails', async () => {
      dataSource.query.mockImplementation(async () => { throw new Error('DB error'); });

      const result = await service.searchPublicProducts('iPhone', {});

      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  // ─── 18.4 Index sync (no-op) ──────────────────────────────────────────────────

  describe('syncItem()', () => {
    it('should not throw (no-op for MVP)', async () => {
      await expect(service.syncItem('item-uuid-1')).resolves.not.toThrow();
    });

    it('should log the sync operation', async () => {
      const logSpy = jest.spyOn((service as any).logger, 'log') as any;

      await service.syncItem('item-uuid-1');

      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('item-uuid-1'));
    });
  });

  describe('removeItem()', () => {
    it('should not throw (no-op for MVP)', async () => {
      await expect(service.removeItem('item-uuid-1')).resolves.not.toThrow();
    });

    it('should log the remove operation', async () => {
      const logSpy = jest.spyOn((service as any).logger, 'log') as any;

      await service.removeItem('item-uuid-1');

      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('item-uuid-1'));
    });
  });
});
