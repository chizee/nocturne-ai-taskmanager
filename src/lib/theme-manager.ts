/**
 * ThemeManager - Manages spookiness levels and theme application
 * Requirements: 8.1, 8.5
 */

import { SpookinessLevel, ThemeConfig } from './types';
import { StorageManager } from './storage';
import { getThemeConfig } from './utils';

export class ThemeManager {
  private currentLevel: SpookinessLevel = 'minimal';
  private storage: StorageManager;

  constructor(storage: StorageManager) {
    this.storage = storage;
    this.loadPreferences();
  }

  /**
   * Load preferences and apply saved theme
   */
  private loadPreferences(): void {
    try {
      const preferences = this.storage.loadPreferences();
      this.currentLevel = preferences.spookinessLevel;
      // Only apply theme if we're in the browser
      if (typeof document !== 'undefined') {
        this.applyTheme(this.currentLevel);
      }
    } catch (error) {
      console.error('Failed to load theme preferences:', error);
      if (typeof document !== 'undefined') {
        this.applyTheme('minimal');
      }
    }
  }

  /**
   * Set spookiness level
   * Requirement: 8.1 - Apply theme immediately
   */
  setSpookinessLevel(level: SpookinessLevel): void {
    this.currentLevel = level;
    this.applyTheme(level);
    this.savePreference(level);
  }

  /**
   * Get current spookiness level
   */
  getSpookinessLevel(): SpookinessLevel {
    return this.currentLevel;
  }

  /**
   * Apply theme to document
   * Requirement: 8.1 - Apply corresponding visual theme immediately
   */
  applyTheme(level: SpookinessLevel): void {
    // Only apply theme if we're in the browser
    if (typeof document === 'undefined') {
      return;
    }

    const config = getThemeConfig(level);
    
    // Update CSS custom properties
    const root = document.documentElement;
    
    // Set color variables
    root.style.setProperty('--color-bg', config.colors.background);
    root.style.setProperty('--color-fg', config.colors.foreground);
    root.style.setProperty('--color-primary', config.colors.primary);
    root.style.setProperty('--color-secondary', config.colors.secondary);
    root.style.setProperty('--color-accent', config.colors.accent);
    root.style.setProperty('--color-muted', config.colors.muted);
    
    // Set animation variables
    root.style.setProperty('--transition-duration', `${config.animations.transitionDuration}ms`);
    
    // Update body classes for theme-specific styles
    root.classList.remove('theme-minimal', 'theme-twilight', 'theme-haunted');
    root.classList.add(`theme-${level}`);
    
    // Store animation preferences as data attributes
    root.dataset.breathingGlow = config.animations.breathingGlow.toString();
    root.dataset.particles = config.animations.particles.toString();
  }

  /**
   * Get theme configuration for current level
   */
  getThemeConfig(level?: SpookinessLevel): ThemeConfig {
    return getThemeConfig(level || this.currentLevel);
  }

  /**
   * Save theme preference
   * Requirement: 8.5 - Persist preference
   */
  private savePreference(level: SpookinessLevel): void {
    try {
      const preferences = this.storage.loadPreferences();
      preferences.spookinessLevel = level;
      this.storage.savePreferences(preferences);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  }

  /**
   * Toggle to next spookiness level
   */
  toggleSpookinessLevel(): SpookinessLevel {
    const levels: SpookinessLevel[] = ['minimal', 'twilight', 'haunted'];
    const currentIndex = levels.indexOf(this.currentLevel);
    const nextIndex = (currentIndex + 1) % levels.length;
    const nextLevel = levels[nextIndex];
    
    this.setSpookinessLevel(nextLevel);
    return nextLevel;
  }

  /**
   * Check if animations should be enabled
   * Respects prefers-reduced-motion
   */
  shouldEnableAnimations(): boolean {
    if (typeof window === 'undefined') {
      return true; // Default to enabled on server
    }
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return !prefersReducedMotion;
  }

  /**
   * Get CSS class for current theme
   */
  getThemeClass(): string {
    return `theme-${this.currentLevel}`;
  }

  /**
   * Get background color for current theme
   */
  getBackgroundColor(): string {
    return getThemeConfig(this.currentLevel).colors.background;
  }

  /**
   * Get primary color for current theme
   */
  getPrimaryColor(): string {
    return getThemeConfig(this.currentLevel).colors.primary;
  }
}
