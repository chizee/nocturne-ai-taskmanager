# Design Document

## Overview

Nocturne is a client-side web application built with Next.js 14 and React 18, featuring a toggleable gothic aesthetic and AI-powered focus session planning. The architecture follows a component-based design with clear separation between UI, business logic, and data persistence layers. All data is stored locally in the browser using the Web Storage API, ensuring privacy and offline functionality.

The application emphasizes accessibility as a core requirement, implementing WCAG 2.1 Level AA standards throughout. The AI Focus Coach leverages Kiro agent hooks to analyze task metadata and generate explainable micro-plans for 25-minute focus sessions.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Presentation Layer                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Next.js    │  │   React      │  │   Tailwind   │  │
│  │   App Router │  │   Components │  │   CSS        │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    Business Logic Layer                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Task       │  │   Focus      │  │   Theme      │  │
│  │   Manager    │  │   Coach      │  │   Manager    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐  ┌──────────────┐                    │
│  │   CSV        │  │   Kiro       │                    │
│  │   Importer   │  │   Agent Hook │                    │
│  └──────────────┘  └──────────────┘                    │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    Data Persistence Layer                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Local      │  │   Storage    │  │   State      │  │
│  │   Storage    │  │   Manager    │  │   Manager    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Frontend Framework:** Next.js 14 with App Router
- **UI Library:** React 18 with TypeScript
- **Styling:** Tailwind CSS with custom design tokens
- **State Management:** React Context API + useReducer
- **Data Persistence:** Web Storage API (localStorage)
- **Animations:** Framer Motion for atmospheric effects
- **AI Integration:** Kiro Agent Hooks for Focus Coach
- **Testing:** Vitest (unit), Playwright (E2E), Axe (accessibility)
- **Property-Based Testing:** fast-check library

## Components and Interfaces

### Core Components

#### 1. TaskList Component
Displays all tasks with filtering, sorting, and grouping capabilities.

**Props:**
```typescript
interface TaskListProps {
  tasks: Task[];
  filter: TaskFilter;
  sortBy: SortOption;
  onTaskClick: (taskId: string) => void;
  onTaskComplete: (taskId: string) => void;
  onTaskDelete: (taskId: string) => void;
}
```

**Responsibilities:**
- Render task cards in a responsive grid/list
- Apply filters (by tag, project, completion status)
- Handle sorting (by due date, creation date, priority)
- Provide keyboard navigation between tasks
- Announce changes to screen readers via ARIA live regions

#### 2. TaskCard Component
Individual task display with inline editing capabilities.

**Props:**
```typescript
interface TaskCardProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onComplete: (taskId: string) => void;
  spookinessLevel: SpookinessLevel;
}
```

**Responsibilities:**
- Display task description, due date, tags, project
- Provide inline editing for quick updates
- Show visual indicators for overdue/approaching tasks
- Apply theme-specific styling based on spookiness level
- Ensure keyboard accessibility (Enter to edit, Escape to cancel)

#### 3. TaskForm Component
Form for creating and editing tasks.

**Props:**
```typescript
interface TaskFormProps {
  task?: Task; // undefined for new task
  onSubmit: (task: Task) => void;
  onCancel: () => void;
  projects: Project[];
  availableTags: string[];
}
```

**Responsibilities:**
- Validate task description (non-empty)
- Provide tag selection/creation
- Provide due date picker
- Provide project assignment dropdown
- Handle form submission and cancellation
- Display validation errors accessibly

#### 4. FocusCoach Component
AI-powered focus session interface.

**Props:**
```typescript
interface FocusCoachProps {
  tasks: Task[];
  onSessionStart: (session: FocusSession) => void;
  onSessionComplete: (session: FocusSession) => void;
}
```

**Responsibilities:**
- Trigger AI micro-plan generation via Kiro hook
- Display 3-step plan with explanations and confidence scores
- Show 25-minute countdown timer
- Provide pause/resume/cancel controls
- Announce timer updates to screen readers at intervals
- Display ghost companion messages

#### 5. Timer Component
Visual countdown timer for focus sessions.

**Props:**
```typescript
interface TimerProps {
  duration: number; // in seconds
  isRunning: boolean;
  onComplete: () => void;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
}
```

