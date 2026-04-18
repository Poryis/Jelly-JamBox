import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Circle, Square, Play, RotateCcw, ChevronRight } from 'lucide-react';
import { BELLS, KEY_TO_NOTE } from '../components/JellyBells';
import { GameHeader, NotationDisplay } from '../components/GameUI';
import { XylophoneInstrument, PianoInstrument } from '../components/Instruments';
import { FullscreenButton } from '../components/FullscreenButton';
import useAudio from '../hooks/useAudio';

const GUIDED_SONGS = [
  { name: 'Do Re Mi', notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'High C'] },
  { name: 'Hot Cross Buns', notes: ['E', 'D', 'C', 'E', 'D', 'C', 'C', 'C', 'C', 'C', 'D', 'D', 'D', 'D', 'E', 'D', 'C'] },
  { name: 'Mary Had a Lamb', notes: ['E', 'D', 'C', 'D', 'E', 'E', 'E', 'D', 'D', 'D', 'E', 'G', 'G'] },
  { name: 'Ode to Joy', notes: ['E', 'E', 'F', 'G', 'G', 'F', 'E', 'D', 'C', 'C', 'D', 'E', 'E', 'D', 'D'] },
];

const INSTRUMENT_TABS = [
  { id: 'bells', label: 'Jelly Bells' },
  { id: 'xylophone', label: 'Xylophone' },
  { id: 'piano', label: 'Piano' },
  { id: 'drums', label: 'Drums' },
];

const XYLO_AUDIO = { C: '/assets/audio/xylo low c.mp3', D: '/assets/audio/xylo D.mp3', E: '/assets/audio/xylo E.mp3', F: '/assets/audio/xylo F.mp3', G: '/assets/audio/xylo G.mp3', A: '/assets/audio/xylo a.mp3', B: '/assets/audio/xylo b.mp3', 'High C': '/assets/audio/xylo High c.mp3' };
const PIANO_AUDIO = { C: '/assets/audio/C4.mp3', D: '/assets/audio/D4.mp3', E: '/assets/audio/E4.mp3', F: '/assets/audio/F4.mp3', G: '/assets/audio/G4.mp3', A: '/assets/audio/A4.mp3', B: '/assets/audio/B4.mp3', 'High C': '/assets/audio/C5.mp3' };

const DRUM_KEY_MAP = { q: 'hihat', w: 'crash', e: 'ride', a: 'snare', s: 'tom', d: 'lowTom', x: 'kick' };

const DRUM_INFO = {
  hihat:  { label: 'Hi-Hat', key: 'Q', color: '#F1C40F', img1: '/assets/drums/Hi hat 1.png', img2: '/assets/drums/Hi hat 2.png' },
  crash:  { label: 'Crash',  key: 'W', color: '#E67E22', img1: '/assets/drums/Crash 1.png',  img2: '/assets/drums/Crash 2.png'  },
  ride:   { label: 'Ride',   key: 'E', color: '#E74C3C', img1: '/assets/drums/Ride 1.png',   img2: '/assets/drums/Ride 2.png'   },
  snare:  { label: 'Snare',  key: 'A', color: '#3498DB', img1: '/assets/drums/Snare 1.png',  img2: '/assets/drums/Snare 2.png'  },
  tom:    { label: 'Tom 1',  key: 'S', color: '#9B59B6', img1: '/assets/drums/tOM 1 1.png',  img2: '/assets/drums/tOM 1 2.png'  },
  lowTom: { label: 'Tom 2',  key: 'D', color: '#1ABC9C', img1: '/assets/drums/tOM 2 1.png',  img2: '/assets/drums/tOM 2 2.png'  },
  kick:   { label: 'Kick',   key: 'X', color: '#E74C3C', img1: '/assets/drums/kICK 1.png',   img2: '/assets/drums/kICK 2.png'   },
};

const noteToSolfege = { C: 'Do', D: 'Re', E: 'Mi', F: 'Fa', G: 'So', A: 'La', B: 'Ti', 'High C': 'Do' };

