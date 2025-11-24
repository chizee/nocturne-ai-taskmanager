/**
 * NOCTURNE WELCOME PAGE SCRIPT
 * Handles button interactions and video controls
 */

(function() {
  'use strict';

  // ============================================
  // DOM ELEMENTS
  // ============================================
  const enterBtn = document.getElementById('enter-btn');
  const unmuteBtn = document.getElementById('unmute-btn');
  const video = document.getElementById('intro-video');
  const soundIcon = document.getElementById('sound-icon');

  // ============================================
  // CONFIGURATION
  // ============================================
  const CONFIG = {
    targetPage: '/', // Redirect to main app (Next.js handles routing)
    fadeOutDuration: 500, // milliseconds
  };

  // ============================================
  // VIDEO CONTROLS
  // ============================================
  
  /**
   * Initialize video playback
   * Ensures video plays on page load with sound
   */
  function initVideo() {
    if (!video) return;

    // Start with audio unmuted
    video.muted = false;
    video.volume = 0.7; // Set to 70% volume for better experience

    // Update icon to show unmuted state
    if (soundIcon) {
      soundIcon.textContent = '🔊';
    }

    // Attempt to play video with sound
    const playPromise = video.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log('Video playback started successfully with audio');
        })
        .catch((error) => {
          console.warn('Video autoplay with audio prevented:', error);
          // Try muted autoplay as fallback
          video.muted = true;
          if (soundIcon) {
            soundIcon.textContent = '🔇';
          }
          video.play().catch(() => {
            // Show a play button if autoplay is completely blocked
            showPlayButton();
          });
        });
    }

    // Handle video errors
    video.addEventListener('error', (e) => {
      console.error('Video loading error:', e);
      // Fallback image will be shown automatically
    });
  }

  /**
   * Toggle video mute/unmute
   */
  function toggleMute() {
    if (!video) return;

    video.muted = !video.muted;
    
    // Update icon
    if (soundIcon) {
      soundIcon.textContent = video.muted ? '🔇' : '🔊';
    }

    // Update aria-label
    if (unmuteBtn) {
      unmuteBtn.setAttribute(
        'aria-label',
        video.muted ? 'Unmute background video' : 'Mute background video'
      );
    }

    // Log for debugging
    console.log('Video muted:', video.muted);
  }

  /**
   * Show play button if autoplay is blocked
   */
  function showPlayButton() {
    const playBtn = document.createElement('button');
    playBtn.className = 'play-btn';
    playBtn.innerHTML = '▶️ PLAY VIDEO';
    playBtn.setAttribute('aria-label', 'Play background video with audio');
    
    playBtn.style.cssText = `
      position: fixed;
      top: 2rem;
      left: 50%;
      transform: translateX(-50%);
      z-index: 30;
      padding: 1rem 2rem;
      background: rgba(147, 51, 234, 0.9);
      color: white;
      border: none;
      border-radius: 50px;
      font-family: 'Cinzel', serif;
      font-size: 1rem;
      font-weight: 600;
      letter-spacing: 0.05em;
      cursor: pointer;
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 20px rgba(147, 51, 234, 0.5);
      transition: all 0.3s ease;
      animation: playBtnPulse 2s ease-in-out infinite;
    `;

    playBtn.addEventListener('click', () => {
      // Unmute and play video
      video.muted = false;
      video.volume = 0.7;
      video.play().then(() => {
        console.log('Video playing with audio after user interaction');
        // Update mute button icon
        if (soundIcon) {
          soundIcon.textContent = '🔊';
        }
        if (unmuteBtn) {
          unmuteBtn.setAttribute('aria-label', 'Mute background video');
        }
        playBtn.remove();
      }).catch((error) => {
        console.error('Failed to play video:', error);
      });
    });

    playBtn.addEventListener('mouseenter', () => {
      playBtn.style.transform = 'translateX(-50%) scale(1.05)';
      playBtn.style.boxShadow = '0 6px 30px rgba(147, 51, 234, 0.7)';
    });

    playBtn.addEventListener('mouseleave', () => {
      playBtn.style.transform = 'translateX(-50%) scale(1)';
      playBtn.style.boxShadow = '0 4px 20px rgba(147, 51, 234, 0.5)';
    });

    document.body.appendChild(playBtn);

    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
      @keyframes playBtnPulse {
        0%, 100% {
          box-shadow: 0 4px 20px rgba(147, 51, 234, 0.5);
        }
        50% {
          box-shadow: 0 4px 30px rgba(147, 51, 234, 0.8);
        }
      }
    `;
    document.head.appendChild(style);
  }

  // ============================================
  // NAVIGATION
  // ============================================
  
  /**
   * Handle enter button click
   * Redirects to main task manager app
   */
  function handleEnter() {
    // Add fade out effect
    document.body.style.transition = `opacity ${CONFIG.fadeOutDuration}ms ease-out`;
    document.body.style.opacity = '0';

    // Redirect after fade out
    setTimeout(() => {
      window.location.href = CONFIG.targetPage;
    }, CONFIG.fadeOutDuration);
  }

  // ============================================
  // KEYBOARD NAVIGATION
  // ============================================
  
  /**
   * Handle keyboard shortcuts
   */
  function handleKeyboard(event) {
    // Enter or Space on enter button
    if (event.key === 'Enter' || event.key === ' ') {
      if (document.activeElement === enterBtn) {
        event.preventDefault();
        handleEnter();
      }
    }

    // M key to toggle mute
    if (event.key === 'm' || event.key === 'M') {
      event.preventDefault();
      toggleMute();
    }

    // Escape key to skip intro
    if (event.key === 'Escape') {
      event.preventDefault();
      handleEnter();
    }
  }

  // ============================================
  // ACCESSIBILITY
  // ============================================
  
  /**
   * Announce page load to screen readers
   */
  function announcePageLoad() {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = 'Welcome to Nocturne Task Manager. Press Enter or click the Launch button to continue.';
    
    announcement.style.cssText = `
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border-width: 0;
    `;
    
    document.body.appendChild(announcement);
  }

  // ============================================
  // EVENT LISTENERS
  // ============================================
  
  /**
   * Initialize all event listeners
   */
  function initEventListeners() {
    // Enter button click
    if (enterBtn) {
      enterBtn.addEventListener('click', handleEnter);
    }

    // Unmute button click
    if (unmuteBtn) {
      unmuteBtn.addEventListener('click', toggleMute);
    }

    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboard);

    // Prevent context menu on video (optional)
    if (video) {
      video.addEventListener('contextmenu', (e) => {
        e.preventDefault();
      });
    }
  }

  // ============================================
  // INITIALIZATION
  // ============================================
  
  /**
   * Initialize the welcome page
   */
  function init() {
    console.log('🌙 Nocturne Welcome Page Initialized');
    
    // Initialize video
    initVideo();
    
    // Set up event listeners
    initEventListeners();
    
    // Accessibility announcement
    announcePageLoad();
    
    // Focus on enter button for keyboard users
    if (enterBtn) {
      enterBtn.focus();
    }
  }

  // ============================================
  // START
  // ============================================
  
  // Wait for DOM to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ============================================
  // PERFORMANCE MONITORING (Optional)
  // ============================================
  
  /**
   * Log performance metrics
   */
  function logPerformance() {
    if ('performance' in window) {
      window.addEventListener('load', () => {
        const perfData = performance.getEntriesByType('navigation')[0];
        if (perfData) {
          console.log('Page Load Time:', perfData.loadEventEnd - perfData.fetchStart, 'ms');
        }
      });
    }
  }

  logPerformance();

})();
