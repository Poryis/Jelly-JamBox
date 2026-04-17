import { motion } from 'framer-motion';
import { BELLS } from './JellyBells';

// Xylophone bar heights - low notes = tall bars, high notes = short bars
const XYLO_BAR_CONFIG = [
  { note: 'C', height: 140, width: 44 },
  { note: 'D', height: 128, width: 42 },
  { note: 'E', height: 116, width: 40 },
  { note: 'F', height: 104, width: 38 },
  { note: 'G', height: 92, width: 36 },
  { note: 'A', height: 80, width: 34 },
  { note: 'B', height: 68, width: 32 },
  { note: 'High C', height: 56, width: 30 },
];

export function XylophoneInstrument({ onPlayNote, pressedKeys, highlightedNote }) {
  return (
    <div className="flex flex-col items-center py-4 px-2" data-testid="xylophone-row">
      {/* Bars */}
      <div className="flex items-end justify-center gap-1.5 md:gap-2.5">
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
              {/* The bar itself */}
              <div
                className="rounded-lg border-4 border-[var(--jma-dark)] flex items-center justify-center relative"
                style={{
                  backgroundColor: bell?.color,
                  width: `${config.width}px`,
                  height: `${config.height}px`,
                  boxShadow: isHighlighted
                    ? `0 0 20px ${bell?.color}80, 0 4px 0 0 var(--jma-dark)`
                    : '0 4px 0 0 var(--jma-dark)',
                }}
              >
                {/* Face on each bar - matching bell art style */}
                <div className="flex flex-col items-center">
                  {/* Eyes */}
                  <div className="flex gap-1.5 mb-1">
                    <div className="w-2.5 h-3 bg-white rounded-full border border-[var(--jma-dark)] flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-[var(--jma-dark)] rounded-full" />
                    </div>
                    <div className="w-2.5 h-3 bg-white rounded-full border border-[var(--jma-dark)] flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-[var(--jma-dark)] rounded-full" />
                    </div>
                  </div>
                  {/* Mouth */}
                  <div className="w-4 h-2 border-b-2 border-[var(--jma-dark)] rounded-b-full" />
                </div>
                {/* Cord holes */}
                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[var(--jma-dark)] opacity-50" />
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[var(--jma-dark)] opacity-50" />
              </div>
              {/* Label */}
              <span className="text-xs md:text-sm font-bold mt-1.5" style={{ color: bell?.color }}>{bell?.solfege}</span>
              <div className="w-5 h-5 rounded-full bg-white border-2 border-[var(--jma-dark)] text-[9px] font-bold flex items-center justify-center"
                style={{ color: bell?.color }}>{bell?.key}</div>
            </motion.button>
          );
        })}
      </div>
      {/* Xylophone frame */}
      <div className="w-full max-w-md mt-2 flex items-center">
        <div className="h-3 bg-[#C4A035] border-2 border-[var(--jma-dark)] rounded-full flex-1" />
      </div>
    </div>
  );
}

export function PianoInstrument({ onPlayNote, pressedKeys, highlightedNote }) {
  return (
    <div className="flex items-end justify-center gap-0 py-4 px-2" data-testid="piano-row">
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
            {/* Piano key */}
            <div
              className="rounded-t-lg border-4 border-[var(--jma-dark)] flex flex-col items-center justify-end pb-2 relative"
              style={{
                backgroundColor: bell.color,
                width: '48px',
                height: '120px',
                boxShadow: isHighlighted
                  ? `0 0 20px ${bell.color}80, 0 6px 0 0 var(--jma-dark)`
                  : '0 6px 0 0 var(--jma-dark)',
                marginLeft: '-2px',
              }}
            >
              {/* Solfège label on key */}
              <div className="bg-white/80 rounded px-1.5 py-0.5 border border-[var(--jma-dark)]">
                <span className="text-xs font-black" style={{ color: 'var(--jma-dark)' }}>
                  {bell.solfege}
                </span>
              </div>
            </div>
            {/* Key number */}
            <div className="w-5 h-5 rounded-full bg-white border-2 border-[var(--jma-dark)] text-[9px] font-bold flex items-center justify-center mt-1"
              style={{ color: bell.color }}>{bell.key}</div>
          </motion.button>
        );
      })}
    </div>
  );
}
