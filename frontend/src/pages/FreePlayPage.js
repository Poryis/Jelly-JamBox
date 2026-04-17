import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Music, Circle, Square, Play, RotateCcw, ChevronRight } from 'lucide-react';
import { BELLS, KEY_TO_NOTE } from '../components/JellyBells';
import { GameHeader, NotationDisplay } from '../components/GameUI';
import { FullscreenButton } from '../components/FullscreenButton';
import useAudio from '../hooks/useAudio';

// Guided songs
const GUIDED_SONGS = [
  { name: 'Do Re Mi', notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'High C'] },
  { name: 'Hot Cross Buns', notes: ['E', 'D', 'C', 'E', 'D', 'C', 'C', 'C', 'C', 'C', 'D', 'D', 'D', 'D', 'E', 'D', 'C'] },
  { name: 'Mary Had a Lamb', notes: ['E', 'D', 'C', 'D', 'E', 'E', 'E', 'D', 'D', 'D', 'E', 'G', 'G'] },
  { name: 'Ode to Joy', notes: ['E', 'E', 'F', 'G', 'G', 'F', 'E', 'D', 'C', 'C', 'D', 'E', 'E', 'D', 'D'] },
];

const SOUND_MODES = [
  { id: 'bells', label: 'Jelly Bells' },
  { id: 'xylophone', label: 'Xylophone' },
  { id: 'piano', label: 'Piano' },
];

const XYLO_AUDIO = { C: '/assets/audio/xylo low c.mp3', D: '/assets/audio/xylo D.mp3', E: '/assets/audio/xylo E.mp3', F: '/assets/audio/xylo F.mp3', G: '/assets/audio/xylo G.mp3', A: '/assets/audio/xylo a.mp3', B: '/assets/audio/xylo b.mp3', 'High C': '/assets/audio/xylo High c.mp3' };
const PIANO_AUDIO = { C: '/assets/audio/C4.mp3', D: '/assets/audio/D4.mp3', E: '/assets/audio/E4.mp3', F: '/assets/audio/F4.mp3', G: '/assets/audio/G4.mp3', A: '/assets/audio/A4.mp3', B: '/assets/audio/B4.mp3', 'High C': '/assets/audio/C5.mp3' };

// Drum keyboard mapping (case-insensitive)
const DRUM_KEY_MAP = {
  q: 'hihat', w: 'crash', e: 'ride',
  a: 'snare', s: 'tom', d: 'lowTom',
  x: 'kick',
};

const DRUM_INFO = {
  hihat: { label: 'Hi-Hat', key: 'Q', color: '#F1C40F', img1: '/assets/drums/Hi hat 1.png', img2: '/assets/drums/Hi hat 2.png' },
  crash: { label: 'Crash', key: 'W', color: '#E67E22', img1: '/assets/drums/Crash 1.png', img2: '/assets/drums/Crash 2.png' },
  ride: { label: 'Ride', key: 'E', color: '#E74C3C', img1: '/assets/drums/Ride 1.png', img2: '/assets/drums/Ride 2.png' },
  snare: { label: 'Snare', key: 'A', color: '#3498DB', img1: '/assets/drums/Snare 1.png', img2: '/assets/drums/Snare 2.png' },
  tom: { label: 'Tom 1', key: 'S', color: '#9B59B6', img1: '/assets/drums/tOM 1 1.png', img2: '/assets/drums/tOM 1 2.png' },
  lowTom: { label: 'Tom 2', key: 'D', color: '#1ABC9C', img1: '/assets/drums/tOM 2 1.png', img2: '/assets/drums/tOM 2 2.png' },
  kick: { label: 'Kick', key: 'X', color: '#E74C3C', img1: '/assets/drums/kICK 1.png', img2: '/assets/drums/kICK 1.png' },
};

const noteToSolfege = { C: 'Do', D: 'Re', E: 'Mi', F: 'Fa', G: 'So', A: 'La', B: 'Ti', 'High C': 'Do' };

