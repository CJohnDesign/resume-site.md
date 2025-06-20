import React from 'react';
import { cn } from '../../../utils/cn';

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2' | 'caption' | 'overline';
  color?: 'primary' | 'secondary' | 'muted' | 'accent' | 'success' | 'error' | 'warning';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right';
  as?: keyof JSX.IntrinsicElements;
  children: React.ReactNode;
}

const variantStyles = {
  h1: 'text-5xl font-bold leading-tight',
  h2: 'text-4xl font-bold leading-tight',
  h3: 'text-3xl font-semibold leading-snug',
  h4: 'text-2xl font-semibold leading-snug',
  h5: 'text-xl font-medium leading-normal',
  h6: 'text-lg font-medium leading-normal',
  body1: 'text-base leading-relaxed',
  body2: 'text-sm leading-normal',
  caption: 'text-xs leading-normal',
  overline: 'text-xs uppercase tracking-wider font-medium',
};

const colorStyles = {
  primary: 'text-white',
  secondary: 'text-gray-300',
  muted: 'text-gray-400',
  accent: 'text-orange-400',
  success: 'text-green-400',
  error: 'text-red-400',
  warning: 'text-yellow-400',
};

const weightStyles = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

const alignStyles = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

const defaultElements = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  body1: 'p',
  body2: 'p',
  caption: 'span',
  overline: 'span',
} as const;

export function Typography({
  variant = 'body1',
  color = 'primary',
  weight,
  align = 'left',
  as,
  className,
  children,
  ...props
}: TypographyProps) {
  const Component = as || defaultElements[variant];

  return React.createElement(
    Component,
    {
      className: cn(
        variantStyles[variant],
        colorStyles[color],
        weight && weightStyles[weight],
        alignStyles[align],
        'transition-colors duration-300',
        className
      ),
      ...props,
    },
    children
  );
}