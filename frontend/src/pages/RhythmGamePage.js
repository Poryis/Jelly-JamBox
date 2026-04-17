import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, RotateCcw } from 'lucide-react';
import JellyBellsRow, { BELLS } from '../components/JellyBells';
import { GameHeader, FeedbackPopup, ProgressBar } from '../components/GameUI';
import useAudio from '../hooks/useAudio';

// Simple songs for young children
const SONGS = {
  easy: {
    name: 'Hot Cross Buns',
    notes: ['E', 'D', 'C', 'E', 'D', 'C', 'C', 'C', 'C', 'C', 'D', 'D', 'D', 'D', 'E', 'D', 'C'],
    tempo: 800 // ms per note
  },
  medium: {
    name: 'Mary Had a Little Lamb',
    notes: ['E', 'D', 'C', 'D', 'E', 'E', 'E', 'D', 'D', 'D', 'E', 'G', 'G', 'E', 'D', 'C', 'D', 'E', 'E', 'E', 'E', 'D', 'D', 'E', 'D', 'C'],
    tempo: 600
  },
  hard: {
    name: 'Twinkle Twinkle',
    notes: ['C', 'C', 'G', 'G', 'A', 'A', 'G', 'F', 'F', 'E', 'E', 'D', 'D', 'C', 'G', 'G', 'F', 'F', 'E', 'E', 'D', 'G', 'G', 'F', 'F', 'E', 'E', 'D', 'C', 'C', 'G', 'G', 'A', 'A', 'G', 'F', 'F', 'E', 'E', 'D', 'D', 'C'],
    tempo: 500
  }
};

function FallingNote({ note, onMiss, speed, laneIndex, totalLanes }) {
  const bell = BELLS.find(b => b.note === note);
  const laneWidth = 100 / totalLanes;
  
  return (
    <motion.div
      className="note-block"
      style={{
        backgroundColor: bell?.color || '#ccc',
        position: 'absolute',
        left: `${laneIndex * laneWidth + laneWidth / 2}%`,
        transform: 'translateX(-50%)'
      }}
      initial={{ top: -60 }}
      animate={{ top: 'calc(100% + 60px)' }}
      transition={{ duration: speed / 1000, ease: 'linear' }}
      onAnimationComplete={onMiss}
      data-testid={`falling-note-${note}`}
    >
      {bell?.solfege || note}
    </motion.div>
  );
}

