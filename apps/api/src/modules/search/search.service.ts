import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

export interface SearchFilters {
  itemId?: string;
  condition?: string;
  status?: string;
  brand?: string;
  model?: string;
  branchId?: string;
  minPrice?: number;
  maxPrice?: number;
  isOnline?: boolean;
  storage?: string;
  colour?: string;
  city?: string;
  page?: number;
  limit?: number;
}

export interface SearchResult {
  items: any[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  private queue: any = null;

  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
    private configService: ConfigService,
  ) {
    this.initQueue();
  }

  private readonly fallbackImage = 'https://via.placeholder.com/300x300?text=No+Image';

  // ─── Queue init ───────────────────────────────────────────────────────────────

  private initQueue(): void {
    try {
      const { Queue } = require('bullmq');
      const redisUrl = this.configService.get<string>('redis.url') ?? this.configService.get<string>('REDIS_URL');
      if (redisUrl) {
        this.queue = new Queue('search', {
          connection: { url: redisUrl },
          defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 1000 } },
        });
        this.logger.log('Search BullMQ queue initialized');
      }
    } catch {
      this.logger.warn('BullMQ not available for search queue');
    }
  }

  // ─── 18.2 Admin inventory search ─────────────────────────────────────────────

  async searchInventory(query: string, filters: SearchFilters = {}): Promise<SearchResult> {
    const { page = 1, limit = 20 } = filters;
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIdx = 1;

    // Full-text search using tsvector
    if (query?.trim()) {
      conditions.push(`i.search_vector @@ plainto_tsquery('english', $${paramIdx})`);
      params.push(query.trim());
      paramIdx++;
    }

    // Filters
    if (filters.condition) {
      conditions.push(`i.condition = $${paramIdx}`);
      params.push(filters.condition);
      paramIdx++;
    }
    if (filters.status) {
      conditions.push(`i.status = $${paramIdx}`);
      params.push(filters.status);
      paramIdx++;
    }
    if (filters.branchId) {
      conditions.push(`i.branch_id = $${paramIdx}`);
      params.push(filters.branchId);
      paramIdx++;
    }
    if (filters.minPrice !== undefined) {
      conditions.push(`i.selling_price >= $${paramIdx}`);
      params.push(filters.minPrice);
      paramIdx++;
    }
    if (filters.maxPrice !== undefined) {
      conditions.push(`i.selling_price <= $${paramIdx}`);
      params.push(filters.maxPrice);
      paramIdx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    try {
      const countResult = await this.dataSource.query(
        `SELECT COUNT(*)::int AS total FROM inventory_items i ${whereClause}`,
        params,
      );

      const rankClause = query?.trim()
        ? `, ts_rank(i.search_vector, plainto_tsquery('english', $1)) AS rank`
        : '';
      const orderClause = query?.trim() ? 'ORDER BY rank DESC, i.created_at DESC' : 'ORDER BY i.created_at DESC';

      const items = await this.dataSource.query(
        `SELECT
          i.id, i.imei, i.condition, i.status,
          i.purchase_price, i.selling_price, i.online_price,
          i.colour, i.storage, i.battery_health,
          i.is_online, i.created_at,
          brd.name AS brand_name,
          mdl.name AS model_name,
          b.name AS branch_name
          ${rankClause}
        FROM inventory_items i
        LEFT JOIN brands brd ON brd.id = i.brand_id
        LEFT JOIN models mdl ON mdl.id = i.model_id
        LEFT JOIN branches b ON b.id = i.branch_id
        ${whereClause}
        ${orderClause}
        LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
        [...params, limit, offset],
      );

      return {
        items,
        total: countResult[0]?.total ?? 0,
        page,
        limit,
      };
    } catch (err: any) {
      this.logger.warn(`Search query failed: ${err?.message}`);
      return { items: [], total: 0, page, limit };
    }
  }

  // ─── 18.3 Public product search ───────────────────────────────────────────────

  async searchPublicProducts(query: string, filters: SearchFilters = {}): Promise<SearchResult> {
    const { page = 1, limit = 20 } = filters;
    const offset = (page - 1) * limit;

    const conditions: string[] = [
      `i.is_online = true`,
      `i.status = 'available'`,
    ];
    const params: any[] = [];
    let paramIdx = 1;

    if (query?.trim()) {
      conditions.push(`i.search_vector @@ plainto_tsquery('english', $${paramIdx})`);
      params.push(query.trim());
      paramIdx++;
    }

    if (filters.condition) {
      conditions.push(`i.condition = $${paramIdx}`);
      params.push(filters.condition);
      paramIdx++;
    }
    if (filters.brand) {
      conditions.push(`brd.name = $${paramIdx}`);
      params.push(filters.brand);
      paramIdx++;
    }
    if (filters.itemId) {
      conditions.push(`i.id = $${paramIdx}`);
      params.push(filters.itemId);
      paramIdx++;
    }
    if (filters.minPrice !== undefined) {
      conditions.push(`i.online_price >= $${paramIdx}`);
      params.push(filters.minPrice);
      paramIdx++;
    }
    if (filters.maxPrice !== undefined) {
      conditions.push(`i.online_price <= $${paramIdx}`);
      params.push(filters.maxPrice);
      paramIdx++;
    }
    if (filters.storage) {
      conditions.push(`i.storage = $${paramIdx}`);
      params.push(filters.storage);
      paramIdx++;
    }
    if (filters.colour) {
      conditions.push(`i.colour ILIKE $${paramIdx}`);
      params.push(`%${filters.colour}%`);
      paramIdx++;
    }
    if (filters.branchId) {
      conditions.push(`i.branch_id = $${paramIdx}`);
      params.push(filters.branchId);
      paramIdx++;
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    try {
      const countResult = await this.dataSource.query(
        `SELECT COUNT(*)::int AS total FROM inventory_items i
         LEFT JOIN brands brd ON brd.id = i.brand_id
         ${whereClause}`,
        params,
      );

      const rankClause = query?.trim()
        ? `, ts_rank(i.search_vector, plainto_tsquery('english', $1)) AS rank`
        : '';
      const orderClause = query?.trim() ? 'ORDER BY rank DESC, i.online_price ASC' : 'ORDER BY i.online_price ASC';

      const items = await this.dataSource.query(
        `SELECT
          i.id, i.imei, i.condition, i.status,
          i.online_price AS price, i.selling_price,
          i.colour, i.storage, i.battery_health,
          i.warranty_expiry,
          i.item_name AS item_name,
          brd.name AS brand,
          mdl.name AS model,
          b.name AS branch_name,
          b.id AS branch_id,
          COALESCE(
            (SELECT jsonb_agg(url ORDER BY sort_order) FROM item_photos p WHERE p.item_id = i.id), '[]'
          ) AS images,
          COALESCE(
            (SELECT url FROM item_photos p WHERE p.item_id = i.id ORDER BY sort_order LIMIT 1), $${paramIdx}
          ) AS thumbnail
          ${rankClause}
        FROM inventory_items i
        LEFT JOIN brands brd ON brd.id = i.brand_id
        LEFT JOIN models mdl ON mdl.id = i.model_id
        LEFT JOIN branches b ON b.id = i.branch_id
        ${whereClause}
        ${orderClause}
        LIMIT $${paramIdx + 1} OFFSET $${paramIdx + 2}`,
        [...params, this.fallbackImage, limit, offset],
      );

      const normalizedItems = items.map((item: any) => ({
        ...item,
        images: Array.isArray(item.images) ? item.images : [],
        thumbnail: item.thumbnail || this.fallbackImage,
        price: Number(item.price ?? item.online_price ?? item.selling_price ?? 0),
      }));

      // Faceted aggregations
      const facets = await this.getPublicFacets(conditions, params);

      return {
        items: normalizedItems,
        total: countResult[0]?.total ?? 0,
        page,
        limit,
        ...facets,
      } as any;
    } catch (err: any) {
      this.logger.warn(`Public search query failed: ${err?.message}`);
      return { items: [], total: 0, page, limit };
    }
  }

  private async getPublicFacets(conditions: string[], params: any[]): Promise<any> {
    try {
      const whereClause = `WHERE ${conditions.join(' AND ')}`;

      const storageWhereClause = `${whereClause} AND i.storage IS NOT NULL`;
      const [conditionFacets, storageFacets] = await Promise.all([
        this.dataSource.query(
          `SELECT i.condition, COUNT(*)::int AS count
           FROM inventory_items i
           LEFT JOIN brands brd ON brd.id = i.brand_id
           ${whereClause}
           GROUP BY i.condition ORDER BY count DESC`,
          params,
        ),
        this.dataSource.query(
          `SELECT i.storage, COUNT(*)::int AS count
           FROM inventory_items i
           LEFT JOIN brands brd ON brd.id = i.brand_id
           ${storageWhereClause}
           GROUP BY i.storage ORDER BY count DESC`,
          params,
        ),
      ]);

      return { facets: { conditions: conditionFacets, storage: storageFacets } };
    } catch {
      return { facets: {} };
    }
  }

  // ─── 18.4 BullMQ index sync (no-op for MVP) ───────────────────────────────────

  async syncItem(itemId: string): Promise<void> {
    this.logger.log(`[Search] syncItem: ${itemId} (no-op for MVP)`);
    if (this.queue) {
      await this.queue.add('index-item', { itemId }).catch((err: any) => {
        this.logger.warn(`Failed to enqueue search sync: ${err?.message}`);
      });
    }
  }

  async removeItem(itemId: string): Promise<void> {
    this.logger.log(`[Search] removeItem: ${itemId} (no-op for MVP)`);
    if (this.queue) {
      await this.queue.add('remove-item', { itemId }).catch((err: any) => {
        this.logger.warn(`Failed to enqueue search remove: ${err?.message}`);
      });
    }
  }
}
