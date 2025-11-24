/**
 * StorageManager - Handles data persistence to local storage
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */

import { Task, Project, UserPreferences, FocusSession, StorageStats, ErrorType, AppError } from './types';
import { STORAGE_KEYS, DEFAULTS } from './constants';

export class StorageManager {
  /**
   * Check if local storage is available
   */
  private isStorageAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Save tasks to local storage
   * Requirement: 4.1 - Persist changes immediately
   */
  saveTasks(tasks: Task[]): void {
    if (!this.isStorageAvailable()) {
      throw this.createError(ErrorType.STORAGE_UNAVAILABLE, 'Local storage is not available');
    }

    try {
      const serialized = JSON.stringify(tasks);
      localStorage.setItem(STORAGE_KEYS.TASKS, serialized);
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        throw this.createError(ErrorType.STORAGE_QUOTA_EXCEEDED, 'Storage quota exceeded');
      }
      throw this.createError(ErrorType.STORAGE_UNAVAILABLE, 'Failed to save tasks');
    }
  }

  /**
   * Load tasks from local storage
   * Requirement: 4.2 - Load previously saved data
   */
  loadTasks(): Task[] {
    if (!this.isStorageAvailable()) {
      return [];
    }

    try {
      const serialized = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (!serialized) {
        return [];
      }

      const tasks = JSON.parse(serialized) as Task[];
      
      // Convert date strings back to Date objects
      return tasks.map(task => ({
        ...task,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
      }));
    } catch (error) {
      console.error('Failed to load tasks:', error);
      throw this.createError(ErrorType.STORAGE_CORRUPTED, 'Failed to parse stored tasks');
    }
  }

  /**
   * Save projects to local storage
   * Requirement: 4.1 - Persist changes immediately
   */
  saveProjects(projects: Project[]): void {
    if (!this.isStorageAvailable()) {
      throw this.createError(ErrorType.STORAGE_UNAVAILABLE, 'Local storage is not available');
    }

    try {
      const serialized = JSON.stringify(projects);
      localStorage.setItem(STORAGE_KEYS.PROJECTS, serialized);
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        throw this.createError(ErrorType.STORAGE_QUOTA_EXCEEDED, 'Storage quota exceeded');
      }
      throw this.createError(ErrorType.STORAGE_UNAVAILABLE, 'Failed to save projects');
    }
  }

  /**
   * Load projects from local storage
   * Requirement: 4.2 - Load previously saved data
   */
  loadProjects(): Project[] {
    if (!this.isStorageAvailable()) {
      return [];
    }

    try {
      const serialized = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (!serialized) {
        return [];
      }

      const projects = JSON.parse(serialized) as Project[];
      
      // Convert date strings back to Date objects
      return projects.map(project => ({
        ...project,
        createdAt: new Date(project.createdAt),
      }));
    } catch (error) {
      console.error('Failed to load projects:', error);
      throw this.createError(ErrorType.STORAGE_CORRUPTED, 'Failed to parse stored projects');
    }
  }

  /**
   * Save user preferences to local storage
   * Requirement: 4.1 - Persist changes immediately
   */
  savePreferences(preferences: UserPreferences): void {
    if (!this.isStorageAvailable()) {
      throw this.createError(ErrorType.STORAGE_UNAVAILABLE, 'Local storage is not available');
    }

    try {
      const serialized = JSON.stringify(preferences);
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, serialized);
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        throw this.createError(ErrorType.STORAGE_QUOTA_EXCEEDED, 'Storage quota exceeded');
      }
      throw this.createError(ErrorType.STORAGE_UNAVAILABLE, 'Failed to save preferences');
    }
  }

  /**
   * Load user preferences from local storage
   * Requirement: 4.2 - Load previously saved data
   */
  loadPreferences(): UserPreferences {
    if (!this.isStorageAvailable()) {
      return this.getDefaultPreferences();
    }

    try {
      const serialized = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      if (!serialized) {
        return this.getDefaultPreferences();
      }

      return JSON.parse(serialized) as UserPreferences;
    } catch (error) {
      console.error('Failed to load preferences:', error);
      return this.getDefaultPreferences();
    }
  }

  /**
   * Save active focus session to local storage
   */
  saveActiveSession(session: FocusSession | null): void {
    if (!this.isStorageAvailable()) {
      throw this.createError(ErrorType.STORAGE_UNAVAILABLE, 'Local storage is not available');
    }

    try {
      if (session === null) {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
      } else {
        const serialized = JSON.stringify(session);
        localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, serialized);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        throw this.createError(ErrorType.STORAGE_QUOTA_EXCEEDED, 'Storage quota exceeded');
      }
      throw this.createError(ErrorType.STORAGE_UNAVAILABLE, 'Failed to save session');
    }
  }

  /**
   * Load active focus session from local storage
   */
  loadActiveSession(): FocusSession | null {
    if (!this.isStorageAvailable()) {
      return null;
    }

    try {
      const serialized = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
      if (!serialized) {
        return null;
      }

      const session = JSON.parse(serialized) as FocusSession;
      
      // Convert date strings back to Date objects
      return {
        ...session,
        startTime: new Date(session.startTime),
        endTime: session.endTime ? new Date(session.endTime) : undefined,
        pausedAt: session.pausedAt ? new Date(session.pausedAt) : undefined,
        resumedAt: session.resumedAt ? new Date(session.resumedAt) : undefined,
        microPlan: {
          ...session.microPlan,
          generatedAt: new Date(session.microPlan.generatedAt),
        },
      };
    } catch (error) {
      console.error('Failed to load active session:', error);
      return null;
    }
  }

  /**
   * Clear all application data
   * Requirement: 4.5 - Remove all data after confirmation
   */
  clearAllData(): void {
    if (!this.isStorageAvailable()) {
      return;
    }

    try {
      localStorage.removeItem(STORAGE_KEYS.TASKS);
      localStorage.removeItem(STORAGE_KEYS.PROJECTS);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
      // Note: We don't clear preferences so theme and settings persist
    } catch (error) {
      console.error('Failed to clear data:', error);
      throw this.createError(ErrorType.STORAGE_UNAVAILABLE, 'Failed to clear data');
    }
  }

  /**
   * Get storage usage statistics
   * Requirement: 4.4 - Monitor storage usage
   */
  getStorageUsage(): StorageStats {
    if (!this.isStorageAvailable()) {
      return {
        used: 0,
        available: 0,
        percentage: 0,
      };
    }

    try {
      // Calculate approximate storage usage
      let used = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length + key.length;
        }
      }

      // Most browsers have a 5-10MB limit for localStorage
      // We'll use 5MB as a conservative estimate
      const available = 5 * 1024 * 1024; // 5MB in bytes
      const percentage = (used / available) * 100;

      return {
        used,
        available,
        percentage: Math.min(percentage, 100),
      };
    } catch (error) {
      console.error('Failed to get storage usage:', error);
      return {
        used: 0,
        available: 0,
        percentage: 0,
      };
    }
  }

  /**
   * Get default user preferences
   */
  private getDefaultPreferences(): UserPreferences {
    return {
      spookinessLevel: DEFAULTS.SPOOKINESS_LEVEL,
      hasCompletedOnboarding: false,
      keyboardShortcutsEnabled: true,
      soundEffectsEnabled: true,
    };
  }

  /**
   * Create an AppError
   */
  private createError(type: ErrorType, message: string, context?: Record<string, unknown>): AppError {
    return {
      type,
      message,
      context,
    };
  }
}

// Export singleton instance
export const storageManager = new StorageManager();