function RhythmGamePage({ score, setScore, gameStats, setGameStats, resetGame }) {
  const navigate = useNavigate();
  const { playBellNote, playFeedbackSound, initAudioContext } = useAudio();
  
  const [gameState, setGameState] = useState('menu'); // menu, playing, paused, finished
  const [difficulty, setDifficulty] = useState('easy');
  const [fallingNotes, setFallingNotes] = useState([]);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [highlightedNote, setHighlightedNote] = useState(null);
  
  const gameLoopRef = useRef(null);
  const noteIdRef = useRef(0);

  const currentSong = SONGS[difficulty];
  const activeBells = useMemo(() => [...new Set(currentSong.notes)], [currentSong.notes]);

  // Start game
  const startGame = useCallback(() => {
    initAudioContext();
    resetGame();
    setGameState('playing');
    setCurrentNoteIndex(0);
    setFallingNotes([]);
    noteIdRef.current = 0;
  }, [initAudioContext, resetGame]);

  // Spawn notes
  useEffect(() => {
    if (gameState !== 'playing') return;

    const spawnNote = () => {
      if (currentNoteIndex >= currentSong.notes.length) {
        // Song finished
        setTimeout(() => {
          setGameState('finished');
          navigate('/results');
        }, 2000);
        return;
      }

      const note = currentSong.notes[currentNoteIndex];
      const laneIndex = activeBells.indexOf(note);
      
      setFallingNotes(prev => [
        ...prev,
        {
          id: noteIdRef.current++,
          note,
          laneIndex,
          hit: false
        }
      ]);
      setCurrentNoteIndex(prev => prev + 1);
    };

    gameLoopRef.current = setInterval(spawnNote, currentSong.tempo);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameState, currentNoteIndex, currentSong, activeBells, navigate]);

  // Handle bell tap
  const handlePlayNote = useCallback((tappedNote) => {
    playBellNote(tappedNote);
    setHighlightedNote(tappedNote);
    setTimeout(() => setHighlightedNote(null), 200);

    // Check if there's a matching note in the target zone
    const matchingNote = fallingNotes.find(n => 
      n.note === tappedNote && !n.hit
    );

    if (matchingNote) {
      // Hit! Calculate score based on timing
      const points = 100;
      setScore(prev => prev + points);
      setGameStats(prev => ({
        ...prev,
        perfect: prev.perfect + 1,
        streak: prev.streak + 1,
        maxStreak: Math.max(prev.maxStreak, prev.streak + 1)
      }));
      
      setFeedback('perfect');
      playFeedbackSound('perfect');
      
      // Remove the hit note
      setFallingNotes(prev => prev.filter(n => n.id !== matchingNote.id));
    }

    setTimeout(() => setFeedback(null), 500);
  }, [fallingNotes, playBellNote, playFeedbackSound, setScore, setGameStats]);

  // Handle missed note
  const handleNoteMiss = useCallback((noteId) => {
    setFallingNotes(prev => {
      const note = prev.find(n => n.id === noteId);
      if (note && !note.hit) {
        setGameStats(p => ({
          ...p,
          miss: p.miss + 1,
          streak: 0
        }));
        setFeedback('miss');
        playFeedbackSound('miss');
        setTimeout(() => setFeedback(null), 500);
      }
      return prev.filter(n => n.id !== noteId);
    });
  }, [playFeedbackSound, setGameStats]);

  // Difficulty selection screen
  if (gameState === 'menu') {
    return (
      <div className="min-h-screen sunburst-bg flex flex-col items-center justify-center p-4" data-testid="rhythm-game-menu">
        <GameHeader showHomeButton={true} />
        
        <motion.h1
          className="text-3xl md:text-5xl font-black mb-8 text-center"
          style={{ color: 'var(--jma-dark)', fontFamily: "'Fredoka', cursive" }}
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          Rhythm Game
        </motion.h1>

        <motion.p
          className="text-lg mb-8 text-center max-w-md"
          style={{ color: 'var(--jma-dark)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Hit the Jelly Bells when the notes reach the bottom!
        </motion.p>

        <div className="grid gap-4 w-full max-w-md">
          {Object.entries(SONGS).map(([key, song], idx) => (
            <motion.button
              key={key}
              data-testid={`difficulty-${key}`}
              className={`level-card p-4 text-left ${difficulty === key ? 'ring-4 ring-[var(--jma-blue)]' : ''}`}
              onClick={() => setDifficulty(key)}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 * idx }}
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="text-xl font-bold" style={{ fontFamily: "'Fredoka', cursive" }}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </h3>
              <p className="text-sm opacity-70">{song.name}</p>
              <p className="text-xs mt-1 opacity-50">{song.notes.length} notes</p>
            </motion.button>
          ))}
        </div>

        <motion.button
          data-testid="start-game-button"
          className="chunky-btn bg-[var(--jma-green)] text-white px-8 py-4 mt-8 flex items-center gap-3"
          onClick={startGame}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Play className="w-6 h-6" />
          <span className="text-xl font-bold">START!</span>
        </motion.button>
      </div>
    );
  }

  // Game playing screen
  return (
    <div className="min-h-screen sunburst-cool flex flex-col" data-testid="rhythm-game-playing">
      <GameHeader 
        title={currentSong.name}
        score={score} 
        streak={gameStats.streak}
        showHomeButton={true} 
      />

      {/* Progress bar */}
      <div className="fixed top-16 left-0 right-0 px-4 py-2 z-40">
        <ProgressBar 
          current={currentNoteIndex} 
          total={currentSong.notes.length}
          color="var(--jma-green)"
        />
      </div>

      {/* Feedback popup */}
      <AnimatePresence>
        {feedback && (
          <FeedbackPopup feedback={feedback} onComplete={() => setFeedback(null)} />
        )}
      </AnimatePresence>

      {/* Game area */}
      <main className="flex-1 flex flex-col pt-24 pb-4 px-2 md:px-4">
        <div className="game-board flex-1 relative overflow-hidden">
          {/* Lanes */}
          <div className="rhythm-lanes">
            {activeBells.map((note, idx) => {
              const bell = BELLS.find(b => b.note === note);
              return (
                <div 
                  key={note}
                  className="rhythm-lane"
                  style={{ 
                    backgroundColor: `${bell?.color}15`
                  }}
                >
                  {/* Target zone indicator */}
                  <div className="lane-target" />
                </div>
              );
            })}

            {/* Falling notes */}
            <AnimatePresence>
              {fallingNotes.map(note => (
                <FallingNote
                  key={note.id}
                  note={note.note}
                  laneIndex={note.laneIndex}
                  totalLanes={activeBells.length}
                  speed={2500}
                  onMiss={() => handleNoteMiss(note.id)}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Bell controls at bottom */}
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t-4 border-[var(--jma-dark)] p-2">
            <div className="flex justify-center gap-2">
              {activeBells.map(note => {
                const bell = BELLS.find(b => b.note === note);
                return (
                  <motion.button
                    key={note}
                    data-testid={`game-bell-${note}`}
                    className="w-12 h-14 md:w-16 md:h-18 rounded-xl border-3 border-[var(--jma-dark)] flex items-center justify-center font-bold text-white text-sm md:text-base"
                    style={{ backgroundColor: bell?.color }}
                    onClick={() => handlePlayNote(note)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {bell?.solfege}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default RhythmGamePage;
