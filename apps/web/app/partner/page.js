'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import Link from 'next/link';
const PARTNER_TYPES = [
    {
        icon: '🏪',
        title: 'Retail Partner',
        desc: 'Open a franchise or partner store and sell certified refurbished devices in your area. Get access to our inventory, training, and marketing support.',
        benefits: ['Exclusive inventory access', 'Store branding support', 'Marketing materials', 'Training program'],
    },
    {
        icon: '🔧',
        title: 'Service Partner',
        desc: 'Provide device inspection, repair, and quality certification services. Join our network of trusted service centers across India.',
        benefits: ['Certification training', 'Regular service volume', 'Spare parts support', 'Quality tools'],
    },
    {
        icon: '📦',
        title: 'Bulk Supplier',
        desc: 'Supply devices in bulk to Dream Gadgets for refurbishment and resale. We offer competitive pricing and reliable payment terms.',
        benefits: ['Bulk pricing', 'Quick payments', 'Pickup service', 'Long-term contracts'],
    },
    {
        icon: '🤝',
        title: 'Affiliate Partner',
        desc: 'Earn commissions by referring customers to Dream Gadgets. Join our affiliate program and earn up to 5% on every successful sale.',
        benefits: ['Competitive commissions', 'Real-time tracking', 'Marketing assets', 'Monthly payouts'],
    },
];
export default function PartnerPage() {
    const [form, setForm] = useState({ name: '', businessName: '', email: '', phone: '', partnerType: '', message: '' });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.name || !form.email || !form.phone || !form.partnerType) {
            setError('Please fill in all required fields.');
            return;
        }
        setSubmitting(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
            const res = await fetch(`${apiUrl}/public/partner/inquiry`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            if (!res.ok && res.status !== 404) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || 'Failed to submit inquiry.');
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
    if (submitted) {
        return (_jsx("main", { className: "animate-fade-in", children: _jsxs("section", { className: "max-w-lg mx-auto px-4 py-20 text-center", children: [_jsx("div", { className: "text-6xl mb-4", children: "\uD83C\uDF89" }), _jsx("h1", { className: "heading-md text-surface-900 mb-2", children: "Inquiry Submitted!" }), _jsx("p", { className: "text-surface-500 text-sm mb-8", children: "Thank you for your interest in partnering with Dream Gadgets. Our partnerships team will review your inquiry and reach out within 2 business days." }), _jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-center gap-3", children: [_jsx(Link, { href: "/", className: "btn-secondary btn-md", children: "Go Home" }), _jsx("button", { onClick: () => { setSubmitted(false); setForm({ name: '', businessName: '', email: '', phone: '', partnerType: '', message: '' }); }, className: "btn-outline btn-md", children: "Submit Another" })] })] }) }));
    }
    return (_jsxs("main", { className: "animate-fade-in", children: [_jsxs("section", { className: "text-white py-16 px-4 text-center relative overflow-hidden bg-gradient-hero", children: [_jsx("div", { className: "absolute -top-16 -right-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" }), _jsxs("div", { className: "relative max-w-2xl mx-auto", children: [_jsx("h1", { className: "text-4xl font-extrabold mb-3", children: "Become a Partner" }), _jsx("p", { className: "text-white/70 text-sm max-w-xl mx-auto", children: "Join India's most transparent mobile selling platform. Whether you're a retailer, service center, supplier, or affiliate \u2014 grow your business with Dream Gadgets." })] })] }), _jsxs("section", { className: "max-w-6xl mx-auto px-4 py-16", children: [_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 mb-16", children: PARTNER_TYPES.map((p) => (_jsxs("div", { className: "card p-6 hover:shadow-card-hover hover:-translate-y-0.5 transition-all group", children: [_jsx("span", { className: "text-4xl mb-3 block", children: p.icon }), _jsx("h3", { className: "font-bold text-surface-900 text-lg mb-2 group-hover:text-primary transition-colors", children: p.title }), _jsx("p", { className: "text-sm text-surface-600 leading-relaxed mb-4", children: p.desc }), _jsx("ul", { className: "space-y-1.5", children: p.benefits.map((b) => (_jsxs("li", { className: "text-xs text-surface-500 flex items-center gap-2", children: [_jsx("svg", { className: "w-3.5 h-3.5 text-emerald-500 shrink-0", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2.5, d: "M5 13l4 4L19 7" }) }), b] }, b))) })] }, p.title))) }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-5 gap-8 items-start", children: [_jsxs("div", { className: "lg:col-span-2 space-y-6", children: [_jsx("h2", { className: "heading-md text-surface-900", children: "Why Partner With Us?" }), _jsx("div", { className: "space-y-4", children: [
                                            { stat: '50,000+', label: 'Happy Customers' },
                                            { stat: '200+', label: 'Partner Locations' },
                                            { stat: '₹50Cr+', label: 'Partner Payouts' },
                                            { stat: '95%', label: 'Satisfaction Rate' },
                                        ].map((s) => (_jsxs("div", { className: "card p-4 flex items-center justify-between hover:shadow-card-hover transition-all", children: [_jsx("span", { className: "text-sm text-surface-600", children: s.label }), _jsx("span", { className: "text-lg font-bold text-primary", children: s.stat })] }, s.label))) }), _jsx("div", { className: "p-4 bg-primary/5 border border-primary/20 rounded-xl", children: _jsxs("p", { className: "text-xs text-surface-700 leading-relaxed", children: [_jsx("strong", { children: "Trusted by businesses across India." }), " Our partner network spans retail stores, service centers, and bulk suppliers in over 100 cities. Join the network and be part of India's circular economy."] }) })] }), _jsxs("div", { className: "lg:col-span-3 card p-6", children: [_jsx("h3", { className: "font-bold text-surface-900 text-lg mb-1", children: "Partner Inquiry Form" }), _jsx("p", { className: "text-sm text-surface-500 mb-6", children: "Fill out the form and our partnerships team will contact you within 2 business days." }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs text-surface-500 mb-1 font-medium", children: "Full Name *" }), _jsx("input", { type: "text", required: true, value: form.name, onChange: (e) => setForm((f) => ({ ...f, name: e.target.value })), className: "input-field", placeholder: "Your full name" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs text-surface-500 mb-1 font-medium", children: "Business Name" }), _jsx("input", { type: "text", value: form.businessName, onChange: (e) => setForm((f) => ({ ...f, businessName: e.target.value })), className: "input-field", placeholder: "Your business name" })] })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs text-surface-500 mb-1 font-medium", children: "Email Address *" }), _jsx("input", { type: "email", required: true, value: form.email, onChange: (e) => setForm((f) => ({ ...f, email: e.target.value })), className: "input-field", placeholder: "your@email.com" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs text-surface-500 mb-1 font-medium", children: "Phone Number *" }), _jsx("input", { type: "tel", required: true, value: form.phone, onChange: (e) => setForm((f) => ({ ...f, phone: e.target.value })), className: "input-field", placeholder: "10-digit mobile number", minLength: 10 })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs text-surface-500 mb-1 font-medium", children: "Partner Type *" }), _jsxs("select", { required: true, value: form.partnerType, onChange: (e) => setForm((f) => ({ ...f, partnerType: e.target.value })), className: "input-field", children: [_jsx("option", { value: "", children: "Select partner type..." }), PARTNER_TYPES.map((p) => (_jsx("option", { value: p.title, children: p.title }, p.title)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs text-surface-500 mb-1 font-medium", children: "Message (optional)" }), _jsx("textarea", { rows: 3, value: form.message, onChange: (e) => setForm((f) => ({ ...f, message: e.target.value })), className: "input-field resize-none", placeholder: "Tell us about your business..." })] }), error && (_jsx("p", { className: "text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg", children: error })), _jsx("button", { type: "submit", disabled: submitting, className: "btn-primary btn-lg w-full", children: submitting ? (_jsxs("span", { className: "flex items-center justify-center gap-2", children: [_jsxs("svg", { className: "animate-spin h-4 w-4", viewBox: "0 0 24 24", fill: "none", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" })] }), "Submitting..."] })) : ('Submit Inquiry →') }), _jsxs("p", { className: "text-xs text-surface-400 text-center", children: ["By submitting, you agree to our", ' ', _jsx(Link, { href: "/terms", className: "text-primary hover:underline", children: "Terms & Conditions" }), ' ', "and", ' ', _jsx(Link, { href: "/privacy", className: "text-primary hover:underline", children: "Privacy Policy" }), "."] })] })] })] })] })] }));
}
//# sourceMappingURL=page.js.map