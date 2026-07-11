'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { apiClient } from '../../lib/api';
import { StaticOfferBanner } from '../../components/banner/StaticPageBanners';
export default function ContactPage() {
    const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', email: '', message: '' });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [apiError, setApiError] = useState('');
    function validate() {
        const e = {};
        if (!form.firstName.trim())
            e.firstName = 'First name is required';
        if (!form.phone.trim() || !/^[0-9]{10}$/.test(form.phone.replace(/\D/g, '')))
            e.phone = 'Valid 10-digit phone required';
        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            e.email = 'Invalid email address';
        if (!form.message.trim())
            e.message = 'Message is required';
        else if (form.message.trim().length < 10)
            e.message = 'Message must be at least 10 characters';
        setErrors(e);
        return Object.keys(e).length === 0;
    }
    async function handleSubmit(e) {
        e.preventDefault();
        if (!validate() || submitting)
            return;
        setSubmitting(true);
        setApiError('');
        try {
            await apiClient.post('/public/contact', {
                name: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
                phone: form.phone.trim(),
                email: form.email.trim(),
                message: form.message.trim(),
            });
            setSuccess(true);
            setForm({ firstName: '', lastName: '', phone: '', email: '', message: '' });
        }
        catch (err) {
            setApiError(err?.response?.data?.error?.message ?? err?.response?.data?.message ?? 'Failed to send message. Please try again later or reach us directly via phone/email.');
        }
        finally {
            setSubmitting(false);
        }
    }
    function updateField(key, value) {
        setForm(f => ({ ...f, [key]: value }));
        if (errors[key])
            setErrors(e => { const c = { ...e }; delete c[key]; return c; });
    }
    if (success) {
        return (_jsxs("main", { children: [_jsxs("section", { className: "text-white py-16 px-4 text-center", style: {
                        background: 'linear-gradient(135deg, #0F0F10 0%, #1A1A1A 50%, #0F0F10 100%)'
                    }, children: [_jsx("h1", { className: "text-4xl font-extrabold mb-3", children: "Contact Us" }), _jsx("p", { className: "text-white/80", children: "We're here to help. Reach out anytime." })] }), _jsxs("section", { className: "max-w-lg mx-auto px-4 py-16 text-center", children: [_jsx("div", { className: "text-5xl mb-4", children: "\u2705" }), _jsx("h2", { className: "text-2xl font-bold text-surface-900 mb-2", children: "Message Sent!" }), _jsx("p", { className: "text-surface-500 mb-6", children: "Thank you for reaching out! Our team will get back to you within 24 hours." }), _jsx("button", { onClick: () => setSuccess(false), className: "px-6 py-3 btn-primary rounded-xl", children: "Send Another Message" })] })] }));
    }
    return (_jsxs("main", { children: [_jsxs("section", { className: "text-white py-16 px-4 text-center", style: {
                    background: 'linear-gradient(135deg, #0F0F10 0%, #1A1A1A 50%, #0F0F10 100%)'
                }, children: [_jsx("h1", { className: "text-4xl font-extrabold mb-3", children: "Contact Us" }), _jsx("p", { className: "text-white/80", children: "We're here to help. Reach out anytime." })] }), _jsx("section", { className: "max-w-5xl mx-auto px-4 py-16", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-12", children: [_jsxs("div", { children: [_jsx("h2", { className: "heading-sm text-surface-900 mb-6", children: "Send us a message" }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsxs("label", { htmlFor: "contact-firstName", className: "block text-xs font-semibold text-surface-700 mb-1", children: ["First Name ", _jsx("span", { className: "text-red-400", children: "*" })] }), _jsx("input", { id: "contact-firstName", name: "firstName", type: "text", value: form.firstName, onChange: e => updateField('firstName', e.target.value), className: `input ${errors.firstName ? 'border-red-300 bg-red-50' : ''}` }), errors.firstName && _jsx("p", { className: "text-xs text-red-500 mt-1", children: errors.firstName })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "contact-lastName", className: "block text-xs font-semibold text-surface-700 mb-1", children: "Last Name" }), _jsx("input", { id: "contact-lastName", name: "lastName", type: "text", value: form.lastName, onChange: e => updateField('lastName', e.target.value), className: "input" })] })] }), _jsxs("div", { children: [_jsxs("label", { htmlFor: "contact-phone", className: "block text-xs font-semibold text-surface-700 mb-1", children: ["Phone Number ", _jsx("span", { className: "text-red-400", children: "*" })] }), _jsx("input", { id: "contact-phone", name: "phone", type: "tel", value: form.phone, onChange: e => updateField('phone', e.target.value), className: `input ${errors.phone ? 'border-red-300 bg-red-50' : ''}` }), errors.phone && _jsx("p", { className: "text-xs text-red-500 mt-1", children: errors.phone })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "contact-email", className: "block text-xs font-semibold text-surface-700 mb-1", children: "Email" }), _jsx("input", { id: "contact-email", name: "email", type: "email", value: form.email, onChange: e => updateField('email', e.target.value), className: `input ${errors.email ? 'border-red-300 bg-red-50' : ''}` }), errors.email && _jsx("p", { className: "text-xs text-red-500 mt-1", children: errors.email })] }), _jsxs("div", { children: [_jsxs("label", { htmlFor: "contact-message", className: "block text-xs font-semibold text-surface-700 mb-1", children: ["Message ", _jsx("span", { className: "text-red-400", children: "*" })] }), _jsx("textarea", { id: "contact-message", name: "message", rows: 4, value: form.message, onChange: e => updateField('message', e.target.value), className: `textarea ${errors.message ? 'border-red-300 bg-red-50' : ''}` }), errors.message && _jsx("p", { className: "text-xs text-red-500 mt-1", children: errors.message })] }), apiError && (_jsx("div", { className: "p-3 bg-red-50 border border-red-100 rounded-xl", children: _jsx("p", { className: "text-sm text-red-700", children: apiError }) })), _jsx("button", { type: "submit", disabled: submitting, className: "btn-primary w-full py-3", children: submitting ? (_jsxs("span", { className: "flex items-center justify-center gap-2", children: [_jsxs("svg", { className: "animate-spin h-4 w-4", viewBox: "0 0 24 24", fill: "none", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" })] }), "Sending..."] })) : ('Send Message →') })] })] }), _jsxs("div", { className: "space-y-6", children: [_jsx("h2", { className: "heading-sm text-surface-900", children: "Get in touch" }), [
                                    { icon: '📍', title: 'Main Branch', detail: '29A, Pitambar Ghatak Lane, Chetla, Kolkata — 700027' },
                                    { icon: '📞', title: 'Phone', detail: '+91 82820 11193 (Chetla) / +91 90383 12344 (Jadavpur)' },
                                    { icon: '✉️', title: 'Email', detail: 'dreamgadgetskolkata@gmail.com' },
                                    { icon: '🕐', title: 'Hours', detail: '12:30–9:30 PM (Chetla & Champahati) / 2–10 PM (Jadavpur)' },
                                ].map(i => (_jsxs("div", { className: "flex gap-4 p-4 bg-surface-50 rounded-2xl border border-surface-100", children: [_jsx("span", { className: "text-2xl shrink-0", children: i.icon }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold text-surface-900 text-sm", children: i.title }), _jsx("p", { className: "text-sm text-surface-500 mt-0.5", children: i.detail })] })] }, i.title))), _jsxs("div", { className: "rounded-2xl p-5 border", style: { backgroundColor: 'rgba(229, 9, 20, 0.06)', borderColor: 'rgba(229, 9, 20, 0.15)' }, children: [_jsx("p", { className: "font-semibold text-white text-sm mb-1", children: "\uD83D\uDCAC WhatsApp Support" }), _jsx("p", { className: "text-xs text-gray-400 mb-3", children: "Chat with us directly on WhatsApp for quick help." }), "                ", _jsx("a", { href: "https://wa.me/918282011193", target: "_blank", rel: "noopener noreferrer", className: "inline-block px-4 py-2 btn-red text-xs font-bold rounded-lg transition-all", children: "Chat on WhatsApp" })] })] })] }) }), _jsx(StaticOfferBanner, {})] }));
}
//# sourceMappingURL=page.js.map