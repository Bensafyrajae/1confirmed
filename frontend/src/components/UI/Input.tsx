import React, { InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled';
  inputSize?: 'sm' | 'md' | 'lg';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      variant = 'default',
      inputSize = 'md',
      disabled,
      required,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const baseClasses = [
      'block w-full rounded-lg border transition-colors duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      'disabled:bg-secondary-50 disabled:text-secondary-500 disabled:cursor-not-allowed',
    ];

    const variantClasses = {
      default: [
        'bg-white border-secondary-300',
        'focus:border-primary-500 focus:ring-primary-500',
        error
          ? 'border-error-500 focus:border-error-500 focus:ring-error-500'
          : 'hover:border-secondary-400',
      ],
      filled: [
        'bg-secondary-50 border-transparent',
        'focus:bg-white focus:border-primary-500 focus:ring-primary-500',
        error
          ? 'bg-error-50 border-error-500 focus:border-error-500 focus:ring-error-500'
          : 'hover:bg-secondary-100',
      ],
    };

    const sizeClasses = {
      sm: leftIcon || rightIcon ? 'py-1.5 text-sm' : 'px-3 py-1.5 text-sm',
      md: leftIcon || rightIcon ? 'py-2 text-sm' : 'px-3 py-2 text-sm',
      lg: leftIcon || rightIcon ? 'py-3 text-base' : 'px-4 py-3 text-base',
    };

    const iconPaddingClasses = {
      sm: {
        left: leftIcon ? 'pl-9' : '',
        right: rightIcon ? 'pr-9' : '',
      },
      md: {
        left: leftIcon ? 'pl-10' : '',
        right: rightIcon ? 'pr-10' : '',
      },
      lg: {
        left: leftIcon ? 'pl-12' : '',
        right: rightIcon ? 'pr-12' : '',
      },
    };

    const iconSizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    };

    const iconPositionClasses = {
      sm: {
        left: 'left-2.5',
        right: 'right-2.5',
      },
      md: {
        left: 'left-3',
        right: 'right-3',
      },
      lg: {
        left: 'left-3',
        right: 'right-3',
      },
    };

    const inputClasses = clsx(
      baseClasses,
      variantClasses[variant],
      sizeClasses[inputSize],
      iconPaddingClasses[inputSize].left,
      iconPaddingClasses[inputSize].right,
      className
    );

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className={clsx(
              'block text-sm font-medium text-secondary-700 mb-1',
              disabled && 'text-secondary-500'
            )}
          >
            {label}
            {required && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div
              className={clsx(
                'absolute inset-y-0 flex items-center pointer-events-none',
                iconPositionClasses[inputSize].left,
                error ? 'text-error-500' : 'text-secondary-400'
              )}
            >
              <span className={iconSizeClasses[inputSize]}>{leftIcon}</span>
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={inputClasses}
            disabled={disabled}
            required={required}
            {...props}
          />

          {rightIcon && (
            <div
              className={clsx(
                'absolute inset-y-0 flex items-center pointer-events-none',
                iconPositionClasses[inputSize].right,
                error ? 'text-error-500' : 'text-secondary-400'
              )}
            >
              <span className={iconSizeClasses[inputSize]}>{rightIcon}</span>
            </div>
          )}
        </div>

        {(error || helperText) && (
          <p
            className={clsx(
              'mt-1 text-sm',
              error ? 'text-error-600' : 'text-secondary-500'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
export default Input;