'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useRef, useState } from 'react';
const MAX_PHOTOS = 3;
const MAX_SIZE_MB = 10;
function compressImage(file, maxDim = 1600) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let { width, height } = img;
                if (width > maxDim || height > maxDim) {
                    const ratio = Math.min(maxDim / width, maxDim / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Canvas context unavailable'));
                    return;
                }
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = e.target?.result;
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}
export function PhotoUpload({ photos, onUpdate }) {
    const inputRef = useRef(null);
    const [processing, setProcessing] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const addPhotos = useCallback(async (files) => {
        const fileArray = Array.from(files).slice(0, MAX_PHOTOS - photos.length);
        if (fileArray.length === 0)
            return;
        setProcessing(true);
        try {
            const compressed = await Promise.all(fileArray.map((f) => compressImage(f)));
            onUpdate({ photos: [...photos, ...compressed] });
        }
        catch {
            // Silently fail individual photos
        }
        finally {
            setProcessing(false);
        }
    }, [photos, onUpdate]);
    const removePhoto = useCallback((index) => {
        onUpdate({ photos: photos.filter((_, i) => i !== index) });
    }, [photos, onUpdate]);
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files.length > 0)
            addPhotos(e.dataTransfer.files);
    }, [addPhotos]);
    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setDragOver(true);
    }, []);
    const handleDragLeave = useCallback(() => setDragOver(false), []);
    const handleFileSelect = useCallback((e) => {
        if (e.target.files && e.target.files.length > 0) {
            addPhotos(e.target.files);
            e.target.value = '';
        }
    }, [addPhotos]);
    const remaining = MAX_PHOTOS - photos.length;
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "heading-sm text-surface-900 mb-1", children: "Device Photos" }), _jsxs("p", { className: "text-sm text-surface-500", children: ["Upload up to ", MAX_PHOTOS, " photos showing the condition of your device"] })] }), _jsxs("div", { onDrop: handleDrop, onDragOver: handleDragOver, onDragLeave: handleDragLeave, onClick: () => !processing && remaining > 0 && inputRef.current?.click(), className: `relative rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${dragOver
                    ? 'border-primary bg-primary/5'
                    : remaining > 0
                        ? 'border-surface-200 hover:border-primary/50 hover:bg-surface-50'
                        : 'border-surface-100 bg-surface-50 cursor-default'}`, children: [processing ? (_jsxs("div", { className: "flex flex-col items-center gap-2", children: [_jsx("div", { className: "w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" }), _jsx("p", { className: "text-sm text-surface-500", children: "Processing photos..." })] })) : remaining > 0 ? (_jsxs("div", { className: "flex flex-col items-center gap-2", children: [_jsx("div", { className: "w-14 h-14 bg-surface-100 rounded-full flex items-center justify-center", children: _jsx("svg", { className: "w-7 h-7 text-surface-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" }) }) }), _jsx("p", { className: "text-sm font-medium text-surface-700", children: "Drop photos here or click to browse" }), _jsxs("p", { className: "text-xs text-surface-400", children: ["PNG, JPG up to ", MAX_SIZE_MB, "MB each (", remaining, " remaining)"] })] })) : (_jsxs("p", { className: "text-sm text-surface-400", children: ["Maximum ", MAX_PHOTOS, " photos reached"] })), _jsx("input", { ref: inputRef, type: "file", accept: "image/png,image/jpeg,image/webp", multiple: true, onChange: handleFileSelect, className: "hidden" })] }), photos.length > 0 && (_jsxs("div", { className: "grid grid-cols-3 gap-3", children: [photos.map((photo, i) => (_jsxs("div", { className: "relative group aspect-square rounded-xl overflow-hidden bg-surface-100 border border-surface-200 ring-1 ring-black/5", children: [_jsx("img", { src: photo, alt: `Device photo ${i + 1}`, className: "w-full h-full object-cover" }), _jsx("button", { onClick: (e) => { e.stopPropagation(); removePhoto(i); }, className: "absolute top-1.5 right-1.5 w-6 h-6 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm", title: "Remove photo", children: _jsx("svg", { className: "w-3.5 h-3.5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2.5, d: "M6 18L18 6M6 6l12 12" }) }) }), _jsx("span", { className: "absolute bottom-1.5 left-1.5 text-[10px] px-1.5 py-0.5 bg-black/40 text-white rounded font-medium backdrop-blur-sm", children: i + 1 })] }, i))), remaining > 0 && Array.from({ length: remaining }).map((_, i) => (_jsx("div", { className: "aspect-square rounded-xl border-2 border-dashed border-surface-200 bg-surface-50 flex items-center justify-center", children: _jsx("span", { className: "text-xs text-surface-300", children: "Empty" }) }, `empty-${i}`)))] }))] }));
}
//# sourceMappingURL=PhotoUpload.js.map