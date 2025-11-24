/**
 * ThemeToggle component - Switch between spookiness levels
 * Requirements: 8.1, 8.5, 9.1, 9.3
 */

'use client';

import React from 'react';
import { SpookinessLevel } from '@/lib/types';

export interface ThemeToggleProps {
  currentLevel: SpookinessLevel;
  onChange: (level: SpookinessLevel) => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ currentLevel, onChange }) => {
  const levels: { value: SpookinessLevel; label: string; emoji: string; description: string }[] = [
    { value: 'minimal', label: 'Minimal', emoji: '🌑', description: 'Clean dark interface' },
    { value: 'twilight', label: 'Twilight', emoji: '🌙', description: 'Ambient atmosphere' },
    { value: 'haunted', label: 'Haunted', emoji: '👻', description: 'Full spooky effects' },
  ];

  return (
    <div className="flex gap-3" role="group" aria-label="Theme selector">
      {levels.map((level) => (
        <button
          key={level.value}
          onClick={() => onChange(level.value)}
          className={`relative px-6 py-3 rounded-xl font-heading font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] overflow-hidden group ${
            currentLevel === level.value
              ? 'glass border-2 border-[var(--color-primary)] text-[var(--color-primary)] scale-110'
              : 'glass border-2 border-transparent text-[var(--color-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] hover:scale-105'
          }`}
          aria-label={`Switch to ${level.label} theme: ${level.description}`}
          aria-pressed={currentLevel === level.value}
          title={level.description}
          style={{
            boxShadow: currentLevel === level.value 
              ? '0 0 20px rgba(139, 92, 246, 0.5), 0 0 40px rgba(139, 92, 246, 0.3)'
              : 'none',
          }}
        >
          {/* Animated background */}
          {currentLevel === level.value && (
            <div
              className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20"
              style={{
                animation: 'shimmer 3s linear infinite',
              }}
            />
          )}
          
          {/* Content */}
          <span className="relative z-10 flex items-center gap-2">
            <span className="text-2xl" aria-hidden="true">{level.emoji}</span>
            <span className="text-sm">{level.label}</span>
          </span>
        </button>
      ))}
    </div>
  );
};

ThemeToggle.displayName = 'ThemeToggle';
