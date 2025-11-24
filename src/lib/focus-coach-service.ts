/**
 * FocusCoachService - AI-powered focus session planning
 * 
 * This service integrates with Kiro agent hooks to analyze tasks
 * and generate intelligent 3-step micro-plans for 25-minute focus sessions.
 * 
 * Based on design.md specifications and .kiro/hooks/focus-coach.md
 */

import { Task, FocusSession, MicroPlan, ErrorType, AppError } from './types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Input format for the Kiro agent hook
 */
interface FocusCoachInput {
  tasks: Task[];
  currentTime: string;
  previousPlans: Array<{
    taskIds: string[];
    generatedAt: string;
  }>;
}

/**
 * Output format from the Kiro agent hook
 */
interface FocusCoachOutput {
  microPlan: {
    steps: Array<{
      taskId: string;
      description: string;
      estimatedMinutes: number;
      explanation: string;
      confidence: number;
    }>;
    generatedAt: string;
    confidence: number;
    reasoning: string;
  };
}



/**
 * Service for managing AI-powered focus sessions
 */
export class FocusCoachService {
  private activeSession: FocusSession | undefined;
  private previousPlans: Array<{ taskIds: string[]; generatedAt: Date }> = [];

  /**
   * Generate a micro-plan using the Kiro agent hook
   * 
   * @param tasks - List of all tasks
   * @returns Promise resolving to a MicroPlan
   * @throws AppError if generation fails
   */
  async generateMicroPlan(tasks: Task[]): Promise<MicroPlan> {
    // Filter to incomplete tasks only
    const incompleteTasks = tasks.filter(task => !task.completed);

    // Validate minimum task count
    if (incompleteTasks.length < 3) {
      const error: AppError = {
        type: ErrorType.INSUFFICIENT_TASKS,
        message: `At least 3 incomplete tasks are required to generate a focus session plan. You currently have ${incompleteTasks.length} incomplete task(s).`,
        context: { availableTasks: incompleteTasks.length }
      };
      throw error;
    }

    // Prepare input for Kiro agent hook
    const input: FocusCoachInput = {
      tasks: incompleteTasks,
      currentTime: new Date().toISOString(),
      previousPlans: this.previousPlans.map(plan => ({
        taskIds: plan.taskIds,
        generatedAt: plan.generatedAt.toISOString()
      }))
    };

    try {
      // Call the Kiro agent hook (simulated for now)
      const output = await this.callKiroAgentHook(input);

      // Convert to MicroPlan format
      const microPlan: MicroPlan = {
        steps: output.microPlan.steps.map(step => ({
          taskId: step.taskId,
          description: step.description,
          estimatedMinutes: step.estimatedMinutes,
          explanation: step.explanation,
          confidence: step.confidence
        })),
        generatedAt: new Date(output.microPlan.generatedAt),
        confidence: output.microPlan.confidence,
        reasoning: output.microPlan.reasoning
      };

      // Validate the micro-plan
      this.validateMicroPlan(microPlan, incompleteTasks);

      // Store for regeneration tracking
      this.previousPlans.push({
        taskIds: microPlan.steps.map(step => step.taskId),
        generatedAt: microPlan.generatedAt
      });

      return microPlan;
    } catch (error) {
      if (this.isAppError(error)) {
        throw error;
      }

      const appError: AppError = {
        type: ErrorType.PLAN_GENERATION_FAILED,
        message: 'Failed to generate focus session plan. Please try again.',
        context: { originalError: error }
      };
      throw appError;
    }
  }

  /**
   * Start a new focus session with the given micro-plan
   * 
   * @param plan - The micro-plan to execute
   * @param duration - Session duration in seconds (default: 1500 = 25 minutes)
   * @returns The created FocusSession
   * @throws Error if a session is already active
   */
  startSession(plan: MicroPlan, duration: number = 1500): FocusSession {
    if (this.activeSession && this.activeSession.status === 'active') {
      throw new Error('A focus session is already active. Please complete or cancel it first.');
    }

    const session: FocusSession = {
      id: uuidv4(),
      microPlan: plan,
      startTime: new Date(),
      duration,
      status: 'active'
    };

    this.activeSession = session;
    return session;
  }

