/**
 * TaskManager - Handles all task-related operations
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 3.2
 */

import { Task, TaskFilter, SortOption } from './types';
import { StorageManager } from './storage';
import { generateId, isNonEmptyString, validateTask } from './utils';
import { ERROR_MESSAGES } from './constants';

export class TaskManager {
  private tasks: Task[] = [];
  private storage: StorageManager;

  constructor(storage: StorageManager) {
    this.storage = storage;
    this.loadTasks();
  }

  /**
   * Load tasks from storage
   */
  private loadTasks(): void {
    try {
      this.tasks = this.storage.loadTasks();
    } catch (error) {
      console.error('Failed to load tasks:', error);
      this.tasks = [];
    }
  }

  /**
   * Save tasks to storage
   */
  private saveTasks(): void {
    try {
      this.storage.saveTasks(this.tasks);
    } catch (error) {
      console.error('Failed to save tasks:', error);
      throw error;
    }
  }

  /**
   * Create a new task
   * Requirement: 1.1 - Create task with unique identifier
   * Requirement: 1.2 - Validate non-empty description
   */
  createTask(description: string, metadata?: Partial<Omit<Task, 'id' | 'description' | 'completed' | 'createdAt' | 'updatedAt'>>): Task {
    // Validate description
    if (!isNonEmptyString(description)) {
      throw new Error(ERROR_MESSAGES.EMPTY_TASK_DESCRIPTION);
    }

    const now = new Date();
    const task: Task = {
      id: generateId(),
      description: description.trim(),
      completed: false,
      createdAt: now,
      updatedAt: now,
      tags: metadata?.tags || [],
      dueDate: metadata?.dueDate,
      projectId: metadata?.projectId,
    };

    // Validate task invariants
    const errors = validateTask(task);
    if (errors.length > 0) {
      throw new Error(`Invalid task: ${errors.join(', ')}`);
    }

    this.tasks.push(task);
    this.saveTasks();

    return task;
  }

  /**
   * Update an existing task
   * Requirement: 1.3 - Update task properties and persist immediately
   */
  updateTask(taskId: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Task {
    const taskIndex = this.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      throw new Error(`Task not found: ${taskId}`);
    }

    // Validate description if being updated
    if (updates.description !== undefined && !isNonEmptyString(updates.description)) {
      throw new Error(ERROR_MESSAGES.EMPTY_TASK_DESCRIPTION);
    }

    const updatedTask: Task = {
      ...this.tasks[taskIndex],
      ...updates,
      description: updates.description?.trim() || this.tasks[taskIndex].description,
      updatedAt: new Date(),
    };

    // Validate task invariants
    const errors = validateTask(updatedTask);
    if (errors.length > 0) {
      throw new Error(`Invalid task: ${errors.join(', ')}`);
    }

    this.tasks[taskIndex] = updatedTask;
    this.saveTasks();

    return updatedTask;
  }

  /**
   * Delete a task
   * Requirement: 1.4 - Remove task from list and update persistence
   */
  deleteTask(taskId: string): void {
    const taskIndex = this.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      throw new Error(`Task not found: ${taskId}`);
    }

