/**
 * FocusCoach - AI-powered focus session component
 * 
 * Integrates with FocusCoachService to generate intelligent micro-plans
 * and guide users through 25-minute focus sessions.
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { focusCoachService } from '@/lib/focus-coach-service';
import { MicroPlan, Task } from '@/lib/types';
import { Timer } from './Timer';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { getSoundManager } from '@/lib/sound-manager';

interface FocusCoachProps {
  tasks: Task[];
  isOpen: boolean;
  onClose: () => void;
}

type SessionState = 'start' | 'planning' | 'plan-ready' | 'active' | 'completed' | 'error';

export const FocusCoach: React.FC<FocusCoachProps> = ({ tasks, isOpen, onClose }) => {
  const [sessionState, setSessionState] = useState<SessionState>('start');
  const [microPlan, setMicroPlan] = useState<MicroPlan | null>(null);
  const [error, setError] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');

  const handleStartPlanning = async () => {
    setSessionState('planning');
    setError('');

    try {
      // Generate micro-plan
      const plan = await focusCoachService.generateMicroPlan(tasks);
      setMicroPlan(plan);
      setSessionState('plan-ready');
      getSoundManager().play('task-complete', 0.3);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Failed to generate focus plan');
      setSessionState('error');
    }
  };

  const handleRegeneratePlan = async () => {
    setSessionState('planning');
    setError('');

    try {
      const plan = await focusCoachService.generateMicroPlan(tasks);
      setMicroPlan(plan);
      setSessionState('plan-ready');
      getSoundManager().play('task-complete', 0.3);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Failed to regenerate focus plan');
      setSessionState('error');
    }
  };

  const handleBeginSession = () => {
    if (!microPlan) return;

    try {
      const session = focusCoachService.startSession(microPlan);
      setSessionId(session.id);
      setSessionState('active');
      getSoundManager().play('task-create', 0.4);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Failed to start session');
      setSessionState('error');
    }
  };

  const handleTimerComplete = () => {
    if (sessionId) {
      focusCoachService.completeSession(sessionId);
    }
    setSessionState('completed');
    getSoundManager().play('task-complete', 0.5);
  };

  const handleTimerCancel = () => {
    if (sessionId) {
      focusCoachService.cancelSession(sessionId);
    }
    handleClose();
  };

  const handleClose = () => {
    setSessionState('start');
    setMicroPlan(null);
    setError('');
    setSessionId('');
    onClose();
  };

  const handleTryAgain = () => {
    setSessionState('start');
    setError('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="🎯 AI Focus Coach"
    >
      <div className="min-h-[400px] max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          {/* Start Screen */}
          {sessionState === 'start' && (
            <motion.div
              key="start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-6"
            >
              <div className="space-y-4">
                <div className="text-6xl">👻</div>
                <h2 className="text-2xl font-bold text-[var(--color-fg)]">
                  Ready for a Focus Session?
                </h2>
                <p className="text-[var(--color-muted)] max-w-md mx-auto">
                  I&apos;ll analyze your tasks and create a personalized 25-minute focus plan
                  to help you overcome decision fatigue and start working immediately.
                </p>
              </div>

              <div className="bg-[var(--color-muted)] bg-opacity-10 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm text-[var(--color-muted)]">
                  📊 Available tasks: <span className="font-bold text-[var(--color-fg)]">{tasks.filter(t => !t.completed).length}</span>
                </p>
                <p className="text-xs text-[var(--color-muted)] mt-2">
                  (Minimum 3 incomplete tasks required)
                </p>
              </div>

              <Button
                onClick={handleStartPlanning}
                variant="primary"
                size="lg"
                disabled={tasks.filter(t => !t.completed).length < 3}
              >
                Generate My Focus Plan
              </Button>
            </motion.div>
          )}

          {/* Planning State */}
          {sessionState === 'planning' && (
            <motion.div
              key="planning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-6 py-12"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="text-6xl"
              >
                🧠
              </motion.div>
              <h2 className="text-2xl font-bold text-[var(--color-fg)]">
                Analyzing Your Tasks...
              </h2>
              <p className="text-[var(--color-muted)]">
                Creating your personalized focus plan
              </p>
            </motion.div>
          )}

          {/* Plan Ready */}
          {sessionState === 'plan-ready' && microPlan && (
            <motion.div
              key="plan-ready"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Plan Header */}
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-3xl">✨</span>
                  <h2 className="text-2xl font-bold text-[var(--color-fg)]">
                    Your Focus Plan
                  </h2>
                </div>
                <div className="flex items-center justify-center gap-4 text-sm text-[var(--color-muted)]">
                  <span>📊 Confidence: {Math.round(microPlan.confidence * 100)}%</span>
                  <span>⏱️ Duration: {microPlan.steps.reduce((sum, s) => sum + s.estimatedMinutes, 0)} min</span>
                </div>
              </div>

              {/* Reasoning */}
              <div className="bg-[var(--color-primary)] bg-opacity-10 rounded-lg p-4 border-2 border-[var(--color-primary)] border-opacity-30">
                <p className="text-sm text-[var(--color-fg)] italic">
                  💭 {microPlan.reasoning}
                </p>
              </div>

              {/* Steps */}
              <div className="space-y-4">
                {microPlan.steps.map((step, index) => (
                  <motion.div
                    key={step.taskId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-[var(--color-bg)] border-2 border-[var(--color-muted)] rounded-lg p-4 hover:border-[var(--color-primary)] transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1 space-y-2">
                        <h3 className="font-semibold text-[var(--color-fg)]">
                          {step.description}
                        </h3>
                        <p className="text-sm text-[var(--color-muted)]">
                          💡 {step.explanation}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-[var(--color-muted)]">
                          <span>⏱️ {step.estimatedMinutes} minutes</span>
                          <span>📈 {Math.round(step.confidence * 100)}% confidence</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Ghost Companion Message */}
              <div className="bg-[var(--color-muted)] bg-opacity-10 rounded-lg p-4 flex items-start gap-3">
                <span className="text-2xl">👻</span>
                <p className="text-sm text-[var(--color-muted)] italic">
                  &quot;This plan balances urgency with variety to keep you focused and energized throughout the session!&quot;
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={handleRegeneratePlan}
                  variant="secondary"
                >
                  🔄 Regenerate Plan
                </Button>
                <Button
                  onClick={handleBeginSession}
                  variant="primary"
                  size="lg"
                >
                  Begin Session →
                </Button>
              </div>
            </motion.div>
          )}

          {/* Active Session */}
          {sessionState === 'active' && microPlan && (
            <motion.div
              key="active"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold text-[var(--color-fg)] mb-2">
                  Focus Session Active
                </h2>
                <p className="text-[var(--color-muted)]">
                  Stay focused on your plan!
                </p>
              </div>

              {/* Timer */}
              <div className="flex justify-center">
                <Timer
                  onComplete={handleTimerComplete}
                  onCancel={handleTimerCancel}
                />
              </div>
              <p className="text-center text-sm text-[var(--color-muted)]">
                💡 Tip: Set the timer to 25 minutes for a full Pomodoro session
              </p>

              {/* Current Plan Reference */}
              <div className="bg-[var(--color-muted)] bg-opacity-10 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-[var(--color-fg)] text-sm">
                  📝 Your Plan:
                </h3>
                {microPlan.steps.map((step, index) => (
                  <div key={step.taskId} className="flex items-center gap-2 text-sm">
                    <span className="text-[var(--color-muted)]">{index + 1}.</span>
                    <span className="text-[var(--color-fg)]">{step.description}</span>
                    <span className="text-[var(--color-muted)] text-xs">
                      ({step.estimatedMinutes}m)
                    </span>
                  </div>
                ))}
              </div>

              {/* Ghost Encouragement */}
              <div className="text-center">
                <span className="text-4xl">👻</span>
                <p className="text-sm text-[var(--color-muted)] italic mt-2">
                  &quot;You&apos;ve got this! Stay focused!&quot;
                </p>
              </div>
            </motion.div>
          )}

          {/* Completed */}
          {sessionState === 'completed' && (
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-6 py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.6 }}
                className="text-8xl"
              >
                🎉
              </motion.div>
              <h2 className="text-3xl font-bold text-[var(--color-fg)]">
                Session Complete!
              </h2>
              <p className="text-[var(--color-muted)] max-w-md mx-auto">
                Great work! You&apos;ve completed your 25-minute focus session.
                Take a short break before starting another one.
              </p>

              <div className="bg-[var(--color-primary)] bg-opacity-10 rounded-lg p-6 max-w-md mx-auto">
                <span className="text-4xl mb-3 block">👻</span>
                <p className="text-[var(--color-fg)] italic">
                  &quot;Excellent focus! You&apos;re building great productivity habits!&quot;
                </p>
              </div>

              <Button
                onClick={handleClose}
                variant="primary"
                size="lg"
              >
                Close
              </Button>
            </motion.div>
          )}

          {/* Error State */}
          {sessionState === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-6 py-8"
            >
              <div className="text-6xl">⚠️</div>
              <h2 className="text-2xl font-bold text-[var(--color-fg)]">
                Oops! Something Went Wrong
              </h2>
              <div className="bg-red-500 bg-opacity-10 border-2 border-red-500 border-opacity-30 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-red-400">{error}</p>
              </div>

              <div className="flex gap-3 justify-center">
                <Button onClick={handleClose} variant="secondary">
                  Close
                </Button>
                <Button onClick={handleTryAgain} variant="primary">
                  Try Again
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
};
