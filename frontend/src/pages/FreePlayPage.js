import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Music, Circle, Square, Play, RotateCcw, ChevronRight, Volume2 } from 'lucide-react';
import { BELLS, KEY_TO_NOTE } from '../components/JellyBells';
import { GameHeader, NotationDisplay } from '../components/GameUI';
import { XylophoneInstrument, PianoInstrument } from '../components/Instruments';
import { FullscreenButton } from '../components/FullscreenButton';
import useAudio from '../hooks/useAudio';

// Guided songs
const GUIDED_SONGS = [
  { name: 'Do Re Mi', notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'High C'] },
  { name: 'Hot Cross Buns', notes: ['E', 'D', 'C', 'E', 'D', 'C', 'C', 'C', 'C', 'C', 'D', 'D', 'D', 'D', 'E', 'D', 'C'] },
  { name: 'Mary Had a Lamb', notes: ['E', 'D', 'C', 'D', 'E', 'E', 'E', 'D', 'D', 'D', 'E', 'G', 'G'] },
  { name: 'Ode to Joy', notes: ['E', 'E', 'F', 'G', 'G', 'F', 'E', 'D', 'C', 'C', 'D', 'E', 'E', 'D', 'D'] },
];

// Sound modes with image config
const SOUND_MODES = [
  { id: 'bells', label: 'Jelly Bells' },
  { id: 'xylophone', label: 'Xylophone' },
  { id: 'piano', label: 'Piano' },
];

// Xylophone bar images per note
const XYLO_IMAGES = {
  C: '/assets/xylophone/bars/C bar.png',
  D: '/assets/xylophone/bars/D bar.png',
  E: '/assets/xylophone/bars/E bar.png',
  F: '/assets/xylophone/bars/F bar.png',
  G: '/assets/xylophone/bars/G bar.png',
  A: '/assets/xylophone/bars/A bar.png',
  B: '/assets/xylophone/bars/B bar.png',
  'High C': '/assets/xylophone/bars/High C bar.png',
};

// Piano key images per note (solfège naming)
const PIANO_IMAGES = {
  C: '/assets/piano/keys/Do.png',
  D: '/assets/piano/keys/Re.png',
  E: '/assets/piano/keys/Mi.png',
  F: '/assets/piano/keys/Fa.png',
  G: '/assets/piano/keys/So.png',
  A: '/assets/piano/keys/La.png',
  B: '/assets/piano/keys/Ti.png',
  'High C': '/assets/piano/keys/Do.png',
};

// Audio file paths per mode
const XYLO_AUDIO = {
  C: '/assets/audio/xylo low c.mp3', D: '/assets/audio/xylo D.mp3', E: '/assets/audio/xylo E.mp3',
  F: '/assets/audio/xylo F.mp3', G: '/assets/audio/xylo G.mp3', A: '/assets/audio/xylo a.mp3',
  B: '/assets/audio/xylo b.mp3', 'High C': '/assets/audio/xylo High c.mp3',
};
const PIANO_AUDIO = {
  C: '/assets/audio/C4.mp3', D: '/assets/audio/D4.mp3', E: '/assets/audio/E4.mp3',
  F: '/assets/audio/F4.mp3', G: '/assets/audio/G4.mp3', A: '/assets/audio/A4.mp3',
  B: '/assets/audio/B4.mp3', 'High C': '/assets/audio/C5.mp3',
};

const noteToSolfege = { C: 'Do', D: 'Re', E: 'Mi', F: 'Fa', G: 'So', A: 'La', B: 'Ti', 'High C': 'Do' };

