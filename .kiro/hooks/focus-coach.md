# Focus Coach Agent Hook

## Overview

This agent hook analyzes a user's task list and generates an intelligent 3-step micro-plan for a 25-minute focus session. The hook prioritizes tasks based on urgency, importance, and context, providing explainable recommendations with confidence scores.

## Hook Configuration

**Trigger:** User initiates a focus session  
**Input:** Task list with metadata (due dates, tags, projects, completion status)  
**Output:** 3-step micro-plan with explanations and confidence scores  
**Duration:** Should complete within 5 seconds

## Input Format

```json
{
  "tasks": [
    {
      "id": "string",
      "description": "string",
      "completed": false,
      "dueDate": "ISO 8601 date string (optional)",
      "tags": ["string"],
      "projectId": "string (optional)",
      "createdAt": "ISO 8601 date string",
      "updatedAt": "ISO 8601 date string"
    }
  ],
  "currentTime": "ISO 8601 date string",
  "previousPlans": [
    {
      "taskIds": ["string"],
      "generatedAt": "ISO 8601 date string"
    }
  ]
}
```

## Output Format

```json
{
  "microPlan": {
    "steps": [
      {
        "taskId": "string",
        "description": "string",
        "estimatedMinutes": 8,
        "explanation": "string (why this task was selected)",
        "confidence": 0.85
      },
      {
        "taskId": "string",
        "description": "string",
        "estimatedMinutes": 10,
        "explanation": "string",
        "confidence": 0.90
      },
      {
        "taskId": "string",
        "description": "string",
        "estimatedMinutes": 7,
        "explanation": "string",
        "confidence": 0.75
      }
    ],
    "generatedAt": "ISO 8601 date string",
    "confidence": 0.83,
    "reasoning": "string (overall plan rationale)"
  }
}
```

## Task Analysis Logic

### Priority Scoring

Tasks are scored based on multiple factors:

1. **Urgency (40% weight)**
   - Overdue tasks: 1.0
   - Due within 24 hours: 0.8
   - Due within 3 days: 0.6
   - Due within 7 days: 0.4
   - No due date: 0.2

2. **Recency (30% weight)**
   - Recently created tasks (< 24 hours): 0.9
   - Created within week: 0.6
   - Older tasks: 0.3

3. **Context (20% weight)**
   - Tasks with project assignment: +0.2
   - Tasks with tags: +0.1 per tag (max +0.3)

4. **Variety (10% weight)**
   - Prefer tasks from different projects
   - Avoid selecting all tasks from same context

### Selection Algorithm

1. **Filter:** Remove completed tasks
2. **Score:** Calculate priority score for each task
3. **Diversify:** Ensure variety across projects/contexts
4. **Balance:** Distribute estimated time across 25 minutes
5. **Explain:** Generate reasoning for each selection

### Time Estimation

- Short tasks (simple descriptions): 5-8 minutes
- Medium tasks (moderate complexity): 8-12 minutes
- Long tasks (complex descriptions): 12-15 minutes
- Total should sum to ~25 minutes (±5 minutes acceptable)

### Confidence Scoring

Confidence is based on:
- Data quality (0.0-1.0): How much metadata is available
- Urgency clarity (0.0-1.0): How clear the priority is
- Context completeness (0.0-1.0): Project/tag information
- Historical success (0.0-1.0): If previous plans were completed

Formula: `confidence = (data_quality * 0.4) + (urgency_clarity * 0.3) + (context_completeness * 0.2) + (historical_success * 0.1)`

## Explainability Requirements

Each step must include a clear explanation following this template:

**For urgent tasks:**
"This task is due [timeframe] and should be prioritized to avoid missing the deadline."

**For recent tasks:**
"This task was recently added and addressing it early prevents it from becoming urgent."

**For project-related tasks:**
"This task is part of the [project name] project and contributes to [project goal]."

**For variety:**
"This task provides variety in your session, switching context from [previous task type]."

## Error Handling

### Insufficient Tasks
If fewer than 3 incomplete tasks exist:
```json
{
  "error": "INSUFFICIENT_TASKS",
  "message": "At least 3 incomplete tasks are required to generate a focus session plan.",
  "availableTasks": 2
}
```

### All Tasks Overdue
If all tasks are overdue, prioritize by most recent due date and explain the triage strategy.

### No Metadata
If tasks lack due dates, tags, or projects, use creation date and description length as fallback signals.

## Regeneration Strategy

When user requests a new plan (Property 20):
1. Exclude tasks from previous plan (if possible)
2. Shuffle remaining tasks with similar scores
3. Apply slight randomization to scoring (±10%)
4. Ensure at least 80% of plans are different

## Example Interaction

### Input
```json
{
  "tasks": [
    {
      "id": "1",
      "description": "Review pull request for authentication feature",
      "completed": false,
      "dueDate": "2025-11-23T18:00:00Z",
      "tags": ["code-review", "urgent"],
      "projectId": "proj-auth",
      "createdAt": "2025-11-22T10:00:00Z"
    },
    {
      "id": "2",
      "description": "Write unit tests for user service",
      "completed": false,
      "tags": ["testing"],
      "projectId": "proj-auth",
      "createdAt": "2025-11-20T14:00:00Z"
    },
    {
      "id": "3",
      "description": "Update project documentation",
      "completed": false,
      "dueDate": "2025-11-25T17:00:00Z",
      "tags": ["documentation"],
      "createdAt": "2025-11-21T09:00:00Z"
    },
    {
      "id": "4",
      "description": "Refactor database queries",
      "completed": false,
      "tags": ["refactoring", "performance"],
      "projectId": "proj-db",
      "createdAt": "2025-11-19T11:00:00Z"
    }
  ],
  "currentTime": "2025-11-23T15:00:00Z"
}
```

### Output
```json
{
  "microPlan": {
    "steps": [
      {
        "taskId": "1",
        "description": "Review pull request for authentication feature",
        "estimatedMinutes": 10,
        "explanation": "This task is due in 3 hours and should be prioritized to avoid missing the deadline. Code reviews are critical for maintaining quality.",
        "confidence": 0.95
      },
      {
        "taskId": "4",
        "description": "Refactor database queries",
        "estimatedMinutes": 8,
        "explanation": "This task provides variety in your session, switching from code review to optimization work. It's been pending for 4 days.",
        "confidence": 0.75
      },
      {
        "taskId": "3",
        "description": "Update project documentation",
        "estimatedMinutes": 7,
        "explanation": "This task is due in 2 days and documentation work pairs well after technical tasks. It ensures project knowledge is current.",
        "confidence": 0.80
      }
    ],
    "generatedAt": "2025-11-23T15:00:00Z",
    "confidence": 0.83,
    "reasoning": "This plan balances urgent work (PR review) with important maintenance tasks (refactoring, documentation). The variety across different types of work helps maintain focus and prevents fatigue."
  }
}
```

## Testing

Property-based tests should verify:
- **Property 17:** Exactly 3 steps, total time ~25 minutes
- **Property 18:** All explanations are non-empty
- **Property 19:** All confidence scores in [0.0, 1.0]
- **Property 20:** Regeneration produces different plans 80%+ of the time

## Implementation Notes

This hook is designed to be called by the `FocusCoachService` class. The service handles:
- Preparing input data from the task list
- Calling the Kiro agent with this hook
- Parsing and validating the response
- Handling errors gracefully
- Caching plans to avoid redundant generation

The hook should be stateless and deterministic given the same input (except for regeneration randomization).
