/**
 * TaskForm component - Create and edit tasks
 * Requirements: 1.1, 1.2, 2.1, 2.2, 3.2, 10.3
 */

'use client';

import React, { useState } from 'react';
import { Task, Project } from '@/lib/types';
import { Input, Textarea, Button, Dropdown, Tag } from './ui';
import { DropdownOption } from './ui/Dropdown';

export interface TaskFormProps {
  task?: Task;
  onSubmit: (taskData: Partial<Task>) => void;
  onCancel: () => void;
  projects: Project[];
  availableTags: string[];
}

export const TaskForm: React.FC<TaskFormProps> = ({
  task,
  onSubmit,
  onCancel,
  projects,
  availableTags,
}) => {
  const [description, setDescription] = useState(task?.description || '');
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(task?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [projectId, setProjectId] = useState(task?.projectId || '');
  const [error, setError] = useState('');

  const projectOptions: DropdownOption[] = [
    { value: '', label: 'No Project' },
    ...projects.map(p => ({ value: p.id, label: p.name })),
  ];

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      setSelectedTags([...selectedTags, trimmedTag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate description
    if (!description.trim()) {
      setError('Task description is required');
      return;
    }

    const taskData: Partial<Task> = {
      description: description.trim(),
      dueDate: dueDate ? new Date(dueDate) : undefined,
      tags: selectedTags,
      projectId: projectId || undefined,
    };

    onSubmit(taskData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        label="Description *"
        value={description}
        onChange={(e) => {
          setDescription(e.target.value);
          setError('');
        }}
        error={error}
        placeholder="What needs to be done?"
        rows={3}
        required
        aria-required="true"
      />

      <Input
        type="date"
        label="Due Date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        helperText="Optional: Set a deadline for this task"
      />

      <Dropdown
        label="Project"
        options={projectOptions}
        value={projectId}
        onChange={setProjectId}
        placeholder="Select a project"
      />

      <div>
        <label className="block text-sm font-medium text-[var(--color-fg)] mb-1">
          Tags
        </label>
        <div className="flex gap-2 mb-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
            placeholder="Add a tag"
            className="flex-1"
            list="available-tags"
          />
          <datalist id="available-tags">
            {availableTags.map(tag => (
              <option key={tag} value={tag} />
            ))}
          </datalist>
          <Button type="button" onClick={handleAddTag} variant="secondary">
            Add
          </Button>
        </div>
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {selectedTags.map(tag => (
              <Tag key={tag} label={tag} onRemove={() => handleRemoveTag(tag)} />
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 justify-end pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {task ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
};

TaskForm.displayName = 'TaskForm';