// Particle burst
function ParticleBurst({ x, y, color }) {
  const particles = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2;
    const dist = 40 + Math.random() * 30;
    return { id: i, tx: Math.cos(angle) * dist, ty: Math.sin(angle) * dist, size: 6 + Math.random() * 8 };
  });
  return (
    <div className="fixed pointer-events-none z-50" style={{ left: x, top: y }}>
      {particles.map(p => (
        <motion.div key={p.id} className="absolute rounded-full"
          style={{ width: p.size, height: p.size, backgroundColor: color }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: p.tx, y: p.ty, opacity: 0, scale: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }} />
      ))}
    </div>
  );
}

// Character reaction
function CharacterReaction({ streak }) {
  const reactions = [
    { min: 0, src: '/assets/characters/finn-danger.png', msg: '' },
    { min: 3, src: '/assets/characters/finn-danger.png', msg: 'Nice!' },
    { min: 6, src: '/assets/characters/chunk.png', msg: 'Keep going!' },
    { min: 10, src: '/assets/characters/jazzy.png', msg: 'Amazing!' },
    { min: 15, src: '/assets/characters/dr-jellybone.png', msg: 'SUPERSTAR!' },
  ];
  const reaction = [...reactions].reverse().find(r => streak >= r.min) || reactions[0];
  return (
    <motion.div className="fixed bottom-3 right-3 flex items-end gap-2 z-30 hidden md:flex"
      key={reaction.msg} initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
      {streak >= 3 && (
        <motion.div className="bg-white px-3 py-2 rounded-2xl border-3 border-[var(--jma-dark)] shadow-lg mb-8"
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
          <span className="font-bold text-sm" style={{ color: 'var(--jma-dark)' }}>{reaction.msg}</span>
        </motion.div>
      )}
      <motion.img src={reaction.src} alt="character" className="w-20 h-24 object-contain"
        animate={streak >= 5 ? { y: [0, -10, 0], rotate: [-3, 3, -3] } : { y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: streak >= 10 ? 0.5 : 1.5, ease: 'easeInOut' }} />
    </motion.div>
  );
}

// Instrument display for each mode
// InstrumentRow now uses shared CSS components
function InstrumentRow({ soundMode, onPlayNote, highlightedNote, pressedKeys }) {
  if (soundMode === 'xylophone') {
    return <XylophoneInstrument onPlayNote={onPlayNote} pressedKeys={pressedKeys} highlightedNote={highlightedNote} />;
  }
  if (soundMode === 'piano') {
    return <PianoInstrument onPlayNote={onPlayNote} pressedKeys={pressedKeys} highlightedNote={highlightedNote} />;
  }
  return null;
}

