'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
export function BuybackForm({ brands }) {
    const [form, setForm] = useState({ brand: '', modelName: '', phone: '' });
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const isValid = form.brand && form.modelName.trim() && form.phone.trim().length >= 10;
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isValid || submitting)
            return;
        setSubmitting(true);
        setError('');
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
            const res = await fetch(`${apiUrl}/public/buyback/leads`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    brand: form.brand,
                    modelName: form.modelName.trim(),
                    phone: form.phone.trim(),
                    deviceType: 'mobile',
                }),
            });
            if (!res.ok) {
                const errBody = await res.json().catch(() => ({}));
                throw new Error(errBody.message || 'Failed to submit. Please try again.');
            }
            setSuccess(true);
            setForm({ brand: '', modelName: '', phone: '' });
        }
        catch (err) {
            setError(err.message || 'Something went wrong. Please try again.');
        }
        finally {
            setSubmitting(false);
        }
    };
    if (success) {
        return (_jsxs("div", { className: "bg-white rounded-2xl p-8 text-center max-w-lg mx-auto shadow-xl", children: [_jsx("div", { className: "text-5xl mb-4", children: "\uD83C\uDF89" }), _jsx("h3", { className: "text-xl font-bold text-gray-900 mb-2", children: "Request Submitted!" }), _jsx("p", { className: "text-gray-500 text-sm mb-6", children: "Our team will contact you shortly with the best price for your device." }), _jsx("button", { onClick: () => setSuccess(false), className: "bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors", children: "Submit Another" })] }));
    }
    return (_jsxs("form", { onSubmit: handleSubmit, className: "bg-white rounded-2xl p-6 text-left max-w-lg mx-auto shadow-xl", children: [_jsx("h2", { className: "font-bold text-gray-900 mb-4", children: "Get Instant Quote" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("select", { value: form.brand, onChange: (e) => setForm(f => ({ ...f, brand: e.target.value })), className: "w-full border border-gray-700 rounded-xl px-4 py-3 text-sm text-white bg-slate-950 focus:outline-none focus:ring-2", style: { '--tw-ring-color': '#E50914' }, required: true, children: [_jsx("option", { value: "", className: "text-gray-800", children: "Select Brand" }), brands.map(b => _jsx("option", { value: b, children: b }, b))] }), _jsx("input", { type: "text", value: form.modelName, onChange: (e) => setForm(f => ({ ...f, modelName: e.target.value })), placeholder: "Enter Model Name (e.g. iPhone 13)", className: "w-full border border-gray-700 rounded-xl px-4 py-3 text-sm text-white bg-slate-950 focus:outline-none focus:ring-2 placeholder-gray-500", style: { '--tw-ring-color': '#E50914' }, required: true }), _jsx("input", { type: "tel", value: form.phone, onChange: (e) => setForm(f => ({ ...f, phone: e.target.value })), placeholder: "Your Phone Number", className: "w-full border border-gray-700 rounded-xl px-4 py-3 text-sm text-white bg-slate-950 focus:outline-none focus:ring-2 placeholder-gray-500", style: { '--tw-ring-color': '#E50914' }, required: true, minLength: 10 }), error && (_jsx("p", { className: "text-red-500 text-xs", children: error })), _jsx("button", { type: "submit", disabled: !isValid || submitting, className: "w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl text-sm transition-colors", children: submitting ? (_jsxs("span", { className: "flex items-center justify-center gap-2", children: [_jsxs("svg", { className: "animate-spin h-4 w-4", viewBox: "0 0 24 24", fill: "none", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" })] }), "Submitting..."] })) : ('Get My Price →') })] })] }));
}
//# sourceMappingURL=BuybackForm.js.map