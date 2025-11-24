/**
 * Utility functions for Nocturne
 */

import { Task, Project, SpookinessLevel, ThemeConfig } from './types';

/**
 * Generate a UUID v4
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Validate that a string is non-empty after trimming
 */
export function isNonEmptyString(value: string): boolean {
  return value.trim().length > 0;
}

/**
 * Validate hex color code
 */
export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(color);
}

/**
 * Check if a task is urgent (due within 24 hours)
 */
export function isTaskUrgent(task: Task): boolean {
  if (!task.dueDate) return false;
  
  const now = new Date();
  const dueDate = new Date(task.dueDate);
  const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  return hoursUntilDue > 0 && hoursUntilDue <= 24;
}

/**
 * Check if a task is overdue
 */
export function isTaskOverdue(task: Task): boolean {
  if (!task.dueDate) return false;
  
  const now = new Date();
  const dueDate = new Date(task.dueDate);
  
  return dueDate < now && !task.completed;
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

/**
 * Format time remaining for timer
 */
export function formatTimeRemaining(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Get theme configuration for a spookiness level
 */
export function getThemeConfig(level: SpookinessLevel): ThemeConfig {
  const configs: Record<SpookinessLevel, ThemeConfig> = {
    minimal: {
      level: 'minimal',
      colors: {
        background: '#0a0a0a',
        foreground: '#e5e5e5',
        primary: '#8b5cf6',
        secondary: '#6366f1',
        accent: '#a78bfa',
        muted: '#404040',
      },
      animations: {
        breathingGlow: false,
        particles: false,
        transitionDuration: 200,
      },
      typography: {
        headingFont: 'Cinzel',
        bodyFont: 'Crimson Text',
      },
    },
    twilight: {
      level: 'twilight',
      colors: {
        background: '#0f0a1a',
        foreground: '#e8e0f5',
        primary: '#9333ea',
        secondary: '#7c3aed',
        accent: '#c084fc',
        muted: '#4c1d95',
      },
      animations: {
        breathingGlow: true,
        particles: false,
        transitionDuration: 300,
      },
      typography: {
        headingFont: 'Cinzel',
        bodyFont: 'Crimson Text',
      },
    },
    haunted: {
      level: 'haunted',
      colors: {
        background: '#1a0a2e',
        foreground: '#f0e6ff',
        primary: '#a855f7',
        secondary: '#9333ea',
        accent: '#d8b4fe',
        muted: '#581c87',
      },
      animations: {
        breathingGlow: true,
        particles: true,
        transitionDuration: 400,
      },
      typography: {
        headingFont: 'Cinzel',
        bodyFont: 'Crimson Text',
      },
    },
  };

  return configs[level];
}

/**
 * Validate Task invariants
 */
export function validateTask(task: Task): string[] {
  const errors: string[] = [];

  if (!task.id) {
    errors.push('Task must have an id');
  }

  if (!isNonEmptyString(task.description)) {
    errors.push('Task description must be non-empty');
  }

  if (task.createdAt > task.updatedAt) {
    errors.push('createdAt must be <= updatedAt');
  }

  // Check for duplicate tags
  const uniqueTags = new Set(task.tags);
  if (uniqueTags.size !== task.tags.length) {
    errors.push('Task tags must not contain duplicates');
  }

  return errors;
}

/**
 * Validate Project invariants
 */
export function validateProject(project: Project): string[] {
  const errors: string[] = [];

  if (!project.id) {
    errors.push('Project must have an id');
  }

  if (!isNonEmptyString(project.name)) {
    errors.push('Project name must be non-empty');
  }

  if (!isValidHexColor(project.color)) {
    errors.push('Project color must be a valid hex color code (#RRGGBB)');
  }

  return errors;
}

/**
 * Deep clone an object (for immutable updates)
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Compare two dates (ignoring time)
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Get a random item from an array
 */
export function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Shuffle an array (Fisher-Yates algorithm)
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Calculate percentage
 */
export function percentage(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle a function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
