/**
 * Dropdown component with keyboard navigation
 * Requirements: 9.1, 9.2, 10.4
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';

export interface DropdownOption {
  value: string;
  label: string;
}

export interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const selectedOption = options.find(opt => opt.value === value);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
        setFocusedIndex(0);
      }
      return;
    }
    
    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => (prev + 1) % options.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => (prev - 1 + options.length) % options.length);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0) {
          onChange(options[focusedIndex].value);
          setIsOpen(false);
        }
        break;
    }
  };
  
  return (
    <div ref={dropdownRef} className="relative w-full">
      {label && (
        <label className="block text-sm font-medium text-[var(--color-fg)] mb-1">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className="w-full px-4 py-2 text-left rounded-lg bg-[var(--color-bg)] text-[var(--color-fg)] border-2 border-[var(--color-muted)] hover:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-colors duration-200"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="block truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg className="w-5 h-5 text-[var(--color-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      
      {isOpen && (
        <ul
          className="absolute z-10 w-full mt-1 bg-[var(--color-bg)] border-2 border-[var(--color-primary)] rounded-lg shadow-lg max-h-60 overflow-auto"
          role="listbox"
        >
          {options.map((option, index) => (
            <li
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              onMouseEnter={() => setFocusedIndex(index)}
              className={`px-4 py-2 cursor-pointer transition-colors ${
                index === focusedIndex
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'text-[var(--color-fg)] hover:bg-[var(--color-muted)]'
              } ${value === option.value ? 'font-semibold' : ''}`}
              role="option"
              aria-selected={value === option.value}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

Dropdown.displayName = 'Dropdown';
