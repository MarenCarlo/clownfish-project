'use client';

import React, { type InputHTMLAttributes } from 'react';

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label?: React.ReactNode;
  description?: string;
  isError?: boolean;
  checked?: boolean;
  align?: 'horizontal' | 'vertical';
  onChange?: (checked: boolean) => void;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className = '',
      label,
      description,
      isError = false,
      checked = false,
      disabled = false,
      align = 'horizontal',
      onChange,
      id,
      ...props
    },
    ref
  ) => {
    const isVertical = align === 'vertical';

    return (
      <label
        htmlFor={id}
        className={`inline-flex ${
          isVertical ? 'flex-col items-center gap-1.5 text-center' : 'items-start gap-3'
        } select-none cursor-pointer group ${
          disabled ? 'opacity-40 cursor-not-allowed' : ''
        } ${className}`}
      >
        <div className="relative flex items-center justify-center shrink-0 mt-0.5">
          <input
            ref={ref}
            id={id}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={(e) => onChange?.(e.target.checked)}
            className="peer sr-only"
            {...props}
          />
          <div
            className={`w-5 h-5 rounded-[4px] border transition-colors flex items-center justify-center ${
              checked
                ? 'bg-black border-black text-white'
                : 'bg-white border-black group-hover:border-black'
            } ${isError ? 'border-status-error ring-1 ring-status-error' : ''}`}
          >
            {checked && (
              <svg
                className="w-3.5 h-3.5 stroke-current"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </div>
        </div>

        {(label || description) && (
          <div className={`flex flex-col text-sm leading-tight ${isVertical ? 'items-center text-center' : ''}`}>
            {label && (
              <span className="font-medium text-black">
                {label}
              </span>
            )}
            {description && (
              <span className="text-xs text-black/60 mt-0.5">
                {description}
              </span>
            )}
          </div>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
