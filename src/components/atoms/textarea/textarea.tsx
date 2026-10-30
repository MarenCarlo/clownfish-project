import React, { type TextareaHTMLAttributes } from 'react';

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  isError?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', isError = false, disabled, rows = 4, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        disabled={disabled}
        className={`w-full px-3.5 py-2.5 text-sm rounded-none border bg-white text-black placeholder:text-black/50 transition-colors focus:outline-none focus:ring-1 disabled:opacity-40 resize-none ${
          isError
            ? 'border-status-error text-status-error focus:ring-status-error'
            : 'border-black focus:border-black focus:ring-black'
        } ${className}`}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';
