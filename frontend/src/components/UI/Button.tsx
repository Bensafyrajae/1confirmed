import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { LoadingSpinner } from './LoadingSpinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'whatsapp';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses = [
      'inline-flex items-center justify-center font-medium rounded-lg',
      'transition-all duration-200 ease-in-out',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'relative overflow-hidden',
    ];

    const variantClasses = {
      primary: [
        'bg-primary-600 text-white',
        'hover:bg-primary-700 active:bg-primary-800',
        'focus:ring-primary-500',
        'shadow-sm hover:shadow-md',
      ],
      secondary: [
        'bg-secondary-100 text-secondary-900 border border-secondary-200',
        'hover:bg-secondary-200 active:bg-secondary-300',
        'focus:ring-secondary-500',
      ],
      outline: [
        'bg-transparent text-primary-600 border border-primary-600',
        'hover:bg-primary-50 active:bg-primary-100',
        'focus:ring-primary-500',
      ],
      ghost: [
        'bg-transparent text-secondary-700',
        'hover:bg-secondary-100 active:bg-secondary-200',
        'focus:ring-secondary-500',
      ],
      danger: [
        'bg-error-600 text-white',
        'hover:bg-error-700 active:bg-error-800',
        'focus:ring-error-500',
        'shadow-sm hover:shadow-md',
      ],
      success: [
        'bg-success-600 text-white',
        'hover:bg-success-700 active:bg-success-800',
        'focus:ring-success-500',
        'shadow-sm hover:shadow-md',
      ],
      whatsapp: [
        'bg-whatsapp-500 text-white',
        'hover:bg-whatsapp-600 active:bg-whatsapp-700',
        'focus:ring-whatsapp-500',
        'shadow-sm hover:shadow-md',
      ],
    };

    const sizeClasses = {
      xs: 'px-2 py-1 text-xs',
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
      xl: 'px-8 py-4 text-lg',
    };

    const classes = clsx(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      fullWidth && 'w-full',
      className
    );

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-inherit">
            <LoadingSpinner size="sm" />
          </div>
        )}
        
        <div className={clsx('flex items-center gap-2', isLoading && 'opacity-0')}>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </div>
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export default Button;