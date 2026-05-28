'use client';

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  // Only show relevant steps (exclude confirmation from visual count)
  const visibleSteps = steps.slice(0, 5);

  return (
    <div className="stepper">
      {visibleSteps.map((label, i) => {
        const isCompleted = i < currentStep;
        const isActive = i === currentStep;
        const isPending = i > currentStep;

        let circleClass = 'stepper-circle stepper-circle-pending';
        let labelClass = 'stepper-label stepper-label-pending';
        let lineClass = 'stepper-line stepper-line-pending';

        if (isCompleted) {
          circleClass = 'stepper-circle stepper-circle-completed';
          labelClass = 'stepper-label stepper-label-completed';
          lineClass = 'stepper-line stepper-line-active';
        } else if (isActive) {
          circleClass = 'stepper-circle stepper-circle-active';
          labelClass = 'stepper-label stepper-label-active';
        }

        return (
          <div key={i} className="stepper-step flex-1">
            <div className={circleClass}>
              {isCompleted ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span>{i + 1}</span>
              )}
            </div>
            <span className={labelClass}>{label}</span>
            {/* Connector line */}
            {i < visibleSteps.length - 1 && (
              <div className={`absolute top-[18px] left-[calc(50%+22px)] right-0 ${lineClass}`} style={{ width: 'calc(100% - 44px)' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
