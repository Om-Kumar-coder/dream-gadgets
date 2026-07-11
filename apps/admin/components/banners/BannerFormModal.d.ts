export interface BannerFormData {
    id?: string;
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
    startsAt: string;
    endsAt: string;
}
interface BannerFormModalProps {
    open: boolean;
    onClose: () => void;
    banner?: BannerFormData | null;
    defaultPageType?: string;
    defaultPosition?: string;
}
export declare function BannerFormModal({ open, onClose, banner, defaultPageType, defaultPosition }: BannerFormModalProps): import("react/jsx-runtime").JSX.Element | null;
export {};
//# sourceMappingURL=BannerFormModal.d.ts.map