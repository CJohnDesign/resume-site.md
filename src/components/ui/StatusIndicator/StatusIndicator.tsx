import React from 'react';
import { AlertTriangle, CheckCircle, Info, Loader2 } from 'lucide-react';
import { cn } from '../../../utils/cn';

export interface StatusIndicatorProps {
  status: 'idle' | 'loading' | 'success' | 'error' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  animate?: boolean;
  className?: string;
}

const statusConfig = {
  idle: {
    color: 'bg-gray-500',
    shadowColor: 'shadow-gray-500/50',
    icon: null,
  },
  loading: {
    color: 'bg-blue-400',
    shadowColor: 'shadow-blue-400/50',
    icon: Loader2,
    iconProps: { className: 'animate-spin' },
  },
  success: {
    color: 'bg-green-400',
    shadowColor: 'shadow-green-400/50',
    icon: CheckCircle,
  },
  error: {
    color: 'bg-red-400',
    shadowColor: 'shadow-red-400/50',
    icon: AlertTriangle,
  },
  warning: {
    color: 'bg-yellow-400',
    shadowColor: 'shadow-yellow-400/50',
    icon: AlertTriangle,
  },
  info: {
    color: 'bg-blue-400',
    shadowColor: 'shadow-blue-400/50',
    icon: Info,
  },
};

const sizes = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
};

const iconSizes = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export function StatusIndicator({
  status,
  size = 'md',
  showIcon = false,
  animate = true,
  className,
}: StatusIndicatorProps) {
  const config = statusConfig[status];
  const IconComponent = config.icon;

  if (showIcon && IconComponent) {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <IconComponent
          className={cn(
            'text-white transition-all duration-500',
            iconSizes[size],
            animate && status === 'loading' && 'animate-spin',
            config.iconProps?.className
          )}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-full transition-all duration-500',
        config.color,
        sizes[size],
        animate && 'shadow-lg',
        animate && config.shadowColor,
        animate && status === 'loading' && 'animate-pulse',
        className
      )}
    />
  );
}