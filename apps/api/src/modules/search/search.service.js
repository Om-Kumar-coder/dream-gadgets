var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
import { Injectable, Logger } from '@nestjs/common';
let SearchService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var SearchService = _classThis = class {
        constructor(dataSource, configService) {
            this.dataSource = dataSource;
            this.configService = configService;
            this.logger = new Logger(SearchService.name);
            this.queue = null;
            this.fallbackImage = '/images/placeholders/no-image.svg';
            this.initQueue();
        }
        // ─── Queue init ───────────────────────────────────────────────────────────────
        initQueue() {
            try {
                const { Queue } = require('bullmq');
                const redisUrl = this.configService.get('redis.url') ?? this.configService.get('REDIS_URL');
                if (redisUrl) {
                    this.queue = new Queue('search', {
                        connection: { url: redisUrl },
                        defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 1000 } },
                    });
                    this.logger.log('Search BullMQ queue initialized');
                }
            }
            catch {
                this.logger.warn('BullMQ not available for search queue');
            }
        }
        // ─── 18.2 Admin inventory search ─────────────────────────────────────────────
        async searchInventory(query, filters = {}) {
            const { page = 1, limit = 20 } = filters;
            const offset = (page - 1) * limit;
            const conditions = [];
            const params = [];
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
                const countResult = await this.dataSource.query(`SELECT COUNT(*)::int AS total FROM inventory_items i ${whereClause}`, params);
                const rankClause = query?.trim()
                    ? `, ts_rank(i.search_vector, plainto_tsquery('english', $1)) AS rank`
                    : '';
                const orderClause = query?.trim() ? 'ORDER BY rank DESC, i.created_at DESC' : 'ORDER BY i.created_at DESC';
                const items = await this.dataSource.query(`SELECT
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
        LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`, [...params, limit, offset]);
                return {
                    items,
                    total: countResult[0]?.total ?? 0,
                    page,
                    limit,
                };
            }
            catch (err) {
                this.logger.warn(`Search query failed: ${err?.message}`);
                return { items: [], total: 0, page, limit };
            }
        }
        // ─── 18.3 Public product search ───────────────────────────────────────────────
        async searchPublicProducts(query, filters = {}) {
            const { page = 1, limit = 20 } = filters;
            const offset = (page - 1) * limit;
            const conditions = [
                `i.is_online = true`,
                `i.status = 'available'`,
            ];
            const params = [];
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
                const countResult = await this.dataSource.query(`SELECT COUNT(*)::int AS total FROM inventory_items i
         LEFT JOIN brands brd ON brd.id = i.brand_id
         ${whereClause}`, params);
                const rankClause = query?.trim()
                    ? `, ts_rank(i.search_vector, plainto_tsquery('english', $1)) AS rank`
                    : '';
                const orderClause = query?.trim() ? 'ORDER BY rank DESC, i.online_price ASC' : 'ORDER BY i.online_price ASC';
                const items = await this.dataSource.query(`SELECT
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
        LIMIT $${paramIdx + 1} OFFSET $${paramIdx + 2}`, [...params, this.fallbackImage, limit, offset]);
                const normalizedItems = items.map((item) => ({
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
                };
            }
            catch (err) {
                this.logger.warn(`Public search query failed: ${err?.message}`);
                return { items: [], total: 0, page, limit };
            }
        }
        async getPublicFacets(conditions, params) {
            try {
                const whereClause = `WHERE ${conditions.join(' AND ')}`;
                const storageWhereClause = `${whereClause} AND i.storage IS NOT NULL`;
                const [conditionFacets, storageFacets] = await Promise.all([
                    this.dataSource.query(`SELECT i.condition, COUNT(*)::int AS count
           FROM inventory_items i
           LEFT JOIN brands brd ON brd.id = i.brand_id
           ${whereClause}
           GROUP BY i.condition ORDER BY count DESC`, params),
                    this.dataSource.query(`SELECT i.storage, COUNT(*)::int AS count
           FROM inventory_items i
           LEFT JOIN brands brd ON brd.id = i.brand_id
           ${storageWhereClause}
           GROUP BY i.storage ORDER BY count DESC`, params),
                ]);
                return { facets: { conditions: conditionFacets, storage: storageFacets } };
            }
            catch {
                return { facets: {} };
            }
        }
        // ─── 18.4 Related products ────────────────────────────────────────────────
        async getRelatedProducts(itemId, limit = 8) {
            try {
                // Get the item's brand_id and model_id first
                const [item] = await this.dataSource.query(`SELECT brand_id, model_id, condition FROM inventory_items WHERE id = $1`, [itemId]);
                if (!item)
                    return [];
                // Find related: same brand or same category, exclude current item
                const items = await this.dataSource.query(`SELECT
          i.id, i.imei, i.condition, i.status,
          i.online_price AS price, i.selling_price,
          i.colour, i.storage, i.battery_health,
          i.item_name AS item_name,
          brd.name AS brand,
          mdl.name AS model,
          COALESCE(
            (SELECT url FROM item_photos p WHERE p.item_id = i.id ORDER BY sort_order LIMIT 1), $1
          ) AS thumbnail
        FROM inventory_items i
        LEFT JOIN brands brd ON brd.id = i.brand_id
        LEFT JOIN models mdl ON mdl.id = i.model_id
        WHERE i.id != $2
          AND i.is_online = true
          AND i.status = 'available'
          AND (i.brand_id = $3 OR i.model_id = $4)
        ORDER BY i.created_at DESC
        LIMIT $5`, [this.fallbackImage, itemId, item.brand_id, item.model_id, limit]);
                return items.map((item) => ({
                    ...item,
                    price: Number(item.price ?? item.selling_price ?? 0),
                    thumbnail: item.thumbnail || this.fallbackImage,
                }));
            }
            catch (err) {
                this.logger.warn(`Related products query failed: ${err?.message}`);
                return [];
            }
        }
        // ─── 18.5 Get product with specs ───────────────────────────────────────────
        async getProductWithSpecs(itemId) {
            try {
                const [item] = await this.dataSource.query(`SELECT
          i.id, i.imei, i.condition, i.status,
          i.online_price AS price, i.selling_price,
          i.colour, i.storage, i.ram, i.battery_health,
          i.box_type,
          i.warranty_status, i.warranty_expiry,
          i.item_name AS item_name,
          i.pku_code,
          brd.id AS brand_id, brd.name AS brand,
          mdl.id AS model_id, mdl.name AS model, mdl.slug AS model_slug,
          mdl.description AS description, mdl.specs AS specs,
          COALESCE(
            (SELECT jsonb_agg(url ORDER BY sort_order) FROM item_photos p WHERE p.item_id = i.id), '[]'
          ) AS images
        FROM inventory_items i
        LEFT JOIN brands brd ON brd.id = i.brand_id
        LEFT JOIN models mdl ON mdl.id = i.model_id
        WHERE i.id = $1 AND i.is_online = true`, [itemId]);
                if (!item)
                    return null;
                return {
                    ...item,
                    price: Number(item.price ?? item.selling_price ?? 0),
                    images: Array.isArray(item.images) ? item.images : [],
                    specs: item.specs ?? {},
                    description: item.description ?? '',
                    model_slug: item.model_slug ?? '',
                };
            }
            catch (err) {
                this.logger.warn(`Product detail query failed: ${err?.message}`);
                return null;
            }
        }
        // ─── 18.6 BullMQ index sync (no-op for MVP) ───────────────────────────────────
        async syncItem(itemId) {
            this.logger.log(`[Search] syncItem: ${itemId} (no-op for MVP)`);
            if (this.queue) {
                await this.queue.add('index-item', { itemId }).catch((err) => {
                    this.logger.warn(`Failed to enqueue search sync: ${err?.message}`);
                });
            }
        }
        async removeItem(itemId) {
            this.logger.log(`[Search] removeItem: ${itemId} (no-op for MVP)`);
            if (this.queue) {
                await this.queue.add('remove-item', { itemId }).catch((err) => {
                    this.logger.warn(`Failed to enqueue search remove: ${err?.message}`);
                });
            }
        }
    };
    __setFunctionName(_classThis, "SearchService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SearchService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return SearchService = _classThis;
})();
export { SearchService };
//# sourceMappingURL=search.service.js.map