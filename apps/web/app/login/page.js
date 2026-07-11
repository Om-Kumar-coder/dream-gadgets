'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '../../lib/api';
import { useWebAuthStore } from '../../store/auth.store';
import ForgotPasswordForm from '../../components/auth/ForgotPasswordForm';
export default function LoginPage() {
    const router = useRouter();
    const { setTokens } = useWebAuthStore();
    const [form, setForm] = useState({ identifier: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    async function handleLogin(e) {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await apiClient.post('/auth/login', {
                identifier: form.identifier,
                password: form.password,
            });
            const { accessToken, refreshToken } = data.data;
            const payload = JSON.parse(atob(accessToken.split('.')[1]));
            setTokens(accessToken, refreshToken, payload);
            router.push('/account');
        }
        catch (err) {
            setError(err?.response?.data?.error?.message ?? 'Login failed. Please check your credentials.');
        }
        finally {
            setLoading(false);
        }
    }
    /* ── Forgot password view (embedded) ─────────────────────── */
    if (showForgotPassword) {
        return (_jsx("div", { className: "min-h-[80vh] flex items-center justify-center px-4 py-12 bg-surface-50/50", children: _jsxs("div", { className: "w-full max-w-md", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("div", { className: "w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4", children: _jsx("svg", { className: "w-8 h-8 text-primary", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" }) }) }), _jsx("h1", { className: "text-2xl font-bold text-surface-900", children: "Forgot Password" }), _jsx("p", { className: "text-sm text-surface-500 mt-1", children: "Enter your email or phone number and we'll send you a reset link" })] }), _jsx("div", { className: "card p-6 sm:p-8", children: _jsx(ForgotPasswordForm, { embedded: true, onBack: () => setShowForgotPassword(false) }) }), _jsx("div", { className: "text-center mt-6", children: _jsx(Link, { href: "/", className: "text-xs text-surface-400 hover:text-surface-600 transition-colors", children: "Back to Home" }) })] }) }));
    }
    /* ── Login view ──────────────────────────────────────────── */
    return (_jsx("div", { className: "min-h-[80vh] flex items-center justify-center px-4 py-12 bg-surface-50/50", children: _jsxs("div", { className: "w-full max-w-md", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("div", { className: "w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4", children: _jsx("svg", { className: "w-8 h-8 text-primary", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" }) }) }), _jsx("h1", { className: "text-2xl font-bold text-surface-900", children: "Welcome Back" }), _jsx("p", { className: "text-sm text-surface-500 mt-1", children: "Sign in to your Dream Gadgets account" })] }), _jsx("div", { className: "card p-6 sm:p-8", children: _jsxs("form", { onSubmit: handleLogin, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "login-identifier", className: "block text-sm font-medium text-surface-700 mb-1.5", children: "Email or Phone Number" }), _jsx("input", { id: "login-identifier", name: "identifier", type: "text", value: form.identifier, onChange: e => setForm(p => ({ ...p, identifier: e.target.value })), className: "input", placeholder: "Enter your email or phone", required: true })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "login-password", className: "block text-sm font-medium text-surface-700 mb-1.5", children: "Password" }), _jsx("input", { id: "login-password", name: "password", type: "password", value: form.password, onChange: e => setForm(p => ({ ...p, password: e.target.value })), className: "input", placeholder: "Enter your password", required: true }), _jsx("div", { className: "flex justify-end mt-1", children: _jsx("button", { type: "button", onClick: () => setShowForgotPassword(true), className: "text-xs text-primary hover:text-primary-hover hover:underline transition-colors", children: "Forgot password?" }) })] }), error && (_jsxs("div", { className: "flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3", children: [_jsx("span", { children: "\u26A0\uFE0F" }), _jsx("span", { children: error })] })), _jsx("button", { type: "submit", disabled: loading, className: "btn-primary w-full py-3", children: loading ? (_jsxs("span", { className: "flex items-center justify-center gap-2", children: [_jsxs("svg", { className: "animate-spin h-4 w-4", viewBox: "0 0 24 24", fill: "none", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" })] }), "Signing in..."] })) : ('Sign In') })] }) }), _jsxs("div", { className: "text-center mt-6", children: [_jsxs("p", { className: "text-sm text-surface-500", children: ["Don't have an account?", ' ', _jsx(Link, { href: "/register", className: "text-primary font-semibold hover:underline", children: "Create Account" })] }), _jsx(Link, { href: "/", className: "inline-block mt-3 text-xs text-surface-400 hover:text-surface-600 transition-colors", children: "Back to Home" })] })] }) }));
}
//# sourceMappingURL=page.js.map