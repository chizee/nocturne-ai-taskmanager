/**
 * Application constants
 */

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  TASKS: 'nocturne_tasks',
  PROJECTS: 'nocturne_projects',
  PREFERENCES: 'nocturne_preferences',
  ACTIVE_SESSION: 'nocturne_active_session',
} as const;

/**
 * Default values
 */
export const DEFAULTS = {
  SPOOKINESS_LEVEL: 'minimal' as const,
  FOCUS_SESSION_DURATION: 1500, // 25 minutes in seconds
  TIMER_UPDATE_INTERVAL: 1000, // 1 second in milliseconds
  URGENT_THRESHOLD_HOURS: 24,
  MIN_TASKS_FOR_FOCUS_SESSION: 3,
  MICRO_PLAN_STEPS: 3,
  MICRO_PLAN_TARGET_DURATION: 25, // minutes
  MICRO_PLAN_DURATION_TOLERANCE: 5, // ±5 minutes
} as const;

/**
 * Project colors (predefined options)
 */
export const PROJECT_COLORS = [
  '#8b5cf6', // Purple
  '#6366f1', // Indigo
  '#3b82f6', // Blue
  '#06b6d4', // Cyan
  '#10b981', // Green
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#ec4899', // Pink
] as const;

/**
 * Keyboard shortcuts
 */
export const KEYBOARD_SHORTCUTS = {
  NEW_TASK: 'ctrl+n',
  START_FOCUS: 'ctrl+f',
  SHOW_SHORTCUTS: 'ctrl+/',
  ESCAPE: 'escape',
  ENTER: 'enter',
  TAB: 'tab',
  SHIFT_TAB: 'shift+tab',
} as const;

/**
 * Accessibility
 */
export const A11Y = {
  MIN_CONTRAST_NORMAL: 4.5, // WCAG AA for normal text
  MIN_CONTRAST_LARGE: 3.0, // WCAG AA for large text
  MIN_TOUCH_TARGET: 44, // pixels
  FOCUS_OUTLINE_WIDTH: 2, // pixels
  LIVE_REGION_POLITENESS: {
    POLITE: 'polite' as const,
    ASSERTIVE: 'assertive' as const,
  },
} as const;

/**
 * Timer announcement intervals (in seconds)
 */
export const TIMER_ANNOUNCEMENTS = {
  FIVE_MINUTES: 300,
  ONE_MINUTE: 60,
  THIRTY_SECONDS: 30,
} as const;

/**
 * CSV import settings
 */
export const CSV_IMPORT = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_COLUMNS: ['description', 'dueDate', 'tags', 'project'] as const,
  DATE_FORMATS: ['YYYY-MM-DD', 'MM/DD/YYYY', 'DD/MM/YYYY'] as const,
} as const;

/**
 * Performance targets
 */
export const PERFORMANCE = {
  INITIAL_LOAD_TARGET: 2000, // 2 seconds
  OPERATION_TARGET: 100, // 100ms for task operations
  MAX_TASKS_FOR_TESTING: 1000,
  TARGET_FPS: 60,
} as const;

/**
 * Onboarding
 */
export const ONBOARDING = {
  MAX_DURATION: 60, // 60 seconds
  STEPS: [
    {
      id: 'task-creation',
      title: 'Create Your First Task',
      description: 'Click the input field or press Ctrl+N to add a task',
    },
    {
      id: 'focus-session',
      title: 'Start a Focus Session',
      description: 'Let the AI coach guide your productivity with 25-minute sessions',
    },
    {
      id: 'theme-toggle',
      title: 'Adjust the Spookiness',
      description: 'Toggle between Minimal, Twilight, and Haunted themes',
    },
  ] as const,
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  STORAGE_QUOTA_EXCEEDED: 'Storage is full. Please delete some tasks or clear old data.',
  STORAGE_UNAVAILABLE: 'Local storage is unavailable. Your data will not be saved.',
  STORAGE_CORRUPTED: 'Stored data is corrupted. Would you like to reset?',
  INVALID_CSV_FORMAT: 'Invalid CSV file format. Please check the file and try again.',
  INVALID_CSV_DATA: 'Some rows contain invalid data and were skipped.',
  INSUFFICIENT_TASKS: 'You need at least 3 incomplete tasks to start a focus session.',
  PLAN_GENERATION_FAILED: 'Failed to generate focus plan. Please try again.',
  TIMER_DRIFT: 'Timer drift detected. Time has been recalculated.',
  EMPTY_TASK_DESCRIPTION: 'Task description cannot be empty.',
  INVALID_PROJECT_NAME: 'Project name cannot be empty.',
  INVALID_HEX_COLOR: 'Invalid color code. Please use format #RRGGBB.',
} as const;

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  TASK_CREATED: 'Task created successfully',
  TASK_UPDATED: 'Task updated successfully',
  TASK_DELETED: 'Task deleted successfully',
  TASK_COMPLETED: 'Task completed! 🎉',
  PROJECT_CREATED: 'Project created successfully',
  PROJECT_DELETED: 'Project deleted successfully',
  CSV_IMPORTED: 'Tasks imported successfully',
  SESSION_COMPLETED: 'Focus session completed! Great work! 👻',
  DATA_CLEARED: 'All data cleared successfully',
} as const;

/**
 * Ghost companion messages (friendly, encouraging)
 */
export const GHOST_MESSAGES = {
  SESSION_START: [
    "Let's haunt some tasks together! 👻",
    'Time to make some productivity magic! ✨',
    'Ready to conquer your to-do list? 🌙',
  ],
  SESSION_MIDPOINT: [
    "You're doing great! Keep going! 💪",
    'Halfway there! Stay focused! 🎯',
    'Excellent progress! 🌟',
  ],
  SESSION_COMPLETE: [
    'Fantastic work! You crushed it! 🎉',
    'Session complete! Time for a break! ☕',
    'Amazing focus! Well done! 👏',
  ],
  SESSION_CANCELLED: [
    "No worries! We'll try again later. 😊",
    'Taking a break is okay! Come back when ready. 🌙',
    "That's fine! Rest up and return refreshed. ✨",
  ],
  INSUFFICIENT_TASKS: [
    'Add a few more tasks so I can help you prioritize! 📝',
    'Create at least 3 tasks to start a focus session. 🎯',
    'Need more tasks to work with! Add some and try again. ✨',
  ],
} as const;
