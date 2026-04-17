import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Music, Circle, Square, Play, RotateCcw, ChevronRight, Volume2 } from 'lucide-react';
import JellyBellsRow, { BELLS } from '../components/JellyBells';
import { GameHeader, NotationDisplay } from '../components/GameUI';
import useAudio from '../hooks/useAudio';

// Guided songs for step-by-step learning
const GUIDED_SONGS = [
  { name: 'Do Re Mi', notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'High C'] },
  { name: 'Hot Cross Buns', notes: ['E', 'D', 'C', 'E', 'D', 'C', 'C', 'C', 'C', 'C', 'D', 'D', 'D', 'D', 'E', 'D', 'C'] },
  { name: 'Mary Had a Lamb', notes: ['E', 'D', 'C', 'D', 'E', 'E', 'E', 'D', 'D', 'D', 'E', 'G', 'G'] },
  { name: 'Ode to Joy', notes: ['E', 'E', 'F', 'G', 'G', 'F', 'E', 'D', 'C', 'C', 'D', 'E', 'E', 'D', 'D'] },
];

// Sound modes
const SOUND_MODES = [
  { id: 'bells', label: 'Jelly Bells', icon: '🔔' },
  { id: 'xylophone', label: 'Xylophone', icon: '🎵' },
  { id: 'piano', label: 'Piano', icon: '🎹' },
];

// Xylophone audio mapping
const XYLO_FILES = { C: '/assets/audio/xylo low c.mp3', D: '/assets/audio/xylo D.mp3', E: '/assets/audio/xylo E.mp3', F: '/assets/audio/xylo F.mp3', G: '/assets/audio/xylo G.mp3', A: '/assets/audio/xylo a.mp3', B: '/assets/audio/xylo b.mp3', 'High C': '/assets/audio/xylo High c.mp3' };
// Piano audio mapping
const PIANO_FILES = { C: '/assets/audio/C4.mp3', D: '/assets/audio/D4.mp3', E: '/assets/audio/E4.mp3', F: '/assets/audio/F4.mp3', G: '/assets/audio/G4.mp3', A: '/assets/audio/A4.mp3', B: '/assets/audio/B4.mp3', 'High C': '/assets/audio/C5.mp3' };

