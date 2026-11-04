import React, { type SelectHTMLAttributes } from 'react';

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options?: SelectOption[];
  placeholder?: string;
  isError?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      options,
      placeholder,
      children,
      className = '',
      isError = false,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          disabled={disabled}
          className={`w-full h-10 appearance-none px-3.5 py-2 pr-10 text-sm rounded-[15px] border bg-white text-black transition-colors focus:outline-none focus:ring-1 disabled:opacity-40 cursor-pointer ${
            isError
              ? 'border-status-error text-status-error focus:ring-status-error'
              : 'border-black focus:border-black focus:ring-black'
          } ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled className="text-black/60">
              {placeholder}
            </option>
          )}
          {options
            ? options.map((opt) => (
                <option
                  key={String(opt.value)}
                  value={opt.value}
                  disabled={opt.disabled}
                  className="bg-white text-black"
                >
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-black">
          <svg
            className="h-4 w-4 fill-current"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
    );
  }
);

Select.displayName = 'Select';
