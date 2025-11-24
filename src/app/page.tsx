'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { Modal } from '@/components/ui';
import { TaskForm } from '@/components/TaskForm';
import { TaskList } from '@/components/TaskList';
import { ThemeToggle } from '@/components/ThemeToggle';
import { GraveyardScene } from '@/components/GraveyardScene';
import { FlyingBats } from '@/components/FlyingBats';
import { LightningFlash } from '@/components/LightningFlash';
import { Timer } from '@/components/Timer';
import { CSVImportUI } from '@/components/CSVImportUI';
import { FocusCoach } from '@/components/FocusCoach';
import { Task } from '@/lib/types';
import { getSoundManager } from '@/lib/sound-manager';

export default function Home() {
  const { 
    tasks, 
    projects, 
    taskManager, 
    currentTheme, 
    setTheme, 
    refreshTasks 
  } = useApp();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isCSVImportOpen, setIsCSVImportOpen] = useState(false);
  const [isFocusCoachOpen, setIsFocusCoachOpen] = useState(false);

  const handleCreateTask = () => {
    setEditingTask(undefined);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = (taskData: Partial<Task>) => {
    if (editingTask) {
      taskManager.updateTask(editingTask.id, taskData);
    } else {
      taskManager.createTask(taskData.description!, {
        dueDate: taskData.dueDate,
        tags: taskData.tags,
        projectId: taskData.projectId,
      });
      // Play creation sound
      getSoundManager().play('task-create');
    }
    refreshTasks();
    setIsModalOpen(false);
    setEditingTask(undefined);
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      taskManager.deleteTask(taskId);
      // Play deletion sound
      getSoundManager().play('stone-crack');
      refreshTasks();
    }
  };

  const handleCompleteTask = (taskId: string, completed: boolean) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      taskManager.updateTask(taskId, { ...task, completed });
      // Play completion sound
      if (completed) {
        getSoundManager().play('task-complete');
      }
      refreshTasks();
    }
  };

  const handleCSVImport = (importedTasks: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    importedTasks.forEach(task => {
      taskManager.createTask(task.description, {
        dueDate: task.dueDate,
        tags: task.tags,
        projectId: task.projectId,
      });
    });
    refreshTasks();
    getSoundManager().play('task-create');
  };

  const handleTimerComplete = () => {
    getSoundManager().play('task-complete');
    alert('🎉 Focus session complete! Great work!');
    setIsTimerOpen(false);
  };

  return (
    <>
      {/* Atmospheric Background */}
      <GraveyardScene />
      
      {/* Atmospheric Effects - Always enabled for visibility */}
      <FlyingBats enabled={true} />
      <LightningFlash enabled={true} />
      
      <main className="relative min-h-screen p-8 z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.header
            className="mb-12"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            {/* Title with smoke effect */}
            <div className="text-center mb-8 relative">
              <motion.h1
                className="text-7xl md:text-8xl font-heading neon-glow mb-4 relative inline-block"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              >
                🌙 NOCTURNE
                {/* Smoke particles rising from title */}
                {Array.from({ length: 3 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-8 h-8 rounded-full"
                    style={{
                      background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4), transparent)',
                      left: `${30 + i * 20}%`,
                      top: '-20px',
                    }}
                    animate={{
                      y: [-20, -80],
                      opacity: [0.6, 0],
                      scale: [1, 1.5],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 0.8,
                    }}
                  />
                ))}
              </motion.h1>
              <motion.p
                className="text-xl text-[var(--color-fg)] mb-2 italic"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                An elegant, spooky-themed task manager
              </motion.p>
              <motion.p
                className="text-sm text-[var(--color-muted)]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                Built with 💜 and a touch of 👻 using Kiro for the Costume Contest 2025
              </motion.p>
            </div>

            {/* Theme Toggle */}
            <motion.div
              className="flex justify-center mb-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9 }}
            >
              <ThemeToggle currentLevel={currentTheme} onChange={setTheme} />
            </motion.div>

            {/* Action Bar with glass morphism */}
            <motion.div
              className="glass rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
            >
              <div className="text-[var(--color-fg)]">
                <span className="text-3xl font-heading neon-glow">
                  {tasks.length} {tasks.length === 1 ? 'Task' : 'Tasks'}
                </span>
                <span className="text-[var(--color-muted)] ml-3 text-lg">
                  ({tasks.filter(t => t.completed).length} completed)
                </span>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 flex-wrap justify-center">
                {/* AI Focus Coach Button */}
                <motion.button
                  onClick={() => setIsFocusCoachOpen(true)}
                  className="relative px-6 py-3 text-base font-heading font-bold uppercase tracking-wider rounded-xl overflow-hidden group"
                  style={{
                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                    border: '2px solid var(--color-primary)',
                    color: 'white',
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    🎯 AI Focus Coach
                  </span>
                  {/* Glow effect */}
                  <motion.div
                    className="absolute inset-0 rounded-xl"
                    style={{
                      boxShadow: '0 0 20px var(--color-primary), 0 0 40px var(--color-primary)',
                    }}
                    animate={{
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  />
                </motion.button>

                {/* Timer Button */}
                <motion.button
                  onClick={() => setIsTimerOpen(true)}
                  className="relative px-6 py-3 text-base font-heading font-bold uppercase tracking-wider rounded-xl overflow-hidden group"
                  style={{
                    background: 'transparent',
                    border: '2px solid var(--color-accent)',
                    color: 'var(--color-accent)',
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    ⏰ Focus Timer
                  </span>
                </motion.button>

                {/* CSV Import Button */}
                <motion.button
                  onClick={() => setIsCSVImportOpen(true)}
                  className="relative px-6 py-3 text-base font-heading font-bold uppercase tracking-wider rounded-xl overflow-hidden group"
                  style={{
                    background: 'transparent',
                    border: '2px solid var(--color-secondary)',
                    color: 'var(--color-secondary)',
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    📁 Import CSV
                  </span>
                </motion.button>

                {/* Neon New Task Button */}
                <motion.button
                onClick={handleCreateTask}
                className="relative px-8 py-4 text-lg font-heading font-bold uppercase tracking-wider rounded-xl overflow-hidden group"
                style={{
                  background: 'transparent',
                  border: '3px solid var(--color-primary)',
                  color: 'var(--color-primary)',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Animated background on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
                
                {/* Button content */}
                <span className="relative z-10 flex items-center gap-2 group-hover:text-white transition-colors">
                  <motion.span
                    animate={{
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    🌙
                  </motion.span>
                  New Task
                </span>
                
                {/* Glow effect */}
                <motion.div
                  className="absolute inset-0 rounded-xl"
                  style={{
                    boxShadow: '0 0 20px var(--color-primary), 0 0 40px var(--color-primary)',
                  }}
                  animate={{
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                />
              </motion.button>
              </div>
            </motion.div>
          </motion.header>

          {/* Task List with stagger animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
          >
            <TaskList
              tasks={tasks}
              projects={projects}
              onUpdate={handleEditTask}
              onDelete={handleDeleteTask}
              onComplete={handleCompleteTask}
            />
          </motion.div>

          {/* Task Form Modal */}
          <Modal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setEditingTask(undefined);
            }}
            title={editingTask ? '✨ Edit Task' : '🌙 Create New Task'}
          >
            <TaskForm
              task={editingTask}
              projects={projects}
              availableTags={taskManager.getAllTags()}
              onSubmit={handleSaveTask}
              onCancel={() => {
                setIsModalOpen(false);
                setEditingTask(undefined);
              }}
            />
          </Modal>

          {/* Timer Modal */}
          <Modal
            isOpen={isTimerOpen}
            onClose={() => setIsTimerOpen(false)}
            title="⏰ Focus Timer"
          >
            <Timer
              onComplete={handleTimerComplete}
              onCancel={() => setIsTimerOpen(false)}
            />
          </Modal>

          {/* CSV Import Modal */}
          <Modal
            isOpen={isCSVImportOpen}
            onClose={() => setIsCSVImportOpen(false)}
            title="📁 Import Tasks from CSV"
          >
            <CSVImportUI
              onImport={handleCSVImport}
              onClose={() => setIsCSVImportOpen(false)}
            />
          </Modal>

          {/* AI Focus Coach */}
          <FocusCoach
            tasks={tasks}
            isOpen={isFocusCoachOpen}
            onClose={() => setIsFocusCoachOpen(false)}
          />

          {/* Footer */}
          <motion.footer
            className="mt-16 text-center text-[var(--color-muted)] text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <p className="flex items-center justify-center gap-2">
              Built with <span className="text-purple-400">💜</span> and a touch of 
              <motion.span
                animate={{
                  y: [0, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                👻
              </motion.span> 
              using Kiro
            </p>
          </motion.footer>
        </div>
      </main>
    </>
  );
}
