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
import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
let ReviewsService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ReviewsService = _classThis = class {
        constructor(dataSource) {
            this.dataSource = dataSource;
            this.logger = new Logger(ReviewsService.name);
        }
        isValidUUID(id) {
            return !!id && UUID_REGEX.test(id);
        }
        async getReviews(itemId, page = 1, limit = 20) {
            // Validate UUID format to prevent SQL errors
            if (!this.isValidUUID(itemId)) {
                return { data: [], total: 0, page, limit, totalPages: 0 };
            }
            const offset = (page - 1) * limit;
            try {
                const [reviews, countResult] = await Promise.all([
                    this.dataSource.query(`SELECT id, item_id, client_name, rating, comment, is_verified, created_at
           FROM product_reviews
           WHERE item_id = $1
           ORDER BY created_at DESC
           LIMIT $2 OFFSET $3`, [itemId, limit, offset]),
                    this.dataSource.query(`SELECT COUNT(*)::int AS total FROM product_reviews WHERE item_id = $1`, [itemId]),
                ]);
                const total = countResult[0]?.total ?? 0;
                return {
                    data: reviews,
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                };
            }
            catch (err) {
                this.logger.warn(`getReviews failed for ${itemId}: ${err?.message}`);
                return { data: [], total: 0, page, limit, totalPages: 0 };
            }
        }
        async getRatingSummary(itemId) {
            // Validate UUID format to prevent SQL errors
            if (!this.isValidUUID(itemId)) {
                return { total_reviews: 0, avg_rating: 0, '5_star': 0, '4_star': 0, '3_star': 0, '2_star': 0, '1_star': 0 };
            }
            try {
                const result = await this.dataSource.query(`SELECT
          COUNT(*)::int AS total_reviews,
          COALESCE(AVG(rating)::numeric(3,2), 0)::float AS avg_rating,
          COUNT(*) FILTER (WHERE rating = 5)::int AS 5_star,
          COUNT(*) FILTER (WHERE rating = 4)::int AS 4_star,
          COUNT(*) FILTER (WHERE rating = 3)::int AS 3_star,
          COUNT(*) FILTER (WHERE rating = 2)::int AS 2_star,
          COUNT(*) FILTER (WHERE rating = 1)::int AS 1_star
        FROM product_reviews
        WHERE item_id = $1`, [itemId]);
                return result[0] ?? { total_reviews: 0, avg_rating: 0, '5_star': 0, '4_star': 0, '3_star': 0, '2_star': 0, '1_star': 0 };
            }
            catch (err) {
                this.logger.warn(`getRatingSummary failed for ${itemId}: ${err?.message}`);
                return { total_reviews: 0, avg_rating: 0, '5_star': 0, '4_star': 0, '3_star': 0, '2_star': 0, '1_star': 0 };
            }
        }
        async createReview(itemId, data) {
            // Validate UUID format
            if (!this.isValidUUID(itemId)) {
                throw new BadRequestException({ code: 'INVALID_PRODUCT_ID', message: 'Invalid product ID format' });
            }
            // Validate rating is a number (not NaN)
            if (typeof data.rating !== 'number' || isNaN(data.rating) || !isFinite(data.rating)) {
                throw new BadRequestException({ code: 'INVALID_RATING', message: 'Rating must be a valid number' });
            }
            if (data.rating < 1 || data.rating > 5) {
                throw new BadRequestException({ code: 'INVALID_RATING', message: 'Rating must be between 1 and 5' });
            }
            if (!data.comment || data.comment.trim().length < 10) {
                throw new BadRequestException({ code: 'COMMENT_TOO_SHORT', message: 'Comment must be at least 10 characters' });
            }
            try {
                // Check item exists
                const [item] = await this.dataSource.query(`SELECT id FROM inventory_items WHERE id = $1 AND is_online = true AND status = 'available'`, [itemId]);
                if (!item) {
                    throw new NotFoundException({ code: 'PRODUCT_NOT_FOUND', message: 'Product not found' });
                }
                const [review] = await this.dataSource.query(`INSERT INTO product_reviews (item_id, user_id, client_name, rating, comment, is_verified)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, item_id, client_name, rating, comment, is_verified, created_at`, [itemId, data.userId ?? null, data.clientName, data.rating, data.comment?.trim() ?? null, false]);
                return review;
            }
            catch (err) {
                // Preserve known NestJS exceptions, wrap everything else
                if (err?.constructor?.name === 'BadRequestException' || err?.constructor?.name === 'NotFoundException') {
                    throw err;
                }
                this.logger.warn(`createReview failed for ${itemId}: ${err?.message}`);
                throw new BadRequestException({ code: 'REVIEW_CREATE_FAILED', message: 'Failed to create review. Please try again.' });
            }
        }
    };
    __setFunctionName(_classThis, "ReviewsService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ReviewsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ReviewsService = _classThis;
})();
export { ReviewsService };
//# sourceMappingURL=reviews.service.js.map