import { useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BELLS } from './JellyBells';

// ============================================================================
// IMPERATIVE IMAGE SWAP PATTERN
// All instrument visuals use direct DOM writes to swap frames instantly.
// Images are rendered with a constant JSX src prop so React never overrides
// our imperative changes. No state, no transitions, no animations.
// ============================================================================

// --- XYLOPHONE ---------------------------------------------------------------
const XYLO_BAR_CONFIG = [
  { note: 'C', height: 260, width: 80 },
  { note: 'D', height: 240, width: 76 },
  { note: 'E', height: 220, width: 72 },
  { note: 'F', height: 200, width: 68 },
  { note: 'G', height: 180, width: 64 },
  { note: 'A', height: 160, width: 60 },
  { note: 'B', height: 140, width: 56 },
  { note: 'High C', height: 120, width: 52 },
];

function XyloBar({ config, bell, onPlayNote, onNoteUp, isHighlighted, registerRef }) {
  const barRef = useRef(null);

  useEffect(() => {
    if (registerRef) registerRef(config.note, barRef);
    return () => { if (registerRef) registerRef(config.note, null); };
  }, [config.note, registerRef]);

  const press = useCallback((e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (barRef.current) barRef.current.style.filter = 'brightness(0.7)';
    onPlayNote(config.note);
  }, [config.note, onPlayNote]);

  const release = useCallback(() => {
    if (barRef.current) barRef.current.style.filter = 'brightness(1)';
    if (onNoteUp) onNoteUp(config.note);
  }, [config.note, onNoteUp]);

  return (
    <div data-testid={`xylo-${config.note.replace(' ', '-')}`}
      className="flex flex-col items-center cursor-pointer select-none"
      onPointerDown={press}
      onPointerUp={release}
      onPointerLeave={release}
      onPointerCancel={release}
      style={{ touchAction: 'none' }}>
      <div ref={barRef} className="rounded-xl border-4 border-[var(--jma-dark)] relative"
        style={{
          backgroundColor: bell?.color,
          width: `${config.width}px`,
          height: `${config.height}px`,
          boxShadow: isHighlighted ? `0 0 20px ${bell?.color}80, 0 4px 0 0 var(--jma-dark)` : '0 4px 0 0 var(--jma-dark)',
        }}>
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[var(--jma-dark)] opacity-40" />
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[var(--jma-dark)] opacity-40" />
        <div className="absolute top-3 left-1 w-1.5 rounded-full opacity-30 bg-white" style={{ height: `${config.height * 0.6}px` }} />
      </div>
      <span className="text-sm md:text-base font-bold mt-2" style={{ color: bell?.color }}>{bell?.solfege}</span>
      <div className="w-6 h-6 rounded-full bg-white border-2 border-[var(--jma-dark)] text-xs font-bold flex items-center justify-center" style={{ color: bell?.color }}>{bell?.key}</div>
    </div>
  );
}

export const XylophoneInstrument = forwardRef(function XylophoneInstrument({ onPlayNote, onNoteUp, highlightedNote }, ref) {
  const refsRef = useRef({});
  const registerRef = useCallback((note, r) => {
    if (r) refsRef.current[note] = r; else delete refsRef.current[note];
  }, []);

  useImperativeHandle(ref, () => ({
    press: (note) => {
      const r = refsRef.current[note];
      if (r && r.current) r.current.style.filter = 'brightness(0.7)';
    },
    release: (note) => {
      const r = refsRef.current[note];
      if (r && r.current) r.current.style.filter = 'brightness(1)';
    },
  }));

  return (
    <div className="flex flex-col items-center py-4 px-2" data-testid="xylophone-row">
      <div className="flex items-end justify-center gap-2 md:gap-3">
        {XYLO_BAR_CONFIG.map((config) => {
          const bell = BELLS.find(b => b.note === config.note);
          return (
            <XyloBar key={config.note} config={config} bell={bell}
              onPlayNote={onPlayNote} onNoteUp={onNoteUp}
              isHighlighted={highlightedNote === config.note}
              registerRef={registerRef} />
          );
        })}
      </div>
      <div className="w-full max-w-lg mt-3 flex items-center">
        <div className="h-4 bg-[#C4A035] border-3 border-[var(--jma-dark)] rounded-full flex-1 shadow-[0_3px_0_0_var(--jma-dark)]" />
      </div>
    </div>
  );
});

