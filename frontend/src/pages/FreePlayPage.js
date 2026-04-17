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
  hihat: { label: 'Hi-Hat', key: 'Q', color: '#F1C40F', img1: '/assets/drums/Hi hat 1.png', img2: '/assets/drums/Hi hat 2.png' },
  crash: { label: 'Crash', key: 'W', color: '#E67E22', img1: '/assets/drums/Crash 1.png', img2: '/assets/drums/Crash 2.png' },
  ride: { label: 'Ride', key: 'E', color: '#E74C3C', img1: '/assets/drums/Ride 1.png', img2: '/assets/drums/Ride 2.png' },
  snare: { label: 'Snare', key: 'A', color: '#3498DB', img1: '/assets/drums/Snare 1.png', img2: '/assets/drums/Snare 2.png' },
  tom: { label: 'Tom 1', key: 'S', color: '#9B59B6', img1: '/assets/drums/tOM 1 1.png', img2: '/assets/drums/tOM 1 2.png' },
  lowTom: { label: 'Tom 2', key: 'D', color: '#1ABC9C', img1: '/assets/drums/tOM 2 1.png', img2: '/assets/drums/tOM 2 2.png' },
  kick: { label: 'Kick', key: 'X', color: '#E74C3C', img1: '/assets/drums/kICK 1.png', img2: '/assets/drums/kICK 1.png' },
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

// Simple press tracker - plain object, guaranteed re-render
function usePressState() {
  const [pressed, setPressed] = useState({});
  const press = useCallback((id) => setPressed(prev => ({ ...prev, [id]: true })), []);
  const release = useCallback((id) => setPressed(prev => ({ ...prev, [id]: false })), []);
  const isPressed = useCallback((id) => !!pressed[id], [pressed]);
  return { pressed, press, release, isPressed };
}

// Individual bell with direct mousedown/mouseup
function PlayableBell({ bell, isDown, onDown, onUp, isHighlighted }) {
  return (
    <div className="bell-container flex flex-col items-center">
      <div
        data-testid={`bell-${bell.note.replace(' ', '-')}`}
        className={`bell-instrument relative cursor-pointer select-none ${isHighlighted ? 'bell-highlight' : ''}`}
        onMouseDown={() => onDown(bell.note)}
        onMouseUp={() => onUp(bell.note)}
        onMouseLeave={() => onUp(bell.note)}
        onTouchStart={(e) => { e.preventDefault(); onDown(bell.note); }}
        onTouchEnd={(e) => { e.preventDefault(); onUp(bell.note); }}
        style={{ touchAction: 'manipulation', transform: isDown ? 'scale(0.9)' : 'scale(1)', transition: 'transform 0.05s' }}
      >
        <img
          src={isDown ? bell.image2 : bell.image1}
          alt={bell.solfege}
          className="w-24 h-28 md:w-32 md:h-36 object-contain pointer-events-none"
          draggable={false}
        />
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white border-2 border-[var(--jma-dark)] flex items-center justify-center text-xs font-bold pointer-events-none"
          style={{ color: bell.color }}>{bell.key}</div>
      </div>
      <div className="bell-note-label text-center">
        <span style={{ color: bell.color }}>{bell.solfege}</span>
        <span className="block text-xs opacity-70">({bell.note})</span>
      </div>
    </div>
  );
}

// Individual drum piece with direct mousedown/mouseup
function PlayableDrumPiece({ drumId, info, isDown, onDown, onUp, style, className }) {
  return (
    <>
      <img
        src={isDown ? info.img2 : info.img1}
        alt={info.label}
        className={`absolute object-contain cursor-pointer ${className || ''}`}
        style={{ ...style, touchAction: 'manipulation', transform: isDown ? `${style?.transform || ''} scale(0.95)` : style?.transform || '', transition: 'transform 0.05s' }}
        onMouseDown={() => onDown(drumId)}
        onMouseUp={() => onUp(drumId)}
        onMouseLeave={() => onUp(drumId)}
        onTouchStart={(e) => { e.preventDefault(); onDown(drumId); }}
        onTouchEnd={(e) => { e.preventDefault(); onUp(drumId); }}
        draggable={false}
      />
      <div className="absolute text-[10px] font-bold bg-white/80 rounded-full w-5 h-5 flex items-center justify-center border border-[var(--jma-dark)] pointer-events-none"
        style={{ left: style?.badgeLeft, bottom: style?.badgeBottom, zIndex: 10, color: info.color }}>{info.key}</div>
    </>
  );
}

