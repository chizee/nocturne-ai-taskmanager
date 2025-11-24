/**
 * Property-based tests for StorageManager
 * Using fast-check for property-based testing with 100+ iterations
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { StorageManager } from '../storage';
import { Task, Project, UserPreferences } from '../types';

describe('StorageManager Property Tests', () => {
  let storage: StorageManager;
  let originalLocalStorage: Storage;

  beforeEach(() => {
    // Create a mock localStorage
    const store: Record<string, string> = {};
    originalLocalStorage = global.localStorage;
    
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
  });

  afterEach(() => {
    global.localStorage = originalLocalStorage;
  });

  /**
   * Generators for property-based testing
   */

  // Generate a valid Task
  const taskArbitrary = fc.record({
    id: fc.uuid(),
    description: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
    completed: fc.boolean(),
    createdAt: fc.date(),
    updatedAt: fc.date(),
    dueDate: fc.option(fc.date(), { nil: undefined }),
    tags: fc.uniqueArray(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 10 }),
    projectId: fc.option(fc.uuid(), { nil: undefined }),
  }).map(task => ({
    ...task,
    // Ensure updatedAt >= createdAt
    updatedAt: new Date(Math.max(task.createdAt.getTime(), task.updatedAt.getTime())),
  })) as fc.Arbitrary<Task>;

  // Generate a valid Project
  const projectArbitrary = fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
    color: fc.hexaString({ minLength: 6, maxLength: 6 }).map(hex => `#${hex.toUpperCase()}`),
    createdAt: fc.date(),
  }) as fc.Arbitrary<Project>;

  // Generate UserPreferences
  const preferencesArbitrary = fc.record({
    spookinessLevel: fc.constantFrom('minimal', 'twilight', 'haunted'),
    hasCompletedOnboarding: fc.boolean(),
    keyboardShortcutsEnabled: fc.boolean(),
    soundEffectsEnabled: fc.boolean(),
  }) as fc.Arbitrary<UserPreferences>;

  /**
   * Feature: nocturne-task-manager, Property 2: Task persistence round-trip
   * Validates: Requirements 1.3, 1.4, 4.1, 4.2
   * 
   * For any task operation (create, update, delete, complete), the change should be 
   * immediately reflected in local storage, and reloading the application should 
   * restore the exact state.
   */
  describe('Property 2: Task persistence round-trip', () => {
    it('should persist and restore tasks correctly', () => {
      fc.assert(
        fc.property(
          fc.array(taskArbitrary, { minLength: 0, maxLength: 50 }),
          (tasks) => {
            // Save tasks
            storage.saveTasks(tasks);

            // Load tasks
            const loadedTasks = storage.loadTasks();

            // Verify count matches
            expect(loadedTasks).toHaveLength(tasks.length);

            // Verify each task matches (comparing properties)
            tasks.forEach((originalTask, index) => {
              const loadedTask = loadedTasks[index];
              
              expect(loadedTask.id).toBe(originalTask.id);
              expect(loadedTask.description).toBe(originalTask.description);
              expect(loadedTask.completed).toBe(originalTask.completed);
              expect(loadedTask.createdAt.getTime()).toBe(originalTask.createdAt.getTime());
              expect(loadedTask.updatedAt.getTime()).toBe(originalTask.updatedAt.getTime());
              
              if (originalTask.dueDate) {
                expect(loadedTask.dueDate?.getTime()).toBe(originalTask.dueDate.getTime());
              } else {
                expect(loadedTask.dueDate).toBeUndefined();
              }
              
              expect(loadedTask.tags).toEqual(originalTask.tags);
              expect(loadedTask.projectId).toBe(originalTask.projectId);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle task updates correctly', () => {
      fc.assert(
        fc.property(
          fc.array(taskArbitrary, { minLength: 1, maxLength: 20 }),
          fc.nat(),
          (tasks, updateIndex) => {
            // Save initial tasks
            storage.saveTasks(tasks);

            // Update a task
            const indexToUpdate = updateIndex % tasks.length;
            const updatedTasks = [...tasks];
            updatedTasks[indexToUpdate] = {
              ...updatedTasks[indexToUpdate],
              description: 'Updated description',
              completed: !updatedTasks[indexToUpdate].completed,
              updatedAt: new Date(),
            };

            // Save updated tasks
            storage.saveTasks(updatedTasks);

            // Load and verify
            const loadedTasks = storage.loadTasks();
            expect(loadedTasks[indexToUpdate].description).toBe('Updated description');
            expect(loadedTasks[indexToUpdate].completed).toBe(updatedTasks[indexToUpdate].completed);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle task deletion correctly', () => {
      fc.assert(
        fc.property(
          fc.array(taskArbitrary, { minLength: 2, maxLength: 20 }),
          fc.nat(),
          (tasks, deleteIndex) => {
            // Save initial tasks
            storage.saveTasks(tasks);

            // Delete a task
            const indexToDelete = deleteIndex % tasks.length;
            const remainingTasks = tasks.filter((_, index) => index !== indexToDelete);

            // Save remaining tasks
            storage.saveTasks(remainingTasks);

            // Load and verify
            const loadedTasks = storage.loadTasks();
            expect(loadedTasks).toHaveLength(tasks.length - 1);
            expect(loadedTasks).not.toContainEqual(tasks[indexToDelete]);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should persist projects correctly', () => {
      fc.assert(
        fc.property(
          fc.array(projectArbitrary, { minLength: 0, maxLength: 20 }),
          (projects) => {
            // Save projects
            storage.saveProjects(projects);

            // Load projects
            const loadedProjects = storage.loadProjects();

            // Verify count matches
            expect(loadedProjects).toHaveLength(projects.length);

            // Verify each project matches
            projects.forEach((originalProject, index) => {
              const loadedProject = loadedProjects[index];
              
              expect(loadedProject.id).toBe(originalProject.id);
              expect(loadedProject.name).toBe(originalProject.name);
              expect(loadedProject.color).toBe(originalProject.color);
              expect(loadedProject.createdAt.getTime()).toBe(originalProject.createdAt.getTime());
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should persist preferences correctly', () => {
      fc.assert(
        fc.property(
          preferencesArbitrary,
          (preferences) => {
            // Save preferences
            storage.savePreferences(preferences);

            // Load preferences
            const loadedPreferences = storage.loadPreferences();

            // Verify all properties match
            expect(loadedPreferences.spookinessLevel).toBe(preferences.spookinessLevel);
            expect(loadedPreferences.hasCompletedOnboarding).toBe(preferences.hasCompletedOnboarding);
            expect(loadedPreferences.keyboardShortcutsEnabled).toBe(preferences.keyboardShortcutsEnabled);
            expect(loadedPreferences.soundEffectsEnabled).toBe(preferences.soundEffectsEnabled);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: nocturne-task-manager, Property 14: Storage clear operation
   * Validates: Requirements 4.5
   * 
   * For any application state with tasks and projects, clearing all data should 
   * remove all tasks and projects from local storage, and reloading should result 
   * in an empty state.
   */
  describe('Property 14: Storage clear operation', () => {
    it('should clear all tasks and projects', () => {
      fc.assert(
        fc.property(
          fc.array(taskArbitrary, { minLength: 1, maxLength: 20 }),
          fc.array(projectArbitrary, { minLength: 1, maxLength: 10 }),
          (tasks, projects) => {
            // Save data
            storage.saveTasks(tasks);
            storage.saveProjects(projects);

            // Verify data exists
            expect(storage.loadTasks()).toHaveLength(tasks.length);
            expect(storage.loadProjects()).toHaveLength(projects.length);

            // Clear all data
            storage.clearAllData();

            // Verify data is cleared
            expect(storage.loadTasks()).toHaveLength(0);
            expect(storage.loadProjects()).toHaveLength(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve preferences after clearing data', () => {
      fc.assert(
        fc.property(
          fc.array(taskArbitrary, { minLength: 1, maxLength: 10 }),
          preferencesArbitrary,
          (tasks, preferences) => {
            // Save data and preferences
            storage.saveTasks(tasks);
            storage.savePreferences(preferences);

            // Clear data
            storage.clearAllData();

            // Verify tasks are cleared but preferences remain
            expect(storage.loadTasks()).toHaveLength(0);
            
            const loadedPreferences = storage.loadPreferences();
            expect(loadedPreferences.spookinessLevel).toBe(preferences.spookinessLevel);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
