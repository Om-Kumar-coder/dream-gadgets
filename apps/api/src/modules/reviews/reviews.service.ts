import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  private isValidUUID(id: string): boolean {
    return !!id && UUID_REGEX.test(id);
  }

  async getReviews(itemId: string, page = 1, limit = 20) {
    // Validate UUID format to prevent SQL errors
    if (!this.isValidUUID(itemId)) {
      return { data: [], total: 0, page, limit, totalPages: 0 };
    }

    const offset = (page - 1) * limit;

    try {
      const [reviews, countResult] = await Promise.all([
        this.dataSource.query(
          `SELECT id, item_id, client_name, rating, comment, is_verified, created_at
           FROM product_reviews
           WHERE item_id = $1
           ORDER BY created_at DESC
           LIMIT $2 OFFSET $3`,
          [itemId, limit, offset],
        ),
        this.dataSource.query(
          `SELECT COUNT(*)::int AS total FROM product_reviews WHERE item_id = $1`,
          [itemId],
        ),
      ]);

      const total = countResult[0]?.total ?? 0;

      return {
        data: reviews,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (err: any) {
      this.logger.warn(`getReviews failed for ${itemId}: ${err?.message}`);
      return { data: [], total: 0, page, limit, totalPages: 0 };
    }
  }

  async getRatingSummary(itemId: string) {
    // Validate UUID format to prevent SQL errors
    if (!this.isValidUUID(itemId)) {
      return { total_reviews: 0, avg_rating: 0, '5_star': 0, '4_star': 0, '3_star': 0, '2_star': 0, '1_star': 0 };
    }

    try {
      const result = await this.dataSource.query(
        `SELECT
          COUNT(*)::int AS total_reviews,
          COALESCE(AVG(rating)::numeric(3,2), 0)::float AS avg_rating,
          COUNT(*) FILTER (WHERE rating = 5)::int AS 5_star,
          COUNT(*) FILTER (WHERE rating = 4)::int AS 4_star,
          COUNT(*) FILTER (WHERE rating = 3)::int AS 3_star,
          COUNT(*) FILTER (WHERE rating = 2)::int AS 2_star,
          COUNT(*) FILTER (WHERE rating = 1)::int AS 1_star
        FROM product_reviews
        WHERE item_id = $1`,
        [itemId],
      );

      return result[0] ?? { total_reviews: 0, avg_rating: 0, '5_star': 0, '4_star': 0, '3_star': 0, '2_star': 0, '1_star': 0 };
    } catch (err: any) {
      this.logger.warn(`getRatingSummary failed for ${itemId}: ${err?.message}`);
      return { total_reviews: 0, avg_rating: 0, '5_star': 0, '4_star': 0, '3_star': 0, '2_star': 0, '1_star': 0 };
    }
  }

  async createReview(itemId: string, data: { rating: number; comment?: string; clientName: string; userId?: string }) {
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
      const [item] = await this.dataSource.query(
        `SELECT id FROM inventory_items WHERE id = $1 AND is_online = true AND status = 'available'`,
        [itemId],
      );

      if (!item) {
        throw new NotFoundException({ code: 'PRODUCT_NOT_FOUND', message: 'Product not found' });
      }

      const [review] = await this.dataSource.query(
        `INSERT INTO product_reviews (item_id, user_id, client_name, rating, comment, is_verified)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, item_id, client_name, rating, comment, is_verified, created_at`,
        [itemId, data.userId ?? null, data.clientName, data.rating, data.comment?.trim() ?? null, false],
      );

      return review;
    } catch (err: any) {
      // Preserve known NestJS exceptions, wrap everything else
      if (err?.constructor?.name === 'BadRequestException' || err?.constructor?.name === 'NotFoundException') {
        throw err;
      }
      this.logger.warn(`createReview failed for ${itemId}: ${err?.message}`);
      throw new BadRequestException({ code: 'REVIEW_CREATE_FAILED', message: 'Failed to create review. Please try again.' });
    }
  }
}
