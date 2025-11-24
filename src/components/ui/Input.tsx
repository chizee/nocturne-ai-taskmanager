/**
 * Input component with label and error handling
 * Requirements: 10.3
 */

import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;
    
    const baseStyles = 'w-full px-4 py-2 rounded-lg bg-[var(--color-bg)] text-[var(--color-fg)] border-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-bg)]';
    
    const stateStyles = error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
      : 'border-[var(--color-muted)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]';
    
    const combinedClassName = `${baseStyles} ${stateStyles} ${className}`;
    
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[var(--color-fg)] mb-1"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={combinedClassName}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : helperId}
          {...props}
        />
        {error && (
          <p id={errorId} className="mt-1 text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="mt-1 text-sm text-[var(--color-muted)]">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = error ? `${textareaId}-error` : undefined;
    const helperId = helperText ? `${textareaId}-helper` : undefined;
    
    const baseStyles = 'w-full px-4 py-2 rounded-lg bg-[var(--color-bg)] text-[var(--color-fg)] border-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-bg)] resize-vertical';
    
    const stateStyles = error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
      : 'border-[var(--color-muted)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]';
    
    const combinedClassName = `${baseStyles} ${stateStyles} ${className}`;
    
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-[var(--color-fg)] mb-1"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={combinedClassName}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : helperId}
          {...props}
        />
        {error && (
          <p id={errorId} className="mt-1 text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="mt-1 text-sm text-[var(--color-muted)]">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
