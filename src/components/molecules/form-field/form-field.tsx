import React from 'react';
import { Input, type InputProps } from '@/components/atoms/input';

export interface FormFieldProps extends InputProps {
  label: string;
  error?: string;
  helperText?: string;
}

export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, helperText, id, ...inputProps }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5 w-full">
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
        <Input ref={ref} id={inputId} isError={Boolean(error)} {...inputProps} />
        {error ? (
          <span className="text-xs text-rose-500 font-medium">{error}</span>
        ) : helperText ? (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {helperText}
          </span>
        ) : null}
      </div>
    );
  }
);

FormField.displayName = 'FormField';
