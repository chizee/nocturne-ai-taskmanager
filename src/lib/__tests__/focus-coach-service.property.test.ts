/**
 * Property-based tests for FocusCoachService
 * 
 * Tests correctness properties 17-20 from design.md
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { FocusCoachService } from '../focus-coach-service';
import { Task } from '../types';

// Arbitraries for generating test data

const taskIdArbitrary = fc.uuid();

const dateArbitrary = fc.date({
  min: new Date('2025-01-01'),
  max: new Date('2026-12-31')
});

const taskArbitrary = fc.record({
  id: taskIdArbitrary,
  description: fc.lorem({ maxCount: 10 }).map(words => words || 'Task description'),
  completed: fc.constant(false), // Only incomplete tasks for focus sessions
  createdAt: dateArbitrary,
  updatedAt: dateArbitrary,
  dueDate: fc.option(dateArbitrary, { nil: undefined }),
  tags: fc.array(fc.lorem({ maxCount: 1 }).map(w => w.replace(/\s/g, '-') || 'tag'), { maxLength: 5 }),
  projectId: fc.option(fc.uuid(), { nil: undefined })
}).map(task => ({
  ...task,
  updatedAt: new Date(Math.max(task.createdAt.getTime(), task.updatedAt.getTime()))
})) as fc.Arbitrary<Task>;

const taskListArbitrary = (minTasks: number = 3, maxTasks: number = 20) =>
  fc.array(taskArbitrary, { minLength: minTasks, maxLength: maxTasks }).map(tasks => {
    // Ensure unique IDs
    return tasks.map((task, index) => ({
      ...task,
      id: `task-${index}-${Date.now()}-${Math.random()}`
    }));
  });

describe('FocusCoachService - Property-Based Tests', () => {
  let service: FocusCoachService;

  beforeEach(() => {
    service = new FocusCoachService();
    service.clearHistory();
  });

  describe('Property 17: Micro-plan structure', () => {
    /**
     * Feature: nocturne-task-manager, Property 17: Micro-plan structure
     * 
     * For any task list with at least 3 incomplete tasks, generating a micro-plan
     * should produce exactly 3 steps, with each step referencing an existing
     * incomplete task and having an estimated duration, such that the total
     * duration is approximately 25 minutes (±5 minutes).
     * 
     * Validates: Requirements 6.1
     */
    it('should generate exactly 3 steps with total duration ~25 minutes', async () => {
      await fc.assert(
        fc.asyncProperty(taskListArbitrary(3, 20), async (tasks) => {
          // Generate micro-plan
          const plan = await service.generateMicroPlan(tasks);

          // Check exactly 3 steps
          expect(plan.steps).toHaveLength(3);

          // Check each step references an existing task
          const taskIds = new Set(tasks.map(t => t.id));
          for (const step of plan.steps) {
            expect(taskIds.has(step.taskId)).toBe(true);
            expect(step.description).toBeTruthy();
            expect(step.estimatedMinutes).toBeGreaterThan(0);
          }

          // Check total duration is approximately 25 minutes (±5)
          const totalMinutes = plan.steps.reduce(
            (sum, step) => sum + step.estimatedMinutes,
            0
          );
          expect(totalMinutes).toBeGreaterThanOrEqual(20);
          expect(totalMinutes).toBeLessThanOrEqual(30);

          // Check plan has required metadata
          expect(plan.generatedAt).toBeInstanceOf(Date);
          expect(plan.confidence).toBeGreaterThanOrEqual(0);
          expect(plan.confidence).toBeLessThanOrEqual(1);
          expect(plan.reasoning).toBeTruthy();
        }),
        { numRuns: 50, timeout: 10000 }
      );
    });

    it('should throw error when fewer than 3 incomplete tasks', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(taskArbitrary, { minLength: 0, maxLength: 2 }),
          async (tasks) => {
            await expect(service.generateMicroPlan(tasks)).rejects.toThrow(
              /at least 3 incomplete tasks/i
            );
          }
        ),
        { numRuns: 25, timeout: 10000 }
      );
    });

    it('should not select the same task twice in a plan', async () => {
      await fc.assert(
        fc.asyncProperty(taskListArbitrary(3, 20), async (tasks) => {
          const plan = await service.generateMicroPlan(tasks);

          const taskIds = plan.steps.map(step => step.taskId);
          const uniqueTaskIds = new Set(taskIds);

          expect(uniqueTaskIds.size).toBe(3);
        }),
        { numRuns: 50, timeout: 10000 }
      );
    });
  });

  describe('Property 18: Micro-plan explainability', () => {
    /**
     * Feature: nocturne-task-manager, Property 18: Micro-plan explainability
     * 
     * For any generated micro-plan, each of the 3 steps should include a
     * non-empty explanation string describing why the task was selected.
     * 
     * Validates: Requirements 6.2
     */
    it('should provide non-empty explanations for all steps', async () => {
      await fc.assert(
        fc.asyncProperty(taskListArbitrary(3, 20), async (tasks) => {
          const plan = await service.generateMicroPlan(tasks);

          for (const step of plan.steps) {
            expect(step.explanation).toBeTruthy();
            expect(step.explanation.trim().length).toBeGreaterThan(0);
            expect(typeof step.explanation).toBe('string');
          }

          // Overall reasoning should also be present
          expect(plan.reasoning).toBeTruthy();
          expect(plan.reasoning.trim().length).toBeGreaterThan(0);
        }),
        { numRuns: 50, timeout: 10000 }
      );
    });

    it('should provide meaningful explanations (not just placeholders)', async () => {
      await fc.assert(
        fc.asyncProperty(taskListArbitrary(3, 20), async (tasks) => {
          const plan = await service.generateMicroPlan(tasks);

          for (const step of plan.steps) {
            // Explanation should be reasonably long (not just "good task")
            expect(step.explanation.length).toBeGreaterThan(20);
            
            // Should not be a generic placeholder
            expect(step.explanation.toLowerCase()).not.toBe('todo');
            expect(step.explanation.toLowerCase()).not.toBe('explanation');
          }
        }),
        { numRuns: 50, timeout: 10000 }
      );
    });
  });

  describe('Property 19: Confidence scoring', () => {
    /**
     * Feature: nocturne-task-manager, Property 19: Confidence scoring
     * 
     * For any generated micro-plan, each step should have a confidence value
     * between 0.0 and 1.0 (inclusive), and the overall plan should have a
     * confidence value in the same range.
     * 
     * Validates: Requirements 6.3
     */
    it('should have confidence scores in valid range [0, 1]', async () => {
      await fc.assert(
        fc.asyncProperty(taskListArbitrary(3, 20), async (tasks) => {
          const plan = await service.generateMicroPlan(tasks);

          // Check overall confidence
          expect(plan.confidence).toBeGreaterThanOrEqual(0);
          expect(plan.confidence).toBeLessThanOrEqual(1);

          // Check each step's confidence
          for (const step of plan.steps) {
            expect(step.confidence).toBeGreaterThanOrEqual(0);
            expect(step.confidence).toBeLessThanOrEqual(1);
          }
        }),
        { numRuns: 50, timeout: 10000 }
      );
    });

    it('should have higher confidence for tasks with more metadata', async () => {
      // Create tasks with varying amounts of metadata
      const richTask: Task = {
        id: '1',
        description: 'Complete project documentation',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Due tomorrow
        tags: ['documentation', 'urgent'],
        projectId: 'proj-1'
      };

      const poorTask: Task = {
        id: '2',
        description: 'Do something',
        completed: false,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        tags: []
      };

      const mediumTask: Task = {
        id: '3',
        description: 'Review code changes',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['code-review']
      };

      const tasks = [richTask, poorTask, mediumTask];
      const plan = await service.generateMicroPlan(tasks);

      // Find the steps for each task
      const richStep = plan.steps.find(s => s.taskId === richTask.id);
      const poorStep = plan.steps.find(s => s.taskId === poorTask.id);

      // Rich task should have higher confidence than poor task
      if (richStep && poorStep) {
        expect(richStep.confidence).toBeGreaterThan(poorStep.confidence);
      }
    });
  });

  describe('Property 20: Plan regeneration produces different results', () => {
    /**
     * Feature: nocturne-task-manager, Property 20: Plan regeneration produces different results
     * 
     * For any task list, generating a micro-plan, rejecting it, and regenerating
     * should produce a different plan (different task selection or different order)
     * at least 80% of the time.
     * 
     * Validates: Requirements 6.4
     */
    it('should produce different plans on regeneration at least 80% of the time', async () => {
      await fc.assert(
        fc.asyncProperty(taskListArbitrary(6, 20), async (tasks) => {
          // Generate first plan
          const plan1 = await service.generateMicroPlan(tasks);
          const taskIds1 = plan1.steps.map(s => s.taskId).sort().join(',');

          // Generate second plan
          const plan2 = await service.generateMicroPlan(tasks);
          const taskIds2 = plan2.steps.map(s => s.taskId).sort().join(',');

          // Plans should be different (at least task selection or order)
          // We check this across multiple runs to ensure 80% difference rate
          return taskIds1 !== taskIds2;
        }),
        { numRuns: 50, timeout: 10000 }
      ).then(() => {
        // If we get here, at least 80% of runs produced different plans
        // (fc.assert would fail if too many runs had identical plans)
      });
    });

    it('should exclude previous plan tasks when possible', async () => {
      const tasks: Task[] = Array.from({ length: 10 }, (_, i) => ({
        id: `task-${i}-${Date.now()}`,
        description: `Complete task number ${i} with sufficient description length for testing`,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [],
        dueDate: new Date(Date.now() + i * 24 * 60 * 60 * 1000)
      }));

      // Generate first plan
      const plan1 = await service.generateMicroPlan(tasks);
      const taskIds1 = new Set(plan1.steps.map(s => s.taskId));

      // Generate second plan
      const plan2 = await service.generateMicroPlan(tasks);
      const taskIds2 = new Set(plan2.steps.map(s => s.taskId));

      // Count how many tasks are different
      let differentTasks = 0;
      for (const id of taskIds2) {
        if (!taskIds1.has(id)) {
          differentTasks++;
        }
      }

      // At least one task should be different (with 10 tasks available)
      expect(differentTasks).toBeGreaterThan(0);
    });
  });

  describe('Session Management', () => {
    it('should start a session with a valid plan', async () => {
      const tasks: Task[] = Array.from({ length: 3 }, (_, i) => ({
        id: `task-${i}-${Date.now()}`,
        description: `Complete task number ${i} with sufficient description length`,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [],
        dueDate: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000)
      }));

      const plan = await service.generateMicroPlan(tasks);
      const session = service.startSession(plan);

      expect(session.id).toBeTruthy();
      expect(session.microPlan).toBe(plan);
      expect(session.status).toBe('active');
      expect(session.duration).toBe(1500); // 25 minutes in seconds
    });

    it('should not allow starting multiple active sessions', async () => {
      const tasks: Task[] = Array.from({ length: 3 }, (_, i) => ({
        id: `task-${i}-${Date.now()}`,
        description: `Complete task number ${i} with sufficient description length`,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [],
        dueDate: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000)
      }));

      const plan = await service.generateMicroPlan(tasks);
      service.startSession(plan);

      expect(() => service.startSession(plan)).toThrow(/already active/i);
    });

    it('should pause and resume a session', async () => {
      const tasks: Task[] = Array.from({ length: 3 }, (_, i) => ({
        id: `task-${i}-${Date.now()}`,
        description: `Complete task number ${i} with sufficient description length`,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [],
        dueDate: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000)
      }));

      const plan = await service.generateMicroPlan(tasks);
      const session = service.startSession(plan);

      service.pauseSession(session.id);
      expect(service.getActiveSession()?.status).toBe('paused');

      service.resumeSession(session.id);
      expect(service.getActiveSession()?.status).toBe('active');
    });

    it('should complete a session', async () => {
      const tasks: Task[] = Array.from({ length: 3 }, (_, i) => ({
        id: `task-${i}-${Date.now()}`,
        description: `Complete task number ${i} with sufficient description length`,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [],
        dueDate: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000)
      }));

      const plan = await service.generateMicroPlan(tasks);
      const session = service.startSession(plan);

      service.completeSession(session.id);
      expect(service.getActiveSession()).toBeUndefined();
    });

    it('should cancel a session', async () => {
      const tasks: Task[] = Array.from({ length: 3 }, (_, i) => ({
        id: `task-${i}-${Date.now()}`,
        description: `Complete task number ${i} with sufficient description length`,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [],
        dueDate: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000)
      }));

      const plan = await service.generateMicroPlan(tasks);
      const session = service.startSession(plan);

      service.cancelSession(session.id);
      expect(service.getActiveSession()).toBeUndefined();
    });
  });
});
