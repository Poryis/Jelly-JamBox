import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Play, Square, Trash2, Plus, Minus } from 'lucide-react';
import { BELLS } from '../components/JellyBells';
import { GameHeader } from '../components/GameUI';
import useAudio from '../hooks/useAudio';

const STEPS = 16; // 16-step sequencer
const DEFAULT_BPM = 100;

// Available tracks with instruments
const TRACK_PRESETS = [
  { id: 'bells_C', label: 'Do (C)', type: 'bell', note: 'C', color: '#FF3B30' },
  { id: 'bells_D', label: 'Re (D)', type: 'bell', note: 'D', color: '#FF9500' },
  { id: 'bells_E', label: 'Mi (E)', type: 'bell', note: 'E', color: '#FFCC00' },
  { id: 'bells_F', label: 'Fa (F)', type: 'bell', note: 'F', color: '#4CD964' },
  { id: 'bells_G', label: 'So (G)', type: 'bell', note: 'G', color: '#34A853' },
  { id: 'bells_A', label: 'La (A)', type: 'bell', note: 'A', color: '#4285F4' },
  { id: 'bells_B', label: 'Ti (B)', type: 'bell', note: 'B', color: '#AF52DE' },
  { id: 'bells_HC', label: 'Do (Hi)', type: 'bell', note: 'High C', color: '#FF2D55' },
  { id: 'drum_kick', label: 'Kick', type: 'drum', note: 'kick', color: '#E74C3C' },
  { id: 'drum_snare', label: 'Snare', type: 'drum', note: 'snare', color: '#3498DB' },
  { id: 'drum_hihat', label: 'Hi-Hat', type: 'drum', note: 'hihat', color: '#F1C40F' },
  { id: 'drum_crash', label: 'Crash', type: 'drum', note: 'crash', color: '#E67E22' },
];

