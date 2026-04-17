import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Bell configuration with colors and solfège names
// Ordered from LOW (left) to HIGH (right): C D E F G A B High-C
export const BELLS = [
  { note: 'C', solfege: 'Do', color: '#FF3B30', image1: '/assets/bells/C 1.png', image2: '/assets/bells/C 2.png', key: '1' },
  { note: 'D', solfege: 'Re', color: '#FF9500', image1: '/assets/bells/D 1.png', image2: '/assets/bells/D 2.png', key: '2' },
  { note: 'E', solfege: 'Mi', color: '#FFCC00', image1: '/assets/bells/E 1.png', image2: '/assets/bells/E 2.png', key: '3' },
  { note: 'F', solfege: 'Fa', color: '#4CD964', image1: '/assets/bells/F 1.png', image2: '/assets/bells/F 2.png', key: '4' },
  { note: 'G', solfege: 'So', color: '#34A853', image1: '/assets/bells/G 1.png', image2: '/assets/bells/G 2.png', key: '5' },
  { note: 'A', solfege: 'La', color: '#4285F4', image1: '/assets/bells/A 1.png', image2: '/assets/bells/A 2.png', key: '6' },
  { note: 'B', solfege: 'Ti', color: '#AF52DE', image1: '/assets/bells/B 1.png', image2: '/assets/bells/B 2.png', key: '7' },
  { note: 'High C', solfege: 'Do', color: '#FF2D55', image1: '/assets/bells/C 1.png', image2: '/assets/bells/C 2.png', key: '8' }
];

// Key to note mapping for keyboard control
const KEY_TO_NOTE = {
  '1': 'C', '2': 'D', '3': 'E', '4': 'F',
  '5': 'G', '6': 'A', '7': 'B', '8': 'High C'
};

function JellyBell({ bell, onPlay, isHighlighted, showNotation, isPressed }) {
  const [localPressed, setLocalPressed] = useState(false);
  const pressed = isPressed || localPressed;
  const cooldownRef = useRef(false);

  // Single handler for all input types - prevents double-fire
  const handlePress = useCallback((e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    // Debounce: ignore if fired within 100ms of last press
    if (cooldownRef.current) return;
    cooldownRef.current = true;
    setTimeout(() => { cooldownRef.current = false; }, 100);

    setLocalPressed(true);
    onPlay(bell.note);
    setTimeout(() => setLocalPressed(false), 150);
  }, [bell.note, onPlay]);

  return (
    <motion.div className="bell-container" whileHover={{ scale: 1.05 }}>
      <motion.button
        data-testid={`bell-${bell.note.replace(' ', '-')}`}
        className={`bell-instrument relative ${isHighlighted ? 'bell-highlight' : ''}`}
        onPointerDown={handlePress}
        animate={{ scale: pressed ? 0.9 : 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{
          background: 'transparent',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          touchAction: 'manipulation'
        }}
      >
        <img
          src={pressed ? bell.image2 : bell.image1}
          alt={`${bell.solfege} bell`}
          className="w-20 h-24 md:w-28 md:h-32 object-contain pointer-events-none"
          draggable={false}
        />

        {/* Keyboard hint */}
        <div
          className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white border-2 border-[var(--jma-dark)] flex items-center justify-center text-xs font-bold"
          style={{ color: bell.color }}
        >
          {bell.key}
        </div>

        {/* Glow effect when highlighted */}
        <AnimatePresence>
          {isHighlighted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1.2 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 rounded-full"
              style={{ background: `radial-gradient(circle, ${bell.color}80 0%, transparent 70%)`, zIndex: -1 }}
            />
          )}
        </AnimatePresence>
      </motion.button>

      {/* Note label */}
      <div className="bell-note-label text-center">
        <span style={{ color: bell.color }}>{bell.solfege}</span>
        {showNotation && (
          <span className="block text-xs opacity-70">({bell.note})</span>
        )}
      </div>
    </motion.div>
  );
}

function JellyBellsRow({ onPlayNote, highlightedNote, showNotation = true, enableKeyboard = true }) {
  const [pressedKeys, setPressedKeys] = useState(new Set());

  useEffect(() => {
    if (!enableKeyboard) return;

    const handleKeyDown = (e) => {
      const note = KEY_TO_NOTE[e.key];
      if (note && !pressedKeys.has(e.key)) {
        setPressedKeys(prev => new Set([...prev, e.key]));
        onPlayNote(note);
      }
    };

    const handleKeyUp = (e) => {
      if (KEY_TO_NOTE[e.key]) {
        setPressedKeys(prev => {
          const newSet = new Set(prev);
          newSet.delete(e.key);
          return newSet;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [enableKeyboard, onPlayNote, pressedKeys]);

  return (
    <div className="bell-row" data-testid="jelly-bells-row">
      {BELLS.map((bell) => (
        <JellyBell
          key={bell.note}
          bell={bell}
          onPlay={onPlayNote}
          isHighlighted={highlightedNote === bell.note}
          showNotation={showNotation}
          isPressed={pressedKeys.has(bell.key)}
        />
      ))}
    </div>
  );
}

export { JellyBell, JellyBellsRow, KEY_TO_NOTE };
export default JellyBellsRow;
