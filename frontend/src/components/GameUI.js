import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, Volume2 } from 'lucide-react';

function GameHeader({ title, score, streak, showHomeButton = true }) {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Home button */}
        {showHomeButton && (
          <motion.button
            data-testid="home-button"
            onClick={() => navigate('/')}
            className="chunky-btn bg-white p-3 flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Home className="w-6 h-6" style={{ color: 'var(--jma-dark)' }} />
          </motion.button>
        )}

        {/* Title */}
        {title && (
          <motion.h1 
            className="text-xl md:text-2xl font-bold text-center"
            style={{ color: 'var(--jma-dark)', fontFamily: "'Fredoka', cursive" }}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            {title}
          </motion.h1>
        )}

        {/* Score display */}
        <div className="flex items-center gap-3">
          {streak > 0 && (
            <motion.div
              className="game-card px-3 py-2 flex items-center gap-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              <span className="text-lg font-bold streak-fire">
                {streak}x
              </span>
            </motion.div>
          )}
          
          {score !== undefined && (
            <div className="game-card px-4 py-2">
              <span className="text-xl font-bold" style={{ color: 'var(--jma-dark)' }}>
                {score.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function CharacterMascot({ character, position = 'left', message }) {
  const characterImages = {
    finn: '/assets/characters/finn-danger.png',
    charlie: '/assets/characters/charlie-polliwog.png',
    chunk: '/assets/characters/chunk.png',
    jazzy: '/assets/characters/jazzy.png',
    // Legacy aliases
    shark: '/assets/characters/finn-danger.png',
    catfish: '/assets/characters/charlie-polliwog.png'
  };

  return (
    <motion.div
      className={position === 'left' ? 'mascot-left' : 'mascot-right'}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, type: 'spring' }}
    >
      <motion.img
        src={characterImages[character]}
        alt={character}
        className="w-full h-auto floating"
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      />
      {message && (
        <motion.div
          className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-xl border-3 border-[var(--jma-dark)] whitespace-nowrap"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1 }}
        >
          <span className="font-bold text-sm">{message}</span>
        </motion.div>
      )}
    </motion.div>
  );
}

function FeedbackPopup({ feedback, onComplete }) {
  const feedbackStyles = {
    perfect: { color: '#4CD964', text: 'PERFECT!' },
    great: { color: '#4285F4', text: 'GREAT!' },
    good: { color: '#FFCC00', text: 'GOOD!' },
    miss: { color: '#FF3B30', text: 'MISS!' }
  };

  const style = feedbackStyles[feedback] || feedbackStyles.good;

  return (
    <motion.div
      className="feedback-overlay"
      style={{ color: style.color }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 2, opacity: 0 }}
      transition={{ duration: 0.3 }}
      onAnimationComplete={onComplete}
    >
      {style.text}
    </motion.div>
  );
}

function NotationDisplay({ currentNote, rhythm }) {
  return (
    <div className="notation-display flex items-center gap-4">
      <Volume2 className="w-5 h-5" />
      <div className="flex items-center gap-2">
        <span className="font-bold">Note:</span>
        <span className="text-xl font-bold" style={{ color: 'var(--jma-blue)' }}>
          {currentNote || '-'}
        </span>
      </div>
      {rhythm && (
        <div className="flex items-center gap-2">
          <span className="font-bold">Rhythm:</span>
          <span className="text-xl">{rhythm}</span>
        </div>
      )}
    </div>
  );
}

function ProgressBar({ current, total, color = 'var(--jma-green)' }) {
  const percentage = (current / total) * 100;
  
  return (
    <div className="progress-bar-container w-full max-w-md">
      <div 
        className="progress-bar-fill"
        style={{ 
          width: `${percentage}%`,
          backgroundColor: color
        }}
      />
    </div>
  );
}

export { GameHeader, CharacterMascot, FeedbackPopup, NotationDisplay, ProgressBar };
