/**
 * Property-based tests for ProjectManager
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { ProjectManager } from '../project-manager';
import { TaskManager } from '../task-manager';
import { StorageManager } from '../storage';

describe('ProjectManager Property Tests', () => {
  let projectManager: ProjectManager;
  let taskManager: TaskManager;
  let storage: StorageManager;

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

    storage = new StorageManager();
    taskManager = new TaskManager(storage);
    projectManager = new ProjectManager(storage, taskManager);
  });

  /**
   * Feature: nocturne-task-manager, Property 10: Project creation
   * Validates: Requirements 3.1
   */
  it('Property 10: Project creation', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        (name) => {
          const initialCount = projectManager.getProjects().length;
          const project = projectManager.createProject(name);

          expect(project.id).toBeDefined();
          expect(project.name).toBe(name.trim());
          expect(project.color).toMatch(/^#[0-9A-F]{6}$/i);
          expect(projectManager.getProjects()).toContainEqual(project);
          expect(projectManager.getProjects().length).toBe(initialCount + 1);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: nocturne-task-manager, Property 11: Task-project association
   * Validates: Requirements 3.2
   */
  it('Property 11: Task-project association', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        (projectName, taskDescription) => {
          const project = projectManager.createProject(projectName);
          const task = taskManager.createTask(taskDescription);

          taskManager.assignToProject(task.id, project.id);

          const updatedTask = taskManager.getTaskById(task.id);
          expect(updatedTask?.projectId).toBe(project.id);

          // Verify task appears in project's task list
          const projectTasks = projectManager.getTasksByProject(project.id);
          expect(projectTasks).toContainEqual(updatedTask);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: nocturne-task-manager, Property 12: Project filtering correctness
   * Validates: Requirements 3.3, 3.5
   */
  it('Property 12: Project filtering correctness', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        fc.array(fc.string({ minLength: 1 }).filter(s => s.trim().length > 0), { minLength: 2, maxLength: 5 }),
        (projectName, taskDescriptions) => {
          const project = projectManager.createProject(projectName);

          // Create tasks and assign to project
          taskDescriptions.forEach(desc => {
            const task = taskManager.createTask(desc);
            taskManager.assignToProject(task.id, project.id);
          });

          // Get tasks by project
          const projectTasks = projectManager.getTasksByProject(project.id);

          // All returned tasks should have the project ID
          expect(projectTasks.length).toBe(taskDescriptions.length);
          projectTasks.forEach(task => {
            expect(task.projectId).toBe(project.id);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: nocturne-task-manager, Property 13: Project deletion preserves tasks
   * Validates: Requirements 3.4
   */
  it('Property 13: Project deletion preserves tasks', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        fc.array(fc.string({ minLength: 1 }).filter(s => s.trim().length > 0), { minLength: 1, maxLength: 5 }),
        (projectName, taskDescriptions) => {
          const project = projectManager.createProject(projectName);
          const taskIds: string[] = [];

          // Create tasks and assign to project
          taskDescriptions.forEach(desc => {
            const task = taskManager.createTask(desc);
            taskManager.assignToProject(task.id, project.id);
            taskIds.push(task.id);
          });

          const initialTaskCount = taskManager.getTasks().length;

          // Delete project
          projectManager.deleteProject(project.id);

          // Verify project is deleted
          expect(projectManager.getProjectById(project.id)).toBeUndefined();

          // Verify tasks still exist
          expect(taskManager.getTasks().length).toBe(initialTaskCount);

          // Verify tasks are unassigned from project
          taskIds.forEach(taskId => {
            const task = taskManager.getTaskById(taskId);
            expect(task).toBeDefined();
            expect(task?.projectId).toBeUndefined();
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
