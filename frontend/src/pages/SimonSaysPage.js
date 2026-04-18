import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Play, Eye, RotateCcw } from 'lucide-react';
import JellyBellsRow, { BELLS, KEY_TO_NOTE } from '../components/JellyBells';
import { GameHeader, FeedbackPopup, ProgressBar } from '../components/GameUI';
import { PageCharacters } from '../components/PageCharacters';
import { FullscreenButton } from '../components/FullscreenButton';
import useAudio from '../hooks/useAudio';

// Patterns for Simon Says (progressively harder)
const PATTERNS = {
  1: ['C', 'E', 'G'],
  2: ['C', 'D', 'E', 'F'],
  3: ['G', 'E', 'C', 'E', 'G'],
  4: ['C', 'E', 'G', 'High C', 'G', 'E'],
  5: ['D', 'E', 'F', 'G', 'A', 'G', 'F'],
  6: ['C', 'D', 'E', 'F', 'G', 'F', 'E', 'D'],
  7: ['E', 'E', 'F', 'G', 'G', 'F', 'E', 'D', 'C'],
  8: ['C', 'C', 'G', 'G', 'A', 'A', 'G', 'F', 'F', 'E']
};

function SimonSaysPage({ score, setScore, gameStats, setGameStats, resetGame }) {
  const navigate = useNavigate();
  const { playBellNote, playFeedbackSound, initAudioContext } = useAudio();

  const [gameState, setGameState] = useState('ready');
  const [level, setLevel] = useState(1);
  const [showingIndex, setShowingIndex] = useState(-1);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [highlightedNote, setHighlightedNote] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [message, setMessage] = useState('Watch and listen!');

  const timeoutRef = useRef(null);
  const bellsRowRef = useRef(null); // Imperative handle to flash bells instantly
  const currentPattern = PATTERNS[level] || PATTERNS[8];

  // Clean up timeouts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Start the game
  const startGame = useCallback(() => {
    initAudioContext();
    resetGame();
    setLevel(1);
    setGameState('showing');
    setMessage('Watch and listen!');
    setShowingIndex(0);
  }, [initAudioContext, resetGame]);

  // Show pattern to player
  useEffect(() => {
    if (gameState !== 'showing') return;

    if (showingIndex >= currentPattern.length) {
      // Done showing, player's turn
      setGameState('playing');
      setMessage('Your turn! Repeat the pattern!');
      setPlayerIndex(0);
      setHighlightedNote(null);
      return;
    }

    const note = currentPattern[showingIndex];
    setHighlightedNote(note);
    playBellNote(note);
    // Imperative visual swap for Simon's demo - bypasses React state delay
    if (bellsRowRef.current) bellsRowRef.current.flashNote(note, 500);

    timeoutRef.current = setTimeout(() => {
      setHighlightedNote(null);
      timeoutRef.current = setTimeout(() => {
        setShowingIndex(prev => prev + 1);
      }, 300);
    }, 500);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [gameState, showingIndex, currentPattern, playBellNote]);

  // Handle player input
  const handlePlayNote = useCallback((note) => {
    if (gameState !== 'playing') return;

    playBellNote(note);
    setHighlightedNote(note);
    setTimeout(() => setHighlightedNote(null), 200);

    const expectedNote = currentPattern[playerIndex];

    if (note === expectedNote) {
      // Correct!
      const newIndex = playerIndex + 1;
      setPlayerIndex(newIndex);
      setScore(prev => prev + 10 * level);

      if (newIndex >= currentPattern.length) {
        // Level complete!
        setGameStats(prev => ({
          ...prev,
          perfect: prev.perfect + 1,
          streak: prev.streak + 1,
          maxStreak: Math.max(prev.maxStreak, prev.streak + 1)
        }));
        
        setFeedback('perfect');
        playFeedbackSound('perfect');
        setMessage('Great job!');
        setGameState('success');

        // Move to next level or finish
        timeoutRef.current = setTimeout(() => {
          if (level >= 8) {
            setGameState('finished');
            navigate('/results');
          } else {
            setLevel(prev => prev + 1);
            setShowingIndex(0);
            setGameState('showing');
            setMessage('Watch and listen!');
          }
          setFeedback(null);
        }, 1500);
      }
    } else {
      // Wrong!
      setGameStats(prev => ({
        ...prev,
        miss: prev.miss + 1,
        streak: 0
      }));
      
      setFeedback('miss');
      playFeedbackSound('miss');
      setMessage('Oops! Try again!');
      setGameState('fail');

      // Retry same level
      timeoutRef.current = setTimeout(() => {
        setShowingIndex(0);
        setGameState('showing');
        setMessage('Watch and listen!');
        setFeedback(null);
      }, 1500);
    }
  }, [gameState, playerIndex, currentPattern, level, playBellNote, playFeedbackSound, setScore, setGameStats, navigate]);

  // Keyboard controls for Simon Says
  useEffect(() => {
    if (gameState !== 'playing') return;

    const handleKeyDown = (e) => {
      const note = KEY_TO_NOTE[e.key];
      if (note) {
        handlePlayNote(note);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handlePlayNote]);

  // Ready screen
  if (gameState === 'ready') {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center p-4" 
        data-testid="simon-says-menu"
        style={{
          backgroundImage: 'url(/assets/backgrounds/underwater.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <GameHeader showHomeButton={true} />
        <FullscreenButton />

        <motion.h1
          className="text-3xl md:text-5xl font-black mb-4 text-center"
          style={{ color: 'var(--jma-dark)', fontFamily: "'Fredoka', cursive" }}
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          Simon Says
        </motion.h1>

        <motion.div
          className="game-card p-6 mb-8 max-w-md text-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Eye className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--jma-blue)' }} />
          <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "'Fredoka', cursive" }}>
            How to Play
          </h2>
          <p className="text-base" style={{ color: 'var(--jma-dark)' }}>
            1. Watch the bells light up<br />
            2. Listen to the melody<br />
            3. Repeat the pattern!
          </p>
        </motion.div>

        <motion.button
          data-testid="start-simon-button"
          className="chunky-btn bg-[var(--jma-blue)] text-white px-8 py-4 flex items-center gap-3"
          onClick={startGame}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: 'spring' }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Play className="w-6 h-6" />
          <span className="text-xl font-bold">START!</span>
        </motion.button>

        <PageCharacters page="simon-menu" />
      </div>
    );
  }

  // Game screen
  return (
    <div 
      className="min-h-screen flex flex-col" 
      data-testid="simon-says-playing"
      style={{
        backgroundImage: 'url(/assets/backgrounds/underwater.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <GameHeader 
        title={`Level ${level}`}
        score={score}
        streak={gameStats.streak}
        showHomeButton={true}
      />

      {/* Progress */}
      <div className="fixed top-16 left-0 right-0 px-4 py-2 z-40">
        <ProgressBar 
          current={level} 
          total={8}
          color="var(--jma-purple)"
        />
      </div>

      {/* Feedback popup */}
      <AnimatePresence>
        {feedback && (
          <FeedbackPopup feedback={feedback} onComplete={() => setFeedback(null)} />
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col items-center justify-center pt-24 pb-8 px-4">
        {/* Message */}
        <motion.div
          key={message}
          className="game-card px-6 py-4 mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <p 
            className="text-xl md:text-2xl font-bold text-center"
            style={{ color: 'var(--jma-dark)', fontFamily: "'Fredoka', cursive" }}
          >
            {message}
          </p>
        </motion.div>

        {/* Pattern progress (during playing) */}
        {gameState === 'playing' && (
          <div className="flex gap-2 mb-6">
            {currentPattern.map((note, idx) => {
              const bell = BELLS.find(b => b.note === note);
              const isCompleted = idx < playerIndex;
              const isCurrent = idx === playerIndex;
              
              return (
                <motion.div
                  key={idx}
                  className={`w-8 h-8 rounded-full border-3 border-[var(--jma-dark)] ${
                    isCompleted ? '' : 'opacity-30'
                  } ${isCurrent ? 'ring-4 ring-[var(--jma-yellow)]' : ''}`}
                  style={{ backgroundColor: bell?.color }}
                  animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                />
              );
            })}
          </div>
        )}

        {/* Jelly Bells */}
        <motion.div
          className="game-board p-4 md:p-8"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <JellyBellsRow 
            ref={bellsRowRef}
            onPlayNote={handlePlayNote}
            onNoteUp={() => {}}
            highlightedNote={highlightedNote}
            showNotation={true}
          />
        </motion.div>

        {/* Hint for showing phase */}
        {gameState === 'showing' && (
          <motion.p
            className="mt-6 text-lg font-bold opacity-70"
            style={{ color: 'var(--jma-dark)' }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            Showing note {showingIndex + 1} of {currentPattern.length}...
          </motion.p>
        )}
      </main>
      <PageCharacters page="simon-play" />
    </div>
  );
}

export default SimonSaysPage;
