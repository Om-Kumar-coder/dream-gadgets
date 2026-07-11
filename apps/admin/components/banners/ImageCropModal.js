'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useCallback, useRef, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { X, ZoomIn, ZoomOut, RotateCw, Sun, Contrast, Check, Image as ImageIcon, Move, Undo2, Redo2, } from 'lucide-react';
function createImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.addEventListener('load', () => resolve(img));
        img.addEventListener('error', (err) => reject(err));
        img.src = url;
    });
}
async function getCroppedImg(imageSrc, pixelCrop, rotation, brightness, contrast) {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx)
        return null;
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    // Apply rotation if needed
    if (rotation !== 0) {
        const rad = (rotation * Math.PI) / 180;
        canvas.width = pixelCrop.height;
        canvas.height = pixelCrop.width;
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(rad);
        ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, -pixelCrop.height / 2, -pixelCrop.width / 2, pixelCrop.width, pixelCrop.height);
    }
    else {
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
        ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
    }
    return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.92);
    });
}
const ASPECT_PRESETS = [
    { label: 'Free', value: undefined },
    { label: '2:1', value: 2 / 1 },
    { label: '16:9', value: 16 / 9 },
    { label: '4:3', value: 4 / 3 },
    { label: '1:1', value: 1 / 1 },
];
export function ImageCropModal({ open, imageUrl, aspectRatio = 16 / 9, onCropComplete, onClose, }) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const [selectedAspect, setSelectedAspect] = useState(aspectRatio);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [activeTab, setActiveTab] = useState('crop');
    const historyRef = useRef({ past: [], future: [] });
    const latestRef = useRef({ crop, zoom, rotation, brightness, contrast, selectedAspect });
    latestRef.current = { crop, zoom, rotation, brightness, contrast, selectedAspect };
    const takeSnapshot = useCallback(() => {
        const s = latestRef.current;
        historyRef.current.past.push({ ...s });
        // Keep max 50 snapshots
        if (historyRef.current.past.length > 50) {
            historyRef.current.past.shift();
        }
        historyRef.current.future = []; // clear redo on new action
    }, []);
    const applySnapshot = useCallback((snapshot) => {
        setCrop(snapshot.crop);
        setZoom(snapshot.zoom);
        setRotation(snapshot.rotation);
        setBrightness(snapshot.brightness);
        setContrast(snapshot.contrast);
        setSelectedAspect(snapshot.selectedAspect);
    }, []);
    const handleUndo = useCallback(() => {
        const history = historyRef.current;
        if (history.past.length === 0)
            return;
        const current = latestRef.current;
        history.future.push({ ...current });
        const snapshot = history.past.pop();
        applySnapshot(snapshot);
    }, [applySnapshot]);
    const handleRedo = useCallback(() => {
        const history = historyRef.current;
        if (history.future.length === 0)
            return;
        const current = latestRef.current;
        history.past.push({ ...current });
        const snapshot = history.future.pop();
        applySnapshot(snapshot);
    }, [applySnapshot]);
    // Record a snapshot on slider/tool release
    const recordSnapshot = useCallback(() => {
        // Use RAF to let React state settle, then snapshot
        requestAnimationFrame(() => takeSnapshot());
    }, [takeSnapshot]);
    const onCropChange = useCallback((location) => {
        setCrop(location);
    }, []);
    const onZoomChange = useCallback((z) => {
        setZoom(z);
    }, []);
    const onCropCompleteHandler = useCallback((_, croppedPixels) => {
        setCroppedAreaPixels(croppedPixels);
        // Snapshot after crop drag finishes
        requestAnimationFrame(() => takeSnapshot());
    }, [takeSnapshot]);
    const handleApply = async () => {
        if (!croppedAreaPixels)
            return;
        setProcessing(true);
        try {
            const blob = await getCroppedImg(imageUrl, croppedAreaPixels, rotation, brightness, contrast);
            if (blob) {
                onCropComplete(blob);
            }
        }
        catch (err) {
            console.error('Crop failed', err);
        }
        finally {
            setProcessing(false);
        }
    };
    // Reset state when modal opens
    const prevOpen = useRef(open);
    const initialSnapshotTaken = useRef(false);
    if (open && !prevOpen.current) {
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setRotation(0);
        setBrightness(100);
        setContrast(100);
        setSelectedAspect(aspectRatio);
        setCroppedAreaPixels(null);
        historyRef.current = { past: [], future: [] };
        initialSnapshotTaken.current = false;
    }
    prevOpen.current = open;
    // Take initial snapshot after defaults have rendered
    useEffect(() => {
        if (open && !initialSnapshotTaken.current) {
            initialSnapshotTaken.current = true;
            const raf = requestAnimationFrame(() => takeSnapshot());
            return () => cancelAnimationFrame(raf);
        }
    }, [open, takeSnapshot]);
    // Keyboard shortcuts
    useEffect(() => {
        if (!open)
            return;
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                if (e.shiftKey) {
                    e.preventDefault();
                    handleRedo();
                }
                else {
                    e.preventDefault();
                    handleUndo();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, handleUndo, handleRedo]);
    if (!open)
        return null;
    return (_jsx("div", { className: "fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in", children: _jsxs("div", { className: "relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col animate-scale-in", children: [_jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b border-surface-100 shrink-0", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center", children: _jsx(ImageIcon, { className: "w-4 h-4 text-primary" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-base font-bold text-surface-900", children: "Edit Banner Image" }), _jsx("p", { className: "text-xs text-surface-400", children: "Crop, adjust & place your image perfectly" })] })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("button", { type: "button", onClick: handleUndo, disabled: historyRef.current.past.length === 0, title: "Undo (Ctrl+Z)", className: `p-2 rounded-xl transition-all ${historyRef.current.past.length === 0
                                        ? 'text-surface-300 cursor-not-allowed'
                                        : 'text-surface-500 hover:bg-surface-100 hover:text-surface-700'}`, children: _jsx(Undo2, { className: "w-4 h-4" }) }), _jsx("button", { type: "button", onClick: handleRedo, disabled: historyRef.current.future.length === 0, title: "Redo (Ctrl+Shift+Z)", className: `p-2 rounded-xl transition-all ${historyRef.current.future.length === 0
                                        ? 'text-surface-300 cursor-not-allowed'
                                        : 'text-surface-500 hover:bg-surface-100 hover:text-surface-700'}`, children: _jsx(Redo2, { className: "w-4 h-4" }) }), _jsx("div", { className: "w-px h-5 bg-surface-200 mx-1" }), _jsx("button", { onClick: onClose, className: "p-2 rounded-xl hover:bg-surface-100 text-surface-400 hover:text-surface-600 transition-all", children: _jsx(X, { className: "w-5 h-5" }) })] })] }), _jsxs("div", { className: "flex gap-1 px-6 pt-3 pb-0 shrink-0", children: [_jsx("button", { onClick: () => setActiveTab('crop'), className: `px-4 py-2 text-sm font-medium rounded-t-lg transition-all ${activeTab === 'crop'
                                ? 'bg-primary/10 text-primary border-b-2 border-primary'
                                : 'text-surface-500 hover:text-surface-700 hover:bg-surface-50'}`, children: "Crop & Position" }), _jsx("button", { onClick: () => setActiveTab('adjust'), className: `px-4 py-2 text-sm font-medium rounded-t-lg transition-all ${activeTab === 'adjust'
                                ? 'bg-primary/10 text-primary border-b-2 border-primary'
                                : 'text-surface-500 hover:text-surface-700 hover:bg-surface-50'}`, children: "Adjust" })] }), _jsx("div", { className: "relative flex-1 min-h-[320px] bg-surface-900/5 mx-6 rounded-xl overflow-hidden", children: _jsx(Cropper, { image: imageUrl, crop: crop, zoom: zoom, rotation: rotation, aspect: selectedAspect, onCropChange: onCropChange, onZoomChange: onZoomChange, onCropComplete: onCropCompleteHandler, cropShape: "rect", showGrid: true, style: {
                            containerStyle: {
                                width: '100%',
                                height: '100%',
                                minHeight: 320,
                                background: '#f5f5f4',
                            },
                            mediaStyle: {
                                filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                            },
                        } }) }), _jsxs("div", { className: "px-6 py-4 border-t border-surface-100 shrink-0 space-y-4", children: [activeTab === 'crop' && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(ZoomOut, { className: "w-4 h-4 text-surface-400 shrink-0" }), _jsx("input", { type: "range", min: 1, max: 3, step: 0.05, value: zoom, onChange: (e) => setZoom(Number(e.target.value)), onMouseUp: recordSnapshot, onTouchEnd: recordSnapshot, className: "flex-1 accent-primary h-1.5 bg-surface-200 rounded-full appearance-none cursor-pointer" }), _jsx(ZoomIn, { className: "w-4 h-4 text-surface-400 shrink-0" }), _jsxs("span", { className: "text-xs text-surface-500 w-8 text-right font-mono", children: [zoom.toFixed(1), "x"] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(RotateCw, { className: "w-4 h-4 text-surface-400 shrink-0" }), _jsx("input", { type: "range", min: -180, max: 180, step: 90, value: rotation, onChange: (e) => setRotation(Number(e.target.value)), onMouseUp: recordSnapshot, onTouchEnd: recordSnapshot, className: "flex-1 accent-primary h-1.5 bg-surface-200 rounded-full appearance-none cursor-pointer" }), _jsxs("span", { className: "text-xs text-surface-500 w-8 text-right font-mono", children: [rotation, "\u00B0"] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Move, { className: "w-4 h-4 text-surface-400 shrink-0" }), _jsx("div", { className: "flex gap-1 flex-1", children: ASPECT_PRESETS.map((preset) => (_jsx("button", { type: "button", onClick: () => {
                                                    takeSnapshot();
                                                    setSelectedAspect(preset.value);
                                                    setCrop({ x: 0, y: 0 });
                                                }, className: `px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${selectedAspect === preset.value
                                                    ? 'bg-primary text-white shadow-sm'
                                                    : 'bg-surface-100 text-surface-600 hover:bg-surface-200'}`, children: preset.label }, preset.label))) })] })] })), activeTab === 'adjust' && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Sun, { className: "w-4 h-4 text-surface-400 shrink-0" }), _jsx("span", { className: "text-xs text-surface-600 w-16 shrink-0", children: "Brightness" }), _jsx("input", { type: "range", min: 0, max: 200, step: 1, value: brightness, onChange: (e) => setBrightness(Number(e.target.value)), onMouseUp: recordSnapshot, onTouchEnd: recordSnapshot, className: "flex-1 accent-primary h-1.5 bg-surface-200 rounded-full appearance-none cursor-pointer" }), _jsxs("span", { className: "text-xs text-surface-500 w-8 text-right font-mono", children: [brightness, "%"] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Contrast, { className: "w-4 h-4 text-surface-400 shrink-0" }), _jsx("span", { className: "text-xs text-surface-600 w-16 shrink-0", children: "Contrast" }), _jsx("input", { type: "range", min: 0, max: 200, step: 1, value: contrast, onChange: (e) => setContrast(Number(e.target.value)), onMouseUp: recordSnapshot, onTouchEnd: recordSnapshot, className: "flex-1 accent-primary h-1.5 bg-surface-200 rounded-full appearance-none cursor-pointer" }), _jsxs("span", { className: "text-xs text-surface-500 w-8 text-right font-mono", children: [contrast, "%"] })] }), _jsx("div", { className: "flex justify-center", children: _jsx("button", { type: "button", onClick: () => {
                                            takeSnapshot();
                                            setBrightness(100);
                                            setContrast(100);
                                        }, className: "text-xs text-primary hover:underline", children: "Reset adjustments" }) })] }))] }), _jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-t border-surface-100 shrink-0", children: [_jsx("button", { type: "button", onClick: onClose, className: "btn-ghost btn-md", children: "Cancel" }), _jsx("div", { className: "flex items-center gap-2 text-xs text-surface-400", children: _jsx("span", { children: "Crop will be applied on save" }) }), _jsx("button", { type: "button", onClick: handleApply, disabled: processing || !croppedAreaPixels, className: "btn-primary btn-md min-w-[120px]", children: processing ? (_jsxs("span", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" }), "Applying\u2026"] })) : (_jsxs("span", { className: "flex items-center gap-2", children: [_jsx(Check, { className: "w-4 h-4" }), "Apply & Save"] })) })] })] }) }));
}
//# sourceMappingURL=ImageCropModal.js.map