    this.tasks.splice(taskIndex, 1);
    this.saveTasks();
  }

  /**
   * Mark a task as complete or incomplete
   * Requirement: 1.5 - Update task status and persist
   */
  completeTask(taskId: string, completed: boolean = true): Task {
    return this.updateTask(taskId, { completed });
  }

  /**
   * Get all tasks with optional filtering
   */
  getTasks(filter?: TaskFilter): Task[] {
    let filteredTasks = [...this.tasks];

    if (filter) {
      // Filter by completion status
      if (filter.completed !== undefined) {
        filteredTasks = filteredTasks.filter(t => t.completed === filter.completed);
      }

      // Filter by tags (task must have at least one of the specified tags)
      if (filter.tags && filter.tags.length > 0) {
        filteredTasks = filteredTasks.filter(t =>
          filter.tags!.some(tag => t.tags.includes(tag))
        );
      }

      // Filter by project
      if (filter.projectId) {
        filteredTasks = filteredTasks.filter(t => t.projectId === filter.projectId);
      }

      // Filter by due date range
      if (filter.dueDateRange) {
        filteredTasks = filteredTasks.filter(t => {
          if (!t.dueDate) return false;
          const dueDate = new Date(t.dueDate);
          return dueDate >= filter.dueDateRange!.start && dueDate <= filter.dueDateRange!.end;
        });
      }

      // Filter by search query
      if (filter.searchQuery) {
        const query = filter.searchQuery.toLowerCase();
        filteredTasks = filteredTasks.filter(t =>
          t.description.toLowerCase().includes(query)
        );
      }
    }

    return filteredTasks;
  }

  /**
   * Get a task by ID
   */
  getTaskById(taskId: string): Task | undefined {
    return this.tasks.find(t => t.id === taskId);
  }

  /**
   * Add a tag to a task
   * Requirement: 2.1 - Associate tag with task
   */
  addTag(taskId: string, tag: string): Task {
    const task = this.getTaskById(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    // Don't add duplicate tags
    if (task.tags.includes(tag)) {
      return task;
    }

    return this.updateTask(taskId, {
      tags: [...task.tags, tag],
    });
  }

  /**
   * Remove a tag from a task
   * Requirement: 2.1 - Manage task tags
   */
  removeTag(taskId: string, tag: string): Task {
    const task = this.getTaskById(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    return this.updateTask(taskId, {
      tags: task.tags.filter(t => t !== tag),
    });
  }

  /**
   * Set due date for a task
   * Requirement: 2.2 - Store due date
   */
  setDueDate(taskId: string, dueDate: Date | undefined): Task {
    return this.updateTask(taskId, { dueDate });
  }

  /**
   * Assign a task to a project
   * Requirement: 3.2 - Associate task with project
   */
  assignToProject(taskId: string, projectId: string | undefined): Task {
    return this.updateTask(taskId, { projectId });
  }

  /**
   * Get all unique tags from all tasks
   */
  getAllTags(): string[] {
    const tagSet = new Set<string>();
    this.tasks.forEach(task => {
      task.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }

  /**
   * Get task count by status
   */
  getTaskCounts(): { total: number; completed: number; incomplete: number } {
    const completed = this.tasks.filter(t => t.completed).length;
    return {
      total: this.tasks.length,
      completed,
      incomplete: this.tasks.length - completed,
    };
  }

  /**
   * Sort tasks by specified option
   */
  sortTasks(tasks: Task[], sortBy: SortOption): Task[] {
    const sorted = [...tasks];

    switch (sortBy) {
      case 'dueDate':
        // Sort by due date: overdue first, then by date, then no due date last
        sorted.sort((a, b) => {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;

          const now = new Date();
          const aOverdue = a.dueDate < now;
          const bOverdue = b.dueDate < now;

          // Overdue tasks first
          if (aOverdue && !bOverdue) return -1;
          if (!aOverdue && bOverdue) return 1;

          // Then by date
          return a.dueDate.getTime() - b.dueDate.getTime();
        });
        break;

      case 'createdAt':
        sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;

      case 'updatedAt':
        sorted.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
        break;
    }

    return sorted;
  }

  /**
   * Get incomplete tasks (for focus session planning)
   */
  getIncompleteTasks(): Task[] {
    return this.getTasks({ completed: false });
  }

  /**
   * Bulk import tasks
   */
  bulkImportTasks(tasks: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>[]): Task[] {
    const importedTasks: Task[] = [];

    for (const taskData of tasks) {
      try {
        const task = this.createTask(taskData.description, {
          dueDate: taskData.dueDate,
          tags: taskData.tags,
          projectId: taskData.projectId,
        });
        
        // Update completion status if needed
        if (taskData.completed) {
          this.completeTask(task.id, true);
        }
        
        importedTasks.push(task);
      } catch (error) {
        console.error('Failed to import task:', taskData, error);
      }
    }

    return importedTasks;
  }
}
