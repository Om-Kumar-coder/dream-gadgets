import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { ReviewsService } from './reviews.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let dataSource: jest.Mocked<DataSource>;

  const mockQuery = jest.fn();

  beforeEach(async () => {
    mockQuery.mockReset();

    dataSource = {
      query: mockQuery,
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        {
          provide: DataSource,
          useValue: dataSource,
        },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
  });

  describe('getReviews', () => {
    it('returns empty list for invalid UUID', async () => {
      const result = await service.getReviews('invalid-uuid');
      expect(result).toEqual({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 });
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it('sanitizes NaN page/limit and calls database correctly', async () => {
      mockQuery
        .mockResolvedValueOnce([{ id: 'rev-1', rating: 5 }])
        .mockResolvedValueOnce([{ total: 1 }]);

      const result = await service.getReviews(
        '8b9df816-7177-4ad8-9862-d69257fe189b',
        NaN as any,
        NaN as any,
      );

      expect(result).toEqual({
        data: [{ id: 'rev-1', rating: 5 }],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });

      // Query should be called with safeLimit=20, offset=0
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT $2 OFFSET $3'),
        ['8b9df816-7177-4ad8-9862-d69257fe189b', 20, 0],
      );
    });

    it('catches and logs errors gracefully returning empty dataset', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Connection failure'));

      const result = await service.getReviews('8b9df816-7177-4ad8-9862-d69257fe189b', 1, 20);
      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('getRatingSummary', () => {
    it('returns default summary for invalid UUID', async () => {
      const summary = await service.getRatingSummary('not-a-uuid');
      expect(summary).toEqual({
        total_reviews: 0,
        avg_rating: 0,
        '5_star': 0,
        '4_star': 0,
        '3_star': 0,
        '2_star': 0,
        '1_star': 0,
      });
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it('queries with double-quoted aliases for PostgreSQL compatibility', async () => {
      mockQuery.mockResolvedValueOnce([
        {
          total_reviews: 10,
          avg_rating: 4.5,
          '5_star': 7,
          '4_star': 2,
          '3_star': 1,
          '2_star': 0,
          '1_star': 0,
        },
      ]);

      const summary = await service.getRatingSummary('8b9df816-7177-4ad8-9862-d69257fe189b');
      expect(summary.total_reviews).toBe(10);
      expect(summary['5_star']).toBe(7);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('AS "5_star"'),
        ['8b9df816-7177-4ad8-9862-d69257fe189b'],
      );
    });
  });

  describe('createReview', () => {
    it('rejects invalid UUID', async () => {
      await expect(
        service.createReview('bad-uuid', {
          rating: 5,
          comment: 'Great phone really loved it!',
          clientName: 'Alice',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects invalid rating range or NaN', async () => {
      await expect(
        service.createReview('8b9df816-7177-4ad8-9862-d69257fe189b', {
          rating: 6,
          comment: 'Great phone really loved it!',
          clientName: 'Alice',
        }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.createReview('8b9df816-7177-4ad8-9862-d69257fe189b', {
          rating: NaN,
          comment: 'Great phone really loved it!',
          clientName: 'Alice',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects too short comment', async () => {
      await expect(
        service.createReview('8b9df816-7177-4ad8-9862-d69257fe189b', {
          rating: 5,
          comment: 'Good',
          clientName: 'Alice',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects nonexistent or offline product', async () => {
      mockQuery.mockResolvedValueOnce([]); // no item found
      await expect(
        service.createReview('8b9df816-7177-4ad8-9862-d69257fe189b', {
          rating: 5,
          comment: 'Great phone really loved it!',
          clientName: 'Alice',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('creates review successfully when item exists and inputs are valid', async () => {
      mockQuery
        .mockResolvedValueOnce([{ id: 'item-1' }]) // item lookup
        .mockResolvedValueOnce([
          {
            id: 'rev-1',
            item_id: '8b9df816-7177-4ad8-9862-d69257fe189b',
            rating: 5,
            comment: 'Great phone really loved it!',
            client_name: 'Alice',
            is_verified: false,
          },
        ]);

      const review = await service.createReview('8b9df816-7177-4ad8-9862-d69257fe189b', {
        rating: 5,
        comment: 'Great phone really loved it!',
        clientName: 'Alice',
      });

      expect(review.id).toBe('rev-1');
      expect(review.rating).toBe(5);
    });
  });
});
