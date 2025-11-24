/**
 * ProjectManager - Handles project-related operations
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */

import { Project, Task } from './types';
import { StorageManager } from './storage';
import { TaskManager } from './task-manager';
import { generateId, isNonEmptyString, validateProject, isValidHexColor } from './utils';
import { ERROR_MESSAGES, PROJECT_COLORS } from './constants';

export class ProjectManager {
  private projects: Project[] = [];
  private storage: StorageManager;
  private taskManager: TaskManager;

  constructor(storage: StorageManager, taskManager: TaskManager) {
    this.storage = storage;
    this.taskManager = taskManager;
    this.loadProjects();
  }

  /**
   * Load projects from storage
   */
  private loadProjects(): void {
    try {
      this.projects = this.storage.loadProjects();
    } catch (error) {
      console.error('Failed to load projects:', error);
      this.projects = [];
    }
  }

  /**
   * Save projects to storage
   */
  private saveProjects(): void {
    try {
      this.storage.saveProjects(this.projects);
    } catch (error) {
      console.error('Failed to save projects:', error);
      throw error;
    }
  }

  /**
   * Create a new project
   * Requirement: 3.1 - Create project with unique identifier
   */
  createProject(name: string, color?: string): Project {
    // Validate name
    if (!isNonEmptyString(name)) {
      throw new Error(ERROR_MESSAGES.INVALID_PROJECT_NAME);
    }

    // Use provided color or pick a random one
    const projectColor = color || PROJECT_COLORS[Math.floor(Math.random() * PROJECT_COLORS.length)];

    // Validate color
    if (!isValidHexColor(projectColor)) {
      throw new Error(ERROR_MESSAGES.INVALID_HEX_COLOR);
    }

    const project: Project = {
      id: generateId(),
      name: name.trim(),
      color: projectColor,
      createdAt: new Date(),
    };

    // Validate project invariants
    const errors = validateProject(project);
    if (errors.length > 0) {
      throw new Error(`Invalid project: ${errors.join(', ')}`);
    }

    this.projects.push(project);
    this.saveProjects();

    return project;
  }

  /**
   * Update an existing project
   */
  updateProject(projectId: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>): Project {
    const projectIndex = this.projects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) {
      throw new Error(`Project not found: ${projectId}`);
    }

    // Validate name if being updated
    if (updates.name !== undefined && !isNonEmptyString(updates.name)) {
      throw new Error(ERROR_MESSAGES.INVALID_PROJECT_NAME);
    }

    // Validate color if being updated
    if (updates.color !== undefined && !isValidHexColor(updates.color)) {
      throw new Error(ERROR_MESSAGES.INVALID_HEX_COLOR);
    }

    const updatedProject: Project = {
      ...this.projects[projectIndex],
      ...updates,
      name: updates.name?.trim() || this.projects[projectIndex].name,
    };

    // Validate project invariants
    const errors = validateProject(updatedProject);
    if (errors.length > 0) {
      throw new Error(`Invalid project: ${errors.join(', ')}`);
    }

    this.projects[projectIndex] = updatedProject;
    this.saveProjects();

    return updatedProject;
  }

  /**
   * Delete a project
   * Requirement: 3.4 - Unassign all tasks but preserve them
   */
  deleteProject(projectId: string): void {
    const projectIndex = this.projects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) {
      throw new Error(`Project not found: ${projectId}`);
    }

    // Unassign all tasks from this project
    const tasks = this.getTasksByProject(projectId);
    tasks.forEach(task => {
      this.taskManager.assignToProject(task.id, undefined);
    });

    // Remove project
    this.projects.splice(projectIndex, 1);
    this.saveProjects();
  }

  /**
   * Get all projects
   */
  getProjects(): Project[] {
    return [...this.projects];
  }

  /**
   * Get a project by ID
   */
  getProjectById(projectId: string): Project | undefined {
    return this.projects.find(p => p.id === projectId);
  }

  /**
   * Get all tasks assigned to a project
   * Requirement: 3.3, 3.5 - Display tasks by project
   */
  getTasksByProject(projectId: string): Task[] {
    return this.taskManager.getTasks({ projectId });
  }

  /**
   * Get project statistics
   */
  getProjectStats(projectId: string): {
    totalTasks: number;
    completedTasks: number;
    incompleteTasks: number;
  } {
    const tasks = this.getTasksByProject(projectId);
    const completedTasks = tasks.filter(t => t.completed).length;

    return {
      totalTasks: tasks.length,
      completedTasks,
      incompleteTasks: tasks.length - completedTasks,
    };
  }

  /**
   * Get all projects with task counts
   */
  getProjectsWithCounts(): Array<Project & { taskCount: number }> {
    return this.projects.map(project => ({
      ...project,
      taskCount: this.getTasksByProject(project.id).length,
    }));
  }
}
