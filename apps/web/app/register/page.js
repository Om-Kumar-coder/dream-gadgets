'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '../../lib/api';
import { useWebAuthStore } from '../../store/auth.store';
export default function RegisterPage() {
    const router = useRouter();
    const { setTokens } = useWebAuthStore();
    const [step, setStep] = useState('otp');
    const [form, setForm] = useState({ phone: '', otp: '', firstName: '', lastName: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    async function sendOtp() {
        if (!form.phone.trim() || form.phone.replace(/\D/g, '').length < 10) {
            setError('Please enter a valid 10-digit phone number');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await apiClient.post('/auth/send-otp', { phone: form.phone });
            setStep('register');
        }
        catch (err) {
            setError(err?.response?.data?.error?.message ?? 'Failed to send OTP');
        }
        finally {
            setLoading(false);
        }
    }
    async function handleRegister(e) {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await apiClient.post('/auth/register', form);
            const { accessToken, refreshToken } = data.data;
            const payload = JSON.parse(atob(accessToken.split('.')[1]));
            setTokens(accessToken, refreshToken, payload);
            router.push('/account');
        }
        catch (err) {
            setError(err?.response?.data?.error?.message ?? 'Registration failed. Please try again.');
        }
        finally {
            setLoading(false);
        }
    }
    return (_jsx("div", { className: "min-h-[80vh] flex items-center justify-center px-4 py-12 bg-surface-50/50", children: _jsxs("div", { className: "w-full max-w-md", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("div", { className: "w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4", children: _jsx("svg", { className: "w-8 h-8 text-primary", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" }) }) }), _jsx("h1", { className: "text-2xl font-bold text-surface-900", children: "Create Account" }), _jsx("p", { className: "text-sm text-surface-500 mt-1", children: "Join Dream Gadgets today" })] }), _jsxs("div", { className: "card p-6 sm:p-8", children: [_jsxs("div", { className: "flex items-center gap-2 mb-6", children: [_jsxs("div", { className: `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${step === 'otp' ? 'bg-primary text-white shadow-sm' : 'bg-primary/10 text-primary'}`, children: [_jsx("span", { children: "1" }), _jsx("span", { children: "Verify Phone" })] }), _jsx("div", { className: "w-6 h-px bg-surface-200" }), _jsxs("div", { className: `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${step === 'register' ? 'bg-primary text-white shadow-sm' : 'bg-surface-100 text-surface-400'}`, children: [_jsx("span", { children: "2" }), _jsx("span", { children: "Details" })] })] }), step === 'otp' ? (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "register-phone", className: "block text-sm font-medium text-surface-700 mb-1.5", children: "Phone Number" }), _jsx("input", { id: "register-phone", name: "phone", type: "tel", value: form.phone, onChange: e => {
                                                setForm(p => ({ ...p, phone: e.target.value }));
                                                if (error)
                                                    setError('');
                                            }, className: "input", placeholder: "+91XXXXXXXXXX", required: true }), _jsx("p", { className: "text-xs text-surface-400 mt-1", children: "We'll send a one-time OTP to verify your number" })] }), error && (_jsxs("div", { className: "flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3", children: [_jsx("span", { children: "\u26A0\uFE0F" }), _jsx("span", { children: error })] })), _jsx("button", { onClick: sendOtp, disabled: loading || !form.phone, className: "w-full py-3 btn-red rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed", children: loading ? (_jsxs("span", { className: "flex items-center justify-center gap-2", children: [_jsxs("svg", { className: "animate-spin h-4 w-4", viewBox: "0 0 24 24", fill: "none", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" })] }), "Sending OTP..."] })) : ('Send OTP') })] })) : (_jsxs("form", { onSubmit: handleRegister, className: "space-y-4", children: [_jsxs("div", { children: [_jsxs("label", { htmlFor: "register-otp", className: "block text-sm font-medium text-surface-700 mb-1.5", children: ["OTP ", _jsxs("span", { className: "text-surface-400 font-normal", children: ["(sent to ", form.phone, ")"] })] }), _jsx("input", { id: "register-otp", name: "otp", type: "text", value: form.otp, onChange: e => setForm(p => ({ ...p, otp: e.target.value })), className: "input", placeholder: "Enter 6-digit OTP", maxLength: 6, required: true })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsxs("label", { htmlFor: "register-firstName", className: "block text-sm font-medium text-surface-700 mb-1.5", children: ["First Name ", _jsx("span", { className: "text-red-400", children: "*" })] }), _jsx("input", { id: "register-firstName", name: "firstName", type: "text", value: form.firstName, onChange: e => setForm(p => ({ ...p, firstName: e.target.value })), className: "input", placeholder: "John", required: true })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "register-lastName", className: "block text-sm font-medium text-surface-700 mb-1.5", children: "Last Name" }), _jsx("input", { id: "register-lastName", name: "lastName", type: "text", value: form.lastName, onChange: e => setForm(p => ({ ...p, lastName: e.target.value })), className: "input", placeholder: "Doe" })] })] }), _jsxs("div", { children: [_jsxs("label", { htmlFor: "register-email", className: "block text-sm font-medium text-surface-700 mb-1.5", children: ["Email ", _jsx("span", { className: "text-surface-400 font-normal", children: "(optional)" })] }), _jsx("input", { id: "register-email", name: "email", type: "email", value: form.email, onChange: e => setForm(p => ({ ...p, email: e.target.value })), className: "input", placeholder: "john@example.com" })] }), _jsxs("div", { children: [_jsxs("label", { htmlFor: "register-password", className: "block text-sm font-medium text-surface-700 mb-1.5", children: ["Password ", _jsx("span", { className: "text-red-400", children: "*" })] }), _jsx("input", { id: "register-password", name: "password", type: "password", value: form.password, onChange: e => setForm(p => ({ ...p, password: e.target.value })), className: "input", placeholder: "Min 8 characters", minLength: 8, required: true }), _jsx("p", { className: "text-xs text-surface-400 mt-1", children: "At least 8 characters" })] }), error && (_jsxs("div", { className: "flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3", children: [_jsx("span", { children: "\u26A0\uFE0F" }), _jsx("span", { children: error })] })), _jsx("button", { type: "submit", disabled: loading, className: "w-full py-3 btn-red rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed", children: loading ? (_jsxs("span", { className: "flex items-center justify-center gap-2", children: [_jsxs("svg", { className: "animate-spin h-4 w-4", viewBox: "0 0 24 24", fill: "none", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" })] }), "Creating account..."] })) : ('Create Account') }), _jsx("div", { className: "text-center", children: _jsx("button", { type: "button", onClick: () => { setStep('otp'); setError(''); }, className: "text-xs text-surface-400 hover:text-surface-600 transition-colors", children: "\u2190 Change phone number" }) })] }))] }), _jsxs("p", { className: "text-center text-sm text-surface-500 mt-6", children: ["Already have an account?", ' ', _jsx(Link, { href: "/login", className: "text-primary font-semibold hover:underline", children: "Sign In" })] })] }) }));
}
//# sourceMappingURL=page.js.map