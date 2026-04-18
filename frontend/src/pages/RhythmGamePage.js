import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Play, Trophy, Zap } from 'lucide-react';
import { BELLS, KEY_TO_NOTE } from '../components/JellyBells';
import { GameHeader, FeedbackPopup, ProgressBar } from '../components/GameUI';
import { PageCharacters } from '../components/PageCharacters';
import { FullscreenButton } from '../components/FullscreenButton';
import useAudio from '../hooks/useAudio';
import { SONG_LIBRARY, SPEED_SETTINGS, getSongsByCategory } from '../data/songs';
import { getHighScore, saveHighScore, getTopScores } from '../hooks/useScores';

const NOTE_ORDER = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'High C'];

// Falling bell image note
function FallingBellNote({ note, laneIndex, totalLanes, speed }) {
  const bell = BELLS.find(b => b.note === note);
  const laneWidth = 100 / totalLanes;

  return (
    <motion.div
      className="absolute flex flex-col items-center"
      style={{
        left: `${laneIndex * laneWidth + laneWidth / 2}%`,
        transform: 'translateX(-50%)',
      }}
      initial={{ top: -80 }}
      animate={{ top: 'calc(100% + 80px)' }}
      transition={{ duration: speed / 1000, ease: 'linear' }}
    >
      <img
        src={bell?.image1}
        alt={bell?.solfege}
        className="w-10 h-12 md:w-12 md:h-14 object-contain drop-shadow-md"
        draggable={false}
      />
      <span className="text-xs font-bold mt-0.5 px-1.5 rounded-full text-white"
        style={{ backgroundColor: bell?.color, textShadow: '1px 1px 0 rgba(0,0,0,0.3)' }}>
        {bell?.solfege}
      </span>
    </motion.div>
  );
}