  /**
   * Pause the active focus session
   * 
   * @param sessionId - ID of the session to pause
   * @throws Error if no active session or session ID doesn't match
   */
  pauseSession(sessionId: string): void {
    if (!this.activeSession || this.activeSession.id !== sessionId) {
      throw new Error('No active session found with the given ID.');
    }

    if (this.activeSession.status !== 'active') {
      throw new Error('Session is not active and cannot be paused.');
    }

    this.activeSession.status = 'paused';
    this.activeSession.pausedAt = new Date();
  }

  /**
   * Resume a paused focus session
   * 
   * @param sessionId - ID of the session to resume
   * @throws Error if no paused session or session ID doesn't match
   */
  resumeSession(sessionId: string): void {
    if (!this.activeSession || this.activeSession.id !== sessionId) {
      throw new Error('No session found with the given ID.');
    }

    if (this.activeSession.status !== 'paused') {
      throw new Error('Session is not paused and cannot be resumed.');
    }

    this.activeSession.status = 'active';
    this.activeSession.resumedAt = new Date();
  }

  /**
   * Cancel the active focus session
   * 
   * @param sessionId - ID of the session to cancel
   * @throws Error if no active session or session ID doesn't match
   */
  cancelSession(sessionId: string): void {
    if (!this.activeSession || this.activeSession.id !== sessionId) {
      throw new Error('No session found with the given ID.');
    }

    this.activeSession.status = 'cancelled';
    this.activeSession.endTime = new Date();
    this.activeSession = undefined;
  }

  /**
   * Complete the active focus session
   * 
   * @param sessionId - ID of the session to complete
   * @throws Error if no active session or session ID doesn't match
   */
  completeSession(sessionId: string): void {
    if (!this.activeSession || this.activeSession.id !== sessionId) {
      throw new Error('No session found with the given ID.');
    }

    this.activeSession.status = 'completed';
    this.activeSession.endTime = new Date();
    this.activeSession = undefined;
  }

  /**
   * Get the currently active session
   * 
   * @returns The active FocusSession or undefined
   */
  getActiveSession(): FocusSession | undefined {
    return this.activeSession;
  }

  /**
   * Clear previous plan history (useful for testing)
   */
  clearHistory(): void {
    this.previousPlans = [];
  }

  /**
   * Call the Kiro agent hook (simulated implementation)
   * 
   * In production, this would make an actual API call to Kiro.
   * For now, we implement the logic directly based on the hook specification.
   * 
   * @param input - Input for the agent hook
   * @returns Promise resolving to the hook output
   */
  private async callKiroAgentHook(input: FocusCoachInput): Promise<FocusCoachOutput> {
    // In production, this would make an actual API call to Kiro
    // For now, we implement the logic directly (no artificial delay for tests)
    
    const { tasks, currentTime, previousPlans } = input;
    const now = new Date(currentTime);

    // Score and rank tasks
    const scoredTasks = tasks.map(task => ({
      task,
      score: this.calculatePriorityScore(task, now),
      urgency: this.calculateUrgency(task, now),
      recency: this.calculateRecency(task, now)
    }));

    // Sort by score (descending)
    scoredTasks.sort((a, b) => b.score - a.score);

    // Exclude tasks from previous plans if possible
    const previousTaskIds = new Set(
      previousPlans.flatMap(plan => plan.taskIds)
    );

    let availableTasks = scoredTasks.filter(
      st => !previousTaskIds.has(st.task.id)
    );

    // If we don't have enough tasks after exclusion, use all tasks
    if (availableTasks.length < 3) {
      availableTasks = scoredTasks;
    }

    // Select top 3 tasks with some variety
    const selectedTasks = this.selectDiverseTasks(availableTasks.slice(0, 6), 3);

    // Generate steps with time estimates
    const steps = selectedTasks.map((st, index) => {
      const estimatedMinutes = this.estimateTaskDuration(st.task);
      const explanation = this.generateExplanation(st.task, st.urgency, st.recency, now, index);
      const confidence = this.calculateConfidence(st.task, st.urgency);

      return {
        taskId: st.task.id,
        description: st.task.description,
        estimatedMinutes,
        explanation,
        confidence
      };
    });

    // Calculate overall confidence
    const overallConfidence = steps.reduce((sum, step) => sum + step.confidence, 0) / steps.length;

    // Generate reasoning
    const reasoning = this.generateReasoning(selectedTasks, now);

    return {
      microPlan: {
        steps,
        generatedAt: now.toISOString(),
        confidence: Math.round(overallConfidence * 100) / 100,
        reasoning
      }
    };
  }

