import React from 'react';
import { Card } from '@/components/atoms/card';
import { Badge, type BadgeProps } from '@/components/atoms/badge';

export interface StatCardProps {
  label: string;
  value: string | number;
  badgeText?: string;
  badgeVariant?: BadgeProps['variant'];
  caption?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  badgeText,
  badgeVariant = 'neutral',
  caption,
}) => {
  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider font-semibold text-black">
          {label}
        </span>
        {badgeText && (
          <Badge variant={badgeVariant} size="sm">
            {badgeText}
          </Badge>
        )}
      </div>
      <div className="text-2xl font-bold text-black">
        {value}
      </div>
      {caption && (
        <span className="text-xs text-black">{caption}</span>
      )}
    </Card>
  );
};
