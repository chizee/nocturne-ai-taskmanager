/**
 * LightningFlash - Random lightning flashes for atmosphere
 */

'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSoundManager } from '@/lib/sound-manager';

export const LightningFlash: React.FC<{ enabled?: boolean }> = ({ enabled = true }) => {
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const triggerLightning = () => {
      if (Math.random() > 0.95) { // 5% chance
        setIsFlashing(true);
        
        // Play thunder sound with delay
        setTimeout(() => {
          getSoundManager().play('thunder', 0.2);
        }, 200);
        
        setTimeout(() => {
          setIsFlashing(false);
        }, 150);
      }
    };

    // Check for lightning every 10 seconds
    const interval = setInterval(triggerLightning, 10000);

    return () => clearInterval(interval);
  }, [enabled]);

  if (!enabled) return null;

  return (
    <AnimatePresence>
      {isFlashing && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-30"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0, 0.3, 0, 0.4, 0],
            backgroundColor: ['rgba(168, 139, 250, 0)', 'rgba(168, 139, 250, 0.3)', 'rgba(168, 139, 250, 0)', 'rgba(168, 139, 250, 0.4)', 'rgba(168, 139, 250, 0)']
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        />
      )}
    </AnimatePresence>
  );
};

LightningFlash.displayName = 'LightningFlash';
