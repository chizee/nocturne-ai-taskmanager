/**
 * Card component for content containers
 * Requirements: 8.1
 */

import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hover?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, hover = false, className = '', ...props }, ref) => {
    const baseStyles = 'rounded-lg border-2 border-[var(--color-muted)] bg-[var(--color-bg)] p-4 transition-all duration-200';
    const hoverStyles = hover ? 'hover:border-[var(--color-primary)] hover:shadow-lg cursor-pointer' : '';
    
    const combinedClassName = `${baseStyles} ${hoverStyles} ${className}`;
    
    return (
      <div ref={ref} className={combinedClassName} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
