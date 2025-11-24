/**
 * Property-based tests for TaskManager
 * Using fast-check for property-based testing with 100+ iterations
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { TaskManager } from '../task-manager';
import { StorageManager } from '../storage';

describe('TaskManager Property Tests', () => {
  let taskManager: TaskManager;
  let storage: StorageManager;

  beforeEach(() => {
    // Mock localStorage
    const store: Record<string, string> = {};
    global.localStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        Object.keys(store).forEach(key => delete store[key]);
      },
      key: (index: number) => Object.keys(store)[index] || null,
      length: Object.keys(store).length,
    } as Storage;

    storage = new StorageManager();
    taskManager = new TaskManager(storage);
  });

  /**
   * Feature: nocturne-task-manager, Property 1: Task creation with valid input
   * Validates: Requirements 1.1
   */
  it('Property 1: Task creation with valid input', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
        (description) => {
          const initialCount = taskManager.getTasks().length;
          const task = taskManager.createTask(description);

          expect(task.id).toBeDefined();
          expect(task.description).toBe(description.trim());
          expect(taskManager.getTasks()).toContainEqual(task);
          expect(taskManager.getTasks().length).toBe(initialCount + 1);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: nocturne-task-manager, Property 3: Empty task rejection
   * Validates: Requirements 1.2
   */
  it('Property 3: Empty task rejection', () => {
    fc.assert(
      fc.property(
        fc.string().filter(s => s.trim().length === 0),
        (emptyDescription) => {
          const initialTasks = taskManager.getTasks();
          
          expect(() => {
            taskManager.createTask(emptyDescription);
          }).toThrow();

          // Task list should remain unchanged
          expect(taskManager.getTasks()).toEqual(initialTasks);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: nocturne-task-manager, Property 4: Task completion toggle
   * Validates: Requirements 1.5
   */
  it('Property 4: Task completion toggle', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        (description) => {
          const task = taskManager.createTask(description);
          
          // Mark as complete
          const completedTask = taskManager.completeTask(task.id, true);
          expect(completedTask.completed).toBe(true);
          
          // Mark as incomplete
          const incompletedTask = taskManager.completeTask(task.id, false);
          expect(incompletedTask.completed).toBe(false);
          
          // Both changes should persist
          const loadedTask = taskManager.getTaskById(task.id);
          expect(loadedTask?.completed).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: nocturne-task-manager, Property 5: Tag association
   * Validates: Requirements 2.1
   */
  it('Property 5: Tag association', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 1, maxLength: 20 }),
        (description, tag) => {
          const task = taskManager.createTask(description);
          
          const updatedTask = taskManager.addTag(task.id, tag);
          
          expect(updatedTask.tags).toContain(tag);
          
          // Verify persistence
          const loadedTask = taskManager.getTaskById(task.id);
          expect(loadedTask?.tags).toContain(tag);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: nocturne-task-manager, Property 6: Due date storage
   * Validates: Requirements 2.2
   */
  it('Property 6: Due date storage', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        fc.date(),
        (description, dueDate) => {
          const task = taskManager.createTask(description);
          
          const updatedTask = taskManager.setDueDate(task.id, dueDate);
          
          expect(updatedTask.dueDate?.getTime()).toBe(dueDate.getTime());
          
          // Verify persistence
          const loadedTask = taskManager.getTaskById(task.id);
          expect(loadedTask?.dueDate?.getTime()).toBe(dueDate.getTime());
        }
      ),
      { numRuns: 100 }
    );
  });
});
