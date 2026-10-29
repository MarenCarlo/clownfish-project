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
    info: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900',
    success:
      'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900',
    warning:
      'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900',
    error:
      'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900',
    neutral:
      'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800',
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border ${
        containerVariants[variant ?? 'info']
      } ${className}`}
    >
      <Badge variant={variant} size="sm" className="mt-0.5">
        {variant?.toUpperCase()}
      </Badge>
      <div className="flex flex-col gap-0.5">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h4>
        {description && (
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};
