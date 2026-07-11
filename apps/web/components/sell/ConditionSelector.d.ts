interface ConditionSelectorProps {
    condition: string;
    screenCondition?: string;
    bodyCondition?: string;
    batteryHealth?: string;
    functionalIssues?: string;
    onUpdate: (data: Partial<{
        condition: string;
        screenCondition?: string;
        bodyCondition?: string;
        batteryHealth?: string;
        functionalIssues?: string;
    }>) => void;
}
export declare function ConditionSelector({ condition, screenCondition, bodyCondition, batteryHealth, functionalIssues, onUpdate }: ConditionSelectorProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ConditionSelector.d.ts.map