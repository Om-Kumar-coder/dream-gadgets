import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Label } from '@radix-ui/react-label';
import { Button } from './button';
const FormField = ({ label, error, children, required }) => {
    return (_jsxs("div", { className: "space-y-2", children: [_jsxs(Label, { className: "text-sm font-medium text-gray-700", children: [label, " ", required && _jsx("span", { className: "text-red-500", children: "*" })] }), children, error && _jsx("p", { className: "text-xs text-red-500 mt-1", children: error })] }));
};
const Form = ({ onSubmit, children, className }) => {
    return (_jsx("form", { onSubmit: onSubmit, className: `space-y-4 ${className}`, children: children }));
};
const FormActions = ({ onCancel, submitText = 'Save', submitDisabled, isLoading, }) => {
    return (_jsxs("div", { className: "flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-6", children: [onCancel && (_jsx(Button, { variant: "outline", onClick: onCancel, children: "Cancel" })), _jsx(Button, { type: "submit", isLoading: isLoading, disabled: submitDisabled, children: submitText })] }));
};
export { FormField, Form, FormActions };
//# sourceMappingURL=form.js.map