**Responsibilities:**
- Display remaining time in MM:SS format
- Update every second when running
- Provide visual progress indicator (circular or linear)
- Play subtle notification sound on completion
- Ensure timer updates are announced accessibly

#### 6. ThemeToggle Component
Control for adjusting spookiness level.

**Props:**
```typescript
interface ThemeToggleProps {
  currentLevel: SpookinessLevel;
  onChange: (level: SpookinessLevel) => void;
}
```

**Responsibilities:**
- Display three theme options (Minimal, Twilight, Haunted)
- Provide visual preview of each theme
- Apply theme change immediately
- Persist preference to local storage
- Ensure keyboard accessibility

#### 7. CSVImporter Component
Interface for importing tasks from CSV files.

**Props:**
```typescript
interface CSVImporterProps {
  onImport: (tasks: Task[]) => void;
  onError: (errors: ImportError[]) => void;
}
```

**Responsibilities:**
- Provide file upload interface
- Parse CSV data (description, dueDate, tags, project)
- Validate each row
- Display import preview with error highlighting
- Report success/failure statistics
- Handle file size limits

#### 8. OnboardingTour Component
Guided tour for first-time users.

**Props:**
```typescript
interface OnboardingTourProps {
  onComplete: () => void;
  onSkip: () => void;
}
```

**Responsibilities:**
- Detect first-time users
- Highlight key features in sequence
- Provide clear instructions for each step
- Complete within 60 seconds
- Allow skipping at any point
- Mark tour as completed in preferences

### Business Logic Modules

#### TaskManager
Handles all task-related operations.

```typescript
interface TaskManager {
  createTask(description: string, metadata?: TaskMetadata): Task;
  updateTask(taskId: string, updates: Partial<Task>): Task;
  deleteTask(taskId: string): void;
  completeTask(taskId: string): Task;
  getTasks(filter?: TaskFilter): Task[];
  getTaskById(taskId: string): Task | undefined;
  addTag(taskId: string, tag: string): Task;
  removeTag(taskId: string, tag: string): Task;
  setDueDate(taskId: string, date: Date): Task;
  assignToProject(taskId: string, projectId: string): Task;
}
```

#### ProjectManager
Handles project-related operations.

```typescript
interface ProjectManager {
  createProject(name: string, color?: string): Project;
  updateProject(projectId: string, updates: Partial<Project>): Project;
  deleteProject(projectId: string): void;
  getProjects(): Project[];
  getProjectById(projectId: string): Project | undefined;
  getTasksByProject(projectId: string): Task[];
}
```

#### FocusCoachService
Integrates with Kiro agent hook for session planning.

```typescript
interface FocusCoachService {
  generateMicroPlan(tasks: Task[]): Promise<MicroPlan>;
  startSession(plan: MicroPlan): FocusSession;
  pauseSession(sessionId: string): void;
  resumeSession(sessionId: string): void;
  cancelSession(sessionId: string): void;
  completeSession(sessionId: string): void;
  getActiveSession(): FocusSession | undefined;
}
```

#### StorageManager
Handles data persistence to local storage.

```typescript
interface StorageManager {
  saveTasks(tasks: Task[]): void;
  loadTasks(): Task[];
  saveProjects(projects: Project[]): void;
  loadProjects(): Project[];
  savePreferences(prefs: UserPreferences): void;
  loadPreferences(): UserPreferences;
  clearAllData(): void;
  getStorageUsage(): StorageStats;
}
```

#### CSVImporter
Parses and validates CSV files.

```typescript
interface CSVImporter {
  parseFile(file: File): Promise<ParseResult>;
  validateRow(row: CSVRow): ValidationResult;
  convertToTasks(rows: CSVRow[]): Task[];
}
```

#### ThemeManager
Manages spookiness levels and theme application.

```typescript
interface ThemeManager {
  setSpookinessLevel(level: SpookinessLevel): void;
  getSpookinessLevel(): SpookinessLevel;
  applyTheme(level: SpookinessLevel): void;
  getThemeConfig(level: SpookinessLevel): ThemeConfig;
}
```

## Data Models

### Task
```typescript
interface Task {
  id: string; // UUID
  description: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  tags: string[];
  projectId?: string;
}
```

**Invariants:**
- `id` must be unique across all tasks
- `description` must be non-empty after trimming whitespace
- `createdAt` must be <= `updatedAt`
- `dueDate`, if present, should be a valid future or past date
- `tags` must not contain duplicates
- `projectId`, if present, must reference an existing project

