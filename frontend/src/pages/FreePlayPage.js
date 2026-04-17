import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import JellyBellsRow from '../components/JellyBells';
import { GameHeader, NotationDisplay } from '../components/GameUI';
import useAudio from '../hooks/useAudio';

function FreePlayPage() {
  const navigate = useNavigate();
  const { playBellNote, initAudioContext } = useAudio();
  const [lastNote, setLastNote] = useState(null);
  const [playedNotes, setPlayedNotes] = useState([]);

  const handlePlayNote = (note) => {
    initAudioContext();
    playBellNote(note);
    setLastNote(note);
    setPlayedNotes(prev => [...prev.slice(-7), note]);
  };

  // Map note to solfège
  const noteToSolfege = {
    'C': 'Do',
    'D': 'Re', 
    'E': 'Mi',
    'F': 'Fa',
    'G': 'So',
    'A': 'La',
    'B': 'Ti',
    'High C': 'Do'
  };

  return (
    <div 
      className="min-h-screen flex flex-col" 
      data-testid="free-play-page"
      style={{
        backgroundImage: 'url(/assets/backgrounds/clubhouse.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <GameHeader title="Free Play" showHomeButton={true} />
      
      <main className="flex-1 flex flex-col items-center justify-center pt-20 pb-8 px-4">
        {/* Instruction */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="game-card px-6 py-4 mb-8 text-center"
        >
          <h2 
            className="text-xl md:text-2xl font-bold"
            style={{ color: 'var(--jma-dark)', fontFamily: "'Fredoka', cursive" }}
          >
            Tap the Jelly Bells to make music!
          </h2>
        </motion.div>

        {/* Current note display */}
        {lastNote && (
          <motion.div
            key={lastNote}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mb-6"
          >
            <NotationDisplay currentNote={`${lastNote} (${noteToSolfege[lastNote]})`} />
          </motion.div>
        )}

        {/* Recently played notes */}
        {playedNotes.length > 0 && (
          <motion.div 
            className="flex gap-2 mb-8 flex-wrap justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {playedNotes.map((note, idx) => (
              <motion.span
                key={`${note}-${idx}`}
                initial={{ scale: 0, y: -20 }}
                animate={{ scale: 1, y: 0 }}
                className="px-3 py-1 rounded-full text-sm font-bold text-white border-2 border-[var(--jma-dark)]"
                style={{ 
                  backgroundColor: 
                    note === 'C' ? '#FF3B30' :
                    note === 'D' ? '#FF9500' :
                    note === 'E' ? '#FFCC00' :
                    note === 'F' ? '#4CD964' :
                    note === 'G' ? '#34A853' :
                    note === 'A' ? '#4285F4' :
                    note === 'B' ? '#AF52DE' :
                    '#FF2D55'
                }}
              >
                {noteToSolfege[note]}
              </motion.span>
            ))}
          </motion.div>
        )}

        {/* Jelly Bells */}
        <motion.div
          className="game-board p-4 md:p-8"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <JellyBellsRow onPlayNote={handlePlayNote} showNotation={true} />
        </motion.div>

        {/* Educational tip */}
        <motion.div
          className="mt-8 max-w-md text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p 
            className="text-base md:text-lg"
            style={{ color: 'var(--jma-dark)', fontFamily: "'Fredoka', cursive" }}
          >
            <span className="font-bold">Music Tip:</span> The notes go up like stairs - 
            <span className="font-bold text-[#FF3B30]"> Do</span>,
            <span className="font-bold text-[#FF9500]"> Re</span>,
            <span className="font-bold text-[#FFCC00]"> Mi</span>,
            <span className="font-bold text-[#4CD964]"> Fa</span>,
            <span className="font-bold text-[#34A853]"> So</span>,
            <span className="font-bold text-[#4285F4]"> La</span>,
            <span className="font-bold text-[#AF52DE]"> Ti</span>,
            <span className="font-bold text-[#FF2D55]"> Do</span>!
          </p>
        </motion.div>
      </main>

      {/* Character - Finn Danger */}
      <motion.div 
        className="fixed bottom-4 right-4 hidden lg:block"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <motion.img
          src="/assets/characters/finn-danger.png"
          alt="Finn Danger"
          className="w-28 h-auto"
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        />
      </motion.div>
    </div>
  );
}

export default FreePlayPage;
