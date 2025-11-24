/**
 * AppContext - Global state management for Nocturne
 */

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task, Project, SpookinessLevel } from '@/lib/types';
import { TaskManager } from '@/lib/task-manager';
import { ProjectManager } from '@/lib/project-manager';
import { StorageManager } from '@/lib/storage';
import { ThemeManager } from '@/lib/theme-manager';

interface AppContextType {
  tasks: Task[];
  projects: Project[];
  taskManager: TaskManager;
  projectManager: ProjectManager;
  themeManager: ThemeManager;
  currentTheme: SpookinessLevel;
  refreshTasks: () => void;
  refreshProjects: () => void;
  setTheme: (level: SpookinessLevel) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [storage] = useState(() => new StorageManager());
  const [taskManager] = useState(() => new TaskManager(storage));
  const [projectManager] = useState(() => new ProjectManager(storage, taskManager));
  const [themeManager] = useState(() => new ThemeManager(storage));
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentTheme, setCurrentTheme] = useState<SpookinessLevel>('minimal');

  const refreshTasks = () => setTasks(taskManager.getTasks());
  const refreshProjects = () => setProjects(projectManager.getProjects());
  
  const setTheme = (level: SpookinessLevel) => {
    themeManager.setSpookinessLevel(level);
    setCurrentTheme(level);
    // Apply theme class to HTML element
    if (typeof document !== 'undefined') {
      document.documentElement.className = `dark theme-${level}`;
    }
  };

  useEffect(() => {
    refreshTasks();
    refreshProjects();
    
    // Create default projects if none exist
    const existingProjects = projectManager.getProjects();
    if (existingProjects.length === 0) {
      projectManager.createProject('Personal', '#8b5cf6');
      projectManager.createProject('Work', '#6366f1');
      projectManager.createProject('Urgent', '#ef4444');
      refreshProjects();
    }
    
    const initialTheme = themeManager.getSpookinessLevel();
    setCurrentTheme(initialTheme);
    // Apply initial theme
    if (typeof document !== 'undefined') {
      document.documentElement.className = `dark theme-${initialTheme}`;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppContext.Provider value={{
      tasks,
      projects,
      taskManager,
      projectManager,
      themeManager,
      currentTheme,
      refreshTasks,
      refreshProjects,
      setTheme,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
