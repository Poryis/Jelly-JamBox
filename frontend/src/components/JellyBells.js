import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

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

function JellyBellsRow({ onPlayNote, onNoteUp, highlightedNote, showNotation = true, enableKeyboard = true }) {
  // Plain object: { C: true, D: false, ... }
  const [pressed, setPressed] = useState({});

  const handleDown = useCallback((note) => {
    setPressed(prev => ({ ...prev, [note]: true }));
    onPlayNote(note);
  }, [onPlayNote]);

  const handleUp = useCallback((note) => {
    setPressed(prev => ({ ...prev, [note]: false }));
    if (onNoteUp) onNoteUp(note);
  }, [onNoteUp]);

  useEffect(() => {
    if (!enableKeyboard) return;
    const onKeyDown = (e) => {
      const note = KEY_TO_NOTE[e.key];
      if (note && !pressed[note]) handleDown(note);
    };
    const onKeyUp = (e) => {
      const note = KEY_TO_NOTE[e.key];
      if (note) handleUp(note);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => { window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp); };
  }, [enableKeyboard, handleDown, handleUp, pressed]);

  return (
    <div className="bell-row" data-testid="jelly-bells-row">
      {BELLS.map((bell) => {
        const isDown = !!pressed[bell.note];
        return (
          <div key={bell.note} className="bell-container flex flex-col items-center">
            <div
              data-testid={`bell-${bell.note.replace(' ', '-')}`}
              className={`bell-instrument relative cursor-pointer select-none ${highlightedNote === bell.note ? 'bell-highlight' : ''}`}
              onMouseDown={() => handleDown(bell.note)}
              onMouseUp={() => handleUp(bell.note)}
              onMouseLeave={() => handleUp(bell.note)}
              onTouchStart={(e) => { e.preventDefault(); handleDown(bell.note); }}
              onTouchEnd={(e) => { e.preventDefault(); handleUp(bell.note); }}
              style={{ touchAction: 'manipulation', transform: isDown ? 'scale(0.9)' : 'scale(1)', transition: 'transform 0.05s' }}
            >
              <img
                src={isDown ? bell.image2 : bell.image1}
                alt={`${bell.solfege} bell`}
                className="w-24 h-28 md:w-32 md:h-36 object-contain pointer-events-none"
                draggable={false}
              />
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white border-2 border-[var(--jma-dark)] flex items-center justify-center text-xs font-bold pointer-events-none"
                style={{ color: bell.color }}>{bell.key}</div>
              <AnimatePresence>
                {highlightedNote === bell.note && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{ background: `radial-gradient(circle, ${bell.color}80 0%, transparent 70%)`, zIndex: -1 }} />
                )}
              </AnimatePresence>
            </div>
            <div className="bell-note-label text-center">
              <span style={{ color: bell.color }}>{bell.solfege}</span>
              {showNotation && <span className="block text-xs opacity-70">({bell.note})</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export { JellyBellsRow, KEY_TO_NOTE };
export default JellyBellsRow;
