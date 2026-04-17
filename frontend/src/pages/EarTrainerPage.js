import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Play, Ear, RotateCcw, Volume2, Trophy } from 'lucide-react';
import JellyBellsRow, { BELLS } from '../components/JellyBells';
import { GameHeader } from '../components/GameUI';
import { PageCharacters } from '../components/PageCharacters';
import { FullscreenButton } from '../components/FullscreenButton';
import useAudio from '../hooks/useAudio';
import { getEarTrainerStats, saveEarTrainerStats } from '../hooks/useScores';

// Difficulty levels
const LEVELS = {
  beginner: { name: 'Beginner', noteCount: 3, notes: ['C', 'E', 'G'], description: 'Do, Mi, So' },
  easy: { name: 'Easy', noteCount: 5, notes: ['C', 'D', 'E', 'F', 'G'], description: 'Do through So' },
  medium: { name: 'Medium', noteCount: 7, notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'], description: 'Full scale' },
  hard: { name: 'Hard', noteCount: 8, notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'High C'], description: 'Full scale + High Do' }
};

function EarTrainerPage() {
  const navigate = useNavigate();
  const { playBellNote, playFeedbackSound, initAudioContext } = useAudio();

  const [gameState, setGameState] = useState('menu'); // menu, playing, feedback
  const [difficulty, setDifficulty] = useState('beginner');
  const [targetNote, setTargetNote] = useState(null);
  const [guess, setGuess] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [round, setRound] = useState(0);
  const [totalRounds] = useState(10);
  const [results, setResults] = useState({ correct: 0, wrong: 0 });
  const [showAnswer, setShowAnswer] = useState(false);
  const [stats, setStats] = useState(getEarTrainerStats());

  const level = LEVELS[difficulty];
  const timeoutRef = useRef(null);

  // Cleanup
  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  // Pick random note and play it
  const playNewNote = useCallback(() => {
    const notes = level.notes;
    const note = notes[Math.floor(Math.random() * notes.length)];
    setTargetNote(note);
    setGuess(null);
    setIsCorrect(null);
    setShowAnswer(false);
    // Small delay then play the note
    setTimeout(() => playBellNote(note), 300);
  }, [level.notes, playBellNote]);

  // Start game
  const startGame = useCallback(() => {
    initAudioContext();
    setGameState('playing');
    setScore(0);
    setStreak(0);
    setRound(1);
    setResults({ correct: 0, wrong: 0 });
    setTimeout(() => {
      const notes = LEVELS[difficulty].notes;
      const note = notes[Math.floor(Math.random() * notes.length)];
      setTargetNote(note);
      setGuess(null);
      setIsCorrect(null);
      setShowAnswer(false);
      setTimeout(() => playBellNote(note), 300);
    }, 500);
  }, [initAudioContext, difficulty, playBellNote]);

  // Handle guess
  const handleGuess = useCallback((guessedNote) => {
    if (isCorrect !== null) return; // Already answered
    
    playBellNote(guessedNote);
    setGuess(guessedNote);
    
    const correct = guessedNote === targetNote;
    setIsCorrect(correct);
    setShowAnswer(true);

    if (correct) {
      setScore(prev => prev + (10 * (streak + 1)));
      setStreak(prev => prev + 1);
      setResults(prev => ({ ...prev, correct: prev.correct + 1 }));
      playFeedbackSound('perfect');
    } else {
      setStreak(0);
      setResults(prev => ({ ...prev, wrong: prev.wrong + 1 }));
      playFeedbackSound('miss');
      // Play the correct note after a delay so they learn
      timeoutRef.current = setTimeout(() => playBellNote(targetNote), 800);
    }

    // Move to next round after delay
    timeoutRef.current = setTimeout(() => {
      if (round >= totalRounds) {
        // Game over
        saveEarTrainerStats({
          correct: results.correct + (correct ? 1 : 0),
          attempts: totalRounds,
          streak
        });
        setStats(getEarTrainerStats());
        setGameState('menu');
      } else {
        setRound(prev => prev + 1);
        const notes = level.notes;
        const note = notes[Math.floor(Math.random() * notes.length)];
        setTargetNote(note);
        setGuess(null);
        setIsCorrect(null);
        setShowAnswer(false);
        setTimeout(() => playBellNote(note), 300);
      }
    }, correct ? 1200 : 2000);
  }, [targetNote, isCorrect, playBellNote, playFeedbackSound, streak, round, totalRounds, results, level.notes]);

  // Replay the note
  const replayNote = useCallback(() => {
    if (targetNote && isCorrect === null) {
      playBellNote(targetNote);
    }
  }, [targetNote, isCorrect, playBellNote]);

  // MENU screen
  if (gameState === 'menu') {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center p-4"
        data-testid="ear-trainer-menu"
        style={{ backgroundImage: 'url(/assets/backgrounds/beach.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <GameHeader showHomeButton={true} />
        <FullscreenButton />

        <motion.h1 className="text-3xl md:text-5xl font-black mb-4 text-center font-display" style={{ color: 'var(--jma-dark)' }} initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          Ear Trainer
        </motion.h1>

        <motion.div className="game-card p-6 mb-6 max-w-md text-center" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}>
          <Ear className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--jma-blue)' }} />
          <h2 className="text-xl font-bold mb-2 font-display">How to Play</h2>
          <p className="text-base" style={{ color: 'var(--jma-dark)' }}>
            1. Listen to the mystery note<br />
            2. Tap the bell you think it is<br />
            3. Get it right for bonus points!
          </p>
        </motion.div>

        {/* Stats */}
        {stats.totalAttempts > 0 && (
          <motion.div className="game-card p-4 mb-4 max-w-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <div className="flex justify-around text-center">
              <div>
                <p className="text-xl font-bold" style={{ color: 'var(--jma-green)' }}>{stats.totalCorrect}</p>
                <p className="text-xs">Total Correct</p>
              </div>
              <div>
                <p className="text-xl font-bold" style={{ color: 'var(--jma-orange)' }}>{stats.bestStreak}</p>
                <p className="text-xs">Best Streak</p>
              </div>
              <div>
                <p className="text-xl font-bold" style={{ color: 'var(--jma-blue)' }}>
                  {stats.totalAttempts > 0 ? Math.round((stats.totalCorrect / stats.totalAttempts) * 100) : 0}%
                </p>
                <p className="text-xs">Accuracy</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Difficulty */}
        <div className="grid gap-2 w-full max-w-md mb-6">
          {Object.entries(LEVELS).map(([key, lvl], idx) => (
            <motion.button key={key} data-testid={`ear-difficulty-${key}`}
              className={`level-card p-3 text-left ${difficulty === key ? 'ring-4 ring-[var(--jma-blue)]' : ''}`}
              onClick={() => setDifficulty(key)}
              initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 * idx }}
            >
              <h3 className="text-lg font-bold font-display">{lvl.name}</h3>
              <p className="text-xs opacity-60">{lvl.description} ({lvl.noteCount} notes)</p>
            </motion.button>
          ))}
        </div>

        <motion.button data-testid="start-ear-trainer" className="chunky-btn bg-[var(--jma-blue)] text-white px-8 py-3 flex items-center gap-3" onClick={startGame} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Ear className="w-6 h-6" /><span className="text-xl font-bold font-display">START!</span>
        </motion.button>
      </div>
    );
  }

  // PLAYING screen
  return (
    <div 
      className="min-h-screen flex flex-col"
      data-testid="ear-trainer-playing"
      style={{ backgroundImage: 'url(/assets/backgrounds/beach.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <GameHeader title={`Round ${round} / ${totalRounds}`} score={score} streak={streak} showHomeButton={true} />

      <main className="flex-1 flex flex-col items-center justify-center pt-20 pb-8 px-4">
        {/* Mystery note indicator */}
        <motion.div className="game-card px-8 py-6 mb-6 text-center" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
          <motion.div 
            className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center border-4 border-[var(--jma-dark)]"
            style={{ backgroundColor: showAnswer ? (BELLS.find(b => b.note === targetNote)?.color || '#ccc') : 'var(--jma-purple)' }}
            animate={isCorrect === null ? { scale: [1, 1.05, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            {showAnswer ? (
              <span className="text-2xl font-bold text-white font-display">
                {BELLS.find(b => b.note === targetNote)?.solfege}
              </span>
            ) : (
              <span className="text-3xl text-white">?</span>
            )}
          </motion.div>

          <p className="text-lg font-bold font-display" style={{ color: 'var(--jma-dark)' }}>
            {isCorrect === null ? 'What note is this?' : isCorrect ? 'Correct!' : `It was ${BELLS.find(b => b.note === targetNote)?.solfege}!`}
          </p>

          {isCorrect === null && (
            <motion.button className="chunky-btn bg-[var(--jma-purple)] text-white px-4 py-2 mt-3 flex items-center gap-2 mx-auto" onClick={replayNote} whileTap={{ scale: 0.95 }}>
              <Volume2 className="w-5 h-5" /> Play Again
            </motion.button>
          )}
        </motion.div>

        {/* Feedback */}
        <AnimatePresence>
          {isCorrect !== null && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="mb-4">
              <span className={`text-3xl font-black font-display ${isCorrect ? 'text-[var(--jma-green)]' : 'text-[var(--jma-red)]'}`}
                style={{ textShadow: '2px 2px 0 var(--jma-dark)' }}>
                {isCorrect ? 'PERFECT!' : 'TRY AGAIN!'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bells to guess from */}
        <motion.div className="game-board p-4 md:p-6" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <div className="bell-row">
            {BELLS.filter(b => level.notes.includes(b.note)).map((bell) => (
              <motion.div key={bell.note} className="bell-container">
                <motion.button
                  data-testid={`ear-bell-${bell.note.replace(' ', '-')}`}
                  className={`bell-instrument relative ${guess === bell.note ? (isCorrect ? 'ring-4 ring-[var(--jma-green)]' : 'ring-4 ring-[var(--jma-red)]') : ''} ${showAnswer && bell.note === targetNote ? 'ring-4 ring-[var(--jma-green)]' : ''}`}
                  onClick={isCorrect === null ? () => handleGuess(bell.note) : undefined}
                  disabled={isCorrect !== null}
                  whileHover={isCorrect === null ? { scale: 1.05 } : {}}
                  whileTap={isCorrect === null ? { scale: 0.95 } : {}}
                  style={{ background: 'transparent', border: 'none', padding: 0, cursor: isCorrect === null ? 'pointer' : 'default' }}
                >
                  <img src={bell.image1} alt={bell.solfege} className="w-20 h-24 md:w-28 md:h-32 object-contain pointer-events-none" draggable={false} />
                  <div className="absolute -top-2 -right-1 w-6 h-6 rounded-full bg-white border-2 border-[var(--jma-dark)] flex items-center justify-center text-xs font-bold" style={{ color: bell.color }}>{bell.key}</div>
                </motion.button>
                <div className="bell-note-label text-center">
                  <span style={{ color: bell.color }}>{bell.solfege}</span>
                  <span className="block text-xs opacity-70">({bell.note})</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Round progress */}
        <div className="flex gap-1 mt-6">
          {Array.from({ length: totalRounds }, (_, i) => (
            <div key={i} className="w-6 h-6 rounded-full border-2 border-[var(--jma-dark)]" style={{
              backgroundColor: i < round - 1 ? (i < results.correct ? 'var(--jma-green)' : 'var(--jma-red)') : i === round - 1 ? 'var(--jma-yellow)' : 'white'
            }} />
          ))}
        </div>
      </main>
      <PageCharacters page="ear-trainer" />
    </div>
  );
}

export default EarTrainerPage;
