/**
 * TaskList component - Display and manage tasks
 * Requirements: 2.4, 2.5, 3.3, 9.1, 10.5
 */

'use client';

import React from 'react';
import { Task, Project } from '@/lib/types';
import { TaskCard } from './TaskCard';
import { InteractiveGhost } from './InteractiveGhost';

export interface TaskListProps {
  tasks: Task[];
  projects: Project[];
  onUpdate: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onComplete: (taskId: string, completed: boolean) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  projects,
  onUpdate,
  onDelete,
  onComplete,
}) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 relative">
        <div className="flex justify-center mb-8">
          <InteractiveGhost />
        </div>
        <p className="text-2xl font-heading neon-glow mt-8 mb-4">
          No tasks yet. Create your first task to get started! 👻
        </p>
        <p className="text-sm text-[var(--color-muted)] italic">
          Click the &ldquo;New Task&rdquo; button above to begin your productivity journey.
        </p>
        <p className="text-xs text-[var(--color-accent)] mt-4">
          💡 Try dragging the ghost around!
        </p>
      </div>
    );
  }

  return (
    <div
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      role="list"
      aria-label="Task list"
    >
      {tasks.map((task) => {
        const project = projects.find((p) => p.id === task.projectId);
        return (
          <TaskCard
            key={task.id}
            task={task}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onComplete={onComplete}
            projectName={project?.name}
          />
        );
      })}
    </div>
  );
};

TaskList.displayName = 'TaskList';
