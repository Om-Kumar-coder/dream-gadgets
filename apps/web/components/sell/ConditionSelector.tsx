'use client';

const FUNCTIONAL_ISSUES = [
  'Won\'t charge',
  'Dead pixels',
  'Touch not working',
  'Face ID / Touch ID broken',
  'No network / WiFi',
  'Battery draining fast',
  'Speaker not working',
  'Camera not working',
  'Buttons not working',
  'Vibrator not working',
];

interface ConditionSelectorProps {
  condition: string;
  screenCondition?: string;
  bodyCondition?: string;
  batteryHealth?: string;
  functionalIssues?: string;
  onUpdate: (data: Partial<{ condition: string; screenCondition?: string; bodyCondition?: string; batteryHealth?: string; functionalIssues?: string }>) => void;
}

const CONDITIONS = [
  {
    value: 'sealed_pack',
    label: 'Sealed Pack',
    icon: '📦',
    desc: 'Brand new, original box sealed, never opened',
    color: 'bg-violet-50 text-violet-700 border-violet-200',
  },
  {
    value: 'open_box',
    label: 'Open Box',
    icon: '📱',
    desc: 'Opened but unused, all accessories intact',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    value: 'super_mint',
    label: 'Super Mint',
    icon: '✨',
    desc: 'Like new, no scratches or signs of use',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    value: 'mint',
    label: 'Mint',
    icon: '👍',
    desc: 'Minor usage marks, screen in perfect condition',
    color: 'bg-teal-50 text-teal-700 border-teal-200',
  },
  {
    value: 'good',
    label: 'Good',
    icon: '🔧',
    desc: 'Visible wear, scratches on body, screen OK',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    value: 'fair',
    label: 'Fair',
    icon: '⚠️',
    desc: 'Significant wear, scratches on screen, dents',
    color: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  {
    value: 'broken',
    label: 'Broken / For Parts',
    icon: '🔨',
    desc: 'Cracked screen, battery issues, not working fully',
    color: 'bg-red-50 text-red-700 border-red-200',
  },
];

const CONDITION_QUESTIONS = [
  {
    id: 'screen',
    label: 'Screen Condition',
    options: ['Perfect', 'Minor Scratches', 'Deep Scratches', 'Cracked'],
  },
  {
    id: 'body',
    label: 'Body Condition',
    options: ['Like New', 'Minor Scratches', 'Visible Dents', 'Heavy Damage'],
  },
  {
    id: 'battery',
    label: 'Battery Health',
    options: ['90-100%', '70-89%', '50-69%', 'Below 50%'],
  },
];

export function ConditionSelector({ condition, screenCondition, bodyCondition, batteryHealth, functionalIssues, onUpdate }: ConditionSelectorProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Device Condition</h3>
        <p className="text-sm text-gray-500">How would you describe your device?</p>
      </div>

      {/* Condition Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CONDITIONS.map(c => (
          <button
            key={c.value}
            onClick={() => onUpdate({ condition: c.value })}
            className={`condition-card ${
              condition === c.value
                ? 'condition-card-selected'
                : 'condition-card-unselected'
            }`}
          >
            <span className="text-3xl">{c.icon}</span>
            <div className="text-center">
              <span className={`text-sm font-bold ${condition === c.value ? 'text-primary' : 'text-gray-900'}`}>
                {c.label}
              </span>
              <p className="text-xs text-gray-500 mt-0.5">{c.desc}</p>
            </div>
            {condition === c.value && (
              <span className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Quick condition questions (shown when condition selected) */}
      {condition && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-2xl animate-fade-in-up">
          <p className="text-sm font-semibold text-gray-700">Quick Assessment</p>
          {CONDITION_QUESTIONS.map(q => {
            const currentValue =
              q.id === 'screen' ? screenCondition :
              q.id === 'body' ? bodyCondition :
              batteryHealth;

            return (
              <div key={q.id}>
                <p className="text-xs text-gray-500 mb-2">{q.label}</p>
                <div className="flex flex-wrap gap-1.5">
                  {q.options.map(o => {
                    const isSelected = currentValue === o;
                    const fieldKey =
                      q.id === 'screen' ? 'screenCondition' :
                      q.id === 'body' ? 'bodyCondition' :
                      'batteryHealth';

                    return (
                      <button
                        key={o}
                        onClick={() => onUpdate({ [fieldKey]: isSelected ? '' : o })}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                          isSelected
                            ? 'bg-primary text-white border-primary shadow-sm'
                            : 'border-gray-200 text-gray-600 hover:border-primary hover:text-primary'
                        }`}
                      >
                        {o}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Functional Issues (shown when condition selected) */}
      {condition && (
        <div className="space-y-3 p-4 bg-white rounded-2xl border border-red-100">
          <div className="flex items-center gap-2">
            <span className="text-sm">⚠️</span>
            <p className="text-sm font-semibold text-gray-700">Functional Issues</p>
            <span className="text-[10px] text-gray-400 font-normal">(select all that apply)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {FUNCTIONAL_ISSUES.map(issue => {
              const selectedIssues = functionalIssues
                ? functionalIssues.split(',').map(s => s.trim())
                : [];
              const isSelected = selectedIssues.includes(issue);

              return (
                <button
                  key={issue}
                  onClick={() => {
                    const current = selectedIssues;
                    const next = isSelected
                      ? current.filter(i => i !== issue)
                      : [...current, issue];
                    onUpdate({ functionalIssues: next.length > 0 ? next.join(', ') : '' });
                  }}
                  className={`text-xs px-3 py-2 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-red-50 text-red-700 border-red-300 shadow-sm'
                      : 'border-gray-200 text-gray-600 hover:border-red-200 hover:text-red-600'
                  }`}
                >
                  {isSelected && <span className="mr-1">✓</span>}
                  {issue}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