function DrumKitPlayable({ bellPress, drumPress }) {
  return (
    <div className="relative mx-auto" style={{ width: '500px', height: '320px' }}>
      <PlayableDrumPiece drumId="crash" info={DRUM_INFO.crash} isDown={drumPress.isPressed('crash')} onDown={drumPress.press} onUp={drumPress.release}
        style={{ left: '70px', bottom: '170px', height: '130px', zIndex: 1, badgeLeft: '118px', badgeBottom: '168px' }} />
      <PlayableDrumPiece drumId="ride" info={DRUM_INFO.ride} isDown={drumPress.isPressed('ride')} onDown={drumPress.press} onUp={drumPress.release}
        style={{ left: '320px', bottom: '150px', height: '160px', zIndex: 1, badgeLeft: '385px', badgeBottom: '148px' }} />
      <PlayableDrumPiece drumId="hihat" info={DRUM_INFO.hihat} isDown={drumPress.isPressed('hihat')} onDown={drumPress.press} onUp={drumPress.release}
        style={{ left: '0px', bottom: '25px', height: '210px', zIndex: 3, badgeLeft: '30px', badgeBottom: '23px' }} />
      <img src="/assets/drums/kICK 1.png" alt="Kick" className="absolute object-contain cursor-pointer"
        style={{ left: '155px', bottom: '0px', width: '185px', zIndex: 3, touchAction: 'manipulation', transform: drumPress.isPressed('kick') ? 'scale(0.95)' : 'scale(1)', transition: 'transform 0.05s' }}
        onMouseDown={() => drumPress.press('kick')} onMouseUp={() => drumPress.release('kick')} onMouseLeave={() => drumPress.release('kick')}
        onTouchStart={(e) => { e.preventDefault(); drumPress.press('kick'); }} onTouchEnd={(e) => { e.preventDefault(); drumPress.release('kick'); }} />
      <div className="absolute text-[10px] font-bold bg-white/80 rounded-full w-5 h-5 flex items-center justify-center border border-[var(--jma-dark)] pointer-events-none"
        style={{ left: '240px', bottom: '-2px', zIndex: 10, color: '#E74C3C' }}>X</div>
      <PlayableDrumPiece drumId="lowTom" info={DRUM_INFO.lowTom} isDown={drumPress.isPressed('lowTom')} onDown={drumPress.press} onUp={drumPress.release}
        style={{ left: '140px', bottom: '155px', width: '90px', zIndex: 3, badgeLeft: '178px', badgeBottom: '153px' }} />
      <img src="/assets/drums/toms-base.png" alt="Toms base" className="absolute object-contain pointer-events-none"
        style={{ left: '215px', bottom: '143px', width: '50px', zIndex: 4 }} />
      <PlayableDrumPiece drumId="tom" info={DRUM_INFO.tom} isDown={drumPress.isPressed('tom')} onDown={drumPress.press} onUp={drumPress.release}
        style={{ left: '252px', bottom: '158px', width: '78px', zIndex: 5, badgeLeft: '284px', badgeBottom: '156px' }} />
      <PlayableDrumPiece drumId="snare" info={DRUM_INFO.snare} isDown={drumPress.isPressed('snare')} onDown={drumPress.press} onUp={drumPress.release}
        style={{ left: '80px', bottom: '12px', width: '110px', zIndex: 6, badgeLeft: '128px', badgeBottom: '10px' }} />
    </div>
  );
}

