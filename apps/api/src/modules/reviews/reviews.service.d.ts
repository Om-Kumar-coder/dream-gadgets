import { DataSource } from 'typeorm';
export declare class ReviewsService {
    private dataSource;
    private readonly logger;
    constructor(dataSource: DataSource);
    private isValidUUID;
    getReviews(itemId: string, page?: number, limit?: number): Promise<{
        data: any;
        total: any;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getRatingSummary(itemId: string): Promise<any>;
    createReview(itemId: string, data: {
        rating: number;
        comment?: string;
        clientName: string;
        userId?: string;
    }): Promise<any>;
}
//# sourceMappingURL=reviews.service.d.ts.map