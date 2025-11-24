/**
 * Utility script to create sample tasks for testing the Focus Coach
 * Run this in the browser console to populate tasks
 */

import { Task } from '../types';

export function createSampleTasks(): Task[] {
  const now = Date.now();
  
  const sampleTasks: Task[] = [
    {
      id: `task-${now}-1`,
      title: 'Review pull request for authentication feature',
      description: 'Check code quality, test coverage, and security implications',
      status: 'todo',
      priority: 'high',
      tags: ['code-review', 'security'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `task-${now}-2`,
      title: 'Write unit tests for payment service',
      description: 'Cover edge cases for refund processing and error handling',
      status: 'todo',
      priority: 'high',
      tags: ['testing', 'backend'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `task-${now}-3`,
      title: 'Update API documentation',
      description: 'Document new endpoints and update examples',
      status: 'todo',
      priority: 'medium',
      tags: ['documentation'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `task-${now}-4`,
      title: 'Fix responsive layout on mobile',
      description: 'Navigation menu breaks on screens smaller than 375px',
      status: 'todo',
      priority: 'medium',
      tags: ['frontend', 'bug'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `task-${now}-5`,
      title: 'Optimize database queries',
      description: 'Profile slow queries and add appropriate indexes',
      status: 'todo',
      priority: 'low',
      tags: ['performance', 'database'],
      createdAt: now,
      updatedAt: now,
    },
  ];

  return sampleTasks;
}

export function addSampleTasksToStorage(): void {
  const tasks = createSampleTasks();
  const existingData = localStorage.getItem('nocturne-tasks');
  const existingTasks = existingData ? JSON.parse(existingData) : [];
  
  const allTasks = [...existingTasks, ...tasks];
  localStorage.setItem('nocturne-tasks', JSON.stringify(allTasks));
  
  console.log(`✅ Added ${tasks.length} sample tasks to localStorage`);
  console.log('Reload the page to see the tasks');
}

// For browser console usage
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).addSampleTasks = addSampleTasksToStorage;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).createSampleTasks = createSampleTasks;
}
