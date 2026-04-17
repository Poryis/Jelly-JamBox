// Audio hook for playing bell sounds - supports polyphonic playback
import { useCallback, useRef, useEffect } from 'react';

// Note frequencies for Web Audio API fallback
const NOTE_FREQUENCIES = {
  C: 261.63,
  D: 293.66,
  E: 329.63,
  F: 349.23,
  G: 392.00,
  A: 440.00,
  B: 493.88,
  'High C': 523.25
};

// Bell audio file mapping
const BELL_AUDIO_FILES = {
  C: '/assets/audio/C - Do.mp3',
  D: '/assets/audio/D - Re.mp3',
  E: '/assets/audio/E - Mi.mp3',
  F: '/assets/audio/F - Fa.mp3',
  G: '/assets/audio/G - So.mp3',
  A: '/assets/audio/A - La.mp3',
  B: '/assets/audio/B - ti.mp3',
  'High C': '/assets/audio/High C - High Do.mp3'
};

// Drum audio file mapping  
const DRUM_AUDIO_FILES = {
  kick: '/assets/audio/Bass drum - kick.mp3',
  snare: '/assets/audio/Snare.mp3',
  hihat: '/assets/audio/Hi Hat closed.mp3',
  crash: '/assets/audio/Crash cymbal.mp3',
  ride: '/assets/audio/Ride.mp3',
  tom: '/assets/audio/Tom.mp3',
  lowTom: '/assets/audio/Low Tom.mp3'
};

export function useAudio() {
  const audioContextRef = useRef(null);
  const audioBuffersRef = useRef({});
  const loadedRef = useRef(false);

  // Initialize audio context
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Resume if suspended (for autoplay policies)
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  // Preload audio files
  const preloadAudio = useCallback(async () => {
    if (loadedRef.current) return;
    
    const ctx = initAudioContext();
    const allFiles = { ...BELL_AUDIO_FILES, ...DRUM_AUDIO_FILES };
    
    const loadPromises = Object.entries(allFiles).map(async ([note, url]) => {
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        audioBuffersRef.current[note] = audioBuffer;
      } catch (error) {
        console.warn(`Could not load audio for ${note}:`, error);
      }
    });

    await Promise.all(loadPromises);
    loadedRef.current = true;
  }, [initAudioContext]);

  // Play a bell note - supports polyphonic playback (multiple notes at once)
  const playBellNote = useCallback((note) => {
    const ctx = initAudioContext();

    // Try to play loaded audio file
    const buffer = audioBuffersRef.current[note];
    if (buffer) {
      // Create a NEW source node each time (allows polyphonic playback)
      const source = ctx.createBufferSource();
      const gainNode = ctx.createGain();
      
      source.buffer = buffer;
      gainNode.gain.setValueAtTime(0.7, ctx.currentTime);
      
      source.connect(gainNode);
      gainNode.connect(ctx.destination);
      source.start(0);
      return;
    }

    // Fallback to synthesized tone
    const freq = NOTE_FREQUENCIES[note];
    if (!freq) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(freq, ctx.currentTime);

    // Bell-like envelope
    gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.8);
  }, [initAudioContext]);

  // Play drum sound - supports polyphonic playback
  const playDrumSound = useCallback((drum) => {
    const ctx = initAudioContext();

    const buffer = audioBuffersRef.current[drum];
    if (buffer) {
      const source = ctx.createBufferSource();
      const gainNode = ctx.createGain();
      
      source.buffer = buffer;
      gainNode.gain.setValueAtTime(0.8, ctx.currentTime);
      
      source.connect(gainNode);
      gainNode.connect(ctx.destination);
      source.start(0);
    }
  }, [initAudioContext]);

  // Play success/feedback sound
  const playFeedbackSound = useCallback((type) => {
    const ctx = initAudioContext();

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    if (type === 'perfect') {
      oscillator.frequency.setValueAtTime(523.25, ctx.currentTime);
      oscillator.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
    } else if (type === 'miss') {
      oscillator.frequency.setValueAtTime(200, ctx.currentTime);
    } else {
      oscillator.frequency.setValueAtTime(440, ctx.currentTime);
    }

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);
  }, [initAudioContext]);

  // Preload on mount
  useEffect(() => {
    preloadAudio();
  }, [preloadAudio]);

  return {
    playBellNote,
    playDrumSound,
    playFeedbackSound,
    preloadAudio,
    initAudioContext
  };
}

export default useAudio;
