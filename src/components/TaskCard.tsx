/**
 * TaskCard component - Individual task display with inline editing
 * Requirements: 1.5, 2.1, 2.2, 2.3, 10.1
 */

'use client';

import React, { useState } from 'react';
import { Task } from '@/lib/types';
import { Tag, Button } from './ui';
import { isTaskUrgent, isTaskOverdue, formatDate } from '@/lib/utils';

export interface TaskCardProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onComplete: (taskId: string, completed: boolean) => void;
  projectName?: string;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onUpdate,
  onDelete,
  onComplete,
  projectName,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState(task.description);
  
  const isUrgent = isTaskUrgent(task);
  const isOverdue = isTaskOverdue(task);
  
  const handleSave = () => {
    if (editedDescription.trim()) {
      onUpdate({ ...task, description: editedDescription.trim() });
      setIsEditing(false);
    }
  };
  
  const handleCancel = () => {
    setEditedDescription(task.description);
    setIsEditing(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };
  
  // Accessibility: Announce task status
  const ariaLabel = `Task: ${task.description}. ${task.completed ? 'Completed' : 'Not completed'}. ${
    task.dueDate ? `Due ${formatDate(task.dueDate)}` : 'No due date'
  }. ${task.tags.length > 0 ? `Tags: ${task.tags.join(', ')}` : 'No tags'}. ${
    projectName ? `Project: ${projectName}` : 'No project'
  }`;
  
  return (
    <div
      className={`tombstone-card p-6 ${task.completed ? 'opacity-60' : ''} ${
        isUrgent && !task.completed ? 'border-yellow-500' : ''
      } ${isOverdue && !task.completed ? 'border-red-500' : ''}`}
      role="article"
      aria-label={ariaLabel}
    >
      <div className="flex items-start gap-3">
        {/* Completion checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onComplete(task.id, !task.completed);
          }}
          className="relative mt-1 flex-shrink-0 w-6 h-6 rounded border-2 border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all cursor-pointer z-10"
          style={{
            backgroundColor: task.completed ? 'var(--color-primary)' : 'transparent',
          }}
          aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
          aria-checked={task.completed}
          role="checkbox"
        >
          {task.completed && (
            <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>
        
        {/* Task content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-3 py-2 rounded bg-[var(--color-bg)] text-[var(--color-fg)] border-2 border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
                rows={2}
                autoFocus
                aria-label="Edit task description"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave}>
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => setIsEditing(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setIsEditing(true);
                }
              }}
              className="cursor-pointer hover:text-[var(--color-primary)] transition-colors"
              role="button"
              tabIndex={0}
              aria-label="Click to edit task"
            >
              <p className={`text-[var(--color-fg)] ${task.completed ? 'line-through' : ''}`}>
                {task.description}
              </p>
            </div>
          )}
          
          {/* Task metadata */}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            {/* Due date */}
            {task.dueDate && (
              <span
                className={`flex items-center gap-1 ${
                  isOverdue && !task.completed
                    ? 'text-red-500'
                    : isUrgent && !task.completed
                    ? 'text-yellow-500'
                    : 'text-[var(--color-muted)]'
                }`}
                aria-label={`Due date: ${formatDate(task.dueDate)}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {formatDate(task.dueDate)}
                {isOverdue && !task.completed && ' (Overdue)'}
                {isUrgent && !task.completed && !isOverdue && ' (Due soon)'}
              </span>
            )}
            
            {/* Project */}
            {projectName && (
              <span className="flex items-center gap-1 text-[var(--color-muted)]" aria-label={`Project: ${projectName}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  />
                </svg>
                {projectName}
              </span>
            )}
          </div>
          
          {/* Tags */}
          {task.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1" role="list" aria-label="Task tags">
              {task.tags.map((tag) => (
                <Tag key={tag} label={tag} />
              ))}
            </div>
          )}
        </div>
        
        {/* Delete button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm('Are you sure you want to delete this task?')) {
              onDelete(task.id);
            }
          }}
          className="flex-shrink-0 p-1 text-[var(--color-muted)] hover:text-red-500 hover:bg-red-500 hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-red-500 rounded transition-all cursor-pointer z-10"
          aria-label="Delete task"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

TaskCard.displayName = 'TaskCard';
