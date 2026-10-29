import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  bordered?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  bordered = true,
  ...props
}) => {
  return (
    <div
      className={`rounded-xl bg-white dark:bg-gray-900 shadow-sm p-6 ${
        bordered ? 'border border-gray-200 dark:border-gray-800' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