function FreePlayPage() {
  const navigate = useNavigate();
  const { playBellNote, initAudioContext } = useAudio();
  const [lastNote, setLastNote] = useState(null);
  const [playedNotes, setPlayedNotes] = useState([]);
  const [particles, setParticles] = useState([]);
  const [streak, setStreak] = useState(0);
  const [soundMode, setSoundMode] = useState('bells');
  const [pressedKeys, setPressedKeys] = useState(new Set());

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState([]);
  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const recordStartRef = useRef(null);
  const playbackTimeouts = useRef([]);

  // Guided song state
  const [guidedMode, setGuidedMode] = useState(false);
  const [guidedSongIdx, setGuidedSongIdx] = useState(0);
  const [guidedStep, setGuidedStep] = useState(0);

  // Audio context + buffers for xylo/piano
  const audioCtxRef = useRef(null);
  const extraBuffersRef = useRef({});
  const loadedModesRef = useRef(new Set(['bells']));

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
    return audioCtxRef.current;
  }, []);

  // Preload audio for a mode
  const preloadMode = useCallback(async (mode) => {
    if (loadedModesRef.current.has(mode)) return;
    const ctx = getAudioCtx();
    const files = mode === 'xylophone' ? XYLO_AUDIO : PIANO_AUDIO;
    const promises = Object.entries(files).map(async ([note, url]) => {
      try {
        const resp = await fetch(url);
        const buf = await resp.arrayBuffer();
        extraBuffersRef.current[`${mode}_${note}`] = await ctx.decodeAudioData(buf);
      } catch (e) { console.warn(`Failed to load ${mode} ${note}:`, e); }
    });
    await Promise.all(promises);
    loadedModesRef.current.add(mode);
  }, [getAudioCtx]);

  // Preload on mode change
  useEffect(() => {
    if (soundMode !== 'bells') preloadMode(soundMode);
  }, [soundMode, preloadMode]);

  const playModeSound = useCallback((note) => {
    if (soundMode === 'bells') {
      playBellNote(note);
      return;
    }
    const ctx = getAudioCtx();
    const buffer = extraBuffersRef.current[`${soundMode}_${note}`];
    if (buffer) {
      const source = ctx.createBufferSource();
      const gain = ctx.createGain();
      source.buffer = buffer;
      gain.gain.setValueAtTime(0.8, ctx.currentTime);
      source.connect(gain);
      gain.connect(ctx.destination);
      source.start(0);
    }
  }, [soundMode, playBellNote, getAudioCtx]);

  const spawnParticles = useCallback((note) => {
    const bell = BELLS.find(b => b.note === note);
    const idx = BELLS.findIndex(b => b.note === note);
    const x = window.innerWidth * 0.25 + (idx / 7) * (window.innerWidth * 0.5);
    const y = window.innerHeight * 0.55;
    const id = Date.now() + Math.random();
    setParticles(prev => [...prev, { id, x, y, color: bell?.color || '#FFD700' }]);
    setTimeout(() => setParticles(prev => prev.filter(p => p.id !== id)), 700);
  }, []);

  const handlePlayNote = useCallback((note) => {
    initAudioContext();
    playModeSound(note);
    setLastNote(note);
    setPlayedNotes(prev => [...prev.slice(-11), note]);
    setStreak(prev => prev + 1);
    spawnParticles(note);

    if (isRecording) {
      const time = Date.now() - recordStartRef.current;
      setRecording(prev => [...prev, { note, time }]);
    }

    if (guidedMode) {
      const song = GUIDED_SONGS[guidedSongIdx];
      if (song && note === song.notes[guidedStep]) {
        setGuidedStep(prev => prev + 1 >= song.notes.length ? 0 : prev + 1);
      }
    }
  }, [initAudioContext, playModeSound, isRecording, guidedMode, guidedSongIdx, guidedStep, spawnParticles]);

  // Keyboard handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      const note = KEY_TO_NOTE[e.key];
      if (note && !pressedKeys.has(e.key)) {
        setPressedKeys(prev => new Set([...prev, e.key]));
        handlePlayNote(note);
      }
    };
    const handleKeyUp = (e) => {
      if (KEY_TO_NOTE[e.key]) {
        setPressedKeys(prev => { const s = new Set(prev); s.delete(e.key); return s; });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
  }, [handlePlayNote, pressedKeys]);

  // Reset streak after inactivity
  useEffect(() => {
    const timer = setTimeout(() => setStreak(0), 3000);
    return () => clearTimeout(timer);
  }, [streak]);

  const startRecording = useCallback(() => { setRecording([]); setIsRecording(true); recordStartRef.current = Date.now(); }, []);
  const stopRecording = useCallback(() => setIsRecording(false), []);
  const playBack = useCallback(() => {
    if (recording.length === 0 || isPlayingBack) return;
    setIsPlayingBack(true);
    playbackTimeouts.current.forEach(t => clearTimeout(t));
    playbackTimeouts.current = [];
    recording.forEach(({ note, time }) => {
      const t = setTimeout(() => handlePlayNote(note), time);
      playbackTimeouts.current.push(t);
    });
    const lastTime = recording[recording.length - 1]?.time || 0;
    const t = setTimeout(() => setIsPlayingBack(false), lastTime + 500);
    playbackTimeouts.current.push(t);
  }, [recording, isPlayingBack, handlePlayNote]);

  const currentGuidedSong = GUIDED_SONGS[guidedSongIdx];
  const nextGuidedNote = guidedMode && currentGuidedSong ? currentGuidedSong.notes[guidedStep] : null;

  return (
    <div className="min-h-screen flex flex-col" data-testid="free-play-page"
      style={{ backgroundImage: 'url(/assets/backgrounds/clubhouse.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <GameHeader title="Free Play" showHomeButton={true} />
      <FullscreenButton />

      <AnimatePresence>
        {particles.map(p => <ParticleBurst key={p.id} x={p.x} y={p.y} color={p.color} />)}
      </AnimatePresence>

      <CharacterReaction streak={streak} />

      <motion.div className="fixed bottom-3 left-3 hidden md:block z-20"
        initial={{ x: -80, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
        <motion.img src="/assets/characters/charlie-polliwog.png" alt="Charlie" className="w-16 h-20 object-contain"
          animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }} />
      </motion.div>

      <main className="flex-1 flex flex-col items-center justify-center pt-16 pb-6 px-4">
        {/* Top controls */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
          <div className="game-card px-3 py-2 flex items-center gap-1">
            {SOUND_MODES.map(mode => (
              <button key={mode.id} data-testid={`sound-mode-${mode.id}`}
                className={`px-2 py-1 rounded-lg text-xs font-bold border-2 transition-all ${soundMode === mode.id ? 'bg-[var(--jma-dark)] text-white border-[var(--jma-dark)]' : 'bg-white border-gray-300'}`}
                onClick={() => setSoundMode(mode.id)}>
                {mode.label}
              </button>
            ))}
          </div>
          <div className="game-card px-3 py-2 flex items-center gap-2">
            {!isRecording ? (
              <button data-testid="record-btn" className="chunky-btn bg-[var(--jma-red)] text-white px-3 py-1 flex items-center gap-1 text-xs font-bold" onClick={startRecording}>
                <Circle className="w-3 h-3 fill-current" /> REC
              </button>
            ) : (
              <button data-testid="stop-record-btn" className="chunky-btn bg-[var(--jma-dark)] text-white px-3 py-1 flex items-center gap-1 text-xs font-bold" onClick={stopRecording}>
                <Square className="w-3 h-3 fill-current" /> STOP
              </button>
            )}
            {recording.length > 0 && !isRecording && (
              <button data-testid="playback-btn" className="chunky-btn bg-[var(--jma-green)] text-white px-3 py-1 flex items-center gap-1 text-xs font-bold"
                onClick={playBack} disabled={isPlayingBack}>
                <Play className="w-3 h-3" /> {isPlayingBack ? 'Playing...' : `Play (${recording.length})`}
              </button>
            )}
          </div>
          <div className="game-card px-3 py-2 flex items-center gap-2">
            <button data-testid="guided-toggle" className={`chunky-btn px-3 py-1 text-xs font-bold ${guidedMode ? 'bg-[var(--jma-blue)] text-white' : 'bg-white'}`}
              onClick={() => setGuidedMode(!guidedMode)}>
              <Music className="inline w-3 h-3 mr-1" /> {guidedMode ? 'Guided ON' : 'Learn a Song'}
            </button>
          </div>
        </div>

        {guidedMode && (
          <motion.div className="game-card px-4 py-2 mb-3 flex items-center gap-3" initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <button onClick={() => { setGuidedSongIdx(i => Math.max(0, i - 1)); setGuidedStep(0); }} className="p-1"><ChevronRight className="w-4 h-4 rotate-180" /></button>
            <div className="text-center">
              <p className="text-sm font-bold font-display" style={{ color: 'var(--jma-dark)' }}>{currentGuidedSong?.name}</p>
              <p className="text-xs opacity-60">Note {guidedStep + 1} of {currentGuidedSong?.notes.length}</p>
            </div>
            <button onClick={() => { setGuidedSongIdx(i => Math.min(GUIDED_SONGS.length - 1, i + 1)); setGuidedStep(0); }} className="p-1"><ChevronRight className="w-4 h-4" /></button>
            <button onClick={() => setGuidedStep(0)} className="p-1"><RotateCcw className="w-4 h-4" /></button>
          </motion.div>
        )}

        {lastNote && (
          <motion.div key={lastNote + streak} initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="mb-2">
            <NotationDisplay currentNote={`${lastNote} (${noteToSolfege[lastNote]})`} />
          </motion.div>
        )}

        {playedNotes.length > 0 && (
          <div className="flex gap-1.5 mb-3 flex-wrap justify-center max-w-lg">
            {playedNotes.map((note, idx) => (
              <motion.span key={`${note}-${idx}`} initial={{ scale: 0, y: -10 }} animate={{ scale: 1, y: 0 }}
                className="px-2 py-0.5 rounded-full text-xs font-bold text-white border-2 border-[var(--jma-dark)]"
                style={{ backgroundColor: BELLS.find(b => b.note === note)?.color || '#ccc' }}>
                {noteToSolfege[note]}
              </motion.span>
            ))}
          </div>
        )}

        {/* Instrument display - changes based on sound mode */}
        <motion.div className="game-board p-3 md:p-6" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          {soundMode === 'bells' ? (
            <div className="bell-row" data-testid="jelly-bells-row">
              {BELLS.map(bell => {
                const isPressed = pressedKeys.has(bell.key);
                const isHighlighted = nextGuidedNote === bell.note;
                return (
                  <motion.div key={bell.note} className="bell-container" whileHover={{ scale: 1.05 }}>
                    <motion.button data-testid={`bell-${bell.note.replace(' ', '-')}`}
                      className={`bell-instrument relative ${isHighlighted ? 'bell-highlight' : ''}`}
                      onPointerDown={(e) => { e.preventDefault(); handlePlayNote(bell.note); }}
                      animate={{ scale: isPressed ? 0.9 : 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', touchAction: 'manipulation' }}>
                      <img src={isPressed ? bell.image2 : bell.image1} alt={bell.solfege}
                        className="w-24 h-28 md:w-32 md:h-36 object-contain pointer-events-none" draggable={false} />
                      <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white border-2 border-[var(--jma-dark)] flex items-center justify-center text-xs font-bold"
                        style={{ color: bell.color }}>{bell.key}</div>
                      {isHighlighted && (
                        <motion.div className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle, ${bell.color}80 0%, transparent 70%)`, zIndex: -1 }}
                          animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 0.6 }} />
                      )}
                    </motion.button>
                    <div className="bell-note-label text-center">
                      <span style={{ color: bell.color }}>{bell.solfege}</span>
                      <span className="block text-xs opacity-70">({bell.note})</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <InstrumentRow soundMode={soundMode} onPlayNote={handlePlayNote} highlightedNote={nextGuidedNote} pressedKeys={pressedKeys} />
          )}
        </motion.div>

        <motion.div className="mt-4 max-w-md text-center game-card px-4 py-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <p className="text-sm md:text-base font-medium" style={{ color: 'var(--jma-dark)' }}>
            <span className="font-bold">Music Tip:</span>{' '}
            {guidedMode ? `Play the highlighted note! Next: ${noteToSolfege[nextGuidedNote] || '?'}` : 'The notes go up like stairs - Do, Re, Mi, Fa, So, La, Ti, Do!'}
          </p>
        </motion.div>

        {isRecording && (
          <motion.div className="mt-3 flex items-center gap-2" animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
            <div className="w-3 h-3 rounded-full bg-[var(--jma-red)]" />
            <span className="text-sm font-bold" style={{ color: 'var(--jma-red)' }}>Recording... ({recording.length} notes)</span>
          </motion.div>
        )}
      </main>
    </div>
  );
}

export default FreePlayPage;
