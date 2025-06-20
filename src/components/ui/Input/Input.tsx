import React, { forwardRef } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '../../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isValid?: boolean;
  isInvalid?: boolean;
  fullWidth?: boolean;
  variant?: 'default' | 'filled' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const inputVariants = {
  default: 'bg-gray-700/50 border border-gray-600/50 focus:bg-gray-700/70',
  filled: 'bg-gray-800/50 border border-gray-700/50 focus:bg-gray-800/70',
  outline: 'bg-transparent border-2 border-gray-600 focus:bg-gray-900/20',
};

const inputSizes = {
  sm: 'px-3 py-2 text-sm rounded-lg',
  md: 'px-4 py-3 text-base rounded-xl',
  lg: 'px-6 py-4 text-lg rounded-xl',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    label,
    error,
    success,
    helperText,
    leftIcon,
    rightIcon,
    isValid,
    isInvalid,
    fullWidth = true,
    variant = 'default',
    size = 'md',
    id,
    ...props
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = error || isInvalid;
    const hasSuccess = success || isValid;

    return (
      <div className={cn('relative', fullWidth && 'w-full')}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-300 mb-2 transition-colors duration-300"
          >
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 transition-colors duration-300">
              {leftIcon}
            </div>
          )}

          {/* Input Field */}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              // Base styles
              'w-full text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-500 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 hover:bg-opacity-80',
              // Variant styles
              inputVariants[variant],
              // Size styles
              inputSizes[size],
              // Icon padding
              leftIcon && 'pl-12',
              (rightIcon || hasError || hasSuccess) && 'pr-12',
              // State styles
              hasError && 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500',
              hasSuccess && 'border-green-500/50 focus:ring-green-500/50 focus:border-green-500',
              props.disabled && 'opacity-50 cursor-not-allowed',
              className
            )}
            {...props}
          />

          {/* Right Icon or Status Icon */}
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            {hasError ? (
              <AlertCircle className="w-5 h-5 text-red-400" />
            ) : hasSuccess ? (
              <CheckCircle className="w-5 h-5 text-green-400 animate-fade-in" />
            ) : rightIcon ? (
              <span className="text-gray-500 transition-colors duration-300">
                {rightIcon}
              </span>
            ) : null}
          </div>
        </div>

        {/* Helper Text, Error, or Success Message */}
        {(error || success || helperText) && (
          <div className="mt-2 animate-fade-in">
            {error && (
              <div className="flex items-center text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                {error}
              </div>
            )}
            {success && !error && (
              <div className="flex items-center text-green-400 text-sm bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                {success}
              </div>
            )}
            {helperText && !error && !success && (
              <p className="text-gray-400 text-sm">{helperText}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';