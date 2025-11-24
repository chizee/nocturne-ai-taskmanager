/**
 * Tag component for displaying and managing tags
 * Requirements: 2.1
 */

import React from 'react';

export interface TagProps {
  label: string;
  onRemove?: () => void;
  color?: string;
}

export const Tag: React.FC<TagProps> = ({ label, onRemove, color }) => {
  const bgColor = color || 'var(--color-primary)';
  
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium text-white transition-all duration-200"
      style={{ backgroundColor: bgColor }}
    >
      {label}
      {onRemove && (
        <button
          onClick={onRemove}
          className="hover:bg-white hover:bg-opacity-20 rounded-full p-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
          aria-label={`Remove ${label} tag`}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
};

Tag.displayName = 'Tag';
