import * as React from 'react';
import { Label } from '@radix-ui/react-label';
import { Input } from './input';

interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
  required?: boolean;
}

const FormField = ({ label, error, children, required }: FormFieldProps) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

interface FormProps {
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
  className?: string;
}

const Form = ({ onSubmit, children, className }: FormProps) => {
  return (
    <form onSubmit={onSubmit} className={`space-y-4 ${className}`}>
      {children}
    </form>
  );
};

interface FormActionsProps {
  onCancel?: () => void;
  submitText?: string;
  submitDisabled?: boolean;
  isLoading?: boolean;
}

const FormActions = ({
  onCancel,
  submitText = 'Save',
  submitDisabled,
  isLoading,
}: FormActionsProps) => {
  return (
    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
      {onCancel && (
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      )}
      <Button type="submit" isLoading={isLoading} disabled={submitDisabled}>
        {submitText}
      </Button>
    </div>
  );
};

export { FormField, Form, FormActions };
