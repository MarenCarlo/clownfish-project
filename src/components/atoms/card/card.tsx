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
      className={`rounded-none bg-white text-black p-6 ${
        bordered ? 'border border-black' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
