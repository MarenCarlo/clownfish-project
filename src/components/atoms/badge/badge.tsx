import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'info' | 'success' | 'warning' | 'error' | 'neutral';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className = '',
  variant = 'info',
  size = 'md',
  ...props
}) => {
  const variants: Record<string, string> = {
    info: 'bg-white text-status-info border-status-info',
    success: 'bg-white text-status-success border-status-success',
    warning: 'bg-white text-status-warning border-status-warning',
    error: 'bg-white text-status-error border-status-error',
    neutral: 'bg-white text-black border-black',
  };

  const sizes: Record<string, string> = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-none border font-medium ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
