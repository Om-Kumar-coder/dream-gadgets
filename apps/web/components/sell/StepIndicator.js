'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function StepIndicator({ steps, currentStep }) {
    // Only show relevant steps (exclude confirmation from visual count)
    const visibleSteps = steps.slice(0, 5);
    return (_jsx("div", { className: "stepper", children: visibleSteps.map((label, i) => {
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
            }
            else if (isActive) {
                circleClass = 'stepper-circle stepper-circle-active';
                labelClass = 'stepper-label stepper-label-active';
            }
            return (_jsxs("div", { className: "stepper-step flex-1", children: [_jsx("div", { className: circleClass, children: isCompleted ? (_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M5 13l4 4L19 7" }) })) : (_jsx("span", { children: i + 1 })) }), _jsx("span", { className: labelClass, children: label }), i < visibleSteps.length - 1 && (_jsx("div", { className: `absolute top-[18px] left-[calc(50%+22px)] right-0 ${lineClass}`, style: { width: 'calc(100% - 44px)' } }))] }, i));
        }) }));
}
//# sourceMappingURL=StepIndicator.js.map