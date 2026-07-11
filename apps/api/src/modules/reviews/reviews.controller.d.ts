import { ReviewsService } from './reviews.service';
export declare class CreateReviewDto {
    rating: number;
    comment: string;
    clientName: string;
}
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    getReviews(id: string, page?: number, limit?: number): Promise<{
        data: {
            data: any;
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
        summary: any;
    }>;
    createReview(id: string, dto: CreateReviewDto, req: any): Promise<{
        data: any;
    }>;
}
//# sourceMappingURL=reviews.controller.d.ts.map