import * as React from 'react';
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    footer?: React.ReactNode;
}
declare const Modal: ({ isOpen, onClose, title, children, size, footer }: ModalProps) => import("react/jsx-runtime").JSX.Element | null;
export { Modal };
//# sourceMappingURL=modal.d.ts.map