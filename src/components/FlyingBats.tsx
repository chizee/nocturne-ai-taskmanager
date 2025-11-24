/**
 * FlyingBats - Animated bats flying across the screen
 */

'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Bat {
  id: number;
  startY: number;
  duration: number;
  delay: number;
}

export const FlyingBats: React.FC<{ enabled?: boolean }> = ({ enabled = true }) => {
  const [bats, setBats] = useState<Bat[]>([]);

  useEffect(() => {
    if (!enabled) return;

    // Generate random bats periodically
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance every interval
        const newBat: Bat = {
          id: Date.now(),
          startY: Math.random() * 60 + 10, // 10-70% from top
          duration: 3 + Math.random() * 2, // 3-5 seconds
          delay: 0,
        };
        
        setBats(prev => [...prev, newBat]);
        
        // Remove bat after animation
        setTimeout(() => {
          setBats(prev => prev.filter(b => b.id !== newBat.id));
        }, (newBat.duration + newBat.delay) * 1000);
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-20">
      <AnimatePresence>
        {bats.map((bat) => (
          <motion.div
            key={bat.id}
            className="absolute"
            style={{
              top: `${bat.startY}%`,
              left: '-50px',
            }}
            initial={{ x: 0, opacity: 0 }}
            animate={{ 
              x: typeof window !== 'undefined' ? window.innerWidth + 100 : 1200, 
              opacity: [0, 1, 1, 0],
              y: [0, -20, -10, 0, 10, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: bat.duration,
              delay: bat.delay,
              ease: 'linear',
              y: {
                duration: bat.duration / 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }
            }}
          >
            {/* Bat SVG */}
            <svg
              width="40"
              height="30"
              viewBox="0 0 40 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Left wing */}
              <motion.path
                d="M 5 15 Q 0 10 2 5 Q 5 8 8 10 L 15 15 Z"
                fill="#1a0f2e"
                animate={{
                  d: [
                    "M 5 15 Q 0 10 2 5 Q 5 8 8 10 L 15 15 Z",
                    "M 5 15 Q 0 8 2 3 Q 5 6 8 8 L 15 15 Z",
                    "M 5 15 Q 0 10 2 5 Q 5 8 8 10 L 15 15 Z",
                  ],
                }}
                transition={{
                  duration: 0.3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              
              {/* Right wing */}
              <motion.path
                d="M 35 15 Q 40 10 38 5 Q 35 8 32 10 L 25 15 Z"
                fill="#1a0f2e"
                animate={{
                  d: [
                    "M 35 15 Q 40 10 38 5 Q 35 8 32 10 L 25 15 Z",
                    "M 35 15 Q 40 8 38 3 Q 35 6 32 8 L 25 15 Z",
                    "M 35 15 Q 40 10 38 5 Q 35 8 32 10 L 25 15 Z",
                  ],
                }}
                transition={{
                  duration: 0.3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              
              {/* Body */}
              <ellipse cx="20" cy="15" rx="5" ry="8" fill="#0a0a0f" />
              
              {/* Head */}
              <circle cx="20" cy="12" r="3" fill="#0a0a0f" />
              
              {/* Ears */}
              <path d="M 18 10 L 17 8 L 19 10 Z" fill="#0a0a0f" />
              <path d="M 22 10 L 23 8 L 21 10 Z" fill="#0a0a0f" />
            </svg>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

FlyingBats.displayName = 'FlyingBats';