function RhythmGamePage({ score, setScore, gameStats, setGameStats, resetGame }) {
  const navigate = useNavigate();
  const { playBellNote, playFeedbackSound, initAudioContext } = useAudio();

  const [gameState, setGameState] = useState('menu');
  const [selectedSong, setSelectedSong] = useState(SONG_LIBRARY[0]);
  const [speed, setSpeed] = useState('normal');
  const [showHighScores, setShowHighScores] = useState(false);
  const [fallingNotes, setFallingNotes] = useState([]);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('All');

  const gameLoopRef = useRef(null);
  const noteIdRef = useRef(0);
  const fallingNotesRef = useRef([]);
  // Imperative refs for instant bell frame swap (no React render involved)
  const bellImgRefs = useRef({});
  const pressedKeysRef = useRef(new Set()); // dedup keyboard repeats

  const speedConfig = SPEED_SETTINGS[speed];
  const songCategories = useMemo(() => getSongsByCategory(), []);
  const categories = ['All', ...Object.keys(songCategories)];

  const filteredSongs = categoryFilter === 'All'
    ? SONG_LIBRARY
    : SONG_LIBRARY.filter(s => s.category === categoryFilter);

  const activeBells = useMemo(() => {
    const uniqueNotes = [...new Set(selectedSong.notes)];
    return uniqueNotes.sort((a, b) => NOTE_ORDER.indexOf(a) - NOTE_ORDER.indexOf(b));
  }, [selectedSong.notes]);

  useEffect(() => { fallingNotesRef.current = fallingNotes; }, [fallingNotes]);

  const startGame = useCallback(() => {
    initAudioContext();
    resetGame();
    setGameState('playing');
    setCurrentNoteIndex(0);
    setFallingNotes([]);
    noteIdRef.current = 0;
    setIsNewRecord(false);
  }, [initAudioContext, resetGame]);

  const handlePlayNote = useCallback((tappedNote) => {
    playBellNote(tappedNote);
    const currentNotes = fallingNotesRef.current;
    const matchingNote = currentNotes.find(n => n.note === tappedNote && !n.hit);

    if (matchingNote) {
      setScore(prev => prev + 100);
      setGameStats(prev => ({
        ...prev, perfect: prev.perfect + 1, streak: prev.streak + 1,
        maxStreak: Math.max(prev.maxStreak, prev.streak + 1)
      }));
      setFeedback('perfect');
      playFeedbackSound('perfect');
      setFallingNotes(prev => prev.filter(n => n.id !== matchingNote.id));
    }
    setTimeout(() => setFeedback(null), 400);
  }, [playBellNote, playFeedbackSound, setScore, setGameStats]);

  // Keyboard controls - imperative image swap via ref (no React render)
  useEffect(() => {
    if (gameState !== 'playing') return;
    const handleKeyDown = (e) => {
      const note = KEY_TO_NOTE[e.key];
      if (note && activeBells.includes(note) && !pressedKeysRef.current.has(e.key)) {
        pressedKeysRef.current.add(e.key);
        const refs = bellImgRefs.current[note];
        if (refs?.current) refs.current.style.display = 'none';
        if (refs?.pressedEl) refs.pressedEl.style.display = 'block';
        handlePlayNote(note);
      }
    };
    const handleKeyUp = (e) => {
      const note = KEY_TO_NOTE[e.key];
      if (note) {
        pressedKeysRef.current.delete(e.key);
        const refs = bellImgRefs.current[note];
        if (refs?.pressedEl) refs.pressedEl.style.display = 'none';
        if (refs?.current) refs.current.style.display = 'block';
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
  }, [gameState, activeBells, handlePlayNote]);

  // Spawn notes
  useEffect(() => {
    if (gameState !== 'playing') return;
    const spawnNote = () => {
      if (currentNoteIndex >= selectedSong.notes.length) {
        setTimeout(() => setGameState('finished'), 2000);
        return;
      }
      const note = selectedSong.notes[currentNoteIndex];
      const laneIndex = activeBells.indexOf(note);
      setFallingNotes(prev => [...prev, { id: noteIdRef.current++, note, laneIndex, hit: false }]);
      setCurrentNoteIndex(prev => prev + 1);
    };
    gameLoopRef.current = setInterval(spawnNote, speedConfig.ms);
    return () => { if (gameLoopRef.current) clearInterval(gameLoopRef.current); };
  }, [gameState, currentNoteIndex, selectedSong, activeBells, speedConfig.ms]);

  // Handle missed notes
  const handleNoteMiss = useCallback((noteId) => {
    setFallingNotes(prev => {
      const note = prev.find(n => n.id === noteId);
      if (note && !note.hit) {
        setGameStats(p => ({ ...p, miss: p.miss + 1, streak: 0 }));
        setFeedback('miss');
        playFeedbackSound('miss');
        setTimeout(() => setFeedback(null), 400);
      }
      return prev.filter(n => n.id !== noteId);
    });
  }, [playFeedbackSound, setGameStats]);

  // Save score when game ends
  useEffect(() => {
    if (gameState !== 'finished') return;
    const total = gameStats.perfect + gameStats.miss;
    const accuracy = total > 0 ? Math.round((gameStats.perfect / total) * 100) : 0;
    const newRecord = saveHighScore(selectedSong.id, speed, score, { accuracy, maxStreak: gameStats.maxStreak });
    setIsNewRecord(newRecord);
  }, [gameState, selectedSong.id, speed, score, gameStats]);

  // FINISHED screen
  if (gameState === 'finished') {
    const total = gameStats.perfect + gameStats.miss;
    const accuracy = total > 0 ? Math.round((gameStats.perfect / total) * 100) : 0;
    let rating, ratingColor;
    if (accuracy >= 90) { rating = 'SUPERSTAR!'; ratingColor = '#FFD700'; }
    else if (accuracy >= 70) { rating = 'GREAT JOB!'; ratingColor = '#4CD964'; }
    else if (accuracy >= 50) { rating = 'GOOD TRY!'; ratingColor = '#4285F4'; }
    else { rating = 'KEEP GOING!'; ratingColor = '#FF9500'; }

    return (
      <div className="min-h-screen sunburst-bg flex flex-col items-center justify-center p-4" data-testid="rhythm-results">
        <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring' }} className="mb-4">
          <div className="w-24 h-24 rounded-full flex items-center justify-center border-4 border-[var(--jma-dark)]" style={{ backgroundColor: ratingColor }}>
            <Trophy className="w-12 h-12 text-white" />
          </div>
        </motion.div>
        {isNewRecord && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-[var(--jma-yellow)] text-[var(--jma-dark)] px-4 py-2 rounded-full border-4 border-[var(--jma-dark)] mb-4 font-display text-xl font-bold">
            NEW HIGH SCORE!
          </motion.div>
        )}
        <h1 className="text-4xl md:text-5xl font-black mb-2 font-display" style={{ color: ratingColor, textShadow: '3px 3px 0 var(--jma-dark)' }}>{rating}</h1>
        <p className="text-lg mb-4 font-display" style={{ color: 'var(--jma-dark)' }}>{selectedSong.name} - {speedConfig.label}</p>
        <div className="game-card p-6 w-full max-w-sm mb-6">
          <div className="text-center mb-4">
            <p className="text-sm uppercase opacity-70">Score</p>
            <p className="text-5xl font-black font-display" style={{ color: 'var(--jma-dark)' }}>{score.toLocaleString()}</p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-2 rounded-xl" style={{ backgroundColor: '#4CD96420' }}>
              <p className="text-xl font-bold" style={{ color: '#4CD964' }}>{gameStats.perfect}</p>
              <p className="text-xs">Hit</p>
            </div>
            <div className="p-2 rounded-xl" style={{ backgroundColor: '#FF3B3020' }}>
              <p className="text-xl font-bold" style={{ color: '#FF3B30' }}>{gameStats.miss}</p>
              <p className="text-xs">Miss</p>
            </div>
            <div className="p-2 rounded-xl" style={{ backgroundColor: '#FF950020' }}>
              <p className="text-xl font-bold" style={{ color: '#FF9500' }}>{gameStats.maxStreak}x</p>
              <p className="text-xs">Streak</p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <motion.button data-testid="play-again-button" className="chunky-btn bg-[var(--jma-green)] text-white px-6 py-3 font-bold" onClick={startGame} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Play Again</motion.button>
          <motion.button className="chunky-btn bg-white px-6 py-3 font-bold" style={{ color: 'var(--jma-dark)' }} onClick={() => setGameState('menu')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Pick Song</motion.button>
          <motion.button data-testid="home-button-results" className="chunky-btn bg-white px-6 py-3 font-bold" style={{ color: 'var(--jma-dark)' }} onClick={() => navigate('/')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Home</motion.button>
        </div>
      </div>
    );
  }

  // MENU screen
  if (gameState === 'menu') {
    const topScores = getTopScores(5);
    return (
      <div className="min-h-screen sunburst-bg flex flex-col items-center p-4 pt-20 pb-8" data-testid="rhythm-game-menu">
        <GameHeader showHomeButton={true} />
        <motion.h1 className="text-3xl md:text-5xl font-black mb-2 text-center font-display" style={{ color: 'var(--jma-dark)' }} initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>Rhythm Game</motion.h1>
        <p className="text-sm mb-2 bg-white rounded-xl border-2 border-[var(--jma-dark)] px-4 py-1" style={{ color: 'var(--jma-dark)' }}><strong>Controls:</strong> Keys 1-8, click, or tap</p>
        <button data-testid="toggle-high-scores" className="text-sm font-bold mb-4 underline" style={{ color: 'var(--jma-blue)' }} onClick={() => setShowHighScores(!showHighScores)}>
          {showHighScores ? 'Hide' : 'Show'} High Scores <Trophy className="inline w-4 h-4" />
        </button>
        {showHighScores && topScores.length > 0 && (
          <motion.div className="game-card p-4 mb-4 w-full max-w-lg" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}>
            <h3 className="font-bold text-center mb-2 font-display">Top Scores</h3>
            <div className="space-y-1">
              {topScores.map((s, i) => {
                const song = SONG_LIBRARY.find(sl => sl.id === s.songId);
                return (<div key={i} className="flex justify-between text-sm px-2 py-1 rounded bg-[var(--jma-bg)]"><span className="font-bold">{i+1}. {song?.name || s.songId}</span><span>{s.score.toLocaleString()} ({s.speed})</span></div>);
              })}
            </div>
          </motion.div>
        )}
        <div className="flex gap-2 mb-4">
          {Object.entries(SPEED_SETTINGS).map(([key, cfg]) => (
            <motion.button key={key} data-testid={`speed-${key}`}
              className={`chunky-btn px-4 py-2 text-sm font-bold ${speed === key ? 'ring-4 ring-[var(--jma-yellow)]' : ''}`}
              style={{ backgroundColor: cfg.color, color: key === 'normal' ? 'var(--jma-dark)' : 'white' }}
              onClick={() => setSpeed(key)} whileTap={{ scale: 0.95 }}>
              <Zap className="inline w-4 h-4 mr-1" />{cfg.label}
            </motion.button>
          ))}
        </div>
        <div className="flex gap-2 mb-3 flex-wrap justify-center">
          {categories.map(cat => (
            <button key={cat} className={`px-3 py-1 rounded-full text-sm font-bold border-2 border-[var(--jma-dark)] transition-all ${categoryFilter === cat ? 'bg-[var(--jma-dark)] text-white' : 'bg-white'}`} onClick={() => setCategoryFilter(cat)}>{cat}</button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full max-w-2xl mb-4 max-h-[50vh] overflow-y-auto pr-1">
          {filteredSongs.map((song) => {
            const highScore = getHighScore(song.id, speed);
            return (
              <motion.button key={song.id} data-testid={`song-${song.id}`}
                className={`level-card p-3 text-left flex items-center gap-3 ${selectedSong.id === song.id ? 'ring-4 ring-[var(--jma-blue)]' : ''}`}
                onClick={() => { setSelectedSong(song); startGame(); }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}>
                <div className="flex-1">
                  <h3 className="text-base font-bold font-display">{song.name}</h3>
                  <p className="text-xs opacity-60">{song.category} - {song.notes.length} notes</p>
                </div>
                {highScore && (<div className="text-right"><p className="text-xs font-bold" style={{ color: 'var(--jma-orange)' }}><Trophy className="inline w-3 h-3" /> {highScore.score}</p></div>)}
                <Play className="w-5 h-5 text-[var(--jma-green)] flex-shrink-0" />
              </motion.button>
            );
          })}
        </div>
        <p className="text-xs opacity-70 mb-3">Tap a song to start!</p>
        <PageCharacters page="rhythm-menu" />
      </div>
    );
  }

  // PLAYING screen - with Jelly Bell images!
  return (
    <div className="min-h-screen sunburst-cool flex flex-col" data-testid="rhythm-game-playing">
      <GameHeader title={selectedSong.name} score={score} streak={gameStats.streak} showHomeButton={true} />
      <div className="fixed top-16 left-0 right-0 px-4 py-2 z-40">
        <ProgressBar current={currentNoteIndex} total={selectedSong.notes.length} color={speedConfig.color} />
      </div>
      <AnimatePresence>{feedback && <FeedbackPopup feedback={feedback} />}</AnimatePresence>
      <main className="flex-1 flex flex-col pt-24 pb-4 px-2 md:px-4">
        <div className="game-board flex-1 relative overflow-hidden">
          {/* Lanes - each lane has its bell at the target line */}
          <div className="rhythm-lanes">
            {activeBells.map((note) => {
              const bell = BELLS.find(b => b.note === note);
              if (!bellImgRefs.current[note]) bellImgRefs.current[note] = { current: null, pressedEl: null };
              const setIdleRef = (el) => { bellImgRefs.current[note].current = el; };
              const setPressedRef = (el) => { bellImgRefs.current[note].pressedEl = el; };
              const doDown = (e) => {
                e.preventDefault();
                const idle = bellImgRefs.current[note]?.current;
                const pressed = bellImgRefs.current[note]?.pressedEl;
                if (idle) idle.style.display = 'none';
                if (pressed) pressed.style.display = 'block';
                handlePlayNote(note);
              };
              const doUp = (e) => {
                if (e) e.preventDefault();
                const idle = bellImgRefs.current[note]?.current;
                const pressed = bellImgRefs.current[note]?.pressedEl;
                if (pressed) pressed.style.display = 'none';
                if (idle) idle.style.display = 'block';
              };
              return (
                <div key={note} className="rhythm-lane" style={{ backgroundColor: `${bell?.color}10` }}>
                  <div className="lane-target" />
                  {/* Bell at the target line - notes land ON this bell */}
                  <button
                    data-testid={`game-bell-${note}`}
                    type="button"
                    onPointerDown={doDown}
                    onPointerUp={doUp}
                    onPointerLeave={doUp}
                    onPointerCancel={doUp}
                    className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center bg-transparent border-0 p-0 z-10"
                    style={{ bottom: '20px', touchAction: 'none' }}
                  >
                    <div className="relative">
                      <img
                        ref={setIdleRef}
                        src={bell?.image1}
                        alt={bell?.solfege}
                        className="w-16 h-20 md:w-24 md:h-28 object-contain pointer-events-none"
                        draggable={false}
                      />
                      <img
                        ref={setPressedRef}
                        src={bell?.image2}
                        alt=""
                        aria-hidden="true"
                        className="w-16 h-20 md:w-24 md:h-28 object-contain pointer-events-none absolute top-0 left-0"
                        draggable={false}
                        style={{ display: 'none' }}
                      />
                      <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white border border-[var(--jma-dark)] text-xs font-bold flex items-center justify-center pointer-events-none"
                        style={{ color: bell?.color }}>{bell?.key}</span>
                    </div>
                    <span className="text-xs md:text-sm font-bold pointer-events-none mt-1" style={{ color: bell?.color }}>
                      {bell?.solfege}
                    </span>
                  </button>
                </div>
              );
            })}
            {/* Falling bell images */}
            <AnimatePresence>
              {fallingNotes.map(note => (
                <FallingBellNote key={note.id} note={note.note} laneIndex={note.laneIndex} totalLanes={activeBells.length} speed={speedConfig.fallSpeed} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

export default RhythmGamePage;
