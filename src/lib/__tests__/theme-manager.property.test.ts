/**
 * Property-based tests for ThemeManager
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { ThemeManager } from '../theme-manager';
import { StorageManager } from '../storage';
import { SpookinessLevel } from '../types';

describe('ThemeManager Property Tests', () => {
  let themeManager: ThemeManager;
  let storage: StorageManager;

  beforeEach(() => {
    const store: Record<string, string> = {};
    global.localStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => { store[key] = value; },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { Object.keys(store).forEach(key => delete store[key]); },
      key: (index: number) => Object.keys(store)[index] || null,
      length: Object.keys(store).length,
    } as Storage;

    // Mock document for theme application
    global.document = {
      documentElement: {
        style: {
          setProperty: () => {},
        },
        classList: {
          remove: () => {},
          add: () => {},
        },
        dataset: {},
      },
    } as unknown as Document;

    storage = new StorageManager();
    themeManager = new ThemeManager(storage);
  });

  /**
   * Feature: nocturne-task-manager, Property 23: Theme application
   * Validates: Requirements 8.1
   */
  it('Property 23: Theme application', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<SpookinessLevel>('minimal', 'twilight', 'haunted'),
        (level) => {
          themeManager.setSpookinessLevel(level);
          
          const currentLevel = themeManager.getSpookinessLevel();
          expect(currentLevel).toBe(level);
          
          const config = themeManager.getThemeConfig();
          expect(config.level).toBe(level);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: nocturne-task-manager, Property 24: Theme persistence round-trip
   * Validates: Requirements 8.5
   */
  it('Property 24: Theme persistence round-trip', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<SpookinessLevel>('minimal', 'twilight', 'haunted'),
        (level) => {
          // Set theme
          themeManager.setSpookinessLevel(level);
          
          // Create new ThemeManager instance (simulates reload)
          const newThemeManager = new ThemeManager(storage);
          
          // Verify theme persisted
          expect(newThemeManager.getSpookinessLevel()).toBe(level);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should toggle through all spookiness levels', () => {
    // Start at minimal
    themeManager.setSpookinessLevel('minimal');
    
    // Toggle through all levels
    const level1 = themeManager.toggleSpookinessLevel();
    expect(level1).toBe('twilight');
    
    const level2 = themeManager.toggleSpookinessLevel();
    expect(level2).toBe('haunted');
    
    const level3 = themeManager.toggleSpookinessLevel();
    expect(level3).toBe('minimal'); // Should wrap around
  });

  it('should return correct theme configuration for each level', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<SpookinessLevel>('minimal', 'twilight', 'haunted'),
        (level) => {
          const config = themeManager.getThemeConfig(level);
          
          expect(config.level).toBe(level);
          expect(config.colors).toBeDefined();
          expect(config.animations).toBeDefined();
          expect(config.typography).toBeDefined();
          
          // Verify color format
          expect(config.colors.background).toMatch(/^#[0-9a-f]{6}$/i);
          expect(config.colors.primary).toMatch(/^#[0-9a-f]{6}$/i);
          
          // Verify animation settings
          expect(typeof config.animations.breathingGlow).toBe('boolean');
          expect(typeof config.animations.particles).toBe('boolean');
          expect(config.animations.transitionDuration).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
