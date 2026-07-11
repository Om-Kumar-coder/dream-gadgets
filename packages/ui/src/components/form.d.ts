import * as React from 'react';
interface FormFieldProps {
    label: string;
    error?: string;
    children: React.ReactNode;
    required?: boolean;
}
declare const FormField: ({ label, error, children, required }: FormFieldProps) => import("react/jsx-runtime").JSX.Element;
interface FormProps {
    onSubmit: (e: React.FormEvent) => void;
    children: React.ReactNode;
    className?: string;
}
declare const Form: ({ onSubmit, children, className }: FormProps) => import("react/jsx-runtime").JSX.Element;
interface FormActionsProps {
    onCancel?: () => void;
    submitText?: string;
    submitDisabled?: boolean;
    isLoading?: boolean;
}
declare const FormActions: ({ onCancel, submitText, submitDisabled, isLoading, }: FormActionsProps) => import("react/jsx-runtime").JSX.Element;
export { FormField, Form, FormActions };
//# sourceMappingURL=form.d.ts.map