// Random particle burst anywhere on screen
function ParticleBurst({ color }) {
  const x = useRef(Math.random() * (typeof window !== 'undefined' ? window.innerWidth - 100 : 800) + 50);
  const y = useRef(Math.random() * (typeof window !== 'undefined' ? window.innerHeight - 200 : 500) + 50);
  const particles = useRef(Array.from({ length: 10 }, (_, i) => {
    const angle = (i / 10) * Math.PI * 2 + Math.random() * 0.5;
    const dist = 30 + Math.random() * 50;
    return { id: i, tx: Math.cos(angle) * dist, ty: Math.sin(angle) * dist, size: 5 + Math.random() * 10, rot: Math.random() * 360 };
  }));

  return (
    <div className="fixed pointer-events-none z-50" style={{ left: x.current, top: y.current }}>
      {particles.current.map(p => (
        <motion.div key={p.id} className="absolute"
          style={{ width: p.size, height: p.size, backgroundColor: color, borderRadius: Math.random() > 0.5 ? '50%' : '3px', transform: `rotate(${p.rot}deg)` }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: p.tx, y: p.ty, opacity: 0, scale: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
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
    <motion.div className="fixed bottom-3 right-3 flex items-end gap-2 z-30 hidden md:flex" key={reaction.msg} initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
      {streak >= 3 && (
        <motion.div className="bg-white px-3 py-2 rounded-2xl border-3 border-[var(--jma-dark)] shadow-lg mb-8" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
          <span className="font-bold text-sm" style={{ color: 'var(--jma-dark)' }}>{reaction.msg}</span>
        </motion.div>
      )}
      <motion.img src={reaction.src} alt="character" className="w-20 h-24 object-contain"
        animate={streak >= 5 ? { y: [0, -10, 0], rotate: [-3, 3, -3] } : { y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: streak >= 10 ? 0.5 : 1.5, ease: 'easeInOut' }} />
    </motion.div>
  );
}

function FreePlayPage() {
  const navigate = useNavigate();
  const { playBellNote, playDrumSound, initAudioContext } = useAudio();
  const [lastNote, setLastNote] = useState(null);
  const [playedNotes, setPlayedNotes] = useState([]);
  const [particles, setParticles] = useState([]);
  const [streak, setStreak] = useState(0);
  const [soundMode, setSoundMode] = useState('bells');
  const [pressedKeys, setPressedKeys] = useState(new Set());
  const [pressedDrums, setPressedDrums] = useState(new Set());
  const [showDrums, setShowDrums] = useState(true);

  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState([]);
  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const recordStartRef = useRef(null);
  const playbackTimeouts = useRef([]);

  const [guidedMode, setGuidedMode] = useState(false);
  const [guidedSongIdx, setGuidedSongIdx] = useState(0);
  const [guidedStep, setGuidedStep] = useState(0);

  const audioCtxRef = useRef(null);
  const extraBuffersRef = useRef({});
  const loadedModesRef = useRef(new Set(['bells']));

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
    return audioCtxRef.current;
  }, []);

  const preloadMode = useCallback(async (mode) => {
    if (loadedModesRef.current.has(mode)) return;
    const ctx = getAudioCtx();
    const files = mode === 'xylophone' ? XYLO_AUDIO : PIANO_AUDIO;
    await Promise.all(Object.entries(files).map(async ([note, url]) => {
      try { const r = await fetch(url); const b = await r.arrayBuffer(); extraBuffersRef.current[`${mode}_${note}`] = await ctx.decodeAudioData(b); } catch {}
    }));
    loadedModesRef.current.add(mode);
  }, [getAudioCtx]);

  useEffect(() => { if (soundMode !== 'bells') preloadMode(soundMode); }, [soundMode, preloadMode]);

  const playModeSound = useCallback((note) => {
    if (soundMode === 'bells') { playBellNote(note); return; }
    const ctx = getAudioCtx();
    const buffer = extraBuffersRef.current[`${soundMode}_${note}`];
    if (buffer) { const s = ctx.createBufferSource(); const g = ctx.createGain(); s.buffer = buffer; g.gain.setValueAtTime(0.8, ctx.currentTime); s.connect(g); g.connect(ctx.destination); s.start(0); }
  }, [soundMode, playBellNote, getAudioCtx]);

  // Spawn particles at random position
  const spawnParticles = useCallback((color) => {
    const id = Date.now() + Math.random();
    setParticles(prev => [...prev, { id, color }]);
    setTimeout(() => setParticles(prev => prev.filter(p => p.id !== id)), 800);
  }, []);

  // Play a bell note
  const handlePlayNote = useCallback((note) => {
    initAudioContext();
    playModeSound(note);
    setLastNote(note);
    setPlayedNotes(prev => [...prev.slice(-11), note]);
    setStreak(prev => prev + 1);
    const bell = BELLS.find(b => b.note === note);
    spawnParticles(bell?.color || '#FFD700');
    if (isRecording) { setRecording(prev => [...prev, { note, type: 'bell', time: Date.now() - recordStartRef.current }]); }
    if (guidedMode) {
      const song = GUIDED_SONGS[guidedSongIdx];
      if (song && note === song.notes[guidedStep]) setGuidedStep(prev => prev + 1 >= song.notes.length ? 0 : prev + 1);
    }
  }, [initAudioContext, playModeSound, isRecording, guidedMode, guidedSongIdx, guidedStep, spawnParticles]);

  // Play a drum
  const handlePlayDrum = useCallback((drumId) => {
    initAudioContext();
    playDrumSound(drumId);
    setStreak(prev => prev + 1);
    setPressedDrums(prev => new Set([...prev, drumId]));
    setTimeout(() => setPressedDrums(prev => { const s = new Set(prev); s.delete(drumId); return s; }), 150);
    const info = DRUM_INFO[drumId];
    spawnParticles(info?.color || '#E74C3C');
    if (isRecording) { setRecording(prev => [...prev, { note: drumId, type: 'drum', time: Date.now() - recordStartRef.current }]); }
  }, [initAudioContext, playDrumSound, isRecording, spawnParticles]);

  // Keyboard handler - bells (1-8) + drums (q/w/e/a/s/d/x)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      // Bell keys
      const bellNote = KEY_TO_NOTE[e.key];
      if (bellNote && !pressedKeys.has(e.key)) {
        setPressedKeys(prev => new Set([...prev, e.key]));
        handlePlayNote(bellNote);
        return;
      }
      // Drum keys
      const drumId = DRUM_KEY_MAP[key];
      if (drumId) {
        handlePlayDrum(drumId);
      }
    };
    const handleKeyUp = (e) => {
      if (KEY_TO_NOTE[e.key]) setPressedKeys(prev => { const s = new Set(prev); s.delete(e.key); return s; });
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
  }, [handlePlayNote, handlePlayDrum, pressedKeys]);

  useEffect(() => { const t = setTimeout(() => setStreak(0), 3000); return () => clearTimeout(t); }, [streak]);

  const startRecording = useCallback(() => { setRecording([]); setIsRecording(true); recordStartRef.current = Date.now(); }, []);
  const stopRecording = useCallback(() => setIsRecording(false), []);
  const playBack = useCallback(() => {
    if (recording.length === 0 || isPlayingBack) return;
    setIsPlayingBack(true);
    playbackTimeouts.current.forEach(t => clearTimeout(t));
    playbackTimeouts.current = [];
    recording.forEach(({ note, type, time }) => {
      const t = setTimeout(() => { if (type === 'drum') handlePlayDrum(note); else handlePlayNote(note); }, time);
      playbackTimeouts.current.push(t);
    });
    const lastTime = recording[recording.length - 1]?.time || 0;
    playbackTimeouts.current.push(setTimeout(() => setIsPlayingBack(false), lastTime + 500));
  }, [recording, isPlayingBack, handlePlayNote, handlePlayDrum]);

  const currentGuidedSong = GUIDED_SONGS[guidedSongIdx];
  const nextGuidedNote = guidedMode && currentGuidedSong ? currentGuidedSong.notes[guidedStep] : null;

  return (
    <div className="min-h-screen flex flex-col" data-testid="free-play-page"
      style={{ backgroundImage: 'url(/assets/backgrounds/clubhouse.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <GameHeader title="Free Play" showHomeButton={true} />
      <FullscreenButton />

      {/* Random particles */}
      <AnimatePresence>
        {particles.map(p => <ParticleBurst key={p.id} color={p.color} />)}
      </AnimatePresence>

      <CharacterReaction streak={streak} />

      <motion.div className="fixed bottom-3 left-3 hidden md:block z-20"
        initial={{ x: -80, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
        <motion.img src="/assets/characters/charlie-polliwog.png" alt="Charlie" className="w-16 h-20 object-contain"
          animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }} />
      </motion.div>

      <main className="flex-1 flex flex-col items-center justify-center pt-16 pb-6 px-4">
        {/* Controls bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
          <div className="game-card px-3 py-2 flex items-center gap-1">
            {SOUND_MODES.map(mode => (
              <button key={mode.id} data-testid={`sound-mode-${mode.id}`}
                className={`px-2 py-1 rounded-lg text-xs font-bold border-2 transition-all ${soundMode === mode.id ? 'bg-[var(--jma-dark)] text-white border-[var(--jma-dark)]' : 'bg-white border-gray-300'}`}
                onClick={() => setSoundMode(mode.id)}>{mode.label}</button>
            ))}
          </div>
          <div className="game-card px-3 py-2 flex items-center gap-2">
            {!isRecording ? (
              <button data-testid="record-btn" className="chunky-btn bg-[var(--jma-red)] text-white px-3 py-1 flex items-center gap-1 text-xs font-bold" onClick={startRecording}>
                <Circle className="w-3 h-3 fill-current" /> REC</button>
            ) : (
              <button data-testid="stop-record-btn" className="chunky-btn bg-[var(--jma-dark)] text-white px-3 py-1 flex items-center gap-1 text-xs font-bold" onClick={stopRecording}>
                <Square className="w-3 h-3 fill-current" /> STOP</button>
            )}
            {recording.length > 0 && !isRecording && (
              <button data-testid="playback-btn" className="chunky-btn bg-[var(--jma-green)] text-white px-3 py-1 flex items-center gap-1 text-xs font-bold"
                onClick={playBack} disabled={isPlayingBack}>
                <Play className="w-3 h-3" /> {isPlayingBack ? 'Playing...' : `Play (${recording.length})`}</button>
            )}
          </div>
          <div className="game-card px-3 py-2 flex items-center gap-2">
            <button data-testid="guided-toggle" className={`chunky-btn px-3 py-1 text-xs font-bold ${guidedMode ? 'bg-[var(--jma-blue)] text-white' : 'bg-white'}`}
              onClick={() => setGuidedMode(!guidedMode)}>
              <Music className="inline w-3 h-3 mr-1" /> {guidedMode ? 'Guided ON' : 'Learn a Song'}</button>
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
            <NotationDisplay currentNote={`${lastNote} (${noteToSolfege[lastNote] || lastNote})`} />
          </motion.div>
        )}

        {playedNotes.length > 0 && (
          <div className="flex gap-1.5 mb-3 flex-wrap justify-center max-w-lg">
            {playedNotes.map((note, idx) => (
              <motion.span key={`${note}-${idx}`} initial={{ scale: 0, y: -10 }} animate={{ scale: 1, y: 0 }}
                className="px-2 py-0.5 rounded-full text-xs font-bold text-white border-2 border-[var(--jma-dark)]"
                style={{ backgroundColor: BELLS.find(b => b.note === note)?.color || '#ccc' }}>{noteToSolfege[note]}</motion.span>
            ))}
          </div>
        )}

        {/* Jelly Bells */}
        <motion.div className="game-board p-3 md:p-6" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
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
        </motion.div>

        {/* Drum Pads */}
        {showDrums && (
          <motion.div className="game-board p-3 md:p-4 mt-3" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
            <div className="flex flex-wrap justify-center gap-2 md:gap-3">
              {Object.entries(DRUM_INFO).map(([drumId, info]) => {
                const isHit = pressedDrums.has(drumId);
                return (
                  <motion.button key={drumId} data-testid={`drum-${drumId}`}
                    className="flex flex-col items-center"
                    onPointerDown={(e) => { e.preventDefault(); handlePlayDrum(drumId); }}
                    animate={{ scale: isHit ? 0.9 : 1 }}
                    transition={{ type: 'spring', stiffness: 500 }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', touchAction: 'manipulation' }}>
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border-4 border-[var(--jma-dark)] flex items-center justify-center overflow-hidden"
                      style={{ backgroundColor: info.color + '20', boxShadow: isHit ? `0 0 15px ${info.color}80` : '0 3px 0 0 var(--jma-dark)' }}>
                      <img src={isHit ? info.img2 : info.img1} alt={info.label} className="w-12 h-12 md:w-16 md:h-16 object-contain" draggable={false} />
                    </div>
                    <span className="text-[10px] md:text-xs font-bold mt-1" style={{ color: info.color }}>{info.label}</span>
                    <div className="w-5 h-5 rounded-full bg-white border-2 border-[var(--jma-dark)] text-[9px] font-bold flex items-center justify-center"
                      style={{ color: info.color }}>{info.key}</div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Tip */}
        <motion.div className="mt-3 max-w-md text-center game-card px-4 py-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <p className="text-sm md:text-base font-medium" style={{ color: 'var(--jma-dark)' }}>
            <span className="font-bold">Music Tip:</span>{' '}
            {guidedMode ? `Play the highlighted note! Next: ${noteToSolfege[nextGuidedNote] || '?'}` : 'Bells: keys 1-8 | Drums: Q W E A S D X'}
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
