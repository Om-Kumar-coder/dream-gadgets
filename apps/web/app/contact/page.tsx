'use client';
import { useState } from 'react';
import { apiClient } from '../../lib/api';

export default function ContactPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', email: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  function validate() {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.phone.trim() || !/^[0-9]{10}$/.test(form.phone.replace(/\D/g, ''))) e.phone = 'Valid 10-digit phone required';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email address';
    if (!form.message.trim()) e.message = 'Message is required';
    else if (form.message.trim().length < 10) e.message = 'Message must be at least 10 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate() || submitting) return;
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
    } catch (err: any) {
      setApiError(err?.response?.data?.error?.message ?? err?.response?.data?.message ?? 'Failed to send message. Please try again later or reach us directly via phone/email.');
    } finally {
      setSubmitting(false);
    }
  }

  function updateField(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }));
    if (errors[key]) setErrors(e => { const c = { ...e }; delete c[key]; return c; });
  }

  if (success) {
    return (
      <main>
        <section className="text-white py-16 px-4 text-center" style={{
          background: 'linear-gradient(135deg, #0F0F10 0%, #1A1A1A 50%, #0F0F10 100%)'
        }}>
          <h1 className="text-4xl font-extrabold mb-3">Contact Us</h1>
          <p className="text-white/80">We're here to help. Reach out anytime.</p>
        </section>
        <section className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h2>
          <p className="text-gray-500 mb-6">Thank you for reaching out! Our team will get back to you within 24 hours.</p>
          <button onClick={() => setSuccess(false)} className="px-6 py-3 btn-red rounded-xl font-semibold text-sm">
            Send Another Message
          </button>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section className="text-white py-16 px-4 text-center" style={{
        background: 'linear-gradient(135deg, #0F0F10 0%, #1A1A1A 50%, #0F0F10 100%)'
      }}>
        <h1 className="text-4xl font-extrabold mb-3">Contact Us</h1>
        <p className="text-white/80">We're here to help. Reach out anytime.</p>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

          {/* Form */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Send us a message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-firstName" className="block text-xs font-semibold text-gray-700 mb-1">First Name <span className="text-red-400">*</span></label>
                  <input
                    id="contact-firstName"
                    name="firstName"
                    type="text"
                    value={form.firstName}
                    onChange={e => updateField('firstName', e.target.value)}
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all ${errors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white focus:border-primary focus:ring-primary/20'}`}
                  />
                  {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label htmlFor="contact-lastName" className="block text-xs font-semibold text-gray-700 mb-1">Last Name</label>
                  <input
                    id="contact-lastName"
                    name="lastName"
                    type="text"
                    value={form.lastName}
                    onChange={e => updateField('lastName', e.target.value)}
                    className="w-full border border-gray-200 bg-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:border-primary focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="contact-phone" className="block text-xs font-semibold text-gray-700 mb-1">Phone Number <span className="text-red-400">*</span></label>
                <input
                  id="contact-phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={e => updateField('phone', e.target.value)}
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all ${errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white focus:border-primary focus:ring-primary/20'}`}
                />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label htmlFor="contact-email" className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={e => updateField('email', e.target.value)}
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white focus:border-primary focus:ring-primary/20'}`}
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="contact-message" className="block text-xs font-semibold text-gray-700 mb-1">Message <span className="text-red-400">*</span></label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={4}
                  value={form.message}
                  onChange={e => updateField('message', e.target.value)}
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 resize-none transition-all ${errors.message ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white focus:border-primary focus:ring-primary/20'}`}
                />
                {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
              </div>
              {apiError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                  <p className="text-sm text-red-700">{apiError}</p>
                </div>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-red font-bold py-3 rounded-xl text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending...
                  </span>
                ) : (
                  'Send Message →'
                )}
              </button>
            </form>
          </div>

          {/* Info */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Get in touch</h2>
            {[
              { icon: '📍', title: 'Main Branch', detail: '29A, Pitambar Ghatak Lane, Chetla, Kolkata — 700027' },
              { icon: '📞', title: 'Phone', detail: '+91 82820 11193 (Chetla) / +91 90383 12344 (Jadavpur)' },
              { icon: '✉️', title: 'Email', detail: 'dreamgadgetskolkata@gmail.com' },
              { icon: '🕐', title: 'Hours', detail: '12:30–9:30 PM (Chetla & Champahati) / 2–10 PM (Jadavpur)' },
            ].map(i => (
              <div key={i.title} className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-2xl shrink-0">{i.icon}</span>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{i.title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{i.detail}</p>
                </div>
              </div>
            ))}

            <div className="rounded-2xl p-5 border" style={{ backgroundColor: 'rgba(229, 9, 20, 0.06)', borderColor: 'rgba(229, 9, 20, 0.15)' }}>
              <p className="font-semibold text-white text-sm mb-1">💬 WhatsApp Support</p>
              <p className="text-xs text-gray-400 mb-3">Chat with us directly on WhatsApp for quick help.</p>                <a
                href="https://wa.me/918282011193"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 btn-red text-xs font-bold rounded-lg transition-all"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