function ParticleBurst({ color }) {
  const x = useRef(Math.random() * (typeof window !== 'undefined' ? window.innerWidth - 60 : 800) + 30);
  const y = useRef(Math.random() * (typeof window !== 'undefined' ? window.innerHeight - 150 : 500) + 50);
  const particles = useRef(Array.from({ length: 5 }, (_, i) => {
    const angle = (i / 5) * Math.PI * 2 + Math.random() * 0.5;
    const dist = 15 + Math.random() * 25;
    return { id: i, tx: Math.cos(angle) * dist, ty: Math.sin(angle) * dist, size: 4 + Math.random() * 6 };
  }));
  return (
    <div className="fixed pointer-events-none z-50" style={{ left: x.current, top: y.current }}>
      {particles.current.map(p => (
        <motion.div key={p.id} className="absolute rounded-full"
          style={{ width: p.size, height: p.size, backgroundColor: color }}
          initial={{ x: 0, y: 0, opacity: 0.7, scale: 1 }}
          animate={{ x: p.tx, y: p.ty, opacity: 0, scale: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }} />
      ))}
    </div>
  );
}

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

// ============================================================================
// BellCircle: 8 bells arranged around a center point in a 3/4 ring (horseshoe).
// Upright orientation, large, with a decorative center piece.
// ============================================================================
function BellCircle({ onDown, onUp, nextGuidedNote, registerRef }) {
  const n = BELLS.length;
  // Arc from 225deg to -45deg (CCW) = 270deg ring, bottom gap.
  // Bell 0 (Do) at top-left (angle=135), bell 7 (High C) at top-right (angle=45)
  // going clockwise around the top and both sides.
  // Actually easier: distribute from leftmost-bottom (-135) up around top to rightmost-bottom (-45 past 180).
  // Use standard math convention: 0deg=right, 90deg=up. Start at 210deg (bottom-left), go CCW to -30deg (bottom-right)
  // That's 240deg total. Spacing = 240 / 7 = 34.3deg.
  const startAngle = 210;
  const totalArc = 240;
  return (
    <div
      className="relative w-full mx-auto"
      style={{ height: 'var(--bell-ring-h, 520px)', maxWidth: '900px' }}
      data-testid="jelly-bells-row"
    >
      {/* Center medallion */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center"
        style={{ width: '120px', height: '120px' }}
      >
        <div className="w-full h-full rounded-full border-4 border-[var(--jma-dark)] bg-white/70 backdrop-blur-sm flex items-center justify-center shadow-[0_6px_0_0_var(--jma-dark)]">
          <img src="/assets/ui/logo.png" alt="" className="w-20 h-20 object-contain" draggable={false} />
        </div>
      </div>
      {/* Decorative ring path */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 900 520" preserveAspectRatio="none">
        <ellipse cx="450" cy="260" rx="340" ry="200"
          stroke="rgba(10,37,64,0.12)" strokeWidth="4" strokeDasharray="6 10" fill="none" />
      </svg>
      {BELLS.map((bell, i) => {
        const angle = startAngle + (i * (totalArc / (n - 1)));
        const rad = (angle * Math.PI) / 180;
        const cx = 50;
        const cy = 50;
        const rx = 40; // horizontal radius %
        const ry = 38; // vertical radius %
        const x = cx + rx * Math.cos(rad);
        const y = cy - ry * Math.sin(rad); // subtract because CSS y grows downward
        // Rotate each bell so its top points OUTWARD from the center.
        // Bell at math-angle A is positioned at direction (cos A, sin A) from center.
        // CSS rotation (clockwise from 12 o'clock) = 90 - A (degrees).
        const bellRotation = 90 - angle;
        return (
          <div
            key={bell.note}
            className="absolute flex flex-col items-center"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: 10 + i,
            }}
          >
            <PlayableBell
              bell={bell}
              onDown={onDown}
              onUp={onUp}
              isHighlighted={nextGuidedNote === bell.note}
              registerRef={registerRef}
              rotation={bellRotation}
            />
          </div>
        );
      })}
    </div>
  );
}
// ============================================================================
// PlayableBell: BOTH frames rendered in DOM, stacked absolutely.
// Toggling: on press we HIDE idle and SHOW pressed (display swap on both).
// This prevents transparent images from bleeding through each other.
// Zero network, zero decode, zero React render - INSTANT.
// `rotation` prop rotates ONLY the bell image, label stays upright.
function PlayableBell({ bell, onDown, onUp, isHighlighted, registerRef, rotation = 0 }) {
  const idleRef = useRef(null);
  const pressedRef = useRef(null);

  useEffect(() => {
    if (registerRef) registerRef(bell.note, { idleRef, pressedRef });
    return () => { if (registerRef) registerRef(bell.note, null); };
  }, [bell.note, registerRef]);

  const doDown = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (idleRef.current) idleRef.current.style.display = 'none';
    if (pressedRef.current) pressedRef.current.style.display = 'block';
    onDown(bell.note);
  };
  const doUp = () => {
    if (pressedRef.current) pressedRef.current.style.display = 'none';
    if (idleRef.current) idleRef.current.style.display = 'block';
    onUp(bell.note);
  };

  return (
    <div className="bell-container flex flex-col items-center">
      <div
        data-testid={`bell-${bell.note.replace(' ', '-')}`}
        className={`bell-instrument relative cursor-pointer select-none ${isHighlighted ? 'bell-highlight' : ''}`}
        onPointerDown={doDown}
        onPointerUp={doUp}
        onPointerLeave={doUp}
        onPointerCancel={doUp}
        style={{
          touchAction: 'none',
          transform: rotation ? `rotate(${rotation}deg)` : undefined,
          transformOrigin: 'center center',
        }}
      >
        <img
          ref={idleRef}
          src={bell.image1}
          alt={bell.solfege}
          className="w-28 h-32 md:w-36 md:h-40 lg:w-40 lg:h-48 object-contain pointer-events-none"
          draggable={false}
        />
        <img
          ref={pressedRef}
          src={bell.image2}
          alt=""
          aria-hidden="true"
          className="w-28 h-32 md:w-36 md:h-40 lg:w-40 lg:h-48 object-contain pointer-events-none absolute top-0 left-0"
          draggable={false}
          style={{ display: 'none' }}
        />
        <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-white border-2 border-[var(--jma-dark)] flex items-center justify-center text-sm font-bold pointer-events-none"
          style={{ color: bell.color }}>{bell.key}</div>
      </div>
      <div className="bell-note-label text-center">
        <span className="text-lg md:text-xl font-bold" style={{ color: bell.color }}>{bell.solfege}</span>
        <span className="block text-xs opacity-70">({bell.note})</span>
      </div>
    </div>
  );
}

