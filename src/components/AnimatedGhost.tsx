/**
 * AnimatedGhost - Floating ghost for empty state
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const AnimatedGhost: React.FC = () => {
  return (
    <motion.div
      className="relative w-48 h-64 mx-auto"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
    >
      {/* Ghost SVG */}
      <motion.svg
        viewBox="0 0 200 300"
        className="w-full h-full ghost-float"
        animate={{
          y: [0, -20, 0],
          rotate: [0, -2, 2, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
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
          fill="rgba(255, 255, 255, 0.9)"
          stroke="rgba(168, 139, 250, 0.5)"
          strokeWidth="2"
          filter="url(#glow)"
        />
        
        {/* Left eye */}
        <motion.ellipse
          cx="75"
          cy="120"
          rx="12"
          ry="20"
          fill="#1a0f2e"
          animate={{
            scaleY: [1, 0.1, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 2,
          }}
        />
        
        {/* Right eye */}
        <motion.ellipse
          cx="125"
          cy="120"
          rx="12"
          ry="20"
          fill="#1a0f2e"
          animate={{
            scaleY: [1, 0.1, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 2,
          }}
        />
        
        {/* Sad mouth */}
        <motion.path
          d="M 80 160 Q 100 150 120 160"
          stroke="#1a0f2e"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          animate={{
            d: [
              "M 80 160 Q 100 150 120 160",
              "M 80 155 Q 100 145 120 155",
              "M 80 160 Q 100 150 120 160",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Glow filter */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      </motion.svg>
      
      {/* Floating sparkles around ghost */}
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-purple-400 rounded-full"
          style={{
            left: `${20 + Math.random() * 60}%`,
            top: `${20 + Math.random() * 60}%`,
          }}
          animate={{
            y: [-10, -30, -10],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.3,
          }}
        />
      ))}
    </motion.div>
  );
};

AnimatedGhost.displayName = 'AnimatedGhost';
