import { useCallback, useEffect, useRef } from 'react';
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

// Direct DOM image swap - no React state, instant visual feedback
function BellItem({ bell, onPlayNote, onNoteUp, highlightedNote, showNotation }) {
  const imgRef = useRef(null);
  const wrapRef = useRef(null);

  const pressDown = useCallback(() => {
    if (imgRef.current) imgRef.current.src = bell.image2;
    if (wrapRef.current) wrapRef.current.style.transform = 'scale(0.9)';
    onPlayNote(bell.note);
  }, [bell, onPlayNote]);

  const pressUp = useCallback(() => {
    if (imgRef.current) imgRef.current.src = bell.image1;
    if (wrapRef.current) wrapRef.current.style.transform = 'scale(1)';
    if (onNoteUp) onNoteUp(bell.note);
  }, [bell, onNoteUp]);

  return (
    <div className="bell-container flex flex-col items-center">
      <div
        ref={wrapRef}
        data-testid={`bell-${bell.note.replace(' ', '-')}`}
        data-note={bell.note}
        className={`bell-instrument relative cursor-pointer select-none ${highlightedNote === bell.note ? 'bell-highlight' : ''}`}
        onMouseDown={pressDown}
        onMouseUp={pressUp}
        onMouseLeave={pressUp}
        onTouchStart={(e) => { e.preventDefault(); pressDown(); }}
        onTouchEnd={(e) => { e.preventDefault(); pressUp(); }}
        style={{ touchAction: 'manipulation', transition: 'transform 0.05s' }}
      >
        <img
          ref={imgRef}
          src={bell.image1}
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
}

function JellyBellsRow({ onPlayNote, onNoteUp, highlightedNote, showNotation = true, enableKeyboard = true }) {
  // Direct DOM refs for keyboard-driven swaps
  const containerRef = useRef(null);

  useEffect(() => {
    if (!enableKeyboard) return;
    const onKeyDown = (e) => {
      const note = KEY_TO_NOTE[e.key];
      if (!note) return;
      const bell = BELLS.find(b => b.note === note);
      if (!bell || !containerRef.current) return;
      const el = containerRef.current.querySelector(`[data-note="${note}"]`);
      if (!el) return;
      const img = el.querySelector('img');
      if (img && img.src.indexOf(encodeURIComponent(bell.image2.split('/').pop())) === -1) {
        img.src = bell.image2;
        el.style.transform = 'scale(0.9)';
        onPlayNote(note);
      }
    };
    const onKeyUp = (e) => {
      const note = KEY_TO_NOTE[e.key];
      if (!note) return;
      const bell = BELLS.find(b => b.note === note);
      if (!bell || !containerRef.current) return;
      const el = containerRef.current.querySelector(`[data-note="${note}"]`);
      if (!el) return;
      const img = el.querySelector('img');
      if (img) img.src = bell.image1;
      el.style.transform = 'scale(1)';
      if (onNoteUp) onNoteUp(note);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => { window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp); };
  }, [enableKeyboard, onPlayNote, onNoteUp]);

  return (
    <div ref={containerRef} className="bell-row" data-testid="jelly-bells-row">
      {BELLS.map((bell) => (
        <BellItem
          key={bell.note}
          bell={bell}
          onPlayNote={onPlayNote}
          onNoteUp={onNoteUp}
          highlightedNote={highlightedNote}
          showNotation={showNotation}
        />
      ))}
    </div>
  );
}

export { JellyBellsRow, KEY_TO_NOTE };
export default JellyBellsRow;
