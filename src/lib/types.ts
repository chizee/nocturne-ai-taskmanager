/**
 * Core data models for Nocturne task manager
 * Based on design.md specifications
 */

/**
 * Represents a discrete unit of work with metadata
 */
export interface Task {
  /** Unique identifier (UUID) */
  id: string;
  /** Task description (must be non-empty after trimming) */
  description: string;
  /** Completion status */
  completed: boolean;
  /** Creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
  /** Optional due date */
  dueDate?: Date;
  /** Associated tags (no duplicates) */
  tags: string[];
  /** Optional project assignment */
  projectId?: string;
}

/**
 * Represents a collection of related tasks
 */
export interface Project {
  /** Unique identifier (UUID) */
  id: string;
  /** Project name (must be non-empty after trimming) */
  name: string;
  /** Hex color code (#RRGGBB) */
  color: string;
  /** Creation timestamp */
  createdAt: Date;
}

/**
 * Represents a timed productivity session
 */
export interface FocusSession {
  /** Unique identifier (UUID) */
  id: string;
  /** Generated micro-plan for the session */
  microPlan: MicroPlan;
  /** Session start time */
  startTime: Date;
  /** Session end time (when completed or cancelled) */
  endTime?: Date;
  /** Duration in seconds (typically 1500 = 25 minutes) */
  duration: number;
  /** Current session status */
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  /** Timestamp when paused (only present when status is 'paused') */
  pausedAt?: Date;
  /** Timestamp when resumed (only present after pause) */
  resumedAt?: Date;
}

/**
 * Represents an AI-generated plan for a focus session
 */
export interface MicroPlan {
  /** Exactly 3 steps for the session */
  steps: PlanStep[];
  /** When the plan was generated */
  generatedAt: Date;
  /** Overall confidence score (0.0 to 1.0) */
  confidence: number;
  /** Explanation for the overall plan */
  reasoning: string;
}

/**
 * Represents a single step in a micro-plan
 */
export interface PlanStep {
  /** Reference to the task */
  taskId: string;
  /** Task description (for display) */
  description: string;
  /** Estimated time in minutes */
  estimatedMinutes: number;
  /** Why this task was selected */
  explanation: string;
  /** Confidence score for this step (0.0 to 1.0) */
  confidence: number;
}

/**
 * User preferences and settings
 */
export interface UserPreferences {
  /** Current spookiness level */
  spookinessLevel: SpookinessLevel;
  /** Whether user has completed onboarding */
  hasCompletedOnboarding: boolean;
  /** Whether keyboard shortcuts are enabled */
  keyboardShortcutsEnabled: boolean;
  /** Whether sound effects are enabled */
  soundEffectsEnabled: boolean;
}

/**
 * Spookiness level for theme system
 */
export type SpookinessLevel = 'minimal' | 'twilight' | 'haunted';

/**
 * Filter criteria for tasks
 */
export interface TaskFilter {
  /** Filter by completion status */
  completed?: boolean;
  /** Filter by tags (tasks must have at least one of these tags) */
  tags?: string[];
  /** Filter by project */
  projectId?: string;
  /** Filter by due date range */
  dueDateRange?: {
    start: Date;
    end: Date;
  };
  /** Search query for description */
  searchQuery?: string;
}

/**
 * Sort options for tasks
 */
export type SortOption = 'dueDate' | 'createdAt' | 'updatedAt';

/**
 * Theme configuration for a spookiness level
 */
export interface ThemeConfig {
  /** Spookiness level */
  level: SpookinessLevel;
  /** Color palette */
  colors: {
    background: string;
    foreground: string;
    primary: string;
    secondary: string;
    accent: string;
    muted: string;
  };
  /** Animation settings */
  animations: {
    breathingGlow: boolean;
    particles: boolean;
    transitionDuration: number; // in milliseconds
  };
  /** Typography settings */
  typography: {
    headingFont: string;
    bodyFont: string;
  };
}

/**
 * CSV row structure for import
 */
export interface CSVRow {
  description: string;
  dueDate?: string;
  tags?: string;
  project?: string;
}

/**
 * Result of CSV parsing
 */
export interface ParseResult {
  validRows: CSVRow[];
  invalidRows: Array<{
    row: number;
    data: CSVRow;
    error: string;
  }>;
}

/**
 * Validation result for a single row
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Import error details
 */
export interface ImportError {
  row: number;
  field: string;
  message: string;
}

/**
 * Storage statistics
 */
export interface StorageStats {
  used: number; // bytes
  available: number; // bytes
  percentage: number; // 0-100
}

/**
 * Error types for the application
 */
export enum ErrorType {
  STORAGE_QUOTA_EXCEEDED = 'STORAGE_QUOTA_EXCEEDED',
  STORAGE_UNAVAILABLE = 'STORAGE_UNAVAILABLE',
  STORAGE_CORRUPTED = 'STORAGE_CORRUPTED',
  INVALID_CSV_FORMAT = 'INVALID_CSV_FORMAT',
  INVALID_CSV_DATA = 'INVALID_CSV_DATA',
  INSUFFICIENT_TASKS = 'INSUFFICIENT_TASKS',
  PLAN_GENERATION_FAILED = 'PLAN_GENERATION_FAILED',
  TIMER_DRIFT = 'TIMER_DRIFT',
}

/**
 * Application error with type and context
 */
export interface AppError {
  type: ErrorType;
  message: string;
  context?: Record<string, unknown>;
}
