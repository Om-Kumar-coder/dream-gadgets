import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async getReviews(itemId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

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
  }

  async getRatingSummary(itemId: string) {
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
  }

  async createReview(itemId: string, data: { rating: number; comment?: string; clientName: string; userId?: string }) {
    if (!data.rating || data.rating < 1 || data.rating > 5) {
      throw new BadRequestException({ code: 'INVALID_RATING', message: 'Rating must be between 1 and 5' });
    }

    if (!data.comment || data.comment.trim().length < 10) {
      throw new BadRequestException({ code: 'COMMENT_TOO_SHORT', message: 'Comment must be at least 10 characters' });
    }

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
  }
}
