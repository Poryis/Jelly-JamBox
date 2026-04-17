import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

const KEY_TO_NOTE = {
  '1': 'C', '2': 'D', '3': 'E', '4': 'F',
  '5': 'G', '6': 'A', '7': 'B', '8': 'High C'
};

function JellyBell({ bell, onDown, onUp, isHighlighted, showNotation, isPressed }) {
  return (
    <motion.div className="bell-container" whileHover={{ scale: 1.05 }}>
      <motion.button
        data-testid={`bell-${bell.note.replace(' ', '-')}`}
        className={`bell-instrument relative ${isHighlighted ? 'bell-highlight' : ''}`}
        onPointerDown={(e) => { e.preventDefault(); onDown(bell.note); }}
        onPointerUp={(e) => { e.preventDefault(); onUp(bell.note); }}
        onPointerLeave={() => onUp(bell.note)}
        animate={{ scale: isPressed ? 0.9 : 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', touchAction: 'manipulation' }}
      >
        <img
          src={isPressed ? bell.image2 : bell.image1}
          alt={`${bell.solfege} bell`}
          className="w-24 h-28 md:w-32 md:h-36 object-contain pointer-events-none"
          draggable={false}
        />
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white border-2 border-[var(--jma-dark)] flex items-center justify-center text-xs font-bold"
          style={{ color: bell.color }}>{bell.key}</div>
        <AnimatePresence>
          {isHighlighted && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1.2 }} exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle, ${bell.color}80 0%, transparent 70%)`, zIndex: -1 }} />
          )}
        </AnimatePresence>
      </motion.button>
      <div className="bell-note-label text-center">
        <span style={{ color: bell.color }}>{bell.solfege}</span>
        {showNotation && <span className="block text-xs opacity-70">({bell.note})</span>}
      </div>
    </motion.div>
  );
}

function JellyBellsRow({ onPlayNote, onNoteUp, highlightedNote, showNotation = true, enableKeyboard = true }) {
  const [pressedNotes, setPressedNotes] = useState(new Set());

  const handleDown = useCallback((note) => {
    setPressedNotes(prev => new Set([...prev, note]));
    onPlayNote(note);
  }, [onPlayNote]);

  const handleUp = useCallback((note) => {
    setPressedNotes(prev => { const s = new Set(prev); s.delete(note); return s; });
    onNoteUp?.(note);
  }, [onNoteUp]);

  useEffect(() => {
    if (!enableKeyboard) return;
    const handleKeyDown = (e) => {
      const note = KEY_TO_NOTE[e.key];
      if (note && !pressedNotes.has(note)) handleDown(note);
    };
    const handleKeyUp = (e) => {
      const note = KEY_TO_NOTE[e.key];
      if (note) handleUp(note);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
  }, [enableKeyboard, handleDown, handleUp, pressedNotes]);

  return (
    <div className="bell-row" data-testid="jelly-bells-row">
      {BELLS.map((bell) => (
        <JellyBell
          key={bell.note}
          bell={bell}
          onDown={handleDown}
          onUp={handleUp}
          isHighlighted={highlightedNote === bell.note}
          showNotation={showNotation}
          isPressed={pressedNotes.has(bell.note)}
        />
      ))}
    </div>
  );
}

export { JellyBell, JellyBellsRow, KEY_TO_NOTE };
export default JellyBellsRow;