### Project
```typescript
interface Project {
  id: string; // UUID
  name: string;
  color: string; // hex color code
  createdAt: Date;
}
```

**Invariants:**
- `id` must be unique across all projects
- `name` must be non-empty after trimming whitespace
- `color` must be a valid hex color code (#RRGGBB)

### FocusSession
```typescript
interface FocusSession {
  id: string; // UUID
  microPlan: MicroPlan;
  startTime: Date;
  endTime?: Date;
  duration: number; // in seconds, typically 1500 (25 minutes)
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  pausedAt?: Date;
  resumedAt?: Date;
}
```

**Invariants:**
- `id` must be unique across all sessions
- `duration` must be positive
- `endTime`, if present, must be >= `startTime`
- Only one session can be 'active' at a time
- `pausedAt` is only present when status is 'paused'

### MicroPlan
```typescript
interface MicroPlan {
  steps: PlanStep[];
  generatedAt: Date;
  confidence: number; // 0.0 to 1.0
  reasoning: string;
}

interface PlanStep {
  taskId: string;
  description: string;
  estimatedMinutes: number;
  explanation: string; // why this task was selected
  confidence: number; // 0.0 to 1.0
}
```

**Invariants:**
- `steps` must contain exactly 3 items
- Sum of `estimatedMinutes` should be approximately 25
- Each `taskId` must reference an existing, incomplete task
- `confidence` values must be between 0.0 and 1.0

### UserPreferences
```typescript
interface UserPreferences {
  spookinessLevel: SpookinessLevel;
  hasCompletedOnboarding: boolean;
  keyboardShortcutsEnabled: boolean;
  soundEffectsEnabled: boolean;
}

type SpookinessLevel = 'minimal' | 'twilight' | 'haunted';
```

### TaskFilter
```typescript
interface TaskFilter {
  completed?: boolean;
  tags?: string[];
  projectId?: string;
  dueDateRange?: {
    start: Date;
    end: Date;
  };
  searchQuery?: string;
}
```

### ThemeConfig
```typescript
interface ThemeConfig {
  level: SpookinessLevel;
  colors: {
    background: string;
    foreground: string;
    primary: string;
    secondary: string;
    accent: string;
    muted: string;
  };
  animations: {
    breathingGlow: boolean;
    particles: boolean;
    transitionDuration: number; // in ms
  };
  typography: {
    headingFont: string;
    bodyFont: string;
  };
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, several redundancies were identified:
- Requirements 3.3 and 3.5 both test project filtering (consolidated into Property 4)
- Task CRUD persistence (1.3, 1.4, 4.1) can be tested through a single round-trip property (Property 2)
- Theme-specific visual appearance (8.2, 8.3, 8.4) cannot be tested programmatically and are excluded

The following properties provide comprehensive coverage without redundancy:

### Core Task Management Properties

**Property 1: Task creation with valid input**
*For any* non-empty task description, creating a task should result in a new task with a unique ID appearing in the task list.
**Validates: Requirements 1.1**

**Property 2: Task persistence round-trip**
*For any* task operation (create, update, delete, complete), the change should be immediately reflected in local storage, and reloading the application should restore the exact state.
**Validates: Requirements 1.3, 1.4, 4.1, 4.2**

**Property 3: Empty task rejection**
*For any* string composed entirely of whitespace characters, attempting to create a task should be rejected with a validation message, and the task list should remain unchanged.
**Validates: Requirements 1.2**

**Property 4: Task completion toggle**
*For any* task, marking it as complete should update its status to completed, and marking it as incomplete should revert the status, with both changes persisting.
**Validates: Requirements 1.5**

### Task Organization Properties

**Property 5: Tag association**
*For any* task and any non-empty tag string, adding the tag should associate it with the task, and the tag should appear in the task's tag list.
**Validates: Requirements 2.1**

**Property 6: Due date storage**
*For any* task and any valid date, setting the due date should store the date correctly, and retrieving the task should return the same date.
**Validates: Requirements 2.2**

**Property 7: Urgent task highlighting**
*For any* task with a due date within 24 hours of the current time, the task should be marked as urgent, while tasks with due dates beyond 24 hours should not be marked as urgent.
**Validates: Requirements 2.3**

**Property 8: Tag filtering correctness**
*For any* task list and any tag, filtering by that tag should return only tasks that contain the tag in their tag list, and all returned tasks should contain the tag.
**Validates: Requirements 2.4**

**Property 9: Due date sorting correctness**
*For any* task list with due dates, sorting by due date should order tasks chronologically, with overdue tasks (due date < current time) appearing before future tasks, and tasks without due dates appearing last.
**Validates: Requirements 2.5**

### Project Management Properties

**Property 10: Project creation**
*For any* non-empty project name, creating a project should result in a new project with a unique ID that can be used for task assignment.
**Validates: Requirements 3.1**

**Property 11: Task-project association**
*For any* task and any existing project, assigning the task to the project should associate them, and the task should display the project name.
**Validates: Requirements 3.2**

**Property 12: Project filtering correctness**
*For any* task list and any project, filtering by that project should return only tasks assigned to that project, and all returned tasks should have the project ID.
**Validates: Requirements 3.3, 3.5**

**Property 13: Project deletion preserves tasks**
*For any* project with assigned tasks, deleting the project should unassign all tasks from the project (setting projectId to undefined) but preserve all tasks in the task list.
**Validates: Requirements 3.4**

### Data Persistence Properties

**Property 14: Storage clear operation**
*For any* application state with tasks and projects, clearing all data should remove all tasks and projects from local storage, and reloading should result in an empty state.
**Validates: Requirements 4.5**

### CSV Import Properties

**Property 15: Valid CSV import**
*For any* CSV file with valid task data (description, optional due date, tags, project), parsing and importing should create tasks matching the CSV rows, with the count of created tasks equal to the number of valid rows.
**Validates: Requirements 5.1, 5.3, 5.4**

**Property 16: Invalid CSV row handling**
*For any* CSV file containing a mix of valid and invalid rows, importing should create tasks only for valid rows, skip invalid rows, and report the count of failed imports correctly.
**Validates: Requirements 5.2**

### AI Focus Coach Properties

**Property 17: Micro-plan structure**
*For any* task list with at least 3 incomplete tasks, generating a micro-plan should produce exactly 3 steps, with each step referencing an existing incomplete task and having an estimated duration, such that the total duration is approximately 25 minutes (±5 minutes).
**Validates: Requirements 6.1**

**Property 18: Micro-plan explainability**
*For any* generated micro-plan, each of the 3 steps should include a non-empty explanation string describing why the task was selected.
**Validates: Requirements 6.2**

**Property 19: Confidence scoring**
*For any* generated micro-plan, each step should have a confidence value between 0.0 and 1.0 (inclusive), and the overall plan should have a confidence value in the same range.
**Validates: Requirements 6.3**

**Property 20: Plan regeneration produces different results**
*For any* task list, generating a micro-plan, rejecting it, and regenerating should produce a different plan (different task selection or different order) at least 80% of the time.
**Validates: Requirements 6.4**

### Timer Properties

**Property 21: Timer countdown accuracy**
*For any* running timer, the displayed time should decrease by 1 second for each elapsed second, and the timer should reach zero after the specified duration.
**Validates: Requirements 7.2**

**Property 22: Timer pause and resume**
*For any* running timer, pausing should stop the countdown, and resuming should continue from the paused time, with the total elapsed time equal to the sum of all running periods.
**Validates: Requirements 7.3**

### Theme System Properties

**Property 23: Theme application**
*For any* spookiness level (Minimal, Twilight, Haunted), selecting that level should immediately apply the corresponding theme configuration to the UI.
**Validates: Requirements 8.1**

**Property 24: Theme persistence round-trip**
*For any* spookiness level, setting the level should persist it to local storage, and reloading the application should restore the same spookiness level.
**Validates: Requirements 8.5**

### Keyboard Navigation Properties

**Property 25: Tab navigation order**
*For any* page state, pressing Tab should move focus to the next interactive element in DOM order, and repeatedly pressing Tab should cycle through all interactive elements.
**Validates: Requirements 9.1**

**Property 26: Reverse tab navigation**
*For any* page state, pressing Shift+Tab should move focus to the previous interactive element in reverse DOM order.
**Validates: Requirements 9.2**

**Property 27: Enter key activation**
*For any* focused button element, pressing Enter should trigger the button's action, equivalent to clicking the button.
**Validates: Requirements 9.3**

**Property 28: Modal escape key**
*For any* open modal dialog, pressing Escape should close the modal and return focus to the element that triggered the modal.
**Validates: Requirements 9.4**

**Property 29: Focus indicator visibility**
*For any* interactive element that receives focus, a visible focus indicator should be present with sufficient contrast (minimum 3:1 against adjacent colors).
**Validates: Requirements 9.5**

### Screen Reader Properties

**Property 30: Task card announcements**
*For any* task card, the accessible name should include the task description, completion status, due date (if present), tags (if present), and project name (if assigned).
**Validates: Requirements 10.1**

**Property 31: Timer live region updates**
*For any* running focus session timer, the ARIA live region should announce time remaining at appropriate intervals (every 5 minutes, then every minute in the last 5 minutes).
**Validates: Requirements 10.2**

**Property 32: Form control labels**
*For any* form control (input, textarea, select), the control should have an associated label element or aria-label attribute with a descriptive name.
**Validates: Requirements 10.3**

**Property 33: Semantic HTML and ARIA roles**
*For any* component, the rendered HTML should use semantic elements (button, nav, main, etc.) or appropriate ARIA roles (role="button", role="navigation", etc.).
**Validates: Requirements 10.4**

**Property 34: Dynamic content announcements**
*For any* dynamic content change (task added, task completed, error message), the change should be announced through an ARIA live region with appropriate politeness level (polite for non-urgent, assertive for errors).
**Validates: Requirements 10.5**

### Color Contrast Properties

**Property 35: Normal text contrast**
*For any* text content with font size less than 18px (or less than 14px bold), the contrast ratio between text and background should be at least 4.5:1.
**Validates: Requirements 11.1**

**Property 36: Large text contrast**
*For any* text content with font size 18px or larger (or 14px bold or larger), the contrast ratio between text and background should be at least 3:1.
**Validates: Requirements 11.2**

**Property 37: Non-color information indicators**
*For any* information conveyed through color (urgent tasks, completed tasks, error states), additional non-color indicators (icons, text labels, patterns) should also be present.
**Validates: Requirements 11.3**

**Property 38: Theme accessibility compliance**
*For any* spookiness level theme, all text and interactive elements should meet WCAG AA contrast requirements (4.5:1 for normal text, 3:1 for large text).
**Validates: Requirements 11.5**

### Onboarding Properties

**Property 39: Tour completion state**
*For any* user who completes the onboarding tour, the completion state should be persisted, and subsequent visits should not display the tour automatically.
**Validates: Requirements 12.3**

### Responsive Design Properties

**Property 40: Touch target sizing**
*For any* interactive element (button, link, input), the element should have a minimum touch target size of 44x44 pixels on all screen sizes.
**Validates: Requirements 13.5**

## Error Handling

### Error Categories

#### 1. Storage Errors
- **Quota Exceeded:** When local storage is full
  - Display user-friendly error message
  - Prevent further writes
  - Suggest clearing old data or exporting tasks
  - Maintain in-memory state to prevent data loss

- **Storage Unavailable:** When local storage is disabled or inaccessible
  - Display warning on app load
  - Continue functioning with in-memory state only
  - Warn user that data won't persist

- **Corrupted Data:** When stored data fails to parse
  - Attempt to recover partial data
  - Log error details for debugging
  - Offer to reset to clean state

#### 2. CSV Import Errors
- **Invalid File Format:** Non-CSV file uploaded
  - Display clear error message
  - Suggest correct format with example

- **Malformed CSV:** CSV with syntax errors
  - Parse what's possible
  - Report specific line numbers with errors
  - Allow user to fix and retry

- **Invalid Data:** CSV with invalid values (empty descriptions, invalid dates)
  - Skip invalid rows
  - Report count and details of skipped rows
  - Import valid rows successfully

#### 3. AI Focus Coach Errors
- **Insufficient Tasks:** Fewer than 3 incomplete tasks available
  - Display friendly message explaining minimum requirement
  - Suggest creating more tasks
  - Offer to start a free-form focus session

- **Plan Generation Failure:** Kiro hook fails or times out
  - Display error message with retry option
  - Fall back to simple task selection algorithm
  - Log error for debugging

#### 4. Timer Errors
- **Browser Tab Inactive:** Timer may drift when tab is backgrounded
  - Use Web Workers or requestAnimationFrame for accuracy
  - Recalculate elapsed time on tab focus
  - Display warning if significant drift detected

#### 5. Accessibility Errors
- **Missing ARIA Labels:** Component rendered without proper labels
  - Log warning in development mode
  - Provide fallback generic labels
  - Ensure keyboard navigation still works

### Error Handling Patterns

```typescript
// Storage error handling
try {
  localStorage.setItem(key, value);
} catch (error) {
  if (error.name === 'QuotaExceededError') {
    showStorageFullError();
    maintainInMemoryState();
  } else {
    showGenericStorageError();
    logError(error);
  }
}

// CSV import error handling
const result = await parseCSV(file);
if (result.errors.length > 0) {
  showImportErrors(result.errors);
}
if (result.validRows.length > 0) {
  importTasks(result.validRows);
  showImportSuccess(result.validRows.length);
}

// AI coach error handling
try {
  const plan = await generateMicroPlan(tasks);
  displayPlan(plan);
} catch (error) {
  if (error.code === 'INSUFFICIENT_TASKS') {
    showInsufficientTasksMessage();
  } else {
    showPlanGenerationError();
    offerFallbackPlan(tasks);
  }
}
```

## Testing Strategy

### Unit Testing

Unit tests will verify specific examples, edge cases, and component behavior using Vitest and React Testing Library.

**Test Coverage:**
- Data model validation (Task, Project, FocusSession)
- Business logic functions (TaskManager, ProjectManager, FocusCoachService)
- Storage utilities (save, load, error handling)
- CSV parsing and validation
- Theme configuration and application
- Timer logic (countdown, pause, resume)
- Component rendering and user interactions

**Example Unit Tests:**
- Task creation with empty description should fail validation
- Deleting a project should unassign tasks but preserve them
- CSV with invalid date format should skip that row
- Timer should pause at correct time and resume correctly
- Theme toggle should apply new theme immediately

### Property-Based Testing

Property-based tests will verify universal properties using the fast-check library, configured to run a minimum of 100 iterations per property.

**Property Test Configuration:**
```typescript
import fc from 'fast-check';

// Configure for minimum 100 iterations
const testConfig = { numRuns: 100 };

// Example property test
it('Property 1: Task creation with valid input', () => {
  fc.assert(
    fc.property(
      fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
      (description) => {
        const taskManager = new TaskManager();
        const initialCount = taskManager.getTasks().length;
        const task = taskManager.createTask(description);
        
        expect(task.id).toBeDefined();
        expect(task.description).toBe(description);
        expect(taskManager.getTasks()).toContain(task);
        expect(taskManager.getTasks().length).toBe(initialCount + 1);
      }
    ),
    testConfig
  );
});
```

**Property Test Tagging:**
Each property-based test must include a comment explicitly referencing the correctness property:

```typescript
/**
 * Feature: nocturne-task-manager, Property 1: Task creation with valid input
 * Validates: Requirements 1.1
 */
it('Property 1: Task creation with valid input', () => { ... });
```

**Generators:**
Custom generators will be created for domain objects:
- `taskArbitrary`: Generates valid Task objects
- `projectArbitrary`: Generates valid Project objects
- `csvRowArbitrary`: Generates valid CSV rows
- `dateArbitrary`: Generates valid dates (past, present, future)
- `tagArbitrary`: Generates valid tag strings
- `spookinessLevelArbitrary`: Generates theme levels

### End-to-End Testing

E2E tests will verify critical user flows using Playwright.

**Test Scenarios:**
- Complete task management flow (create, edit, complete, delete)
- Focus session flow (start, view plan, complete timer)
- CSV import flow (upload, preview, import)
- Theme toggle flow (change level, verify persistence)
- Keyboard navigation flow (tab through app, activate with Enter)
- Onboarding tour flow (complete tour, verify not shown again)

### Accessibility Testing

Accessibility tests will ensure WCAG 2.1 Level AA compliance.

**Automated Testing:**
- Axe-core integration in unit tests
- Pa11y CI for full page scans
- Color contrast validation for all themes

**Manual Testing:**
- Keyboard-only navigation (no mouse)
- Screen reader testing (NVDA on Windows, VoiceOver on macOS)
- Color-blind simulation (Deuteranopia, Protanopia, Tritanopia)
- Browser zoom testing (up to 200%)

**Accessibility Test Checklist:**
- [ ] All interactive elements keyboard accessible
- [ ] All images have alt text
- [ ] All form controls have labels
- [ ] Color contrast meets WCAG AA (4.5:1 for normal text)
- [ ] Focus indicators visible on all interactive elements
- [ ] ARIA roles and labels present where needed
- [ ] Live regions announce dynamic content
- [ ] No keyboard traps
- [ ] Skip links present for main content
- [ ] Semantic HTML used throughout

### Performance Testing

Performance tests will verify responsiveness and scalability.

**Metrics:**
- Initial load time (target: < 2 seconds)
- Task operation time (target: < 100ms)
- Large dataset performance (1000 tasks)
- Animation frame rate (target: 60fps)
- Bundle size (target: < 500KB gzipped)

**Tools:**
- Lighthouse for performance audits
- Chrome DevTools Performance profiler
- Bundle analyzer for size optimization

## Implementation Notes

### Kiro Integration

#### Specs
This design document, along with requirements.md and tasks.md, forms the complete specification for Nocturne. All implementation should reference these documents.

#### Vibe Coding
Use Kiro's vibe coding feature to scaffold UI components with prompts like:
- "Create a minimal, elegant, gothic task card component"
- "Design a breathing glow animation for the Haunted theme"
- "Build an accessible modal dialog with focus trap"

#### Agent Hooks
The Focus Coach will be implemented as a Kiro agent hook:
- Hook analyzes task metadata (due dates, tags, creation time)
- Generates 3-step micro-plan with explanations
- Provides confidence scores for each suggestion
- Adapts based on user feedback (rejections)

#### Steering Documents
Create steering docs in `.kiro/steering/`:
- `coding-standards.md`: TypeScript, React, Next.js conventions
- `accessibility-guidelines.md`: WCAG AA compliance rules
- `spooky-design-principles.md`: Gothic aesthetic guidelines

### Technology Choices

#### Why Next.js 14?
- App Router for modern routing and layouts
- Server Components for optimal performance
- Built-in TypeScript support
- Excellent developer experience

#### Why Tailwind CSS?
- Utility-first approach for rapid development
- Easy to create custom design tokens
- Excellent dark mode support
- Small bundle size with purging

#### Why fast-check?
- Mature property-based testing library for JavaScript
- Excellent TypeScript support
- Rich set of built-in generators
- Good documentation and community

#### Why Local Storage?
- Simple API for client-side persistence
- No backend required (faster MVP)
- Privacy-first (data never leaves user's device)
- Sufficient for MVP scope (5-10MB typical limit)

### Design Decisions

#### Single Active Session
Only one focus session can be active at a time to maintain focus and simplify state management.

#### 25-Minute Sessions
Based on Pomodoro Technique research showing optimal focus duration.

#### 3-Step Micro-Plans
Balances structure with flexibility; enough to provide direction without overwhelming.

#### Toggleable Spookiness
Respects user preferences and accessibility needs; some users may find heavy animations distracting.

#### Local-First Architecture
Prioritizes privacy, offline functionality, and simplicity over collaboration features.

### Future Enhancements

Post-MVP features to consider:
- Calendar integration (Google Calendar, Microsoft Outlook)
- Smart reminders with push notifications
- Progress visualization (charts, streaks, statistics)
- Team collaboration (shared projects, task assignment)
- Mobile native apps (React Native)
- Browser extensions (quick task capture)
- Recurring tasks
- Task dependencies and subtasks
- Time tracking and analytics
- Export to other formats (JSON, Markdown, iCal)
- Custom theme creation
- Sound effects and ambient music
- Gamification (achievements, levels, rewards)

## Conclusion

This design provides a comprehensive blueprint for implementing Nocturne, a spooky-themed task manager with AI-powered focus sessions. The architecture emphasizes accessibility, testability, and user experience while showcasing Kiro's spec-driven development workflow.

The 40 correctness properties ensure comprehensive test coverage, and the clear separation of concerns enables maintainable, extensible code. The toggleable spooky aesthetic differentiates Nocturne from generic task managers while maintaining professional functionality.

Implementation should proceed incrementally, validating each component against the requirements and correctness properties before moving forward.
