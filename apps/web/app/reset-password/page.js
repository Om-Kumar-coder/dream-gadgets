'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '../../lib/api';
/** ─── Request Reset Form (no token) ─────────────────────────────────── */
function RequestResetForm() {
    const [identifier, setIdentifier] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    async function handleRequest(e) {
        e.preventDefault();
        if (!identifier.trim()) {
            setError('Please enter your email or phone number');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await apiClient.post('/auth/forgot-password', { identifier: identifier.trim() });
            setSent(true);
        }
        catch (err) {
            setError(err?.response?.data?.error?.message ??
                err?.response?.data?.message ??
                'Something went wrong. Please try again.');
        }
        finally {
            setLoading(false);
        }
    }
    if (sent) {
        return (_jsx("div", { className: "min-h-[80vh] flex items-center justify-center px-4 py-12 bg-surface-50/50", children: _jsxs("div", { className: "w-full max-w-md text-center", children: [_jsx("div", { className: "w-20 h-20 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-6 border border-emerald-200 shadow-lg", children: _jsx("svg", { className: "w-10 h-10 text-emerald-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2.5, d: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" }) }) }), _jsx("h1", { className: "text-2xl font-bold text-surface-900 mb-2", children: "Check Your Inbox" }), _jsx("p", { className: "text-sm text-surface-500 mb-6", children: "If an account exists with that email or phone, we've sent a password reset link. Please check your inbox (and spam folder) or your SMS messages." }), _jsxs(Link, { href: "/login", className: "inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:opacity-90 active:scale-[0.97] transition-all shadow-sm", children: [_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M11 17l-5-5m0 0l5-5m-5 5h12" }) }), "Back to Login"] })] }) }));
    }
    return (_jsx("div", { className: "min-h-[80vh] flex items-center justify-center px-4 py-12 bg-surface-50/50", children: _jsxs("div", { className: "w-full max-w-md", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("div", { className: "w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4", children: _jsx("svg", { className: "w-8 h-8 text-primary", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" }) }) }), _jsx("h1", { className: "text-2xl font-bold text-surface-900", children: "Forgot Password" }), _jsx("p", { className: "text-sm text-surface-500 mt-1", children: "Enter your email or phone number and we'll send you a reset link" })] }), _jsx("div", { className: "card p-6 sm:p-8", children: _jsxs("form", { onSubmit: handleRequest, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "forgot-identifier", className: "block text-sm font-medium text-surface-700 mb-1.5", children: "Email or Phone Number" }), _jsx("input", { id: "forgot-identifier", name: "identifier", type: "text", value: identifier, onChange: e => {
                                            setIdentifier(e.target.value);
                                            if (error)
                                                setError('');
                                        }, className: "input", placeholder: "Enter your email or phone", required: true, autoFocus: true })] }), error && (_jsxs("div", { className: "flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3", children: [_jsx("span", { children: "\u26A0\uFE0F" }), _jsx("span", { children: error })] })), _jsx("button", { type: "submit", disabled: loading, className: "btn-primary w-full py-3", children: loading ? (_jsxs("span", { className: "flex items-center justify-center gap-2", children: [_jsxs("svg", { className: "animate-spin h-4 w-4", viewBox: "0 0 24 24", fill: "none", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" })] }), "Sending reset link..."] })) : ('Send Reset Link') })] }) }), _jsxs("div", { className: "text-center mt-6", children: [_jsxs("p", { className: "text-sm text-surface-500", children: ["Remember your password?", ' ', _jsx(Link, { href: "/login", className: "text-primary font-semibold hover:underline", children: "Sign In" })] }), _jsx(Link, { href: "/", className: "inline-block mt-3 text-xs text-surface-400 hover:text-surface-600 transition-colors", children: "Back to Home" })] })] }) }));
}
/** ─── Reset Password Form (has token) ───────────────────────────────── */
function SetNewPasswordForm({ token }) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    async function handleReset(e) {
        e.preventDefault();
        setError('');
        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            await apiClient.post('/auth/reset-password', {
                token,
                newPassword: password,
            });
            setSuccess(true);
        }
        catch (err) {
            setError(err?.response?.data?.error?.message ??
                err?.response?.data?.message ??
                'Failed to reset password. The link may have expired. Please request a new one.');
        }
        finally {
            setLoading(false);
        }
    }
    if (success) {
        return (_jsx("div", { className: "min-h-[80vh] flex items-center justify-center px-4 py-12 bg-surface-50/50", children: _jsxs("div", { className: "w-full max-w-md text-center", children: [_jsx("div", { className: "w-20 h-20 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-6 border border-emerald-200 shadow-lg", children: _jsx("svg", { className: "w-10 h-10 text-emerald-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2.5, d: "M5 13l4 4L19 7" }) }) }), _jsx("h1", { className: "text-2xl font-bold text-surface-900 mb-2", children: "Password Reset!" }), _jsx("p", { className: "text-sm text-surface-500 mb-6", children: "Your password has been successfully reset. You can now sign in with your new password." }), _jsxs(Link, { href: "/login", className: "inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:opacity-90 active:scale-[0.97] transition-all shadow-sm", children: [_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M11 17l-5-5m0 0l5-5m-5 5h12" }) }), "Sign In"] })] }) }));
    }
    return (_jsx("div", { className: "min-h-[80vh] flex items-center justify-center px-4 py-12 bg-surface-50/50", children: _jsxs("div", { className: "w-full max-w-md", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("div", { className: "w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4", children: _jsx("svg", { className: "w-8 h-8 text-primary", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" }) }) }), _jsx("h1", { className: "text-2xl font-bold text-surface-900", children: "Set New Password" }), _jsx("p", { className: "text-sm text-surface-500 mt-1", children: "Enter your new password below" })] }), _jsx("div", { className: "card p-6 sm:p-8", children: _jsxs("form", { onSubmit: handleReset, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "reset-password", className: "block text-sm font-medium text-surface-700 mb-1.5", children: "New Password" }), _jsx("input", { id: "reset-password", name: "password", type: "password", value: password, onChange: e => {
                                            setPassword(e.target.value);
                                            if (error)
                                                setError('');
                                        }, className: "input", placeholder: "Min 8 characters", minLength: 8, required: true, autoFocus: true }), _jsx("p", { className: "text-xs text-surface-400 mt-1", children: "At least 8 characters" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "reset-confirm-password", className: "block text-sm font-medium text-surface-700 mb-1.5", children: "Confirm Password" }), _jsx("input", { id: "reset-confirm-password", name: "confirmPassword", type: "password", value: confirmPassword, onChange: e => {
                                            setConfirmPassword(e.target.value);
                                            if (error)
                                                setError('');
                                        }, className: "input", placeholder: "Re-enter your password", minLength: 8, required: true })] }), error && (_jsxs("div", { className: "flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3", children: [_jsx("span", { children: "\u26A0\uFE0F" }), _jsx("span", { children: error })] })), _jsx("button", { type: "submit", disabled: loading, className: "btn-primary w-full py-3", children: loading ? (_jsxs("span", { className: "flex items-center justify-center gap-2", children: [_jsxs("svg", { className: "animate-spin h-4 w-4", viewBox: "0 0 24 24", fill: "none", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" })] }), "Resetting password..."] })) : ('Reset Password') })] }) }), _jsxs("div", { className: "text-center mt-6", children: [_jsxs("p", { className: "text-sm text-surface-500", children: ["Remember your password?", ' ', _jsx(Link, { href: "/login", className: "text-primary font-semibold hover:underline", children: "Sign In" })] }), _jsx(Link, { href: "/", className: "inline-block mt-3 text-xs text-surface-400 hover:text-surface-600 transition-colors", children: "Back to Home" })] })] }) }));
}
/** ─── Expired Token View ────────────────────────────────────────────── */
function TokenExpiredView() {
    return (_jsx("div", { className: "min-h-[80vh] flex items-center justify-center px-4 py-12 bg-surface-50/50", children: _jsxs("div", { className: "w-full max-w-md text-center", children: [_jsx("div", { className: "w-16 h-16 mx-auto bg-amber-50 rounded-full flex items-center justify-center mb-4 border border-amber-100", children: _jsx("svg", { className: "w-8 h-8 text-amber-500", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }) }), _jsx("h1", { className: "text-2xl font-bold text-surface-900 mb-2", children: "Invalid or Expired Link" }), _jsx("p", { className: "text-sm text-surface-500 mb-6", children: "This password reset link is invalid or has expired. Please request a new one." }), _jsx(Link, { href: "/reset-password", className: "inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-all", children: "Request New Reset Link" })] }) }));
}
/** ─── Main ──────────────────────────────────────────────────────────── */
function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    if (!token) {
        return _jsx(RequestResetForm, {});
    }
    // Validate token looks like a UUID (basic check)
    const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token);
    if (!isValidUuid) {
        return _jsx(TokenExpiredView, {});
    }
    return _jsx(SetNewPasswordForm, { token: token });
}
export default function ResetPasswordPage() {
    return (_jsx(Suspense, { fallback: _jsx("div", { className: "min-h-[80vh] flex items-center justify-center px-4", children: _jsx("div", { className: "w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" }) }), children: _jsx(ResetPasswordForm, {}) }));
}
//# sourceMappingURL=page.js.map