// ============================================================================
// Drum piece with dual-frame stacked approach. Toggles BOTH frames.
// ============================================================================
function PlayableDrumPiece({ drumId, info, onDown, onUp, style, registerRef }) {
  const idleRef = useRef(null);
  const pressedRef = useRef(null);

  useEffect(() => {
    if (registerRef) registerRef(drumId, { idleRef, pressedRef });
    return () => { if (registerRef) registerRef(drumId, null); };
  }, [drumId, registerRef]);

  const doDown = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (idleRef.current) idleRef.current.style.display = 'none';
    if (pressedRef.current) pressedRef.current.style.display = 'block';
    onDown(drumId);
  };
  const doUp = () => {
    if (pressedRef.current) pressedRef.current.style.display = 'none';
    if (idleRef.current) idleRef.current.style.display = 'block';
    onUp(drumId);
  };

  const { badgeLeft, badgeBottom, ...imgStyle } = style || {};

  return (
    <>
      <img
        ref={idleRef}
        src={info.img1}
        alt={info.label}
        className="absolute object-contain cursor-pointer"
        style={{ ...imgStyle, touchAction: 'none' }}
        onPointerDown={doDown}
        onPointerUp={doUp}
        onPointerLeave={doUp}
        onPointerCancel={doUp}
        draggable={false}
      />
      <img
        ref={pressedRef}
        src={info.img2}
        alt=""
        aria-hidden="true"
        className="absolute object-contain pointer-events-none"
        style={{ ...imgStyle, display: 'none', touchAction: 'none' }}
        draggable={false}
      />
      <div className="absolute text-xs font-bold bg-white/80 rounded-full w-6 h-6 flex items-center justify-center border border-[var(--jma-dark)] pointer-events-none"
        style={{ left: badgeLeft, bottom: badgeBottom, zIndex: 10, color: info.color }}>{info.key}</div>
    </>
  );
}

