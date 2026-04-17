import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Play, Square, Trash2, Plus, Minus, Volume2 } from 'lucide-react';
import { BELLS } from '../components/JellyBells';
import { GameHeader } from '../components/GameUI';
import { PageCharacters } from '../components/PageCharacters';
import { FullscreenButton } from '../components/FullscreenButton';
import useAudio from '../hooks/useAudio';

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
  { id: 'scratch_pull', label: 'Scratch Pull', type: 'scratch', note: 'scratchPull', color: '#1ABC9C' },
  { id: 'scratch_push', label: 'Scratch Push', type: 'scratch', note: 'scratchPush', color: '#16A085' },
  { id: 'scratch_pp', label: 'Scratch P/P', type: 'scratch', note: 'scratchPushPull', color: '#2ECC71' },
];

// More presets - melodic ones that work together!
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
  'Rock Pattern': {
    drum_kick:  [1,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0],
    drum_snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
    drum_hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
    drum_crash: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
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
  'Arpeggio': {
    bells_C:    [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
    bells_E:    [0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0],
    bells_G:    [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
    bells_HC:   [0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0],
  },
  'Waltz Feel': {
    bells_C:    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    bells_E:    [0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0],
    bells_G:    [0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],
    drum_kick:  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    drum_hihat: [0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
  },
  'Happy Song': {
    bells_C:    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    bells_D:    [0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
    bells_E:    [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
    bells_C:    [1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],
    bells_F:    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0],
    drum_kick:  [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
    drum_snare: [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
  },
  'Jelly Jam': {
    bells_G:    [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0],
    bells_E:    [0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0],
    bells_C:    [0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0],
    drum_kick:  [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
    drum_hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
    drum_snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
  },
  'Scratch Mix': {
    drum_kick:     [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
    drum_hihat:    [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
    scratch_pull:  [0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0],
    scratch_push:  [0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0],
  },
};

// Measure lengths
const MEASURE_OPTIONS = [
  { label: '1 Bar', steps: 16 },
  { label: '2 Bars', steps: 32 },
  { label: '4 Bars', steps: 64 },
];

function LoopStudioPage() {
  const navigate = useNavigate();
  const { playBellNote, playDrumSound, initAudioContext } = useAudio();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [bpm, setBpm] = useState(DEFAULT_BPM);
  const [totalSteps, setTotalSteps] = useState(16);
  const [activeTracks, setActiveTracks] = useState(['drum_kick', 'drum_snare', 'drum_hihat', 'bells_C', 'bells_E', 'bells_G']);
  const [grid, setGrid] = useState({});
  const [mutedTracks, setMutedTracks] = useState(new Set());

  const intervalRef = useRef(null);
  const gridRef = useRef(grid);
  const mutedRef = useRef(mutedTracks);
  const totalStepsRef = useRef(totalSteps);

  useEffect(() => { gridRef.current = grid; }, [grid]);
  useEffect(() => { mutedRef.current = mutedTracks; }, [mutedTracks]);
  useEffect(() => { totalStepsRef.current = totalSteps; }, [totalSteps]);

  // Initialize grid for active tracks
  useEffect(() => {
    setGrid(prev => {
      const newGrid = { ...prev };
      activeTracks.forEach(trackId => {
        if (!newGrid[trackId] || newGrid[trackId].length < totalSteps) {
          const existing = newGrid[trackId] || [];
          newGrid[trackId] = [...existing, ...new Array(totalSteps - existing.length).fill(0)];
        }
      });
      return newGrid;
    });
  }, [activeTracks, totalSteps]);

  const toggleCell = useCallback((trackId, step) => {
    setGrid(prev => {
      const newGrid = { ...prev };
      const track = [...(newGrid[trackId] || new Array(totalSteps).fill(0))];
      track[step] = track[step] ? 0 : 1;
      newGrid[trackId] = track;
      return newGrid;
    });
  }, [totalSteps]);

  // Play a sound for preview
  const previewSound = useCallback((trackId) => {
    initAudioContext();
    const preset = TRACK_PRESETS.find(p => p.id === trackId);
    if (!preset) return;
    if (preset.type === 'bell') playBellNote(preset.note);
    else playDrumSound(preset.note);
  }, [initAudioContext, playBellNote, playDrumSound]);

  const playStep = useCallback((step) => {
    const currentGrid = gridRef.current;
    const muted = mutedRef.current;
    Object.entries(currentGrid).forEach(([trackId, steps]) => {
      if (muted.has(trackId)) return;
      if (steps[step]) {
        const preset = TRACK_PRESETS.find(p => p.id === trackId);
        if (preset?.type === 'bell') playBellNote(preset.note);
        else if (preset?.type === 'drum' || preset?.type === 'scratch') playDrumSound(preset.note);
      }
    });
  }, [playBellNote, playDrumSound]);

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
        step = (step + 1) % totalStepsRef.current;
        setCurrentStep(step);
        playStep(step);
      }, msPerStep);
    }
  }, [isPlaying, bpm, initAudioContext, playStep]);

  useEffect(() => {
    if (!isPlaying) return;
    clearInterval(intervalRef.current);
    let step = currentStep;
    const msPerStep = (60 / bpm / 4) * 1000;
    intervalRef.current = setInterval(() => {
      step = (step + 1) % totalStepsRef.current;
      setCurrentStep(step);
      playStep(step);
    }, msPerStep);
    return () => clearInterval(intervalRef.current);
  }, [bpm, totalSteps]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const loadPreset = useCallback((presetName) => {
    const preset = LOOP_PRESETS[presetName];
    if (!preset) return;
    const trackIds = Object.keys(preset);
    setActiveTracks(prev => [...new Set([...prev, ...trackIds])]);
    setGrid(prev => {
      const newGrid = { ...prev };
      Object.entries(preset).forEach(([trackId, steps]) => {
        // Extend pattern to fill current totalSteps by repeating
        const extended = [];
        for (let i = 0; i < totalSteps; i++) {
          extended.push(steps[i % steps.length]);
        }
        newGrid[trackId] = extended;
      });
      return newGrid;
    });
  }, [totalSteps]);

  const clearAll = useCallback(() => {
    setGrid(prev => {
      const newGrid = {};
      Object.keys(prev).forEach(k => { newGrid[k] = new Array(totalSteps).fill(0); });
      return newGrid;
    });
  }, [totalSteps]);

  const toggleMute = useCallback((trackId) => {
    setMutedTracks(prev => {
      const s = new Set(prev);
      if (s.has(trackId)) s.delete(trackId); else s.add(trackId);
      return s;
    });
  }, []);

  const addTrack = useCallback((trackId) => {
    if (!activeTracks.includes(trackId)) {
      setActiveTracks(prev => [...prev, trackId]);
    }
  }, [activeTracks]);

  const removeTrack = useCallback((trackId) => {
    setActiveTracks(prev => prev.filter(t => t !== trackId));
    setGrid(prev => { const g = { ...prev }; delete g[trackId]; return g; });
  }, []);

  // Handle measure change
  const changeMeasures = useCallback((newSteps) => {
    if (isPlaying) {
      clearInterval(intervalRef.current);
      setIsPlaying(false);
      setCurrentStep(-1);
    }
    setTotalSteps(newSteps);
    // Extend or trim grid
    setGrid(prev => {
      const newGrid = {};
      Object.entries(prev).forEach(([trackId, steps]) => {
        if (steps.length < newSteps) {
          // Repeat pattern to fill
          const extended = [];
          for (let i = 0; i < newSteps; i++) extended.push(steps[i % steps.length]);
          newGrid[trackId] = extended;
        } else {
          newGrid[trackId] = steps.slice(0, newSteps);
        }
      });
      return newGrid;
    });
  }, [isPlaying]);

  const availableTracks = TRACK_PRESETS.filter(t => !activeTracks.includes(t.id));
  const measureBars = totalSteps / 16;

  return (
    <div className="min-h-screen flex flex-col" data-testid="loop-studio-page"
      style={{ backgroundImage: 'url(/assets/backgrounds/playground.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <GameHeader title="Loop Studio" showHomeButton={true} />
      <FullscreenButton />

      <main className="flex-1 pt-20 pb-4 px-2 md:px-4 overflow-auto">
        {/* Controls Bar */}
        <div className="max-w-6xl mx-auto mb-3">
          <div className="game-card p-3 flex flex-wrap items-center gap-2 justify-between">
            {/* Play/Stop */}
            <motion.button data-testid="loop-play-button"
              className={`chunky-btn px-5 py-2 flex items-center gap-2 text-white font-bold ${isPlaying ? 'bg-[var(--jma-red)]' : 'bg-[var(--jma-green)]'}`}
              onClick={togglePlay} whileTap={{ scale: 0.95 }}>
              {isPlaying ? <Square className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              {isPlaying ? 'STOP' : 'PLAY'}
            </motion.button>

            {/* BPM */}
            <div className="flex items-center gap-1">
              <button className="chunky-btn bg-white p-1.5" onClick={() => setBpm(b => Math.max(60, b - 10))} data-testid="bpm-minus"><Minus className="w-4 h-4" /></button>
              <span className="font-bold text-base font-display w-16 text-center" style={{ color: 'var(--jma-dark)' }}>{bpm} BPM</span>
              <button className="chunky-btn bg-white p-1.5" onClick={() => setBpm(b => Math.min(200, b + 10))} data-testid="bpm-plus"><Plus className="w-4 h-4" /></button>
            </div>

            {/* Measure selector */}
            <div className="flex items-center gap-1">
              {MEASURE_OPTIONS.map(opt => (
                <button key={opt.steps} data-testid={`measure-${opt.steps}`}
                  className={`px-2 py-1 rounded-lg text-xs font-bold border-2 border-[var(--jma-dark)] transition-all ${totalSteps === opt.steps ? 'bg-[var(--jma-dark)] text-white' : 'bg-white'}`}
                  onClick={() => changeMeasures(opt.steps)}>
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Clear */}
            <button className="chunky-btn bg-white p-1.5" onClick={clearAll} data-testid="clear-all">
              <Trash2 className="w-4 h-4" style={{ color: 'var(--jma-red)' }} />
            </button>
          </div>
        </div>

        {/* Presets */}
        <div className="max-w-6xl mx-auto mb-2">
          <div className="flex gap-1 flex-wrap justify-center">
            {Object.keys(LOOP_PRESETS).map(name => (
              <button key={name} data-testid={`preset-${name.replace(/\s/g, '-')}`}
                className="px-2 py-1 rounded-lg text-xs font-bold border-2 border-[var(--jma-dark)] bg-white hover:bg-[var(--jma-yellow)] transition-colors"
                onClick={() => loadPreset(name)}>
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Step indicator */}
        <div className="max-w-6xl mx-auto mb-1">
          <div className="flex ml-24 md:ml-32 overflow-x-auto">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i} className="text-center" style={{ minWidth: totalSteps > 16 ? '20px' : 'auto', flex: totalSteps <= 16 ? 1 : 'none' }}>
                <div className={`w-2.5 h-2.5 mx-auto rounded-full ${currentStep === i ? 'bg-[var(--jma-yellow)]' : 'bg-transparent'}`}
                  style={{ boxShadow: currentStep === i ? '0 0 8px var(--jma-yellow)' : 'none' }} />
                {i % 16 === 0 && totalSteps > 16 && (
                  <span className="text-[8px] font-bold opacity-40">{Math.floor(i/16)+1}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="game-card p-3 overflow-x-auto">
            {activeTracks.map(trackId => {
              const preset = TRACK_PRESETS.find(p => p.id === trackId);
              const steps = grid[trackId] || new Array(totalSteps).fill(0);
              const isMuted = mutedTracks.has(trackId);

              return (
                <div key={trackId} className="flex items-center gap-1 mb-1" data-testid={`track-${trackId}`}>
                  {/* Track label with preview button */}
                  <div className="w-24 md:w-32 flex-shrink-0 flex items-center gap-0.5">
                    {/* Preview sound button */}
                    <button
                      className="w-5 h-5 rounded flex items-center justify-center hover:bg-white/50 flex-shrink-0"
                      onClick={() => previewSound(trackId)}
                      data-testid={`preview-${trackId}`}
                      title={`Preview ${preset?.label}`}
                    >
                      <Volume2 className="w-3 h-3" style={{ color: preset?.color }} />
                    </button>
                    <button className={`px-1.5 py-1 rounded-lg text-xs font-bold border-2 truncate flex-1 ${isMuted ? 'opacity-40' : ''}`}
                      style={{ backgroundColor: preset?.color + '30', borderColor: preset?.color, color: 'var(--jma-dark)' }}
                      onClick={() => toggleMute(trackId)}
                      data-testid={`mute-${trackId}`}>
                      {preset?.label}
                    </button>
                    <button className="text-xs opacity-50 hover:opacity-100 flex-shrink-0" onClick={() => removeTrack(trackId)}>x</button>
                  </div>

                  {/* Steps */}
                  <div className="flex gap-[2px] flex-1 overflow-x-auto">
                    {steps.slice(0, totalSteps).map((active, stepIdx) => (
                      <button key={stepIdx} data-testid={`cell-${trackId}-${stepIdx}`}
                        className={`loop-grid-cell h-7 md:h-9 ${active ? 'active' : ''} ${currentStep === stepIdx && isPlaying ? 'playing' : ''}`}
                        style={{
                          minWidth: totalSteps > 16 ? '18px' : 'auto',
                          flex: totalSteps <= 16 ? 1 : 'none',
                          backgroundColor: active ? (preset?.color || '#ccc') : (stepIdx % 4 === 0 ? '#f0f0f0' : '#fafafa'),
                          opacity: isMuted ? 0.3 : 1,
                          borderLeft: stepIdx % 16 === 0 && stepIdx > 0 ? '2px solid var(--jma-dark)' : undefined
                        }}
                        onClick={() => toggleCell(trackId, stepIdx)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Add track with preview */}
            {availableTracks.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                <span className="text-xs font-bold opacity-60 self-center mr-1">Add:</span>
                {availableTracks.map(track => (
                  <div key={track.id} className="flex items-center gap-0.5">
                    <button
                      className="w-5 h-5 rounded flex items-center justify-center hover:bg-white/50"
                      onClick={() => previewSound(track.id)}
                      title={`Preview ${track.label}`}
                    >
                      <Volume2 className="w-3 h-3" style={{ color: track.color }} />
                    </button>
                    <button
                      className="px-2 py-1 rounded text-xs font-bold border border-dashed border-[var(--jma-dark)] hover:bg-white/50"
                      onClick={() => addTrack(track.id)}
                      data-testid={`add-track-${track.id}`}>
                      + {track.label}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <PageCharacters page="loop-studio" />
    </div>
  );
}

export default LoopStudioPage;