// Particle burst component
function ParticleBurst({ x, y, color }) {
  const particles = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2;
    const dist = 40 + Math.random() * 30;
    return {
      id: i,
      tx: Math.cos(angle) * dist,
      ty: Math.sin(angle) * dist,
      size: 6 + Math.random() * 8,
      shape: Math.random() > 0.5 ? 'circle' : 'star',
    };
  });

  return (
    <div className="fixed pointer-events-none z-50" style={{ left: x, top: y }}>
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: color,
            borderRadius: p.shape === 'circle' ? '50%' : '2px',
            transform: p.shape === 'star' ? 'rotate(45deg)' : 'none',
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: p.tx, y: p.ty, opacity: 0, scale: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

// Character reaction component
function CharacterReaction({ streak, lastAction }) {
  const reactions = [
    { min: 0, src: '/assets/characters/finn-danger.png', msg: 'Play some notes!' },
    { min: 3, src: '/assets/characters/finn-danger.png', msg: 'Nice!' },
    { min: 6, src: '/assets/characters/chunk.png', msg: 'Keep going!' },
    { min: 10, src: '/assets/characters/jazzy.png', msg: 'Amazing!' },
    { min: 15, src: '/assets/characters/dr-jellybone.png', msg: 'SUPERSTAR!' },
  ];

  const reaction = [...reactions].reverse().find(r => streak >= r.min) || reactions[0];

  return (
    <motion.div
      className="fixed bottom-3 right-3 flex items-end gap-2 z-30 hidden md:flex"
      key={reaction.msg}
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
    >
      {streak >= 3 && (
        <motion.div
          className="bg-white px-3 py-2 rounded-2xl border-3 border-[var(--jma-dark)] shadow-lg mb-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring' }}
        >
          <span className="font-bold text-sm" style={{ color: 'var(--jma-dark)' }}>{reaction.msg}</span>
        </motion.div>
      )}
      <motion.img
        src={reaction.src}
        alt="character"
        className="w-20 h-24 object-contain"
        animate={streak >= 5 ? { y: [0, -10, 0], rotate: [-3, 3, -3] } : { y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: streak >= 10 ? 0.5 : 1.5, ease: 'easeInOut' }}
      />
    </motion.div>
  );
}

function FreePlayPage() {
  const navigate = useNavigate();
  const { playBellNote, initAudioContext } = useAudio();
  const [lastNote, setLastNote] = useState(null);
  const [playedNotes, setPlayedNotes] = useState([]);
  const [particles, setParticles] = useState([]);
  const [streak, setStreak] = useState(0);
  const [soundMode, setSoundMode] = useState('bells');

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState([]);
  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const recordStartRef = useRef(null);
  const playbackRef = useRef(null);

  // Guided song state
  const [guidedMode, setGuidedMode] = useState(false);
  const [guidedSongIdx, setGuidedSongIdx] = useState(0);
  const [guidedStep, setGuidedStep] = useState(0);

  // Extra audio buffers for xylophone/piano
  const audioCtxRef = useRef(null);
  const extraBuffersRef = useRef({});

  // Preload xylophone and piano audio
  useEffect(() => {
    const preload = async () => {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = ctx;
      const allFiles = { ...Object.fromEntries(Object.entries(XYLO_FILES).map(([k, v]) => [`xylo_${k}`, v])), ...Object.fromEntries(Object.entries(PIANO_FILES).map(([k, v]) => [`piano_${k}`, v])) };
      for (const [key, url] of Object.entries(allFiles)) {
        try {
          const resp = await fetch(url);
          const buf = await resp.arrayBuffer();
          extraBuffersRef.current[key] = await ctx.decodeAudioData(buf);
        } catch (e) { /* skip */ }
      }
    };
    preload();
  }, []);

  const playExtraSound = useCallback((note) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    const key = `${soundMode}_${note}`;
    const buffer = extraBuffersRef.current[key];
    if (buffer) {
      const source = ctx.createBufferSource();
      const gain = ctx.createGain();
      source.buffer = buffer;
      gain.gain.setValueAtTime(0.7, ctx.currentTime);
      source.connect(gain);
      gain.connect(ctx.destination);
      source.start(0);
    }
  }, [soundMode]);

  const noteToSolfege = { C: 'Do', D: 'Re', E: 'Mi', F: 'Fa', G: 'So', A: 'La', B: 'Ti', 'High C': 'Do' };

  // Spawn particles at a position
  const spawnParticles = useCallback((note) => {
    const bell = BELLS.find(b => b.note === note);
    // Approximate position based on note index
    const idx = BELLS.findIndex(b => b.note === note);
    const x = window.innerWidth * 0.25 + (idx / 7) * (window.innerWidth * 0.5);
    const y = window.innerHeight * 0.55;
    const id = Date.now() + Math.random();
    setParticles(prev => [...prev, { id, x, y, color: bell?.color || '#FFD700' }]);
    setTimeout(() => setParticles(prev => prev.filter(p => p.id !== id)), 700);
  }, []);

  const handlePlayNote = useCallback((note) => {
    initAudioContext();
    if (soundMode === 'bells') {
      playBellNote(note);
    } else {
      playExtraSound(note);
    }
    setLastNote(note);
    setPlayedNotes(prev => [...prev.slice(-11), note]);
    setStreak(prev => prev + 1);
    spawnParticles(note);

    // Recording
    if (isRecording) {
      const time = Date.now() - recordStartRef.current;
      setRecording(prev => [...prev, { note, time }]);
    }

    // Guided mode
    if (guidedMode) {
      const song = GUIDED_SONGS[guidedSongIdx];
      if (song && note === song.notes[guidedStep]) {
        setGuidedStep(prev => {
          const next = prev + 1;
          if (next >= song.notes.length) {
            // Song complete!
            setTimeout(() => setGuidedStep(0), 500);
            return 0;
          }
          return next;
        });
      }
    }
  }, [initAudioContext, playBellNote, playExtraSound, soundMode, isRecording, guidedMode, guidedSongIdx, guidedStep, spawnParticles]);

  // Reset streak after inactivity
  useEffect(() => {
    const timer = setTimeout(() => setStreak(0), 3000);
    return () => clearTimeout(timer);
  }, [streak]);

  // Start recording
  const startRecording = useCallback(() => {
    setRecording([]);
    setIsRecording(true);
    recordStartRef.current = Date.now();
  }, []);

  // Stop recording
  const stopRecording = useCallback(() => {
    setIsRecording(false);
  }, []);

  // Play back recording
  const playBack = useCallback(() => {
    if (recording.length === 0 || isPlayingBack) return;
    setIsPlayingBack(true);
    recording.forEach(({ note, time }) => {
      playbackRef.current = setTimeout(() => {
        handlePlayNote(note);
      }, time);
    });
    const lastTime = recording[recording.length - 1]?.time || 0;
    setTimeout(() => setIsPlayingBack(false), lastTime + 500);
  }, [recording, isPlayingBack, handlePlayNote]);

  // Guided song info
  const currentGuidedSong = GUIDED_SONGS[guidedSongIdx];
  const nextGuidedNote = guidedMode && currentGuidedSong ? currentGuidedSong.notes[guidedStep] : null;

  return (
    <div
      className="min-h-screen flex flex-col"
      data-testid="free-play-page"
      style={{ backgroundImage: 'url(/assets/backgrounds/clubhouse.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <GameHeader title="Free Play" showHomeButton={true} />

      {/* Particles */}
      <AnimatePresence>
        {particles.map(p => (
          <ParticleBurst key={p.id} x={p.x} y={p.y} color={p.color} />
        ))}
      </AnimatePresence>

      {/* Character reaction */}
      <CharacterReaction streak={streak} />

      {/* Left character */}
      <motion.div className="fixed bottom-3 left-3 hidden md:block z-20"
        initial={{ x: -80, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
        <motion.img src="/assets/characters/charlie-polliwog.png" alt="Charlie" className="w-16 h-20 object-contain"
          animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }} />
      </motion.div>

      <main className="flex-1 flex flex-col items-center justify-center pt-16 pb-6 px-4">
        {/* Top controls bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
          {/* Sound mode switcher */}
          <div className="game-card px-3 py-2 flex items-center gap-1">
            {SOUND_MODES.map(mode => (
              <button key={mode.id} data-testid={`sound-mode-${mode.id}`}
                className={`px-2 py-1 rounded-lg text-xs font-bold border-2 transition-all ${soundMode === mode.id ? 'bg-[var(--jma-dark)] text-white border-[var(--jma-dark)]' : 'bg-white border-gray-300'}`}
                onClick={() => setSoundMode(mode.id)}>
                {mode.label}
              </button>
            ))}
          </div>

          {/* Record controls */}
          <div className="game-card px-3 py-2 flex items-center gap-2">
            {!isRecording ? (
              <button data-testid="record-btn" className="chunky-btn bg-[var(--jma-red)] text-white px-3 py-1 flex items-center gap-1 text-xs font-bold"
                onClick={startRecording}>
                <Circle className="w-3 h-3 fill-current" /> REC
              </button>
            ) : (
              <button data-testid="stop-record-btn" className="chunky-btn bg-[var(--jma-dark)] text-white px-3 py-1 flex items-center gap-1 text-xs font-bold"
                onClick={stopRecording}>
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

          {/* Guided mode toggle */}
          <div className="game-card px-3 py-2 flex items-center gap-2">
            <button data-testid="guided-toggle" className={`chunky-btn px-3 py-1 text-xs font-bold ${guidedMode ? 'bg-[var(--jma-blue)] text-white' : 'bg-white'}`}
              onClick={() => setGuidedMode(!guidedMode)}>
              <Music className="inline w-3 h-3 mr-1" /> {guidedMode ? 'Guided ON' : 'Learn a Song'}
            </button>
          </div>
        </div>

        {/* Guided song selector */}
        {guidedMode && (
          <motion.div className="game-card px-4 py-2 mb-3 flex items-center gap-3" initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <button onClick={() => setGuidedSongIdx(i => Math.max(0, i - 1))} className="p-1"><ChevronRight className="w-4 h-4 rotate-180" /></button>
            <div className="text-center">
              <p className="text-sm font-bold font-display" style={{ color: 'var(--jma-dark)' }}>{currentGuidedSong?.name}</p>
              <p className="text-xs opacity-60">Note {guidedStep + 1} of {currentGuidedSong?.notes.length}</p>
            </div>
            <button onClick={() => setGuidedSongIdx(i => Math.min(GUIDED_SONGS.length - 1, i + 1))} className="p-1"><ChevronRight className="w-4 h-4" /></button>
            <button onClick={() => setGuidedStep(0)} className="p-1"><RotateCcw className="w-4 h-4" /></button>
          </motion.div>
        )}

        {/* Current note + played history */}
        {lastNote && (
          <motion.div key={lastNote + Date.now()} initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="mb-2">
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

        {/* Jelly Bells */}
        <motion.div className="game-board p-3 md:p-6" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <JellyBellsRow
            onPlayNote={handlePlayNote}
            highlightedNote={nextGuidedNote}
            showNotation={true}
          />
        </motion.div>

        {/* Educational tip */}
        <motion.div className="mt-4 max-w-md text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <p className="text-sm md:text-base" style={{ color: 'var(--jma-dark)' }}>
            <span className="font-bold">Music Tip:</span>{' '}
            {guidedMode
              ? `Play the highlighted bell! Next note: ${noteToSolfege[nextGuidedNote] || '?'}`
              : 'The notes go up like stairs - Do, Re, Mi, Fa, So, La, Ti, Do!'}
          </p>
        </motion.div>

        {/* Recording indicator */}
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
