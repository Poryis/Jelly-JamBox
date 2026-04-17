import { motion } from 'framer-motion';
import { BELLS } from './JellyBells';

// Xylophone
const XYLO_BAR_CONFIG = [
  { note: 'C', height: 180, width: 54 },
  { note: 'D', height: 164, width: 52 },
  { note: 'E', height: 148, width: 50 },
  { note: 'F', height: 132, width: 48 },
  { note: 'G', height: 116, width: 46 },
  { note: 'A', height: 100, width: 44 },
  { note: 'B', height: 84, width: 42 },
  { note: 'High C', height: 68, width: 40 },
];

export function XylophoneInstrument({ onPlayNote, pressedKeys, highlightedNote }) {
  return (
    <div className="flex flex-col items-center py-4 px-2" data-testid="xylophone-row">
      <div className="flex items-end justify-center gap-2 md:gap-3">
        {XYLO_BAR_CONFIG.map((config) => {
          const bell = BELLS.find(b => b.note === config.note);
          const isPressed = pressedKeys?.has(bell?.key);
          const isHighlighted = highlightedNote === config.note;
          return (
            <motion.button key={config.note} data-testid={`xylo-${config.note.replace(' ', '-')}`}
              className="flex flex-col items-center"
              onPointerDown={(e) => { e.preventDefault(); onPlayNote(config.note); }}
              animate={{ scale: isPressed ? 0.93 : 1 }}
              transition={{ type: 'spring', stiffness: 500 }}
              whileHover={{ scale: 1.05 }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', touchAction: 'manipulation', padding: 0 }}>
              <div className="rounded-xl border-4 border-[var(--jma-dark)] relative"
                style={{ backgroundColor: bell?.color, width: `${config.width}px`, height: `${config.height}px`,
                  boxShadow: isHighlighted ? `0 0 20px ${bell?.color}80, 0 4px 0 0 var(--jma-dark)` : '0 4px 0 0 var(--jma-dark)' }}>
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[var(--jma-dark)] opacity-40" />
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[var(--jma-dark)] opacity-40" />
                <div className="absolute top-3 left-1 w-1.5 rounded-full opacity-30 bg-white" style={{ height: `${config.height * 0.6}px` }} />
              </div>
              <span className="text-sm md:text-base font-bold mt-2" style={{ color: bell?.color }}>{bell?.solfege}</span>
              <div className="w-6 h-6 rounded-full bg-white border-2 border-[var(--jma-dark)] text-xs font-bold flex items-center justify-center" style={{ color: bell?.color }}>{bell?.key}</div>
            </motion.button>
          );
        })}
      </div>
      <div className="w-full max-w-lg mt-3 flex items-center">
        <div className="h-4 bg-[#C4A035] border-3 border-[var(--jma-dark)] rounded-full flex-1 shadow-[0_3px_0_0_var(--jma-dark)]" />
      </div>
    </div>
  );
}

export function PianoInstrument({ onPlayNote, pressedKeys, highlightedNote }) {
  return (
    <div className="flex items-end justify-center gap-0.5 py-4 px-2" data-testid="piano-row">
      {BELLS.map((bell) => {
        const isPressed = pressedKeys?.has(bell.key);
        const isHighlighted = highlightedNote === bell.note;
        return (
          <motion.button key={bell.note} data-testid={`piano-${bell.note.replace(' ', '-')}`}
            className="flex flex-col items-center"
            onPointerDown={(e) => { e.preventDefault(); onPlayNote(bell.note); }}
            animate={{ y: isPressed ? 4 : 0 }}
            transition={{ type: 'spring', stiffness: 500 }}
            whileHover={{ y: -2 }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', touchAction: 'manipulation', padding: 0 }}>
            <div className="rounded-t-xl border-4 border-[var(--jma-dark)] flex flex-col items-center justify-end pb-3 relative"
              style={{ backgroundColor: bell.color, width: '56px', height: '150px',
                boxShadow: isHighlighted ? `0 0 20px ${bell.color}80, 0 6px 0 0 var(--jma-dark)` : '0 6px 0 0 var(--jma-dark)', marginLeft: '-2px' }}>
              <div className="absolute top-3 left-1.5 w-2 rounded-full opacity-30 bg-white" style={{ height: '60%' }} />
              <div className="bg-white/90 rounded-lg px-2 py-1 border-2 border-[var(--jma-dark)]">
                <span className="text-sm font-black" style={{ color: 'var(--jma-dark)' }}>{bell.solfege}</span>
              </div>
            </div>
            <div className="w-6 h-6 rounded-full bg-white border-2 border-[var(--jma-dark)] text-xs font-bold flex items-center justify-center mt-1" style={{ color: bell.color }}>{bell.key}</div>
          </motion.button>
        );
      })}
    </div>
  );
}

// Drum kit - refined positioning
export function DrumKitVisual({ activeHits }) {
  return (
    <div className="relative mx-auto" style={{ width: '380px', height: '240px' }}>
      {/* BACK: Crash - behind snare, bigger, lower */}
      <motion.img src={activeHits?.has('crash') ? '/assets/drums/Crash 2.png' : '/assets/drums/Crash 1.png'}
        alt="Crash" className="absolute object-contain"
        style={{ left: '55px', bottom: '125px', height: '110px', zIndex: 1 }}
        animate={activeHits?.has('crash') ? { rotate: [0, -4, 0] } : {}} transition={{ duration: 0.12 }} />

      {/* BACK: Ride - bigger, lower */}
      <motion.img src={activeHits?.has('ride') ? '/assets/drums/Ride 2.png' : '/assets/drums/Ride 1.png'}
        alt="Ride" className="absolute object-contain"
        style={{ left: '235px', bottom: '110px', height: '120px', zIndex: 1 }}
        animate={activeHits?.has('ride') ? { rotate: [0, 3, 0] } : {}} transition={{ duration: 0.12 }} />

      {/* Hi-Hat - left */}
      <motion.img src={activeHits?.has('hihat') ? '/assets/drums/Hi hat 2.png' : '/assets/drums/Hi hat 1.png'}
        alt="Hi-Hat" className="absolute object-contain"
        style={{ left: '0px', bottom: '20px', height: '160px', zIndex: 3 }}
        animate={activeHits?.has('hihat') ? { y: [0, 3, 0] } : {}} transition={{ duration: 0.1 }} />

      {/* Kick - center (SWAPPED: 2=idle, 1=hit based on user feedback) */}
      <motion.img src={activeHits?.has('kick') ? '/assets/drums/kICK 1.png' : '/assets/drums/kICK 2.png'}
        alt="Kick" className="absolute object-contain"
        style={{ left: '120px', bottom: '0px', width: '140px', zIndex: 3 }}
        animate={activeHits?.has('kick') ? { scale: [1, 0.97, 1] } : {}} transition={{ duration: 0.1 }} />

      {/* Big tom (tom 2) - moved UP, touching toms base left arm */}
      <motion.img src={activeHits?.has('lowTom') ? '/assets/drums/tOM 2 2.png' : '/assets/drums/tOM 2 1.png'}
        alt="Tom 2" className="absolute object-contain"
        style={{ left: '105px', bottom: '115px', width: '70px', zIndex: 3 }}
        animate={activeHits?.has('lowTom') ? { scale: [1, 0.95, 1] } : {}} transition={{ duration: 0.1 }} />

      {/* Toms base T-bar - SMALLER, moved up on kick */}
      <img src="/assets/drums/toms-base.png" alt="Toms base" className="absolute object-contain"
        style={{ left: '162px', bottom: '105px', width: '38px', zIndex: 4 }} />

      {/* Small tom (tom 1) - moved LEFT, on top of toms base right arm */}
      <motion.img src={activeHits?.has('tom') ? '/assets/drums/tOM 1 2.png' : '/assets/drums/tOM 1 1.png'}
        alt="Tom 1" className="absolute object-contain"
        style={{ left: '190px', bottom: '118px', width: '60px', zIndex: 5 }}
        animate={activeHits?.has('tom') ? { scale: [1, 0.95, 1] } : {}} transition={{ duration: 0.1 }} />

      {/* FRONT: Snare */}
      <motion.img src={activeHits?.has('snare') ? '/assets/drums/Snare 2.png' : '/assets/drums/Snare 1.png'}
        alt="Snare" className="absolute object-contain"
        style={{ left: '60px', bottom: '10px', width: '85px', zIndex: 6 }}
        animate={activeHits?.has('snare') ? { scale: [1, 0.95, 1] } : {}} transition={{ duration: 0.1 }} />
    </div>
  );
}

// Turntable visual - base with two spinning records
// Records spin continuously, stop briefly on scratch triggers
export function TurntableVisual({ activeHits }) {
  const isScratchLeft = activeHits?.has('scratchPull') || activeHits?.has('scratchPushPull');
  const isScratchRight = activeHits?.has('scratchPush') || activeHits?.has('scratchPushPull');

  return (
    <div className="relative mx-auto" style={{ width: '200px', height: '140px' }}>
      {/* Turntable base */}
      <img src="/assets/turntable/bg.png" alt="Turntable" className="absolute inset-0 w-full h-full object-contain" style={{ zIndex: 1 }} />

      {/* Left record - spins unless scratch */}
      <motion.img src="/assets/turntable/record-left.png" alt="Record L"
        className="absolute object-contain"
        style={{ left: '10%', top: '22%', width: '34%', zIndex: 2 }}
        animate={isScratchLeft ? { rotate: 0 } : { rotate: 360 }}
        transition={isScratchLeft ? { duration: 0.1 } : { repeat: Infinity, duration: 2, ease: 'linear' }}
      />

      {/* Right record - spins unless scratch */}
      <motion.img src="/assets/turntable/record-right.png" alt="Record R"
        className="absolute object-contain"
        style={{ right: '10%', top: '22%', width: '34%', zIndex: 2 }}
        animate={isScratchRight ? { rotate: 0 } : { rotate: 360 }}
        transition={isScratchRight ? { duration: 0.1 } : { repeat: Infinity, duration: 2, ease: 'linear' }}
      />
    </div>
  );
}

// Bells visual for Loop Studio - bigger, with semi-transparent backdrop
export function BellsVisual({ activeNotes }) {
  return (
    <div className="relative">
      {/* Semi-transparent backdrop */}
      <div className="absolute inset-0 -inset-x-3 -inset-y-2 bg-white/40 rounded-2xl backdrop-blur-sm" />
      <div className="flex justify-center items-end gap-2 relative z-10 p-2">
        {BELLS.map(bell => {
          const isHit = activeNotes?.has(bell.note);
          return (
            <motion.img key={bell.note}
              src={isHit ? bell.image2 : bell.image1}
              alt={bell.solfege}
              className="object-contain"
              style={{ width: '52px', height: '60px' }}
              animate={isHit ? { scale: [1, 0.88, 1] } : {}}
              transition={{ duration: 0.1 }}
            />
          );
        })}
      </div>
    </div>
  );
}
