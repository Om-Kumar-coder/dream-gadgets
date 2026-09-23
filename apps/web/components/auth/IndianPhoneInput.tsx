'use client';

/**
 * India-only phone input for the Dream Gadgets OTP flow.
 *
 * - Fixed India (+91) country code — there is deliberately NO country picker.
 *   No IP/geo detection runs in our code, and the old MSG91 widget iframe
 *   (which auto-detected the country via ip-api/db-ip) is no longer used.
 * - The number is used exactly as typed: digits are validated as a 10-digit
 *   Indian mobile and sent to the backend as-is; the backend normalizes to
 *   '+91 9876543210' / '919876543210' for MSG91 (never '+91 +91 …').
 */

interface IndianPhoneInputProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  autoFocus?: boolean;
  error?: string;
}

export function formatIndianPhoneDisplay(digits: string): string {
  const d = digits.slice(0, 10);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)} ${d.slice(5)}`;
}

/** True when the input is a complete, plausibly-valid Indian mobile number. */
export function isValidIndianMobile(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('0')) return /^[6-9]/.test(digits.slice(1));
  if (digits.length !== 10) return false;
  return /^[6-9]/.test(digits);
}

export function IndianPhoneInput({
  id,
  name,
  value,
  onChange,
  placeholder = '98765 43210',
  required,
  autoFocus,
  error,
}: IndianPhoneInputProps) {
  const digits = value.replace(/\D/g, '');
  // Accept a leading 0 or 91 the user typed themselves.
  let national = digits;
  if (national.length === 11 && national.startsWith('0')) national = national.slice(1);
  if (national.length === 12 && national.startsWith('91')) national = national.slice(2);
  const display = formatIndianPhoneDisplay(national);

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-surface-700 mb-1.5">
        Mobile Number
      </label>
      <div
        className={`flex items-stretch rounded-xl border bg-white overflow-hidden transition-colors ${
          error ? 'border-red-300' : 'border-surface-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10'
        }`}
      >
        {/* Fixed India prefix — not a selector, cannot be changed */}
        <span className="flex items-center gap-1.5 px-3.5 bg-surface-50 border-r border-surface-200 text-surface-700 text-sm font-semibold select-none">
          <svg className="w-4 h-3 rounded-[2px]" viewBox="0 0 6 4" aria-hidden="true">
            <rect width="6" height="4" fill="#f93" />
            <rect width="6" height="2" y="1" fill="#fff" />
            <circle cx="3" cy="2" r="0.8" fill="#008" />
          </svg>
          +91
        </span>
        <input
          id={id}
          name={name}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          maxLength={13} /* 10 digits + 2 spaces typed by the mask */
          value={display}
          onChange={e => {
            // Keep only digits — the value sent to the API is exactly the
            // number the user entered, just grouped for readability.
            const raw = e.target.value.replace(/\D/g, '');
            onChange(raw);
          }}
          placeholder={placeholder}
          required={required}
          autoFocus={autoFocus}
          className="flex-1 px-3.5 py-2.5 border-none outline-none text-sm text-surface-900 tracking-wide"
        />
      </div>
      {error ? (
        <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>
      ) : (
        <p className="text-xs text-surface-400 mt-1">
          We&apos;ll send a one-time code to this Indian number
        </p>
      )}
    </div>
  );
}
