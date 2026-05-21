'use client';

import { useState, useEffect } from 'react';

interface Review {
  id: string;
  item_id: string;
  client_name: string;
  rating: number;
  comment: string | null;
  is_verified: boolean;
  created_at: string;
}

interface RatingSummary {
  total_reviews: number;
  avg_rating: number;
  '5_star': number;
  '4_star': number;
  '3_star': number;
  '2_star': number;
  '1_star': number;
}

interface ReviewSectionProps {
  itemId: string;
  initialSummary: RatingSummary;
  initialReviews: Review[];
}

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

function StarRating({ rating, interactive, onChange, size }: {
  rating: number;
  interactive?: boolean;
  onChange?: (val: number) => void;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-7 h-7' : 'w-5 h-5';

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= rating;
        const half = !filled && star - 0.5 <= rating;
        return (
          <button
            key={star}
            type={interactive ? 'button' : undefined}
            disabled={!interactive}
            onClick={() => interactive && onChange?.(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform ${sizeClass}`}
          >
            <svg viewBox="0 0 24 24" className={`${sizeClass} ${filled ? 'text-amber-400' : half ? 'text-amber-300' : 'text-gray-200'}`} fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}

function RatingBar({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-8 text-gray-500 text-xs">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-6 text-right text-xs text-gray-400">{count}</span>
    </div>
  );
}

export function ReviewSection({ itemId, initialSummary, initialReviews }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [summary, setSummary] = useState<RatingSummary>(initialSummary);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ rating: 5, comment: '', clientName: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${API}/public/products/${itemId}/reviews`);
      const json = await res.json();
      // Unwrap TransformInterceptor: { status, data: { data, summary } }
      const unwrapped = json.data ?? json;
      if (unwrapped.data) {
        setReviews(unwrapped.data ?? []);
        setSummary(unwrapped.summary ?? summary);
      }
    } catch {}
  };

  useEffect(() => { fetchReviews(); }, [itemId]);

  const handleSubmit = async (e: React.FormEvent) => {
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
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex flex-col sm:flex-row gap-6 p-5 bg-gray-50 rounded-2xl">
        <div className="text-center sm:text-left">
          <div className="text-4xl font-bold text-gray-900">{summary.avg_rating.toFixed(1)}</div>
          <StarRating rating={Math.round(summary.avg_rating)} size="sm" />
          <p className="text-xs text-gray-500 mt-1">{summary.total_reviews} reviews</p>
        </div>
        <div className="flex-1 space-y-1">
          {[5, 4, 3, 2, 1].map((star) => {
            const key = `${star}_star` as keyof RatingSummary;
            return (
              <RatingBar
                key={star}
                label={`${star}`}
                count={summary[key] as number}
                total={summary.total_reviews}
              />
            );
          })}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Customer Reviews</h3>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="text-sm text-primary font-medium hover:underline"
            >
              Write a Review
            </button>
          )}
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-3xl mb-2">✍️</div>
            <p className="text-sm">No reviews yet. Be the first to review!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
              <div className="flex items-center gap-2 mb-1">
                <StarRating rating={review.rating} size="sm" />
                {review.is_verified && (
                  <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full font-medium">
                    Verified
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-gray-900">{review.client_name}</p>
              {review.comment && <p className="text-sm text-gray-600 mt-1">{review.comment}</p>}
              <p className="text-xs text-gray-400 mt-1">
                {new Date(review.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Add Review Form */}
      {showForm && (
        <div className="border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Write a Review</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Your Name</label>
              <input
                type="text"
                required
                value={formData.clientName}
                onChange={e => setFormData(p => ({ ...p, clientName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Rating</label>
              <StarRating
                rating={formData.rating}
                interactive
                onChange={val => setFormData(p => ({ ...p, rating: val }))}
                size="lg"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Review</label>
              <textarea
                required
                value={formData.comment}
                onChange={e => setFormData(p => ({ ...p, comment: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                placeholder="Share your experience (min 10 characters)"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            {submitted && (
              <p className="text-sm text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">
                ✓ Review submitted successfully!
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-red w-full py-2.5 rounded-xl font-medium text-sm disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
