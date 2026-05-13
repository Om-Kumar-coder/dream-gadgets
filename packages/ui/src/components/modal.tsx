import * as React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: React.ReactNode;
}

const Modal = ({ isOpen, onClose, title, children, size = 'md', footer }: ModalProps) => {
  if (!isOpen) return null;

  const sizeClasses = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${sizeClasses[size]} bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl`}
        style={{ boxShadow: '0 0 40px rgba(255,45,45,0.15), 0 25px 50px rgba(0,0,0,0.8)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a2a]">
          <h3 className="text-base font-semibold text-white tracking-wide">{title}</h3>
          <button onClick={onClose}
            className="text-gray-600 hover:text-[#FF2D2D] transition-colors p-1 rounded-lg hover:bg-[#FF2D2D]/10">
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* Body */}
        <div className="px-6 py-4 text-gray-300">{children}</div>
        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-[#2a2a2a] bg-[#0A0A0A] rounded-b-xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export { Modal };