function FreePlayPage() {
  const { playBellNote, playDrumSound, initAudioContext } = useAudio();
  const bellPress = usePressState();
  const drumPress = usePressState();

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

  // Wrap press/release to also play sound and track notes
  const onBellDown = useCallback((note) => {
    initAudioContext();
    bellPress.press(note);
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
  }, [initAudioContext, bellPress, playModeSound, isRecording, guidedMode, guidedSongIdx, guidedStep, spawnParticles]);

  const onBellUp = useCallback((note) => {
    bellPress.release(note);
  }, [bellPress]);

  const origDrumPress = drumPress.press;
  const origDrumRelease = drumPress.release;

  const onDrumDown = useCallback((drumId) => {
    initAudioContext();
    origDrumPress(drumId);
    playDrumSound(drumId);
    setStreak(prev => prev + 1);
    spawnParticles(DRUM_INFO[drumId]?.color || '#E74C3C');
    if (isRecording) setRecording(prev => [...prev, { note: drumId, type: 'drum', time: Date.now() - recordStartRef.current }]);
  }, [initAudioContext, origDrumPress, playDrumSound, isRecording, spawnParticles]);

  const onDrumUp = useCallback((drumId) => {
    origDrumRelease(drumId);
  }, [origDrumRelease]);

  // Override drum press/release with our wrappers
  const wrappedDrumPress = { ...drumPress, press: onDrumDown, release: onDrumUp };

  // Keyboard: keydown = press, keyup = release
  useEffect(() => {
    const down = (e) => {
      const key = e.key.toLowerCase();
      const bellNote = KEY_TO_NOTE[e.key];
      if (bellNote && !bellPress.isPressed(bellNote)) { onBellDown(bellNote); return; }
      const drumId = DRUM_KEY_MAP[key];
      if (drumId && !drumPress.isPressed(drumId)) onDrumDown(drumId);
    };
    const up = (e) => {
      const key = e.key.toLowerCase();
      const bellNote = KEY_TO_NOTE[e.key];
      if (bellNote) onBellUp(bellNote);
      const drumId = DRUM_KEY_MAP[key];
      if (drumId) onDrumUp(drumId);
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [onBellDown, onBellUp, onDrumDown, onDrumUp, bellPress, drumPress]);

  useEffect(() => { const t = setTimeout(() => setStreak(0), 3000); return () => clearTimeout(t); }, [streak]);

  const startRecording = useCallback(() => { setRecording([]); setIsRecording(true); recordStartRef.current = Date.now(); }, []);
  const stopRecording = useCallback(() => setIsRecording(false), []);
  const playBack = useCallback(() => {
    if (recording.length === 0 || isPlayingBack) return;
    setIsPlayingBack(true);
    playbackTimeouts.current.forEach(t => clearTimeout(t));
    playbackTimeouts.current = [];
    recording.forEach(({ note, type, time }) => {
      playbackTimeouts.current.push(setTimeout(() => {
        if (type === 'drum') { onDrumDown(note); setTimeout(() => onDrumUp(note), 120); }
        else { onBellDown(note); setTimeout(() => onBellUp(note), 120); }
      }, time));
    });
    playbackTimeouts.current.push(setTimeout(() => setIsPlayingBack(false), (recording[recording.length - 1]?.time || 0) + 500));
  }, [recording, isPlayingBack, onBellDown, onBellUp, onDrumDown, onDrumUp]);

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

      <main className="flex-1 flex flex-col items-center justify-center pt-16 pb-6 px-4">
        <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
          <div className="game-card px-3 py-2 flex items-center gap-1">
            {INSTRUMENT_TABS.map(tab => (
              <button key={tab.id} data-testid={`sound-mode-${tab.id}`}
                className={`px-2 py-1 rounded-lg text-xs font-bold border-2 transition-all ${activeTab === tab.id ? 'bg-[var(--jma-dark)] text-white border-[var(--jma-dark)]' : 'bg-white border-gray-300'}`}
                onClick={() => setActiveTab(tab.id)}>{tab.label}</button>
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
          {!isDrumTab && (
            <div className="game-card px-3 py-2">
              <button data-testid="guided-toggle" className={`chunky-btn px-3 py-1 text-xs font-bold ${guidedMode ? 'bg-[var(--jma-blue)] text-white' : 'bg-white'}`}
                onClick={() => setGuidedMode(!guidedMode)}>
                <Music className="inline w-3 h-3 mr-1" /> {guidedMode ? 'Guided ON' : 'Learn a Song'}</button>
            </div>
          )}
        </div>

        {guidedMode && !isDrumTab && (
          <motion.div className="game-card px-4 py-2 mb-3 flex items-center gap-3" initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
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
          <motion.div key={lastNote + streak} initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="mb-2">
            <NotationDisplay currentNote={`${lastNote} (${noteToSolfege[lastNote] || lastNote})`} />
          </motion.div>
        )}

        {isDrumTab ? (
          <motion.div className="game-board p-4 md:p-6" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <DrumKitPlayable bellPress={bellPress} drumPress={wrappedDrumPress} />
          </motion.div>
        ) : (
          <>
            {playedNotes.length > 0 && (
              <div className="flex gap-1.5 mb-3 flex-wrap justify-center max-w-lg">
                {playedNotes.map((note, idx) => (
                  <motion.span key={`${note}-${idx}`} initial={{ scale: 0, y: -10 }} animate={{ scale: 1, y: 0 }}
                    className="px-2 py-0.5 rounded-full text-xs font-bold text-white border-2 border-[var(--jma-dark)]"
                    style={{ backgroundColor: BELLS.find(b => b.note === note)?.color || '#ccc' }}>{noteToSolfege[note]}</motion.span>
                ))}
              </div>
            )}
            <motion.div className="game-board p-3 md:p-6" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
              {activeTab === 'bells' && (
                <div className="bell-row" data-testid="jelly-bells-row">
                  {BELLS.map(bell => (
                    <PlayableBell key={bell.note} bell={bell} isDown={bellPress.isPressed(bell.note)} onDown={onBellDown} onUp={onBellUp} isHighlighted={nextGuidedNote === bell.note} />
                  ))}
                </div>
              )}
              {activeTab === 'xylophone' && <XylophoneInstrument onPlayNote={onBellDown} onNoteUp={onBellUp} pressedKeys={bellPress.pressed} highlightedNote={nextGuidedNote} />}
              {activeTab === 'piano' && <PianoInstrument onPlayNote={onBellDown} onNoteUp={onBellUp} pressedKeys={bellPress.pressed} highlightedNote={nextGuidedNote} />}
            </motion.div>
          </>
        )}

        <motion.div className="mt-3 max-w-md text-center game-card px-4 py-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <p className="text-sm font-medium" style={{ color: 'var(--jma-dark)' }}>
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
