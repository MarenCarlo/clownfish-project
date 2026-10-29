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
          className="text-sm font-medium text-black"
        >
          {label}
        </label>
        <Input ref={ref} id={inputId} isError={Boolean(error)} {...inputProps} />
        {error ? (
          <span className="text-xs text-status-error font-medium">{error}</span>
        ) : helperText ? (
          <span className="text-xs text-black">
            {helperText}
          </span>
        ) : null}
      </div>
    );
  }
);

FormField.displayName = 'FormField';
