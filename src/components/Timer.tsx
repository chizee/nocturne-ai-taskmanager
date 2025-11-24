/**
 * Timer - Pomodoro-style focus timer
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui';
import { getSoundManager } from '@/lib/sound-manager';

export interface TimerProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

const QUICK_DURATIONS = [
  { label: '10 Seconds', seconds: 10 },
  { label: '30 Seconds', seconds: 30 },
  { label: '1 Minute', seconds: 60 },
];

export const Timer: React.FC<TimerProps> = ({ 
  onComplete,
  onCancel 
}) => {
  const [selectedDuration, setSelectedDuration] = useState(60); // Default 1 minute
  const [customMinutes, setCustomMinutes] = useState('');
  const [timeLeft, setTimeLeft] = useState(selectedDuration);
  const [totalDuration, setTotalDuration] = useState(selectedDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleComplete = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(selectedDuration);
    setTotalDuration(selectedDuration);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    getSoundManager().play('task-complete');
    onComplete?.();
  };

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, isPaused]);

  const handleStart = () => {
    setTotalDuration(timeLeft);
    setIsRunning(true);
    setIsPaused(false);
    getSoundManager().play('task-create');
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);
    getSoundManager().play('task-create');
  };

  const handleCancel = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(selectedDuration);
    setTotalDuration(selectedDuration);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    onCancel?.();
  };

  const handleQuickSelect = (seconds: number) => {
    if (!isRunning) {
      setSelectedDuration(seconds);
      setTimeLeft(seconds);
      setTotalDuration(seconds);
    }
  };

  const handleCustomDuration = () => {
    const minutes = parseInt(customMinutes);
    if (minutes > 0 && !isRunning) {
      const seconds = minutes * 60;
      setSelectedDuration(seconds);
      setTimeLeft(seconds);
      setTotalDuration(seconds);
      setCustomMinutes('');
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((totalDuration - timeLeft) / totalDuration) * 100;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Duration Selection (only show when not running) */}
      {!isRunning && (
        <div className="w-full space-y-4">
          {/* Quick Duration Buttons */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-fg)] mb-2">
              Quick Select:
            </label>
            <div className="flex gap-2 flex-wrap justify-center">
              {QUICK_DURATIONS.map((option) => (
                <Button
                  key={option.seconds}
                  variant={selectedDuration === option.seconds ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => handleQuickSelect(option.seconds)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Duration Input */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-fg)] mb-2">
              Custom Duration (minutes):
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                max="120"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCustomDuration();
                  }
                }}
                placeholder="Enter minutes"
                className="flex-1 px-4 py-2 rounded-lg bg-[var(--color-bg)] text-[var(--color-fg)] border-2 border-[var(--color-muted)] focus:border-[var(--color-primary)] focus:outline-none"
              />
              <Button onClick={handleCustomDuration} disabled={!customMinutes}>
                Set
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Circular Timer Display */}
      <div className="relative w-64 h-64">
        {/* Background Circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="128"
            cy="128"
            r="120"
            stroke="rgba(139, 92, 246, 0.2)"
            strokeWidth="8"
            fill="none"
          />
          {/* Progress Circle */}
          <motion.circle
            cx="128"
            cy="128"
            r="120"
            stroke="var(--color-primary)"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 120}
            strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
            initial={{ strokeDashoffset: 2 * Math.PI * 120 }}
            animate={{ 
              strokeDashoffset: 2 * Math.PI * 120 * (1 - progress / 100),
              filter: [
                'drop-shadow(0 0 10px var(--color-primary))',
                'drop-shadow(0 0 20px var(--color-primary))',
                'drop-shadow(0 0 10px var(--color-primary))',
              ]
            }}
            transition={{ 
              strokeDashoffset: { duration: 0.5 },
              filter: { duration: 2, repeat: Infinity }
            }}
          />
        </svg>

        {/* Time Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            className="text-6xl font-heading neon-glow"
            animate={{
              scale: timeLeft <= 60 && isRunning ? [1, 1.05, 1] : 1,
            }}
            transition={{
              duration: 1,
              repeat: timeLeft <= 60 && isRunning ? Infinity : 0,
            }}
          >
            {formatTime(timeLeft)}
          </motion.div>
          <div className="text-sm text-[var(--color-muted)] mt-2">
            {isRunning ? (isPaused ? 'Paused' : 'Focus Time') : 'Ready'}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        {!isRunning ? (
          <Button
            variant="primary"
            size="lg"
            onClick={handleStart}
            className="min-w-[120px]"
          >
            🌙 Start
          </Button>
        ) : (
          <>
            {isPaused ? (
              <Button
                variant="primary"
                size="lg"
                onClick={handleResume}
                className="min-w-[120px]"
              >
                ▶️ Resume
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="lg"
                onClick={handlePause}
                className="min-w-[120px]"
              >
                ⏸️ Pause
              </Button>
            )}
            <Button
              variant="ghost"
              size="lg"
              onClick={handleCancel}
              className="min-w-[120px]"
            >
              ❌ Cancel
            </Button>
          </>
        )}
      </div>

      {/* Progress Bar (Alternative) */}
      <div className="w-full max-w-md">
        <div className="h-2 bg-[var(--color-muted)] bg-opacity-20 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
            style={{ width: `${progress}%` }}
            animate={{
              boxShadow: [
                '0 0 10px var(--color-primary)',
                '0 0 20px var(--color-primary)',
                '0 0 10px var(--color-primary)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </div>
    </div>
  );
};

Timer.displayName = 'Timer';
