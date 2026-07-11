import { User } from '../../auth/entities/user.entity';
export declare class Banner {
    id: string;
    title: string;
    subtitle: string;
    imageUrl: string;
    mobileImageUrl: string;
    linkUrl: string;
    ctaText: string;
    pageType: string;
    position: string;
    deviceType: string;
    sortOrder: number;
    isActive: boolean;
    clickCount: number;
    startsAt: Date;
    endsAt: Date;
    createdById: string;
    createdBy: User;
    createdAt: Date;
    updatedAt: Date;
}
export declare class ContentPage {
    id: string;
    slug: string;
    title: string;
    content: string;
    metaTitle: string;
    metaDesc: string;
    isActive: boolean;
    updatedById: string;
    updatedBy: User;
    updatedAt: Date;
}
//# sourceMappingURL=banner.entity.d.ts.map