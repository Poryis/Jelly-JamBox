import { motion } from 'framer-motion';
import { BELLS } from './JellyBells';

// Xylophone bar heights - low notes = tall bars, high notes = short bars
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
            <motion.button
              key={config.note}
              data-testid={`xylo-${config.note.replace(' ', '-')}`}
              className="flex flex-col items-center"
              onPointerDown={(e) => { e.preventDefault(); onPlayNote(config.note); }}
              animate={{ scale: isPressed ? 0.93 : 1 }}
              transition={{ type: 'spring', stiffness: 500 }}
              whileHover={{ scale: 1.05 }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', touchAction: 'manipulation', padding: 0 }}
            >
              <div
                className="rounded-xl border-4 border-[var(--jma-dark)] relative"
                style={{
                  backgroundColor: bell?.color,
                  width: `${config.width}px`,
                  height: `${config.height}px`,
                  boxShadow: isHighlighted
                    ? `0 0 20px ${bell?.color}80, 0 4px 0 0 var(--jma-dark)`
                    : '0 4px 0 0 var(--jma-dark)',
                }}
              >
                {/* Cord holes */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[var(--jma-dark)] opacity-40" />
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[var(--jma-dark)] opacity-40" />
                {/* Shine highlight */}
                <div className="absolute top-3 left-1 w-1.5 rounded-full opacity-30 bg-white" style={{ height: `${config.height * 0.6}px` }} />
              </div>
              <span className="text-sm md:text-base font-bold mt-2" style={{ color: bell?.color }}>{bell?.solfege}</span>
              <div className="w-6 h-6 rounded-full bg-white border-2 border-[var(--jma-dark)] text-xs font-bold flex items-center justify-center"
                style={{ color: bell?.color }}>{bell?.key}</div>
            </motion.button>
          );
        })}
      </div>
      {/* Xylophone frame bar */}
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
          <motion.button
            key={bell.note}
            data-testid={`piano-${bell.note.replace(' ', '-')}`}
            className="flex flex-col items-center"
            onPointerDown={(e) => { e.preventDefault(); onPlayNote(bell.note); }}
            animate={{ y: isPressed ? 4 : 0 }}
            transition={{ type: 'spring', stiffness: 500 }}
            whileHover={{ y: -2 }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', touchAction: 'manipulation', padding: 0 }}
          >
            <div
              className="rounded-t-xl border-4 border-[var(--jma-dark)] flex flex-col items-center justify-end pb-3 relative"
              style={{
                backgroundColor: bell.color,
                width: '56px',
                height: '150px',
                boxShadow: isHighlighted
                  ? `0 0 20px ${bell.color}80, 0 6px 0 0 var(--jma-dark)`
                  : '0 6px 0 0 var(--jma-dark)',
                marginLeft: '-2px',
              }}
            >
              {/* Shine */}
              <div className="absolute top-3 left-1.5 w-2 rounded-full opacity-30 bg-white" style={{ height: '60%' }} />
              {/* Label */}
              <div className="bg-white/90 rounded-lg px-2 py-1 border-2 border-[var(--jma-dark)]">
                <span className="text-sm font-black" style={{ color: 'var(--jma-dark)' }}>
                  {bell.solfege}
                </span>
              </div>
            </div>
            <div className="w-6 h-6 rounded-full bg-white border-2 border-[var(--jma-dark)] text-xs font-bold flex items-center justify-center mt-1"
              style={{ color: bell.color }}>{bell.key}</div>
          </motion.button>
        );
      })}
    </div>
  );
}

// Animated drum kit for Loop Studio
export function DrumKitVisual({ activeHits }) {
  // activeHits is a Set of currently playing drum ids: 'kick', 'snare', 'hihat', 'crash', etc
  return (
    <div className="relative w-full h-full" style={{ minHeight: '280px' }}>
      {/* Hi-Hat - far left */}
      <motion.img
        src={activeHits?.has('hihat') ? '/assets/drums/Hi hat 2.png' : '/assets/drums/Hi hat 1.png'}
        alt="Hi-Hat"
        className="absolute object-contain"
        style={{ left: '2%', bottom: '25%', width: '14%', zIndex: 2 }}
        animate={activeHits?.has('hihat') ? { scale: [1, 0.92, 1] } : {}}
        transition={{ duration: 0.12 }}
      />

      {/* Snare - left of kick */}
      <motion.img
        src={activeHits?.has('snare') ? '/assets/drums/Snare 2.png' : '/assets/drums/Snare 1.png'}
        alt="Snare"
        className="absolute object-contain"
        style={{ left: '16%', bottom: '15%', width: '18%', zIndex: 3 }}
        animate={activeHits?.has('snare') ? { scale: [1, 0.93, 1] } : {}}
        transition={{ duration: 0.12 }}
      />

      {/* Tom 1 - above kick left */}
      <motion.img
        src={activeHits?.has('tom') ? '/assets/drums/tOM 1 2.png' : '/assets/drums/tOM 1 1.png'}
        alt="Tom 1"
        className="absolute object-contain"
        style={{ left: '30%', bottom: '50%', width: '16%', zIndex: 4 }}
        animate={activeHits?.has('tom') ? { scale: [1, 0.93, 1] } : {}}
        transition={{ duration: 0.12 }}
      />

      {/* Tom 2 - above kick right */}
      <motion.img
        src={activeHits?.has('lowTom') ? '/assets/drums/tOM 2 2.png' : '/assets/drums/tOM 2 1.png'}
        alt="Tom 2"
        className="absolute object-contain"
        style={{ right: '30%', bottom: '50%', width: '16%', zIndex: 4 }}
        animate={activeHits?.has('lowTom') ? { scale: [1, 0.93, 1] } : {}}
        transition={{ duration: 0.12 }}
      />

      {/* Kick drum - center */}
      <motion.img
        src={activeHits?.has('kick') ? '/assets/drums/kICK 2.png' : '/assets/drums/kICK 1.png'}
        alt="Kick"
        className="absolute object-contain"
        style={{ left: '50%', bottom: '5%', width: '30%', transform: 'translateX(-50%)', zIndex: 2 }}
        animate={activeHits?.has('kick') ? { scale: [1, 0.95, 1] } : {}}
        transition={{ duration: 0.12 }}
      />

      {/* Ride - right of kick */}
      <motion.img
        src={activeHits?.has('ride') ? '/assets/drums/Ride 2.png' : '/assets/drums/Ride 1.png'}
        alt="Ride"
        className="absolute object-contain"
        style={{ right: '16%', bottom: '15%', width: '18%', zIndex: 3 }}
        animate={activeHits?.has('ride') ? { scale: [1, 0.93, 1] } : {}}
        transition={{ duration: 0.12 }}
      />

      {/* Crash - far right, high */}
      <motion.img
        src={activeHits?.has('crash') ? '/assets/drums/Crash 2.png' : '/assets/drums/Crash 1.png'}
        alt="Crash"
        className="absolute object-contain"
        style={{ right: '2%', bottom: '25%', width: '14%', zIndex: 2 }}
        animate={activeHits?.has('crash') ? { scale: [1, 0.9, 1], rotate: [0, -5, 0] } : {}}
        transition={{ duration: 0.15 }}
      />
    </div>
  );
}
