/**
 * Button component with variants and accessibility
 * Requirements: 9.3, 9.5
 */

import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, disabled, className = '', children, ...props }, ref) => {
    const baseStyles = 'font-heading font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-bg)] disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantStyles = {
      primary: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-secondary)] focus:ring-[var(--color-primary)]',
      secondary: 'bg-[var(--color-secondary)] text-white hover:bg-[var(--color-primary)] focus:ring-[var(--color-secondary)]',
      ghost: 'bg-transparent text-[var(--color-fg)] border-2 border-[var(--color-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] focus:ring-[var(--color-muted)]',
    };
    
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };
    
    const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;
    
    return (
      <button
        ref={ref}
        className={combinedClassName}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading...
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
