import React, { type TextareaHTMLAttributes } from 'react';

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  isError?: boolean;
  showCount?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className = '',
      isError = false,
      showCount = true,
      disabled,
      rows = 4,
      maxLength,
      value,
      ...props
    },
    ref
  ) => {
    const hasCounter = showCount && typeof maxLength === 'number' && maxLength > 0;
    const currentLength =
      typeof value === 'string'
        ? value.length
        : typeof value === 'number'
        ? String(value).length
        : 0;

    return (
      <div className="relative w-full">
        <textarea
          ref={ref}
          rows={rows}
          maxLength={maxLength}
          value={value}
          disabled={disabled}
          className={`block w-full px-3.5 py-2.5 ${
            hasCounter ? 'pb-7' : ''
          } text-sm rounded-[15px] border bg-white text-black placeholder:text-black/50 transition-colors focus:outline-none focus:ring-1 disabled:opacity-40 resize-none ${
            isError
              ? 'border-status-error text-status-error focus:ring-status-error'
              : 'border-black focus:border-black focus:ring-black'
          } ${className}`}
          {...props}
        />
        {hasCounter && (
          <span
            aria-live="polite"
            className={`pointer-events-none select-none absolute bottom-2 right-3 text-xs font-mono ${
              currentLength >= maxLength
                ? 'text-status-error font-semibold'
                : 'text-black'
            }`}
          >
            {currentLength}/{maxLength}
          </span>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
