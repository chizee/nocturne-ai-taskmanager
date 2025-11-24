/**
 * GraveyardScene - Atmospheric background with parallax effects
 */

'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export const GraveyardScene: React.FC = () => {
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!sceneRef.current) return;
      
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      // Calculate parallax offset
      const xOffset = (clientX - innerWidth / 2) / 50;
      const yOffset = (clientY - innerHeight / 2) / 50;
      
      // Apply parallax to layers
      const layers = sceneRef.current.querySelectorAll('.parallax-layer');
      layers.forEach((layer, index) => {
        const speed = (index + 1) * 0.5;
        (layer as HTMLElement).style.transform = 
          `translate(${xOffset * speed}px, ${yOffset * speed}px)`;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div ref={sceneRef} className="graveyard-scene fixed inset-0 -z-10">
      {/* Stars layer */}
      <div className="stars parallax-layer" style={{ zIndex: 1 }} />
      
      {/* Moon */}
      <motion.div
        className="parallax-layer moon"
        style={{ zIndex: 2 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2 }}
      >
        <div 
          className="absolute top-[15%] right-[15%] w-48 h-48 rounded-full"
          style={{
            background: 'radial-gradient(circle, #e8d5ff 0%, #c084fc 50%, transparent 70%)',
            boxShadow: '0 0 60px rgba(168, 139, 250, 0.6), 0 0 120px rgba(168, 139, 250, 0.4)',
          }}
        />
      </motion.div>
      
      {/* Fog layers */}
      <div className="parallax-layer" style={{ zIndex: 3 }}>
        <div className="fog" style={{ animationDelay: '0s', bottom: '10%' }} />
        <div className="fog" style={{ animationDelay: '5s', bottom: '5%', opacity: 0.3 }} />
        <div className="fog" style={{ animationDelay: '10s', bottom: '15%', opacity: 0.4 }} />
      </div>
      
      {/* Tree silhouettes */}
      <motion.div
        className="parallax-layer"
        style={{ zIndex: 4 }}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, delay: 0.5 }}
      >
        <div className="tree tree-left" />
        <div className="tree tree-right" />
      </motion.div>
      
      {/* Ground */}
      <div className="ground parallax-layer" style={{ zIndex: 5 }} />
      
      {/* Floating particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 3}s`,
          }}
        />
      ))}
    </div>
  );
};

GraveyardScene.displayName = 'GraveyardScene';
