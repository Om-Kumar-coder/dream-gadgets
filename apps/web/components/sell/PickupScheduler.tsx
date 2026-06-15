'use client';

interface PickupSchedulerProps {
  data: {
    pickupDate: string;
    pickupTime: string;
    address: string;
    city: string;
    pincode: string;
  };
  onUpdate: (data: Partial<{ pickupDate: string; pickupTime: string; address: string; city: string; pincode: string }>) => void;
}

const TIME_SLOTS = [
  '9:00 AM - 11:00 AM',
  '11:00 AM - 1:00 PM',
  '1:00 PM - 3:00 PM',
  '3:00 PM - 5:00 PM',
  '5:00 PM - 7:00 PM',
];

// Generate next 7 days
function getDateOptions() {
  const options: { value: string; label: string }[] = [];
  const today = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (let i = 1; i <= 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dayName = days[date.getDay()];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const value = date.toISOString().split('T')[0];
    const label = i === 1 ? `Tomorrow (${day} ${month})` : `${dayName} (${day} ${month})`;
    options.push({ value, label });
  }
  return options;
}

export function PickupScheduler({ data, onUpdate }: PickupSchedulerProps) {
  const dateOptions = getDateOptions();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="heading-sm text-surface-900 mb-1">Schedule Free Pickup</h3>
        <p className="text-sm text-surface-500">Choose a convenient time for doorstep pickup</p>
      </div>

      {/* Pickup Date */}
      <div>
        <label className="block text-sm font-medium text-surface-700 mb-2">Pickup Date *</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {dateOptions.map(d => (
            <button
              key={d.value}
              onClick={() => onUpdate({ pickupDate: d.value })}
              className={`p-3 rounded-xl text-sm transition-all text-center ${
                data.pickupDate === d.value
                  ? 'bg-primary text-white shadow-lg shadow-primary/30 font-semibold'
                  : 'bg-surface-50 text-surface-600 hover:bg-surface-100 border border-surface-100'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Time Slot */}
      <div>
        <label className="block text-sm font-medium text-surface-700 mb-2">Pickup Time *</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {TIME_SLOTS.map(t => (
            <button
              key={t}
              onClick={() => onUpdate({ pickupTime: t })}
              className={`p-3 rounded-xl text-sm transition-all text-center ${
                data.pickupTime === t
                  ? 'bg-primary text-white shadow-lg shadow-primary/30 font-semibold'
                  : 'bg-surface-50 text-surface-600 hover:bg-surface-100 border border-surface-100'
              }`}
            >
              🕐 {t}
            </button>
          ))}
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-surface-700 mb-2">Pickup Address *</label>
        <textarea
          value={data.address}
          onChange={e => onUpdate({ address: e.target.value })}
          placeholder="Street, building, landmark..."
          rows={2}
          className="input resize-none"
        />
      </div>

      {/* City & Pincode */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1.5">City *</label>
          <input
            type="text"
            value={data.city}
            onChange={e => onUpdate({ city: e.target.value })}
            placeholder="Your city"
            className="input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1.5">Pincode *</label>
          <input
            type="text"
            value={data.pincode}
            onChange={e => onUpdate({ pincode: e.target.value })}
            placeholder="6-digit pincode"
            className="input"
            maxLength={6}
          />
        </div>
      </div>

      {/* Confirmation note */}
      <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-700 flex items-start gap-2 border border-emerald-200">
        <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Free doorstep pickup. Our agent will arrive at your chosen time slot. You&apos;ll receive a confirmation call before pickup.</span>
      </div>
    </div>
  );
}
