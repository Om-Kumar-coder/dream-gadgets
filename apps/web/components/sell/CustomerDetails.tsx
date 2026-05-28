'use client';

interface CustomerDetailsProps {
  data: {
    customerName: string;
    phone: string;
    email: string;
  };
  onUpdate: (data: Partial<{ customerName: string; phone: string; email: string }>) => void;
}

export function CustomerDetails({ data, onUpdate }: CustomerDetailsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Your Details</h3>
        <p className="text-sm text-gray-500">We&apos;ll use this to contact you about your sell request</p>
      </div>

      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">👤</span>
            <input
              type="text"
              value={data.customerName}
              onChange={e => onUpdate({ customerName: e.target.value })}
              placeholder="Enter your full name"
              className="input-field pl-10"
              required
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number *</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">📞</span>
            <input
              type="tel"
              value={data.phone}
              onChange={e => onUpdate({ phone: e.target.value })}
              placeholder="10-digit mobile number"
              className="input-field pl-10"
              maxLength={10}
              required
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">We&apos;ll send a confirmation SMS</p>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email (Optional)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">📧</span>
            <input
              type="email"
              value={data.email}
              onChange={e => onUpdate({ email: e.target.value })}
              placeholder="email@example.com"
              className="input-field pl-10"
            />
          </div>
        </div>
      </div>

      {/* Privacy notice */}
      <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-500 flex items-start gap-2">
        <svg className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <span>Your information is secure and will only be used for this sell request. We respect your privacy.</span>
      </div>
    </div>
  );
}
