interface Review {
    id: string;
    item_id: string;
    client_name: string;
    rating: number;
    comment: string | null;
    is_verified: boolean;
    created_at: string;
}
interface RatingSummary {
    total_reviews: number;
    avg_rating: number;
    '5_star': number;
    '4_star': number;
    '3_star': number;
    '2_star': number;
    '1_star': number;
}
interface ReviewSectionProps {
    itemId: string;
    initialSummary: RatingSummary;
    initialReviews: Review[];
}
export declare function ReviewSection({ itemId, initialSummary, initialReviews }: ReviewSectionProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ReviewSection.d.ts.map