  /**
   * Calculate priority score for a task
   */
  private calculatePriorityScore(task: Task, now: Date): number {
    const urgency = this.calculateUrgency(task, now);
    const recency = this.calculateRecency(task, now);
    const context = this.calculateContext(task);
    
    // Weighted scoring: urgency (40%), recency (30%), context (30%)
    return (urgency * 0.4) + (recency * 0.3) + (context * 0.3);
  }

  /**
   * Calculate urgency score based on due date
   */
  private calculateUrgency(task: Task, now: Date): number {
    if (!task.dueDate) return 0.2;

    const dueDate = new Date(task.dueDate);
    const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilDue < 0) return 1.0; // Overdue
    if (hoursUntilDue < 24) return 0.8; // Due within 24 hours
    if (hoursUntilDue < 72) return 0.6; // Due within 3 days
    if (hoursUntilDue < 168) return 0.4; // Due within 7 days
    return 0.2;
  }

  /**
   * Calculate recency score based on creation date
   */
  private calculateRecency(task: Task, now: Date): number {
    const createdAt = new Date(task.createdAt);
    const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

    if (hoursSinceCreation < 24) return 0.9; // Created within 24 hours
    if (hoursSinceCreation < 168) return 0.6; // Created within week
    return 0.3;
  }

  /**
   * Calculate context score based on metadata
   */
  private calculateContext(task: Task): number {
    let score = 0;
    
    if (task.projectId) score += 0.2;
    score += Math.min(task.tags.length * 0.1, 0.3);
    
    return Math.min(score, 1.0);
  }

  /**
   * Select diverse tasks from candidates
   */
  private selectDiverseTasks(
    candidates: Array<{ task: Task; score: number }>,
    count: number
  ): Array<{ task: Task; score: number; urgency: number; recency: number }> {
    const selected: Array<{ task: Task; score: number; urgency: number; recency: number }> = [];
    const usedProjects = new Set<string>();
    const now = new Date();

    // Add slight randomization to scores for variety (±5%)
    const randomizedCandidates = candidates.map(c => ({
      ...c,
      score: c.score * (0.95 + Math.random() * 0.1)
    }));

    // Re-sort with randomized scores
    randomizedCandidates.sort((a, b) => b.score - a.score);

    for (const candidate of randomizedCandidates) {
      if (selected.length >= count) break;

      // Prefer tasks from different projects
      if (candidate.task.projectId && usedProjects.has(candidate.task.projectId)) {
        continue;
      }

      selected.push({
        ...candidate,
        urgency: this.calculateUrgency(candidate.task, now),
        recency: this.calculateRecency(candidate.task, now)
      });

      if (candidate.task.projectId) {
        usedProjects.add(candidate.task.projectId);
      }
    }

    // If we still need more tasks, add remaining candidates
    if (selected.length < count) {
      for (const candidate of randomizedCandidates) {
        if (selected.length >= count) break;
        if (!selected.find(s => s.task.id === candidate.task.id)) {
          selected.push({
            ...candidate,
            urgency: this.calculateUrgency(candidate.task, now),
            recency: this.calculateRecency(candidate.task, now)
          });
        }
      }
    }

    return selected;
  }

  /**
   * Estimate task duration based on description
   */
  private estimateTaskDuration(task: Task): number {
    const descLength = task.description.length;
    
    if (descLength < 30) return 6; // Short task
    if (descLength < 60) return 9; // Medium task
    return 10; // Long task
  }

  /**
   * Generate explanation for task selection
   */
  private generateExplanation(
    task: Task,
    urgency: number,
    recency: number,
    now: Date,
    index: number
  ): string {
    // Urgent tasks
    if (urgency >= 0.8) {
      if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
        
        if (hoursUntilDue < 0) {
          return 'This task is overdue and should be prioritized immediately to get back on track.';
        } else {
          const timeframe = hoursUntilDue < 24 
            ? `in ${Math.round(hoursUntilDue)} hours`
            : 'soon';
          return `This task is due ${timeframe} and should be prioritized to avoid missing the deadline.`;
        }
      }
    }

    // Recent tasks
    if (recency >= 0.8) {
      return 'This task was recently added and addressing it early prevents it from becoming urgent.';
    }

    // Project-related tasks
    if (task.projectId) {
      return `This task is part of a project and contributes to your overall progress.`;
    }

    // Variety
    if (index > 0) {
      return 'This task provides variety in your session, helping maintain focus and prevent fatigue.';
    }

    return 'This task is a good fit for your current focus session based on its priority and context.';
  }

  /**
   * Calculate confidence score for a task
   */
  private calculateConfidence(task: Task, urgency: number): number {
    const dataQuality = (task.dueDate ? 0.3 : 0) + 
                       (task.projectId ? 0.2 : 0) + 
                       (task.tags.length > 0 ? 0.2 : 0) + 
                       0.3; // Base quality

    const urgencyClarity = urgency;
    const contextCompleteness = (task.projectId ? 0.5 : 0) + 
                                (task.tags.length > 0 ? 0.5 : 0);

    const confidence = (dataQuality * 0.4) + 
                      (urgencyClarity * 0.3) + 
                      (contextCompleteness * 0.3);

    return Math.round(confidence * 100) / 100;
  }

  /**
   * Generate overall reasoning for the plan
   */
  private generateReasoning(
    selectedTasks: Array<{ task: Task; urgency: number }>,
    now: Date
  ): string {
    const hasUrgent = selectedTasks.some(st => st.urgency >= 0.8);
    const hasRecent = selectedTasks.some(st => this.calculateRecency(st.task, now) >= 0.8);
    const hasProjects = selectedTasks.some(st => st.task.projectId);

    let reasoning = 'This plan ';

    if (hasUrgent) {
      reasoning += 'prioritizes urgent tasks to keep you on track with deadlines';
    } else if (hasRecent) {
      reasoning += 'focuses on recently added tasks to prevent them from becoming urgent';
    } else {
      reasoning += 'balances important tasks across your workload';
    }

    if (hasProjects) {
      reasoning += ', includes project work to maintain momentum';
    }

    reasoning += ', and provides variety to help maintain focus throughout the 25-minute session.';

    return reasoning;
  }

  /**
   * Validate a generated micro-plan
   */
  private validateMicroPlan(plan: MicroPlan, tasks: Task[]): void {
    // Check exactly 3 steps
    if (plan.steps.length !== 3) {
      throw new Error(`Micro-plan must have exactly 3 steps, got ${plan.steps.length}`);
    }

    // Check total duration
    const totalMinutes = plan.steps.reduce((sum, step) => sum + step.estimatedMinutes, 0);
    if (totalMinutes < 20 || totalMinutes > 30) {
      throw new Error(`Total duration must be ~25 minutes (±5), got ${totalMinutes}`);
    }

    // Check all task IDs are valid
    const taskIds = new Set(tasks.map(t => t.id));
    for (const step of plan.steps) {
      if (!taskIds.has(step.taskId)) {
        throw new Error(`Invalid task ID in plan: ${step.taskId}`);
      }
    }

    // Check confidence scores
    if (plan.confidence < 0 || plan.confidence > 1) {
      throw new Error(`Overall confidence must be in [0, 1], got ${plan.confidence}`);
    }

    for (const step of plan.steps) {
      if (step.confidence < 0 || step.confidence > 1) {
        throw new Error(`Step confidence must be in [0, 1], got ${step.confidence}`);
      }
    }

    // Check explanations are non-empty
    for (const step of plan.steps) {
      if (!step.explanation || step.explanation.trim().length === 0) {
        throw new Error('All steps must have non-empty explanations');
      }
    }
  }

  /**
   * Type guard for AppError
   */
  private isAppError(error: unknown): error is AppError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'type' in error &&
      'message' in error
    );
  }
}

// Export singleton instance
export const focusCoachService = new FocusCoachService();
