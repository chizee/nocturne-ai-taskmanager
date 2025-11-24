/**
 * InteractiveGhost - Draggable, playful ghost that follows the cursor
 */

'use client';

import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { getSoundManager } from '@/lib/sound-manager';

export const InteractiveGhost: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [mood, setMood] = useState<'happy' | 'excited' | 'playful'>('happy');
  const ghostRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth spring animation for floating
  const springConfig = { damping: 15, stiffness: 100 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleDragStart = () => {
    setIsDragging(true);
    setMood('excited');
    getSoundManager().play('ghost-whisper', 0.2);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setMood('happy');
    getSoundManager().play('bat-flutter', 0.1);
  };

  const handleClick = () => {
    setMood('playful');
    getSoundManager().play('ghost-whisper', 0.3);
    setTimeout(() => setMood('happy'), 1000);
  };

  return (
    <motion.div
      ref={ghostRef}
      drag
      dragMomentum={false}
      dragElastic={0.1}
      dragConstraints={{
        top: typeof window !== 'undefined' ? -window.innerHeight / 2 + 100 : -300,
        left: typeof window !== 'undefined' ? -window.innerWidth / 2 + 100 : -400,
        right: typeof window !== 'undefined' ? window.innerWidth / 2 - 100 : 400,
        bottom: typeof window !== 'undefined' ? window.innerHeight / 2 - 100 : 300,
      }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative w-32 h-40 cursor-grab active:cursor-grabbing z-50"
      style={{ x: springX, y: springY }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Ghost SVG */}
      <motion.svg
        viewBox="0 0 200 300"
        className="w-full h-full drop-shadow-2xl"
        animate={{
          y: isDragging ? 0 : [0, -15, 0],
          rotate: isDragging ? [0, -5, 5, 0] : [0, -2, 2, 0],
        }}
        transition={{
          y: {
            duration: isDragging ? 0.3 : 3,
            repeat: isDragging ? 0 : Infinity,
            ease: "easeInOut",
          },
          rotate: {
            duration: isDragging ? 0.2 : 4,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
      >
        {/* Glow effect */}
        <defs>
          <filter id="ghost-glow">
            <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <radialGradient id="ghost-gradient">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 1)" />
            <stop offset="100%" stopColor="rgba(200, 200, 255, 0.9)" />
          </radialGradient>
        </defs>

        {/* Ghost body */}
        <motion.path
          d="M 100 50 
             Q 60 50 40 90
             L 40 220
             Q 40 240 50 250
             L 60 240
             Q 70 250 80 240
             L 90 250
             Q 100 240 110 250
             L 120 240
             Q 130 250 140 240
             L 150 250
             Q 160 240 160 220
             L 160 90
             Q 140 50 100 50 Z"
          fill="url(#ghost-gradient)"
          stroke="rgba(168, 139, 250, 0.5)"
          strokeWidth="2"
          filter="url(#ghost-glow)"
          animate={{
            fill: isDragging 
              ? "rgba(255, 200, 255, 0.95)" 
              : isHovered 
              ? "rgba(255, 255, 255, 0.95)"
              : "rgba(255, 255, 255, 0.9)",
          }}
        />
        
        {/* Left eye */}
        <motion.ellipse
          cx="75"
          cy="120"
          rx="12"
          ry={mood === 'excited' ? "25" : "20"}
          fill="#1a0f2e"
          animate={{
            scaleY: mood === 'playful' ? [1, 0.1, 1] : 1,
            cy: isDragging ? 115 : 120,
          }}
          transition={{
            scaleY: {
              duration: 0.3,
              repeat: mood === 'playful' ? 3 : 0,
            },
          }}
        />
        
        {/* Right eye */}
        <motion.ellipse
          cx="125"
          cy="120"
          rx="12"
          ry={mood === 'excited' ? "25" : "20"}
          fill="#1a0f2e"
          animate={{
            scaleY: mood === 'playful' ? [1, 0.1, 1] : 1,
            cy: isDragging ? 115 : 120,
          }}
          transition={{
            scaleY: {
              duration: 0.3,
              repeat: mood === 'playful' ? 3 : 0,
            },
          }}
        />
        
        {/* Mouth */}
        <motion.path
          d={
            mood === 'excited' 
              ? "M 70 160 Q 100 180 130 160" // Big smile
              : mood === 'playful'
              ? "M 80 165 Q 100 170 120 165" // Small smile
              : "M 80 160 Q 100 170 120 160" // Normal smile
          }
          stroke="#1a0f2e"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          animate={{
            d: isDragging
              ? "M 70 160 Q 100 180 130 160"
              : "M 80 160 Q 100 170 120 160",
          }}
        />

        {/* Blush when hovered */}
        {isHovered && (
          <>
            <motion.circle
              cx="65"
              cy="140"
              r="8"
              fill="rgba(255, 150, 200, 0.6)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
            />
            <motion.circle
              cx="135"
              cy="140"
              r="8"
              fill="rgba(255, 150, 200, 0.6)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
            />
          </>
        )}
      </motion.svg>
      
      {/* Floating sparkles */}
      {(isDragging || isHovered) && (
        <>
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-purple-400 rounded-full"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                y: [-10, -40, -10],
                x: [0, Math.random() * 30 - 15, 0],
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: 1.5 + Math.random(),
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
        </>
      )}

      {/* Drag hint (shows on first hover) */}
      {isHovered && !isDragging && (
        <motion.div
          className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-[var(--color-primary)] whitespace-nowrap"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          Drag me around! 👻
        </motion.div>
      )}
    </motion.div>
  );
};

InteractiveGhost.displayName = 'InteractiveGhost';
