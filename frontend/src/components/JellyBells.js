import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Bell configuration with colors and solfège names
export const BELLS = [
  { note: 'C', solfege: 'Do', color: '#FF3B30', image1: '/assets/bells/C 1.png', image2: '/assets/bells/C 2.png' },
  { note: 'D', solfege: 'Re', color: '#FF9500', image1: '/assets/bells/D 1.png', image2: '/assets/bells/D 2.png' },
  { note: 'E', solfege: 'Mi', color: '#FFCC00', image1: '/assets/bells/E 1.png', image2: '/assets/bells/E 2.png' },
  { note: 'F', solfege: 'Fa', color: '#4CD964', image1: '/assets/bells/F 1.png', image2: '/assets/bells/F 2.png' },
  { note: 'G', solfege: 'So', color: '#34A853', image1: '/assets/bells/G 1.png', image2: '/assets/bells/G 2.png' },
  { note: 'A', solfege: 'La', color: '#4285F4', image1: '/assets/bells/A 1.png', image2: '/assets/bells/A 2.png' },
  { note: 'B', solfege: 'Ti', color: '#AF52DE', image1: '/assets/bells/B 1.png', image2: '/assets/bells/B 2.png' },
  { note: 'High C', solfege: 'Do', color: '#FF2D55', image1: '/assets/bells/C 1.png', image2: '/assets/bells/C 2.png' }
];

function JellyBell({ bell, onPlay, isHighlighted, showNotation }) {
  const [isPressed, setIsPressed] = useState(false);

  const handlePress = useCallback(() => {
    setIsPressed(true);
    onPlay(bell.note);
    setTimeout(() => setIsPressed(false), 150);
  }, [bell.note, onPlay]);

  return (
    <motion.div
      className="bell-container"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.button
        data-testid={`bell-${bell.note.replace(' ', '-')}`}
        className={`bell-instrument relative ${isHighlighted ? 'bell-highlight' : ''}`}
        onClick={handlePress}
        onTouchStart={(e) => {
          e.preventDefault();
          handlePress();
        }}
        animate={{
          scale: isPressed ? 0.9 : 1,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{
          background: 'transparent',
          border: 'none',
          padding: 0,
          cursor: 'pointer'
        }}
      >
        <img
          src={isPressed ? bell.image2 : bell.image1}
          alt={`${bell.solfege} bell`}
          className="w-16 h-20 md:w-20 md:h-24 object-contain"
          draggable={false}
        />
        
        {/* Glow effect when highlighted */}
        <AnimatePresence>
          {isHighlighted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1.2 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle, ${bell.color}80 0%, transparent 70%)`,
                zIndex: -1
              }}
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

function JellyBellsRow({ onPlayNote, highlightedNote, showNotation = true }) {
  return (
    <div className="bell-row" data-testid="jelly-bells-row">
      {BELLS.map((bell) => (
        <JellyBell
          key={bell.note}
          bell={bell}
          onPlay={onPlayNote}
          isHighlighted={highlightedNote === bell.note}
          showNotation={showNotation}
        />
      ))}
    </div>
  );
}

export { JellyBell, JellyBellsRow };
export default JellyBellsRow;
