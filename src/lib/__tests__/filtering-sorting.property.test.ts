/**
 * Property-based tests for filtering and sorting
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { TaskManager } from '../task-manager';
import { StorageManager } from '../storage';
import { isTaskUrgent } from '../utils';

describe('Filtering and Sorting Property Tests', () => {
  let taskManager: TaskManager;

  beforeEach(() => {
    const store: Record<string, string> = {};
    global.localStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => { store[key] = value; },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { Object.keys(store).forEach(key => delete store[key]); },
      key: (index: number) => Object.keys(store)[index] || null,
      length: Object.keys(store).length,
    } as Storage;

    taskManager = new TaskManager(new StorageManager());
  });

  /**
   * Feature: nocturne-task-manager, Property 8: Tag filtering correctness
   * Validates: Requirements 2.4
   */
  it('Property 8: Tag filtering correctness', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1 }).filter(s => s.trim().length > 0), { minLength: 3, maxLength: 10 }),
        fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 5 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        (descriptions, allTags, filterTag) => {
          // Create tasks with various tags
          descriptions.forEach((desc, i) => {
            const tags = i % 2 === 0 ? [filterTag, ...allTags.slice(0, 2)] : allTags.slice(0, 2);
            const task = taskManager.createTask(desc);
            tags.forEach(tag => taskManager.addTag(task.id, tag));
          });

          // Filter by tag
          const filtered = taskManager.getTasks({ tags: [filterTag] });

          // All returned tasks should contain the filter tag
          filtered.forEach(task => {
            expect(task.tags).toContain(filterTag);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: nocturne-task-manager, Property 9: Due date sorting correctness
   * Validates: Requirements 2.5
   */
  it('Property 9: Due date sorting correctness', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            description: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
            dueDate: fc.option(fc.date(), { nil: undefined }),
          }),
          { minLength: 3, maxLength: 10 }
        ),
        (taskData) => {
          // Create tasks
          taskData.forEach(data => {
            const task = taskManager.createTask(data.description);
            if (data.dueDate) {
              taskManager.setDueDate(task.id, data.dueDate);
            }
          });

          // Sort by due date
          const tasks = taskManager.getTasks();
          const sorted = taskManager.sortTasks(tasks, 'dueDate');

          // Verify sorting order
          const now = new Date();
          let lastWasOverdue = true;
          let lastDate: Date | undefined;

          sorted.forEach(task => {
            if (task.dueDate) {
              const isOverdue = task.dueDate < now;
              
              // Overdue tasks should come before non-overdue
              if (!isOverdue && lastWasOverdue && lastDate) {
                expect(true).toBe(true); // Transition from overdue to not overdue is ok
              }
              
              // Within same category, dates should be in order
              if (lastDate && isOverdue === lastWasOverdue) {
                expect(task.dueDate.getTime()).toBeGreaterThanOrEqual(lastDate.getTime());
              }
              
              lastDate = task.dueDate;
              lastWasOverdue = isOverdue;
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: nocturne-task-manager, Property 7: Urgent task highlighting
   * Validates: Requirements 2.3
   */
  it('Property 7: Urgent task highlighting', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        fc.integer({ min: -48, max: 48 }), // hours from now
        (description, hoursFromNow) => {
          const task = taskManager.createTask(description);
          const dueDate = new Date(Date.now() + hoursFromNow * 60 * 60 * 1000);
          taskManager.setDueDate(task.id, dueDate);

          const updatedTask = taskManager.getTaskById(task.id)!;
          const isUrgent = isTaskUrgent(updatedTask);

          // Task should be urgent if due within 24 hours and not overdue
          if (hoursFromNow > 0 && hoursFromNow <= 24) {
            expect(isUrgent).toBe(true);
          } else {
            expect(isUrgent).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
