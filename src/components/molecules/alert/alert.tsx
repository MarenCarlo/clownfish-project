import React from 'react';
import { Badge, type BadgeProps } from '@/components/atoms/badge';

export interface AlertProps {
  title: string;
  description?: string;
  variant?: BadgeProps['variant'];
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  title,
  description,
  variant = 'info',
  className = '',
}) => {
  const containerVariants: Record<string, string> = {
    info: 'bg-white border-status-info text-status-info',
    success: 'bg-white border-status-success text-status-success',
    warning: 'bg-white border-status-warning text-status-warning',
    error: 'bg-white border-status-error text-status-error',
    neutral: 'bg-white border-black text-black',
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-none border ${
        containerVariants[variant ?? 'info']
      } ${className}`}
    >
      <Badge variant={variant} size="sm" className="mt-0.5">
        {variant?.toUpperCase()}
      </Badge>
      <div className="flex flex-col gap-0.5">
        <h4 className="text-sm font-semibold text-current">
          {title}
        </h4>
        {description && (
          <p className="text-xs text-current leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};