function DrumKitPlayable({ onDrumDown, onDrumUp, registerDrumRef }) {
  // Drum kit overall scale (increased for "MUCH bigger" feel)
  const S = 1.6;
  const px = (n) => `${Math.round(n * S)}px`;
  // Cymbals get an additional +10% on their heights
  const cymS = 1.1;
  return (
    <div className="relative mx-auto" style={{ width: px(500), height: px(340) }}>
      {/* Crash: moved back out LEFT (90) and UP a bit (155) with +10% height */}
      <PlayableDrumPiece drumId="crash"  info={DRUM_INFO.crash}  onDown={onDrumDown} onUp={onDrumUp} registerRef={registerDrumRef}
        style={{ left: px(90), bottom: px(155), height: `${Math.round(130 * S * cymS)}px`, zIndex: 1, badgeLeft: px(145), badgeBottom: px(153) }} />
      {/* Ride: moved back out RIGHT (305) and UP (135) with +10% height */}
      <PlayableDrumPiece drumId="ride"   info={DRUM_INFO.ride}   onDown={onDrumDown} onUp={onDrumUp} registerRef={registerDrumRef}
        style={{ left: px(305), bottom: px(135), height: `${Math.round(160 * S * cymS)}px`, zIndex: 1, badgeLeft: px(380), badgeBottom: px(133) }} />
      <PlayableDrumPiece drumId="hihat"  info={DRUM_INFO.hihat}  onDown={onDrumDown} onUp={onDrumUp} registerRef={registerDrumRef}
        style={{ left: px(0),   bottom: px(25),  height: px(210), zIndex: 3, badgeLeft: px(30),  badgeBottom: px(23)  }} />
      <PlayableDrumPiece drumId="kick"   info={DRUM_INFO.kick}   onDown={onDrumDown} onUp={onDrumUp} registerRef={registerDrumRef}
        style={{ left: px(155), bottom: px(0),   width: px(185),  zIndex: 4, badgeLeft: px(240), badgeBottom: px(-2)  }} />
      <PlayableDrumPiece drumId="lowTom" info={DRUM_INFO.lowTom} onDown={onDrumDown} onUp={onDrumUp} registerRef={registerDrumRef}
        style={{ left: px(140), bottom: px(155), width: px(90),   zIndex: 3, badgeLeft: px(178), badgeBottom: px(153) }} />
      <img src="/assets/drums/toms-base.png" alt="Toms base" className="absolute object-contain pointer-events-none"
        style={{ left: px(215), bottom: px(143), width: px(50), zIndex: 4 }} />
      <PlayableDrumPiece drumId="tom"    info={DRUM_INFO.tom}    onDown={onDrumDown} onUp={onDrumUp} registerRef={registerDrumRef}
        style={{ left: px(252), bottom: px(158), width: px(78),   zIndex: 5, badgeLeft: px(284), badgeBottom: px(156) }} />
      <PlayableDrumPiece drumId="snare"  info={DRUM_INFO.snare}  onDown={onDrumDown} onUp={onDrumUp} registerRef={registerDrumRef}
        style={{ left: px(85),  bottom: px(12),  width: px(99),   zIndex: 6, badgeLeft: px(123), badgeBottom: px(10)  }} />
    </div>
  );
}