// --- PIANO -------------------------------------------------------------------
function PianoKey({ bell, onPlayNote, onNoteUp, isHighlighted, registerRef }) {
  const keyRef = useRef(null);

  useEffect(() => {
    if (registerRef) registerRef(bell.note, keyRef);
    return () => { if (registerRef) registerRef(bell.note, null); };
  }, [bell.note, registerRef]);

  const press = useCallback((e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (keyRef.current) keyRef.current.style.filter = 'brightness(0.75)';
    onPlayNote(bell.note);
  }, [bell.note, onPlayNote]);

  const release = useCallback(() => {
    if (keyRef.current) keyRef.current.style.filter = 'brightness(1)';
    if (onNoteUp) onNoteUp(bell.note);
  }, [bell.note, onNoteUp]);

  return (
    <div data-testid={`piano-${bell.note.replace(' ', '-')}`}
      className="flex flex-col items-center cursor-pointer select-none"
      onPointerDown={press}
      onPointerUp={release}
      onPointerLeave={release}
      onPointerCancel={release}
      style={{ touchAction: 'none' }}>
      <div ref={keyRef} className="rounded-t-xl border-4 border-[var(--jma-dark)] flex flex-col items-center justify-end pb-3 relative"
        style={{
          backgroundColor: bell.color,
          width: '80px', height: '220px',
          boxShadow: isHighlighted ? `0 0 20px ${bell.color}80, 0 6px 0 0 var(--jma-dark)` : '0 6px 0 0 var(--jma-dark)',
          marginLeft: '-2px',
        }}>
        <div className="absolute top-3 left-2 w-2 rounded-full opacity-30 bg-white" style={{ height: '60%' }} />
        <div className="bg-white/90 rounded-lg px-3 py-1 border-2 border-[var(--jma-dark)]">
          <span className="text-base font-black" style={{ color: 'var(--jma-dark)' }}>{bell.solfege}</span>
        </div>
      </div>
      <div className="w-7 h-7 rounded-full bg-white border-2 border-[var(--jma-dark)] text-sm font-bold flex items-center justify-center mt-1" style={{ color: bell.color }}>{bell.key}</div>
    </div>
  );
}

export const PianoInstrument = forwardRef(function PianoInstrument({ onPlayNote, onNoteUp, highlightedNote }, ref) {
  const refsRef = useRef({});
  const registerRef = useCallback((note, r) => {
    if (r) refsRef.current[note] = r; else delete refsRef.current[note];
  }, []);

  useImperativeHandle(ref, () => ({
    press: (note) => {
      const r = refsRef.current[note];
      if (r && r.current) r.current.style.filter = 'brightness(0.75)';
    },
    release: (note) => {
      const r = refsRef.current[note];
      if (r && r.current) r.current.style.filter = 'brightness(1)';
    },
  }));

  return (
    <div className="flex items-end justify-center gap-0.5 py-4 px-2" data-testid="piano-row">
      {BELLS.map((bell) => (
        <PianoKey key={bell.note} bell={bell}
          onPlayNote={onPlayNote} onNoteUp={onNoteUp}
          isHighlighted={highlightedNote === bell.note}
          registerRef={registerRef} />
      ))}
    </div>
  );
});

// --- DRUM KIT (used by Loop Studio as visual-only display) -------------------
// Exposes imperative .flash(id) that swaps img1->img2 for ~100ms then back.
const DRUM_FRAMES = {
  crash:  { img1: '/assets/drums/Crash 1.png',  img2: '/assets/drums/Crash 2.png',  style: { left: '55px',  bottom: '125px', height: '110px', zIndex: 1 } },
  ride:   { img1: '/assets/drums/Ride 1.png',   img2: '/assets/drums/Ride 2.png',   style: { left: '245px', bottom: '95px',  height: '140px', zIndex: 1 } },
  hihat:  { img1: '/assets/drums/Hi hat 1.png', img2: '/assets/drums/Hi hat 2.png', style: { left: '0px',   bottom: '20px',  height: '160px', zIndex: 3 } },
  kick:   { img1: '/assets/drums/kICK 1.png',   img2: '/assets/drums/kICK 2.png',   style: { left: '120px', bottom: '0px',   width:  '140px', zIndex: 3 } },
  lowTom: { img1: '/assets/drums/tOM 2 1.png',  img2: '/assets/drums/tOM 2 2.png',  style: { left: '115px', bottom: '128px', width:  '70px',  zIndex: 3 } },
  tom:    { img1: '/assets/drums/tOM 1 1.png',  img2: '/assets/drums/tOM 1 2.png',  style: { left: '200px', bottom: '130px', width:  '60px',  zIndex: 5 } },
  snare:  { img1: '/assets/drums/Snare 1.png',  img2: '/assets/drums/Snare 2.png',  style: { left: '60px',  bottom: '10px',  width:  '85px',  zIndex: 6 } },
};

