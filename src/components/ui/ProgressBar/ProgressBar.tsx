import React from 'react';
import { cn } from '../../../utils/cn';

export interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'success' | 'error' | 'warning';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  className?: string;
}

const progressVariants = {
  primary: 'bg-gradient-to-r from-orange-500 to-orange-600',
  secondary: 'bg-gradient-to-r from-gray-500 to-gray-600',
  success: 'bg-gradient-to-r from-green-500 to-green-600',
  error: 'bg-gradient-to-r from-red-500 to-red-600',
  warning: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
};

const progressSizes = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

export function ProgressBar({
  value,
  max = 100,
  size = 'md',
  variant = 'primary',
  showLabel = false,
  label,
  animated = true,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn('w-full', className)}>
      {/* Label */}
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-300 font-medium">
            {label || 'Progress'}
          </span>
          <span className="text-sm text-orange-400 font-medium">
            {Math.round(percentage)}%
          </span>
        </div>
      )}

      {/* Progress Track */}
      <div className={cn(
        'w-full bg-gray-700/50 rounded-full overflow-hidden',
        progressSizes[size]
      )}>
        {/* Progress Fill */}
        <div
          className={cn(
            'h-full rounded-full transition-all ease-out',
            progressVariants[variant],
            animated ? 'duration-700' : 'duration-300'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}