function FreePlayPage() {
  const { playBellNote, playDrumSound, initAudioContext } = useAudio();

  const [lastNote, setLastNote] = useState(null);
  const [playedNotes, setPlayedNotes] = useState([]);
  const [particles, setParticles] = useState([]);
  const [streak, setStreak] = useState(0);
  const [activeTab, setActiveTab] = useState('bells');

  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState([]);
  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const recordStartRef = useRef(null);
  const playbackTimeouts = useRef([]);

  const [guidedMode, setGuidedMode] = useState(false);
  const [guidedSongIdx, setGuidedSongIdx] = useState(0);
  const [guidedStep, setGuidedStep] = useState(0);

  // Refs for imperative image swaps (keyboard access)
  const bellRefsRef = useRef({});
  const drumRefsRef = useRef({});
  const xyloRef = useRef(null);
  const pianoRef = useRef(null);

  const registerBellRef = useCallback((note, ref) => {
    if (ref) bellRefsRef.current[note] = ref;
    else delete bellRefsRef.current[note];
  }, []);
  const registerDrumRef = useCallback((id, ref) => {
    if (ref) drumRefsRef.current[id] = ref;
    else delete drumRefsRef.current[id];
  }, []);

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

  useEffect(() => { if (activeTab !== 'bells' && activeTab !== 'drums') preloadMode(activeTab); }, [activeTab, preloadMode]);

  const playModeSound = useCallback((note) => {
    const mode = activeTab === 'drums' ? 'bells' : activeTab;
    if (mode === 'bells') { playBellNote(note); return; }
    const ctx = getAudioCtx();
    const buffer = extraBuffersRef.current[`${mode}_${note}`];
    if (buffer) { const s = ctx.createBufferSource(); const g = ctx.createGain(); s.buffer = buffer; g.gain.setValueAtTime(0.8, ctx.currentTime); s.connect(g); g.connect(ctx.destination); s.start(0); }
  }, [activeTab, playBellNote, getAudioCtx]);

  const spawnParticles = useCallback((color) => {
    const id = Date.now() + Math.random();
    setParticles(prev => [...prev, { id, color }]);
    setTimeout(() => setParticles(prev => prev.filter(p => p.id !== id)), 600);
  }, []);

  // Bell down: play sound + track state (visual swap already happened in PlayableBell handler)
  const onBellDown = useCallback((note) => {
    initAudioContext();
    playModeSound(note);
    setLastNote(note);
    setPlayedNotes(prev => [...prev.slice(-11), note]);
    setStreak(prev => prev + 1);
    spawnParticles(BELLS.find(b => b.note === note)?.color || '#FFD700');
    if (isRecording) setRecording(prev => [...prev, { note, type: 'bell', time: Date.now() - recordStartRef.current }]);
    if (guidedMode) {
      const song = GUIDED_SONGS[guidedSongIdx];
      if (song && note === song.notes[guidedStep]) setGuidedStep(prev => prev + 1 >= song.notes.length ? 0 : prev + 1);
    }
  }, [initAudioContext, playModeSound, isRecording, guidedMode, guidedSongIdx, guidedStep, spawnParticles]);

  const onBellUp = useCallback(() => {}, []);

  const onDrumDown = useCallback((drumId) => {
    initAudioContext();
    playDrumSound(drumId);
    setStreak(prev => prev + 1);
    spawnParticles(DRUM_INFO[drumId]?.color || '#E74C3C');
    if (isRecording) setRecording(prev => [...prev, { note: drumId, type: 'drum', time: Date.now() - recordStartRef.current }]);
  }, [initAudioContext, playDrumSound, isRecording, spawnParticles]);

  const onDrumUp = useCallback(() => {}, []);

  // Keyboard: imperatively toggle pre-rendered frames via refs (idle + pressed)
  useEffect(() => {
    const pressedBells = new Set();
    const pressedDrums = new Set();

    const showPressed = (refs) => {
      if (!refs) return;
      if (refs.idleRef && refs.idleRef.current) refs.idleRef.current.style.display = 'none';
      if (refs.pressedRef && refs.pressedRef.current) refs.pressedRef.current.style.display = 'block';
    };
    const showIdle = (refs) => {
      if (!refs) return;
      if (refs.pressedRef && refs.pressedRef.current) refs.pressedRef.current.style.display = 'none';
      if (refs.idleRef && refs.idleRef.current) refs.idleRef.current.style.display = 'block';
    };

    const down = (e) => {
      const key = e.key.toLowerCase();
      const bellNote = KEY_TO_NOTE[e.key];
      if (bellNote && !pressedBells.has(bellNote)) {
        pressedBells.add(bellNote);
        if (activeTab === 'bells') showPressed(bellRefsRef.current[bellNote]);
        else if (activeTab === 'xylophone' && xyloRef.current) xyloRef.current.press(bellNote);
        else if (activeTab === 'piano' && pianoRef.current) pianoRef.current.press(bellNote);
        onBellDown(bellNote);
        return;
      }
      const drumId = DRUM_KEY_MAP[key];
      if (drumId && !pressedDrums.has(drumId)) {
        pressedDrums.add(drumId);
        if (activeTab === 'drums') showPressed(drumRefsRef.current[drumId]);
        onDrumDown(drumId);
      }
    };
    const up = (e) => {
      const key = e.key.toLowerCase();
      const bellNote = KEY_TO_NOTE[e.key];
      if (bellNote) {
        pressedBells.delete(bellNote);
        if (activeTab === 'bells') showIdle(bellRefsRef.current[bellNote]);
        else if (activeTab === 'xylophone' && xyloRef.current) xyloRef.current.release(bellNote);
        else if (activeTab === 'piano' && pianoRef.current) pianoRef.current.release(bellNote);
        onBellUp(bellNote);
      }
      const drumId = DRUM_KEY_MAP[key];
      if (drumId) {
        pressedDrums.delete(drumId);
        if (activeTab === 'drums') showIdle(drumRefsRef.current[drumId]);
        onDrumUp(drumId);
      }
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [onBellDown, onBellUp, onDrumDown, onDrumUp, activeTab]);

  useEffect(() => { const t = setTimeout(() => setStreak(0), 3000); return () => clearTimeout(t); }, [streak]);

  const startRecording = useCallback(() => { setRecording([]); setIsRecording(true); recordStartRef.current = Date.now(); }, []);
  const stopRecording = useCallback(() => setIsRecording(false), []);

  // Helper to briefly flash the pressed frame for playback (toggles both refs)
  const flashBell = useCallback((note, ms = 120) => {
    const refs = bellRefsRef.current[note];
    if (!refs) return;
    if (refs.idleRef && refs.idleRef.current) refs.idleRef.current.style.display = 'none';
    if (refs.pressedRef && refs.pressedRef.current) refs.pressedRef.current.style.display = 'block';
    setTimeout(() => {
      if (refs.pressedRef && refs.pressedRef.current) refs.pressedRef.current.style.display = 'none';
      if (refs.idleRef && refs.idleRef.current) refs.idleRef.current.style.display = 'block';
    }, ms);
  }, []);
  const flashDrum = useCallback((drumId, ms = 120) => {
    const refs = drumRefsRef.current[drumId];
    if (!refs) return;
    if (refs.idleRef && refs.idleRef.current) refs.idleRef.current.style.display = 'none';
    if (refs.pressedRef && refs.pressedRef.current) refs.pressedRef.current.style.display = 'block';
    setTimeout(() => {
      if (refs.pressedRef && refs.pressedRef.current) refs.pressedRef.current.style.display = 'none';
      if (refs.idleRef && refs.idleRef.current) refs.idleRef.current.style.display = 'block';
    }, ms);
  }, []);

  const playBack = useCallback(() => {
    if (recording.length === 0 || isPlayingBack) return;
    setIsPlayingBack(true);
    playbackTimeouts.current.forEach(t => clearTimeout(t));
    playbackTimeouts.current = [];
    recording.forEach(({ note, type, time }) => {
      playbackTimeouts.current.push(setTimeout(() => {
        if (type === 'drum') { flashDrum(note); onDrumDown(note); }
        else { flashBell(note); onBellDown(note); }
      }, time));
    });
    playbackTimeouts.current.push(setTimeout(() => setIsPlayingBack(false), (recording[recording.length - 1]?.time || 0) + 500));
  }, [recording, isPlayingBack, onBellDown, onDrumDown, flashBell, flashDrum]);

  const currentGuidedSong = GUIDED_SONGS[guidedSongIdx];
  const nextGuidedNote = guidedMode && currentGuidedSong ? currentGuidedSong.notes[guidedStep] : null;
  const isDrumTab = activeTab === 'drums';

  return (
    <div className="min-h-screen flex flex-col" data-testid="free-play-page"
      style={{ backgroundImage: 'url(/assets/backgrounds/clubhouse.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <GameHeader title="Free Play" showHomeButton={true} />
      <FullscreenButton />
      <AnimatePresence>{particles.map(p => <ParticleBurst key={p.id} color={p.color} />)}</AnimatePresence>
      <CharacterReaction streak={streak} />
      <motion.div className="fixed bottom-3 left-3 hidden md:block z-20"
        initial={{ x: -80, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
        <motion.img src="/assets/characters/charlie-polliwog.png" alt="Charlie" className="w-16 h-20 object-contain"
          animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }} />
      </motion.div>

      <main className="flex-1 flex flex-col items-center justify-start pt-14 pb-2 px-2">
        <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
          <div className="game-card px-2 py-1 flex items-center gap-1">
            {INSTRUMENT_TABS.map(tab => (
              <button key={tab.id} data-testid={`sound-mode-${tab.id}`}
                className={`px-2 py-1 rounded-lg text-xs font-bold border-2 transition-all ${activeTab === tab.id ? 'bg-[var(--jma-dark)] text-white border-[var(--jma-dark)]' : 'bg-white border-gray-300'}`}
                onClick={() => setActiveTab(tab.id)}>{tab.label}</button>
            ))}
          </div>
          <div className="game-card px-2 py-1 flex items-center gap-2">
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
          {!isDrumTab && (
            <div className="game-card px-2 py-1">
              <button data-testid="guided-toggle" className={`chunky-btn px-3 py-1 text-xs font-bold ${guidedMode ? 'bg-[var(--jma-blue)] text-white' : 'bg-white'}`}
                onClick={() => setGuidedMode(!guidedMode)}>
                <Music className="inline w-3 h-3 mr-1" /> {guidedMode ? 'Guided ON' : 'Learn a Song'}</button>
            </div>
          )}
        </div>

        {guidedMode && !isDrumTab && (
          <motion.div className="game-card px-3 py-1 mb-2 flex items-center gap-3" initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <button onClick={() => { setGuidedSongIdx(i => Math.max(0, i - 1)); setGuidedStep(0); }}><ChevronRight className="w-4 h-4 rotate-180" /></button>
            <div className="text-center">
              <p className="text-sm font-bold font-display" style={{ color: 'var(--jma-dark)' }}>{currentGuidedSong?.name}</p>
              <p className="text-xs opacity-60">Note {guidedStep + 1} of {currentGuidedSong?.notes.length}</p>
            </div>
            <button onClick={() => { setGuidedSongIdx(i => Math.min(GUIDED_SONGS.length - 1, i + 1)); setGuidedStep(0); }}><ChevronRight className="w-4 h-4" /></button>
            <button onClick={() => setGuidedStep(0)}><RotateCcw className="w-4 h-4" /></button>
          </motion.div>
        )}

        {lastNote && !isDrumTab && (
          <motion.div key={lastNote + streak} initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="mb-1">
            <NotationDisplay currentNote={`${lastNote} (${noteToSolfege[lastNote] || lastNote})`} />
          </motion.div>
        )}

        {isDrumTab ? (
          <motion.div className="game-board p-4 md:p-6 w-[95vw] max-w-[1200px] min-h-[560px] md:min-h-[640px] flex items-center justify-center"
            initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <DrumKitPlayable onDrumDown={onDrumDown} onDrumUp={onDrumUp} registerDrumRef={registerDrumRef} />
          </motion.div>
        ) : (
          <>
            {playedNotes.length > 0 && (
              <div className="flex gap-1 mb-2 flex-wrap justify-center max-w-xl">
                {playedNotes.map((note, idx) => (
                  <motion.span key={`${note}-${idx}`} initial={{ scale: 0, y: -10 }} animate={{ scale: 1, y: 0 }}
                    className="px-2 py-0.5 rounded-full text-xs font-bold text-white border-2 border-[var(--jma-dark)]"
                    style={{ backgroundColor: BELLS.find(b => b.note === note)?.color || '#ccc' }}>{noteToSolfege[note]}</motion.span>
                ))}
              </div>
            )}
            <motion.div className="game-board p-3 md:p-5 w-[95vw] max-w-[1400px] flex items-center justify-center min-h-[560px] md:min-h-[640px]" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
              {activeTab === 'bells' && <BellCircle onDown={onBellDown} onUp={onBellUp} nextGuidedNote={nextGuidedNote} registerRef={registerBellRef} />}
              {activeTab === 'xylophone' && <XylophoneInstrument ref={xyloRef} onPlayNote={onBellDown} onNoteUp={onBellUp} highlightedNote={nextGuidedNote} />}
              {activeTab === 'piano' && <PianoInstrument ref={pianoRef} onPlayNote={onBellDown} onNoteUp={onBellUp} highlightedNote={nextGuidedNote} />}
            </motion.div>
          </>
        )}

        <motion.div className="mt-2 max-w-md text-center game-card px-3 py-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <p className="text-xs font-medium" style={{ color: 'var(--jma-dark)' }}>
            <span className="font-bold">Controls:</span>{' '}
            {isDrumTab ? 'Q=Hi-Hat  W=Crash  E=Ride  A=Snare  S=Tom1  D=Tom2  X=Kick' : 'Bells: keys 1-8 | Drums always: Q W E A S D X'}
          </p>
        </motion.div>

        {isRecording && (
          <motion.div className="mt-2 flex items-center gap-2" animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
            <div className="w-3 h-3 rounded-full bg-[var(--jma-red)]" />
            <span className="text-sm font-bold" style={{ color: 'var(--jma-red)' }}>Recording... ({recording.length})</span>
          </motion.div>
        )}
      </main>
    </div>
  );
}

export default FreePlayPage;
