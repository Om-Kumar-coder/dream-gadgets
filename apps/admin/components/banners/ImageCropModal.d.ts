interface ImageCropModalProps {
    open: boolean;
    imageUrl: string;
    aspectRatio?: number;
    onCropComplete: (croppedBlob: Blob) => void;
    onClose: () => void;
}
export declare function ImageCropModal({ open, imageUrl, aspectRatio, onCropComplete, onClose, }: ImageCropModalProps): import("react/jsx-runtime").JSX.Element | null;
export {};
//# sourceMappingURL=ImageCropModal.d.ts.map