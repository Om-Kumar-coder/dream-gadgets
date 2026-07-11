'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback } from 'react';
import { StepIndicator } from './StepIndicator';
import { BrandModelSelector } from './BrandModelSelector';
import { ConditionSelector } from './ConditionSelector';
import { PhotoUpload } from './PhotoUpload';
import { PriceEstimateCard } from './PriceEstimateCard';
import { CustomerDetails } from './CustomerDetails';
import { PickupScheduler } from './PickupScheduler';
const STEPS = [
    'Select Device',
    'Condition',
    'Photos',
    'Price Quote',
    'Your Details',
    'Schedule Pickup',
    'Confirmation',
];
const INITIAL_DATA = {
    brand: '',
    modelName: '',
    deviceType: 'mobile',
    condition: '',
    photos: [],
    estimatedPrice: null,
    customerName: '',
    phone: '',
    email: '',
    pickupDate: '',
    pickupTime: '',
    address: '',
    city: '',
    pincode: '',
};
const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';
export function SellWizard() {
    const [step, setStep] = useState(0);
    const [data, setData] = useState(INITIAL_DATA);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const update = useCallback((partial) => {
        setData(prev => ({ ...prev, ...partial }));
    }, []);
    const canNext = useCallback(() => {
        switch (step) {
            case 0: return !!data.brand && !!data.modelName;
            case 1: return !!data.condition;
            case 2: return true; // Photos are optional
            case 3: return data.estimatedPrice !== null;
            case 4: return !!data.customerName && !!data.phone;
            case 5: return !!data.pickupDate && !!data.pickupTime;
            default: return false;
        }
    }, [step, data]);
    const handleNext = () => {
        if (canNext()) {
            setStep(s => Math.min(s + 1, STEPS.length - 1));
            setError('');
        }
    };
    const handleBack = () => {
        setStep(s => Math.max(s - 1, 0));
        setError('');
    };
    const handleSubmit = async () => {
        setSubmitting(true);
        setError('');
        try {
            // Phase 1: Create the lead
            const res = await fetch(`${API}/public/buyback/leads`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    brand: data.brand,
                    modelName: data.modelName,
                    phone: data.phone,
                    deviceType: data.deviceType,
                    condition: data.condition,
                    screenCondition: data.screenCondition || undefined,
                    bodyCondition: data.bodyCondition || undefined,
                    batteryHealth: data.batteryHealth || undefined,
                    functionalIssues: data.functionalIssues || undefined,
                    estimatedPrice: data.estimatedPrice,
                    customerName: data.customerName,
                    email: data.email || undefined,
                    pickupDate: data.pickupDate,
                    pickupTime: data.pickupTime,
                    address: data.address,
                    city: data.city,
                    pincode: data.pincode,
                }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Failed to submit');
            }
            const result = await res.json();
            const leadId = result.data?.id;
            // Phase 2: Upload photos if any and we have a lead ID
            if (leadId && data.photos.length > 0) {
                const uploadPromises = data.photos.map(async (base64Photo, i) => {
                    // Convert base64 to Blob
                    const blob = await (await fetch(base64Photo)).blob();
                    const fileExt = blob.type === 'image/webp' ? 'webp' : 'jpeg';
                    const formData = new FormData();
                    formData.append('photo', blob, `photo-${i + 1}.${fileExt}`);
                    const uploadRes = await fetch(`${API}/public/buyback/leads/${leadId}/photos`, {
                        method: 'POST',
                        body: formData,
                    });
                    if (!uploadRes.ok) {
                        // Log but don't block submission — photos are optional
                        console.warn(`Failed to upload photo ${i + 1}:`, await uploadRes.text());
                    }
                });
                // Upload photos in parallel (max 3, so no rate limit concern)
                await Promise.allSettled(uploadPromises);
            }
            setSubmitted(true);
        }
        catch (err) {
            setError(err.message || 'Something went wrong. Please try again.');
        }
        finally {
            setSubmitting(false);
        }
    };
    const handleReset = () => {
        setData(INITIAL_DATA);
        setStep(0);
        setSubmitted(false);
        setError('');
    };
    if (submitted) {
        return (_jsxs("div", { className: "text-center py-12 animate-fade-in-up", children: [_jsx("div", { className: "w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-200 shadow-lg", children: _jsx("svg", { className: "w-10 h-10 text-emerald-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2.5, d: "M5 13l4 4L19 7" }) }) }), _jsx("h3", { className: "heading-md mb-2", children: "Request Submitted! \uD83C\uDF89" }), _jsxs("p", { className: "text-surface-500 mb-2 max-w-md mx-auto", children: ["We've received your request to sell your ", data.brand, " ", data.modelName, ". Our team will contact you at ", _jsx("strong", { className: "text-surface-900", children: data.phone }), " within 24 hours."] }), _jsxs("p", { className: "text-xs text-surface-400 mb-6", children: ["Estimated value: \u20B9", data.estimatedPrice?.toLocaleString('en-IN') ?? 'N/A'] }), _jsxs("div", { className: "flex gap-3 justify-center", children: [_jsx("button", { onClick: handleReset, className: "btn-outline", children: "Sell Another Device" }), _jsx("a", { href: "/products", className: "btn-primary", children: "Browse Products" })] })] }));
    }
    return (_jsxs("div", { className: "max-w-2xl mx-auto", children: [_jsx(StepIndicator, { steps: STEPS, currentStep: step }), _jsxs("div", { className: "mt-8 bg-white rounded-2xl border border-surface-100 shadow-sm p-6 sm:p-8", children: [error && (_jsx("div", { className: "mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 animate-fade-in font-medium", children: error })), _jsxs("div", { className: "min-h-[300px] animate-fade-in-up", children: [step === 0 && (_jsx(BrandModelSelector, { brand: data.brand, modelName: data.modelName, deviceType: data.deviceType, onUpdate: update })), step === 1 && (_jsx(ConditionSelector, { condition: data.condition, screenCondition: data.screenCondition, bodyCondition: data.bodyCondition, batteryHealth: data.batteryHealth, functionalIssues: data.functionalIssues, onUpdate: update })), step === 2 && (_jsx(PhotoUpload, { photos: data.photos, onUpdate: update })), step === 3 && (_jsx(PriceEstimateCard, { brand: data.brand, modelName: data.modelName, condition: data.condition, estimatedPrice: data.estimatedPrice, onUpdate: update })), step === 4 && (_jsx(CustomerDetails, { data: data, onUpdate: update })), step === 5 && (_jsx(PickupScheduler, { data: data, onUpdate: update })), step === 6 && (_jsxs("div", { className: "text-center py-8 animate-fade-in-up", children: [_jsx("div", { className: "w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200", children: _jsx("svg", { className: "w-8 h-8 text-emerald-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2.5, d: "M5 13l4 4L19 7" }) }) }), _jsx("h3", { className: "text-xl font-bold text-surface-900 mb-1", children: "Review Your Details" }), _jsx("p", { className: "text-sm text-surface-500 mb-4", children: "Please confirm everything is correct before submitting." }), _jsxs("div", { className: "text-left space-y-2 bg-surface-50 rounded-xl p-4 mb-6 text-sm border border-surface-100", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-surface-500", children: "Device:" }), _jsxs("span", { className: "font-semibold text-surface-900", children: [data.brand, " ", data.modelName] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-surface-500", children: "Condition:" }), _jsx("span", { className: "font-semibold capitalize text-surface-900", children: data.condition.replace(/_/g, ' ') })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-surface-500", children: "Photos:" }), _jsx("span", { className: "font-semibold text-surface-900", children: data.photos.length > 0 ? `${data.photos.length} uploaded` : 'None' })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-surface-500", children: "Est. Price:" }), _jsxs("span", { className: "font-bold text-primary", children: ["\u20B9", data.estimatedPrice?.toLocaleString('en-IN')] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-surface-500", children: "Name:" }), _jsx("span", { className: "font-semibold text-surface-900", children: data.customerName })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-surface-500", children: "Phone:" }), _jsx("span", { className: "font-semibold text-surface-900", children: data.phone })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-surface-500", children: "Pickup:" }), _jsxs("span", { className: "font-semibold text-surface-900", children: [data.pickupDate, " at ", data.pickupTime] })] })] })] }))] }, step), _jsxs("div", { className: "flex items-center justify-between mt-8 pt-6 border-t border-surface-100", children: [_jsxs("button", { onClick: handleBack, disabled: step === 0, className: "btn-ghost disabled:opacity-30", children: [_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M7 16l-4-4m0 0l4-4m-4 4h18" }) }), "Back"] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "text-xs text-surface-400", children: ["Step ", step + 1, " of ", STEPS.length - 1] }), step < 6 ? (_jsxs("button", { onClick: handleNext, disabled: !canNext(), className: "btn-primary disabled:opacity-50", children: [step === 5 ? 'Review Order' : 'Continue', _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 7l5 5m0 0l-5 5m5-5H6" }) })] })) : (_jsx("button", { onClick: handleSubmit, disabled: submitting, className: "btn-primary-glow disabled:opacity-50", children: submitting ? 'Submitting...' : 'Confirm & Submit' }))] })] })] }), _jsxs("div", { className: "trust-strip mt-6", children: [_jsxs("div", { className: "trust-badge", children: [_jsx("svg", { className: "trust-badge-icon", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" }) }), "Best Price Guaranteed"] }), _jsxs("div", { className: "trust-badge", children: [_jsxs("svg", { className: "trust-badge-icon", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [_jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" }), _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 11a3 3 0 11-6 0 3 3 0 016 0z" })] }), "Free Doorstep Pickup"] }), _jsxs("div", { className: "trust-badge", children: [_jsx("svg", { className: "trust-badge-icon", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 10V3L4 14h7v7l9-11h-7z" }) }), "Instant Payment"] }), _jsxs("div", { className: "trust-badge", children: [_jsx("svg", { className: "trust-badge-icon", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" }) }), "Secure & Safe"] })] })] }));
}
//# sourceMappingURL=SellWizard.js.map