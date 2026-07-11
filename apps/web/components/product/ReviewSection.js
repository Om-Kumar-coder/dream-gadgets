'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';
function StarRating({ rating, interactive, onChange, size }) {
    const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-7 h-7' : 'w-5 h-5';
    return (_jsx("div", { className: "flex gap-0.5", children: [1, 2, 3, 4, 5].map((star) => {
            const filled = star <= rating;
            const half = !filled && star - 0.5 <= rating;
            return (_jsx("button", { type: interactive ? 'button' : undefined, disabled: !interactive, onClick: () => interactive && onChange?.(star), className: `${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform ${sizeClass}`, children: _jsx("svg", { viewBox: "0 0 24 24", className: `${sizeClass} ${filled ? 'text-amber-400' : half ? 'text-amber-300' : 'text-surface-200'}`, fill: "currentColor", children: _jsx("path", { d: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" }) }) }, star));
        }) }));
}
function RatingBar({ label, count, total }) {
    const pct = total > 0 ? (count / total) * 100 : 0;
    return (_jsxs("div", { className: "flex items-center gap-2 text-sm", children: [_jsx("span", { className: "w-8 text-surface-500 text-xs", children: label }), _jsx("div", { className: "flex-1 h-2 bg-surface-100 rounded-full overflow-hidden", children: _jsx("div", { className: "h-full bg-amber-400 rounded-full transition-all duration-500", style: { width: `${pct}%` } }) }), _jsx("span", { className: "w-6 text-right text-xs text-surface-400", children: count })] }));
}
export function ReviewSection({ itemId, initialSummary, initialReviews }) {
    const [reviews, setReviews] = useState(initialReviews);
    const [summary, setSummary] = useState(initialSummary);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ rating: 5, comment: '', clientName: '' });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const fetchReviews = async () => {
        try {
            const res = await fetch(`${API}/public/products/${itemId}/reviews`);
            const json = await res.json();
            const unwrapped = json.data ?? json;
            if (unwrapped.data) {
                setReviews(unwrapped.data ?? []);
                setSummary(unwrapped.summary ?? summary);
            }
        }
        catch { }
    };
    useEffect(() => { fetchReviews(); }, [itemId]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (formData.comment.length < 10) {
            setError('Comment must be at least 10 characters');
            return;
        }
        setSubmitting(true);
        try {
            const res = await fetch(`${API}/public/products/${itemId}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!res.ok) {
                const err = await res.json();
                setError(err.error?.message || 'Failed to submit review');
                return;
            }
            setSubmitted(true);
            setShowForm(false);
            setFormData({ rating: 5, comment: '', clientName: '' });
            fetchReviews();
        }
        catch {
            setError('Network error. Please try again.');
        }
        finally {
            setSubmitting(false);
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row gap-6 p-5 bg-surface-50 rounded-2xl border border-surface-100", children: [_jsxs("div", { className: "text-center sm:text-left", children: [_jsx("div", { className: "text-4xl font-bold text-surface-900", children: summary.avg_rating.toFixed(1) }), _jsx(StarRating, { rating: Math.round(summary.avg_rating), size: "sm" }), _jsxs("p", { className: "text-xs text-surface-500 mt-1", children: [summary.total_reviews, " reviews"] })] }), _jsx("div", { className: "flex-1 space-y-1", children: [5, 4, 3, 2, 1].map((star) => {
                            const key = `${star}_star`;
                            return (_jsx(RatingBar, { label: `${star}`, count: summary[key], total: summary.total_reviews }, star));
                        }) })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "heading-sm text-surface-900", children: "Customer Reviews" }), !showForm && (_jsx("button", { onClick: () => setShowForm(true), className: "text-sm text-primary font-medium hover:underline transition-colors", children: "Write a Review" }))] }), reviews.length === 0 ? (_jsxs("div", { className: "text-center py-8 text-surface-400", children: [_jsx("div", { className: "text-3xl mb-2", children: "\u270D\uFE0F" }), _jsx("p", { className: "text-sm", children: "No reviews yet. Be the first to review!" })] })) : (reviews.map((review) => (_jsxs("div", { className: "border-b border-surface-100 pb-4 last:border-0 last:pb-0", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx(StarRating, { rating: review.rating, size: "sm" }), review.is_verified && (_jsx("span", { className: "badge-success text-[10px]", children: "Verified" }))] }), _jsx("p", { className: "text-sm font-medium text-surface-900", children: review.client_name }), review.comment && _jsx("p", { className: "text-sm text-surface-600 mt-1", children: review.comment }), _jsx("p", { className: "text-xs text-surface-400 mt-1", children: new Date(review.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) })] }, review.id))))] }), showForm && (_jsxs("div", { className: "card p-5", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "font-semibold text-surface-900", children: "Write a Review" }), _jsx("button", { onClick: () => setShowForm(false), className: "text-surface-400 hover:text-surface-600 transition-colors", children: _jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm text-surface-600 mb-1", children: "Your Name" }), _jsx("input", { type: "text", required: true, value: formData.clientName, onChange: e => setFormData(p => ({ ...p, clientName: e.target.value })), className: "input", placeholder: "Enter your name" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm text-surface-600 mb-1", children: "Rating" }), _jsx(StarRating, { rating: formData.rating, interactive: true, onChange: val => setFormData(p => ({ ...p, rating: val })), size: "lg" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm text-surface-600 mb-1", children: "Review" }), _jsx("textarea", { required: true, value: formData.comment, onChange: e => setFormData(p => ({ ...p, comment: e.target.value })), rows: 3, className: "input resize-none", placeholder: "Share your experience (min 10 characters)" })] }), error && (_jsxs("p", { className: "text-sm text-red-500 bg-red-50 border border-red-200 px-3 py-2 rounded-xl flex items-center gap-2", children: [_jsx("span", { children: "\u26A0\uFE0F" }), _jsx("span", { children: error })] })), submitted && (_jsxs("p", { className: "text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl flex items-center gap-2", children: [_jsx("span", { children: "\u2713" }), _jsx("span", { children: "Review submitted successfully!" })] })), _jsx("button", { type: "submit", disabled: submitting, className: "btn-primary-glow w-full disabled:opacity-50", children: submitting ? (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" }), "Submitting..."] })) : ('Submit Review') })] })] }))] }));
}
//# sourceMappingURL=ReviewSection.js.map