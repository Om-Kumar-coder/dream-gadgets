'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { apiClient } from '../../lib/api';
import { Loader2, Tag, X, CheckCircle2, AlertCircle } from 'lucide-react';
export function CouponInput({ subtotal, onCouponApplied, onCouponRemoved, disabled }) {
    const [code, setCode] = useState('');
    const [appliedCode, setAppliedCode] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const handleApply = async () => {
        if (!code.trim())
            return;
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const { data: res } = await apiClient.post('/coupons/validate', {
                code: code.trim(),
                subtotal,
            });
            const result = res?.data ?? res;
            if (result.valid) {
                setAppliedCode(code.trim().toUpperCase());
                setDiscountAmount(result.discount ?? 0);
                setSuccess(result.message || 'Coupon applied!');
                onCouponApplied(code.trim(), result.discount ?? 0);
            }
            else {
                setError(result.message || 'Invalid coupon code');
                onCouponRemoved();
            }
        }
        catch (err) {
            const msg = err?.response?.data?.error?.message ||
                err?.response?.data?.message ||
                'Failed to validate coupon';
            setError(msg);
            onCouponRemoved();
        }
        finally {
            setLoading(false);
        }
    };
    const handleRemove = () => {
        setCode('');
        setAppliedCode(null);
        setDiscountAmount(0);
        setError('');
        setSuccess('');
        onCouponRemoved();
    };
    if (appliedCode) {
        return (_jsx("div", { className: "bg-emerald-50 border border-emerald-200 rounded-xl p-3", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(CheckCircle2, { className: "w-4 h-4 text-emerald-600 shrink-0" }), _jsxs("div", { children: [_jsx("span", { className: "text-sm font-semibold text-emerald-800", children: appliedCode }), _jsx("p", { className: "text-xs text-emerald-600", children: discountAmount > 0
                                            ? `Discount: -₹${discountAmount.toLocaleString('en-IN')}`
                                            : 'Coupon applied' })] })] }), _jsx("button", { onClick: handleRemove, className: "p-1 rounded-lg hover:bg-emerald-100 text-emerald-500 transition-colors", children: _jsx(X, { className: "w-3.5 h-3.5" }) })] }) }));
    }
    return (_jsxs("div", { children: [_jsxs("label", { className: "block text-xs font-medium text-surface-600 mb-1.5", children: [_jsx(Tag, { className: "w-3 h-3 inline mr-1" }), "Have a coupon code?"] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { value: code, onChange: (e) => { setCode(e.target.value.toUpperCase()); setError(''); }, placeholder: "Enter code", className: "input text-sm uppercase font-mono flex-1", disabled: disabled, onKeyDown: (e) => { if (e.key === 'Enter') {
                            e.preventDefault();
                            handleApply();
                        } } }), _jsx("button", { onClick: handleApply, disabled: !code.trim() || loading || disabled, className: "btn-primary btn-sm disabled:opacity-50 whitespace-nowrap", children: loading ? (_jsx(Loader2, { className: "w-3.5 h-3.5 animate-spin" })) : ('Apply') })] }), error && (_jsxs("p", { className: "text-xs text-red-500 mt-1 flex items-center gap-1", children: [_jsx(AlertCircle, { className: "w-3 h-3" }), error] })), success && (_jsxs("p", { className: "text-xs text-emerald-600 mt-1 flex items-center gap-1", children: [_jsx(CheckCircle2, { className: "w-3 h-3" }), success] }))] }));
}
//# sourceMappingURL=CouponInput.js.map