export const DrumKitVisual = forwardRef(function DrumKitVisual(_props, ref) {
  const refsRef = useRef({});
  const timersRef = useRef({});

  useImperativeHandle(ref, () => ({
    flash: (id, ms = 100) => {
      const frame = DRUM_FRAMES[id];
      const imgRef = refsRef.current[id];
      if (!frame || !imgRef || !imgRef.current) return;
      imgRef.current.src = frame.img2;
      clearTimeout(timersRef.current[id]);
      timersRef.current[id] = setTimeout(() => {
        if (imgRef.current) imgRef.current.src = frame.img1;
      }, ms);
    },
  }));

  useEffect(() => {
    const timers = timersRef.current;
    return () => Object.values(timers).forEach(t => clearTimeout(t));
  }, []);

  const setRef = (id) => (el) => {
    if (el) {
      if (!refsRef.current[id]) refsRef.current[id] = { current: null };
      refsRef.current[id].current = el;
    }
  };

  return (
    <div className="relative mx-auto" style={{ width: '380px', height: '240px' }}>
      {Object.entries(DRUM_FRAMES).map(([id, frame]) => (
        <img key={id} ref={setRef(id)}
          src={frame.img1} alt={id}
          className="absolute object-contain"
          style={frame.style}
          draggable={false} />
      ))}
      {/* Toms base - static decoration */}
      <img src="/assets/drums/toms-base.png" alt="Toms base" className="absolute object-contain"
        style={{ left: '172px', bottom: '118px', width: '38px', zIndex: 4 }} />
    </div>
  );
});

// --- TURNTABLE (records spin continuously; keep spin animation - part of identity)
export function TurntableVisual({ activeHits }) {
  const isScratchLeft = activeHits?.has('scratchPull') || activeHits?.has('scratchPushPull');
  const isScratchRight = activeHits?.has('scratchPush') || activeHits?.has('scratchPushPull');

  return (
    <div className="relative mx-auto" style={{ width: '260px', height: '180px' }}>
      <img src="/assets/turntable/bg.png" alt="Turntable" className="absolute inset-0 w-full h-full object-contain" style={{ zIndex: 1 }} />
      <motion.img src="/assets/turntable/record-left.png" alt="Record L"
        className="absolute object-contain"
        style={{ left: '10%', top: '22%', width: '34%', zIndex: 2 }}
        animate={isScratchLeft ? { rotate: 0 } : { rotate: 360 }}
        transition={isScratchLeft ? { duration: 0.1 } : { repeat: Infinity, duration: 2, ease: 'linear' }}
      />
      <motion.img src="/assets/turntable/record-right.png" alt="Record R"
        className="absolute object-contain"
        style={{ right: '10%', top: '22%', width: '34%', zIndex: 2 }}
        animate={isScratchRight ? { rotate: 0 } : { rotate: 360 }}
        transition={isScratchRight ? { duration: 0.1 } : { repeat: Infinity, duration: 2, ease: 'linear' }}
      />
    </div>
  );
}

// --- BELLS VISUAL (used by Loop Studio) --------------------------------------
export const BellsVisual = forwardRef(function BellsVisual(_props, ref) {
  const refsRef = useRef({});
  const timersRef = useRef({});

  useImperativeHandle(ref, () => ({
    flash: (note, ms = 100) => {
      const bell = BELLS.find(b => b.note === note);
      const imgRef = refsRef.current[note];
      if (!bell || !imgRef || !imgRef.current) return;
      imgRef.current.src = bell.image2;
      clearTimeout(timersRef.current[note]);
      timersRef.current[note] = setTimeout(() => {
        if (imgRef.current) imgRef.current.src = bell.image1;
      }, ms);
    },
  }));

  useEffect(() => {
    const timers = timersRef.current;
    return () => Object.values(timers).forEach(t => clearTimeout(t));
  }, []);

  const setRef = (note) => (el) => {
    if (el) {
      if (!refsRef.current[note]) refsRef.current[note] = { current: null };
      refsRef.current[note].current = el;
    }
  };

  return (
    <div className="relative inline-block">
      <div className="absolute inset-0 -inset-x-2 -inset-y-1 bg-white/40 rounded-xl backdrop-blur-sm" />
      <div className="flex justify-center items-end gap-0 relative z-10 px-1 py-1">
        {BELLS.map(bell => (
          <img key={bell.note} ref={setRef(bell.note)}
            src={bell.image1}
            alt={bell.solfege}
            className="object-contain"
            style={{ width: '100px', height: '115px', margin: '0 -4px' }}
            draggable={false}
          />
        ))}
      </div>
    </div>
  );
});
