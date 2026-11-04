import React, { type InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  isError?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', isError = false, disabled, ...props }, ref) => {
    return (
      <input
        ref={ref}
        disabled={disabled}
        className={`
            w-full px-3.5 py-2 text-sm rounded-[15px] border 
            placeholder:text-black/50 transition-colors focus:outline-none
            focus:ring-1 disabled:opacity-40 [appearance:textfield] 
            [&::-webkit-outer-spin-button]:appearance-none 
            [&::-webkit-inner-spin-button]:appearance-none 
            ${isError
            ? 'border-status-error text-status-error focus:ring-status-error'
            : 'border-black focus:border-black focus:ring-black'
          } ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