// Pre-made loop patterns
const LOOP_PRESETS = {
  'Basic Beat': {
    drum_kick:  [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
    drum_snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
    drum_hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
  },
  'Funk Beat': {
    drum_kick:  [1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0],
    drum_snare: [0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,0],
    drum_hihat: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  },
  'Do-Mi-So': {
    bells_C:    [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
    bells_E:    [0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0],
    bells_G:    [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
  },
  'Scale Up': {
    bells_C:    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    bells_D:    [0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
    bells_E:    [0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
    bells_F:    [0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0],
    bells_G:    [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
    bells_A:    [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0],
    bells_B:    [0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],
    bells_HC:   [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0],
  },
  'Rock Pattern': {
    drum_kick:  [1,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0],
    drum_snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
    drum_hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
    drum_crash: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  },
};

function LoopStudioPage() {
  const navigate = useNavigate();
  const { playBellNote, playDrumSound, initAudioContext } = useAudio();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [bpm, setBpm] = useState(DEFAULT_BPM);
  const [activeTracks, setActiveTracks] = useState(['drum_kick', 'drum_snare', 'drum_hihat', 'bells_C', 'bells_E', 'bells_G']);
  const [grid, setGrid] = useState({});
  const [mutedTracks, setMutedTracks] = useState(new Set());

  const intervalRef = useRef(null);
  const gridRef = useRef(grid);
  const mutedRef = useRef(mutedTracks);

  // Keep refs in sync
  useEffect(() => { gridRef.current = grid; }, [grid]);
  useEffect(() => { mutedRef.current = mutedTracks; }, [mutedTracks]);

  // Initialize grid for active tracks
  useEffect(() => {
    setGrid(prev => {
      const newGrid = { ...prev };
      activeTracks.forEach(trackId => {
        if (!newGrid[trackId]) {
          newGrid[trackId] = new Array(STEPS).fill(0);
        }
      });
      return newGrid;
    });
  }, [activeTracks]);

  // Toggle a cell in the grid
  const toggleCell = useCallback((trackId, step) => {
    setGrid(prev => {
      const newGrid = { ...prev };
      const track = [...(newGrid[trackId] || new Array(STEPS).fill(0))];
      track[step] = track[step] ? 0 : 1;
      newGrid[trackId] = track;
      return newGrid;
    });
  }, []);

  // Play a step
  const playStep = useCallback((step) => {
    const currentGrid = gridRef.current;
    const muted = mutedRef.current;

    Object.entries(currentGrid).forEach(([trackId, steps]) => {
      if (muted.has(trackId)) return;
      if (steps[step]) {
        const preset = TRACK_PRESETS.find(p => p.id === trackId);
        if (preset?.type === 'bell') {
          playBellNote(preset.note);
        } else if (preset?.type === 'drum') {
          playDrumSound(preset.note);
        }
      }
    });
  }, [playBellNote, playDrumSound]);

  // Play/Stop loop
  const togglePlay = useCallback(() => {
    initAudioContext();
    if (isPlaying) {
      clearInterval(intervalRef.current);
      setIsPlaying(false);
      setCurrentStep(-1);
    } else {
      setIsPlaying(true);
      let step = 0;
      const msPerStep = (60 / bpm / 4) * 1000;
      
      playStep(0);
      setCurrentStep(0);

      intervalRef.current = setInterval(() => {
        step = (step + 1) % STEPS;
        setCurrentStep(step);
        playStep(step);
      }, msPerStep);
    }
  }, [isPlaying, bpm, initAudioContext, playStep]);

  // Update interval when BPM changes while playing
  useEffect(() => {
    if (!isPlaying) return;
    clearInterval(intervalRef.current);
    let step = currentStep;
    const msPerStep = (60 / bpm / 4) * 1000;
    intervalRef.current = setInterval(() => {
      step = (step + 1) % STEPS;
      setCurrentStep(step);
      playStep(step);
    }, msPerStep);
    return () => clearInterval(intervalRef.current);
  }, [bpm]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup on unmount
  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  // Load a preset
  const loadPreset = useCallback((presetName) => {
    const preset = LOOP_PRESETS[presetName];
    if (!preset) return;
    
    const trackIds = Object.keys(preset);
    setActiveTracks(prev => {
      const combined = new Set([...prev, ...trackIds]);
      return [...combined];
    });
    setGrid(prev => {
      const newGrid = { ...prev };
      Object.entries(preset).forEach(([trackId, steps]) => {
        newGrid[trackId] = [...steps];
      });
      return newGrid;
    });
  }, []);

  // Clear all
  const clearAll = useCallback(() => {
    setGrid(prev => {
      const newGrid = {};
      Object.keys(prev).forEach(k => {
        newGrid[k] = new Array(STEPS).fill(0);
      });
      return newGrid;
    });
  }, []);

  // Toggle track mute
  const toggleMute = useCallback((trackId) => {
    setMutedTracks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(trackId)) newSet.delete(trackId);
      else newSet.add(trackId);
      return newSet;
    });
  }, []);

  // Add a track
  const addTrack = useCallback((trackId) => {
    if (!activeTracks.includes(trackId)) {
      setActiveTracks(prev => [...prev, trackId]);
    }
  }, [activeTracks]);

  // Remove a track
  const removeTrack = useCallback((trackId) => {
    setActiveTracks(prev => prev.filter(t => t !== trackId));
    setGrid(prev => {
      const newGrid = { ...prev };
      delete newGrid[trackId];
      return newGrid;
    });
  }, []);

  const availableTracks = TRACK_PRESETS.filter(t => !activeTracks.includes(t.id));

  return (
    <div 
      className="min-h-screen flex flex-col"
      data-testid="loop-studio-page"
      style={{ backgroundImage: 'url(/assets/backgrounds/playground.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <GameHeader title="Loop Studio" showHomeButton={true} />

      <main className="flex-1 pt-20 pb-4 px-2 md:px-4 overflow-auto">
        {/* Controls Bar */}
        <div className="max-w-6xl mx-auto mb-4">
          <div className="game-card p-3 flex flex-wrap items-center gap-3 justify-between">
            {/* Play/Stop */}
            <motion.button
              data-testid="loop-play-button"
              className={`chunky-btn px-5 py-2 flex items-center gap-2 text-white font-bold ${isPlaying ? 'bg-[var(--jma-red)]' : 'bg-[var(--jma-green)]'}`}
              onClick={togglePlay}
              whileTap={{ scale: 0.95 }}
            >
              {isPlaying ? <Square className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              {isPlaying ? 'STOP' : 'PLAY'}
            </motion.button>

            {/* BPM */}
            <div className="flex items-center gap-2">
              <button className="chunky-btn bg-white p-2" onClick={() => setBpm(b => Math.max(60, b - 10))} data-testid="bpm-minus">
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-bold text-lg font-display w-20 text-center" style={{ color: 'var(--jma-dark)' }}>
                {bpm} BPM
              </span>
              <button className="chunky-btn bg-white p-2" onClick={() => setBpm(b => Math.min(200, b + 10))} data-testid="bpm-plus">
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Presets */}
            <div className="flex gap-1 flex-wrap">
              {Object.keys(LOOP_PRESETS).map(name => (
                <button key={name} data-testid={`preset-${name.replace(/\s/g, '-')}`}
                  className="px-2 py-1 rounded-lg text-xs font-bold border-2 border-[var(--jma-dark)] bg-white hover:bg-[var(--jma-yellow)] transition-colors"
                  onClick={() => loadPreset(name)}
                >
                  {name}
                </button>
              ))}
            </div>

            {/* Clear */}
            <button className="chunky-btn bg-white p-2" onClick={clearAll} data-testid="clear-all">
              <Trash2 className="w-4 h-4" style={{ color: 'var(--jma-red)' }} />
            </button>
          </div>
        </div>

        {/* Step indicator */}
        <div className="max-w-6xl mx-auto mb-1">
          <div className="flex ml-24 md:ml-32">
            {Array.from({ length: STEPS }, (_, i) => (
              <div key={i} className="flex-1 text-center">
                <div className={`w-3 h-3 mx-auto rounded-full ${currentStep === i ? 'bg-[var(--jma-yellow)]' : 'bg-transparent'}`} 
                  style={{ boxShadow: currentStep === i ? '0 0 8px var(--jma-yellow)' : 'none' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="game-card p-3 overflow-x-auto">
            {activeTracks.map(trackId => {
              const preset = TRACK_PRESETS.find(p => p.id === trackId);
              const steps = grid[trackId] || new Array(STEPS).fill(0);
              const isMuted = mutedTracks.has(trackId);

              return (
                <div key={trackId} className="flex items-center gap-1 mb-1" data-testid={`track-${trackId}`}>
                  {/* Track label */}
                  <div className="w-20 md:w-28 flex-shrink-0 flex items-center gap-1">
                    <button className={`px-2 py-1 rounded-lg text-xs font-bold border-2 truncate flex-1 ${isMuted ? 'opacity-40' : ''}`}
                      style={{ backgroundColor: preset?.color + '30', borderColor: preset?.color, color: 'var(--jma-dark)' }}
                      onClick={() => toggleMute(trackId)}
                      data-testid={`mute-${trackId}`}
                    >
                      {preset?.label}
                    </button>
                    <button className="text-xs opacity-50 hover:opacity-100" onClick={() => removeTrack(trackId)}>x</button>
                  </div>

                  {/* Steps */}
                  <div className="flex gap-[2px] flex-1">
                    {steps.map((active, stepIdx) => (
                      <button
                        key={stepIdx}
                        data-testid={`cell-${trackId}-${stepIdx}`}
                        className={`loop-grid-cell flex-1 h-8 md:h-10 ${active ? 'active' : ''} ${currentStep === stepIdx && isPlaying ? 'playing' : ''}`}
                        style={{
                          backgroundColor: active ? (preset?.color || '#ccc') : (stepIdx % 4 === 0 ? '#f0f0f0' : '#fafafa'),
                          opacity: isMuted ? 0.3 : 1
                        }}
                        onClick={() => toggleCell(trackId, stepIdx)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Add track */}
            {availableTracks.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                <span className="text-xs font-bold opacity-60 self-center mr-2">Add:</span>
                {availableTracks.map(track => (
                  <button key={track.id}
                    className="px-2 py-1 rounded text-xs font-bold border border-dashed border-[var(--jma-dark)] hover:bg-white/50"
                    onClick={() => addTrack(track.id)}
                    data-testid={`add-track-${track.id}`}
                  >
                    + {track.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default LoopStudioPage;
