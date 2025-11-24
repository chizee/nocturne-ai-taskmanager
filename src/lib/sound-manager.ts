/**
 * SoundManager - Handles atmospheric sound effects
 */

export type SoundEffect = 
  | 'task-complete'
  | 'task-delete'
  | 'task-create'
  | 'ghost-whisper'
  | 'stone-crack'
  | 'thunder'
  | 'bat-flutter';

export class SoundManager {
  private sounds: Map<SoundEffect, HTMLAudioElement> = new Map();
  private enabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeSounds();
    }
  }

  /**
   * Initialize sound effects using Web Audio API
   */
  private initializeSounds(): void {
    // We'll use simple oscillator-based sounds for now
    // In production, you'd load actual audio files
  }

  /**
   * Play a sound effect
   */
  play(effect: SoundEffect, volume: number = 0.3): void {
    if (!this.enabled || typeof window === 'undefined') return;

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioContext = new AudioContextClass();
      
      switch (effect) {
        case 'task-complete':
          this.playTaskComplete(audioContext, volume);
          break;
        case 'task-delete':
          this.playTaskDelete(audioContext, volume);
          break;
        case 'task-create':
          this.playTaskCreate(audioContext, volume);
          break;
        case 'ghost-whisper':
          this.playGhostWhisper(audioContext, volume);
          break;
        case 'stone-crack':
          this.playStoneCrack(audioContext, volume);
          break;
        case 'thunder':
          this.playThunder(audioContext, volume);
          break;
        case 'bat-flutter':
          this.playBatFlutter(audioContext, volume);
          break;
      }
    } catch (error: unknown) {
      console.warn('Failed to play sound:', error);
    }
  }

  /**
   * Task completion sound - ascending chime
   */
  private playTaskComplete(ctx: AudioContext, volume: number): void {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    oscillator.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.1); // G5
    
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);
  }

  /**
   * Task deletion sound - descending whoosh
   */
  private playTaskDelete(ctx: AudioContext, volume: number): void {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(400, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(volume * 0.5, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);
  }

  /**
   * Task creation sound - magical sparkle
   */
  private playTaskCreate(ctx: AudioContext, volume: number): void {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
    oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.15);
    
    gainNode.gain.setValueAtTime(volume * 0.4, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.15);
  }

  /**
   * Ghost whisper - eerie low frequency
   */
  private playGhostWhisper(ctx: AudioContext, volume: number): void {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(150, ctx.currentTime);
    oscillator.frequency.linearRampToValueAtTime(120, ctx.currentTime + 0.5);
    
    filter.type = 'lowpass';
    filter.frequency.value = 300;
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume * 0.3, ctx.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
  }

  /**
   * Stone crack - sharp percussive sound
   */
  private playStoneCrack(ctx: AudioContext, volume: number): void {
    const bufferSize = ctx.sampleRate * 0.1;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Generate white noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const source = ctx.createBufferSource();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    source.buffer = buffer;
    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    filter.type = 'highpass';
    filter.frequency.value = 1000;
    
    gainNode.gain.setValueAtTime(volume * 0.6, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    source.start(ctx.currentTime);
  }

  /**
   * Thunder - deep rumble
   */
  private playThunder(ctx: AudioContext, volume: number): void {
    const bufferSize = ctx.sampleRate * 0.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Generate filtered noise for thunder
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    
    const source = ctx.createBufferSource();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    source.buffer = buffer;
    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    filter.type = 'lowpass';
    filter.frequency.value = 200;
    
    gainNode.gain.setValueAtTime(volume * 0.8, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    
    source.start(ctx.currentTime);
  }

  /**
   * Bat flutter - quick high-pitched chirps
   */
  private playBatFlutter(ctx: AudioContext, volume: number): void {
    for (let i = 0; i < 3; i++) {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(2000 + Math.random() * 1000, ctx.currentTime + i * 0.05);
      
      gainNode.gain.setValueAtTime(volume * 0.2, ctx.currentTime + i * 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.05 + 0.03);
      
      oscillator.start(ctx.currentTime + i * 0.05);
      oscillator.stop(ctx.currentTime + i * 0.05 + 0.03);
    }
  }

  /**
   * Enable or disable sound effects
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Check if sounds are enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}

// Singleton instance
let soundManagerInstance: SoundManager | null = null;

export function getSoundManager(): SoundManager {
  if (!soundManagerInstance) {
    soundManagerInstance = new SoundManager();
  }
  return soundManagerInstance;
}
