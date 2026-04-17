import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Music, Drum, Brain, Layers, Ear } from 'lucide-react';

// SVG cartoony music notes - colorful, thick-stroked, fun
const NOTES = [
  { type: 'quarter', color: '#FF3B30', x: '3%', y: '5%', size: 28, delay: 0, dur: 4.2 },
  { type: 'eighth', color: '#FF9500', x: '92%', y: '8%', size: 32, delay: 0.3, dur: 3.5 },
  { type: 'quarter', color: '#FFCC00', x: '10%', y: '25%', size: 24, delay: 0.7, dur: 3.8 },
  { type: 'eighth', color: '#4CD964', x: '88%', y: '30%', size: 30, delay: 1.1, dur: 4.0 },
  { type: 'quarter', color: '#4285F4', x: '5%', y: '50%', size: 26, delay: 0.5, dur: 3.2 },
  { type: 'eighth', color: '#AF52DE', x: '95%', y: '55%', size: 28, delay: 0.9, dur: 4.5 },
  { type: 'quarter', color: '#FF2D55', x: '8%', y: '72%', size: 22, delay: 1.3, dur: 3.6 },
  { type: 'eighth', color: '#34A853', x: '90%', y: '75%', size: 34, delay: 0.2, dur: 3.9 },
  { type: 'quarter', color: '#FF9500', x: '15%', y: '88%', size: 26, delay: 0.8, dur: 4.1 },
  { type: 'eighth', color: '#4285F4', x: '85%', y: '90%', size: 24, delay: 1.5, dur: 3.3 },
  // Inner notes
  { type: 'quarter', color: '#FFCC00', x: '20%', y: '12%', size: 20, delay: 1.0, dur: 3.7 },
  { type: 'eighth', color: '#FF3B30', x: '78%', y: '15%', size: 22, delay: 0.4, dur: 4.3 },
  { type: 'quarter', color: '#AF52DE', x: '18%', y: '42%', size: 18, delay: 1.2, dur: 3.4 },
  { type: 'eighth', color: '#4CD964', x: '82%', y: '48%', size: 20, delay: 0.6, dur: 3.9 },
  { type: 'quarter', color: '#FF2D55', x: '22%', y: '65%', size: 22, delay: 0.1, dur: 4.0 },
  { type: 'eighth', color: '#34A853', x: '76%', y: '68%', size: 24, delay: 1.4, dur: 3.6 },
];

function CartoonNote({ note }) {
  // Quarter note SVG
  const quarterNote = (
    <svg width={note.size} height={note.size * 1.8} viewBox="0 0 24 44" fill="none">
      <ellipse cx="10" cy="38" rx="9" ry="6" fill={note.color} stroke="#0A2540" strokeWidth="2.5" />
      <line x1="19" y1="38" x2="19" y2="4" stroke="#0A2540" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
  // Eighth note SVG (with flag)
  const eighthNote = (
    <svg width={note.size} height={note.size * 1.8} viewBox="0 0 28 44" fill="none">
      <ellipse cx="10" cy="38" rx="9" ry="6" fill={note.color} stroke="#0A2540" strokeWidth="2.5" />
      <line x1="19" y1="38" x2="19" y2="4" stroke="#0A2540" strokeWidth="3" strokeLinecap="round" />
      <path d="M19 4 C19 4 26 10 26 18" stroke="#0A2540" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  );

  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{ left: note.x, top: note.y, opacity: 0.4 }}
      animate={{
        y: [0, -12, 0],
        rotate: [0, 8, -8, 0],
        scale: [1, 1.05, 1],
      }}
      transition={{ repeat: Infinity, duration: note.dur, delay: note.delay, ease: 'easeInOut' }}
    >
      {note.type === 'quarter' ? quarterNote : eighthNote}
    </motion.div>
  );
}

function HomePage() {
  const navigate = useNavigate();

  const gameModes = [
    { id: 'free-play', title: 'Free Play', description: 'Tap the Jelly Bells!', icon: Music, color: '#4CD964', path: '/free-play' },
    { id: 'rhythm-game', title: 'Rhythm Game', description: 'Hit notes as they fall!', icon: Drum, color: '#FF3B30', path: '/rhythm-game' },
    { id: 'simon-says', title: 'Simon Says', description: 'Watch, listen, repeat!', icon: Brain, color: '#4285F4', path: '/simon-says' },
    { id: 'ear-trainer', title: 'Ear Trainer', description: 'Name that note!', icon: Ear, color: '#FF9500', path: '/ear-trainer' },
    { id: 'loop-studio', title: 'Loop Studio', description: 'Build beats & layers!', icon: Layers, color: '#AF52DE', path: '/loop-studio' },
  ];

  const characters = [
    { name: 'Finn Danger', image: '/assets/characters/finn-danger.png', delay: 0.5 },
    { name: 'Chunk', image: '/assets/characters/chunk.png', delay: 0.6 },
    { name: 'Dr. Jellybone', image: '/assets/characters/dr-jellybone.png', delay: 0.7 },
    { name: 'Jazzy', image: '/assets/characters/jazzy.png', delay: 0.75 },
    { name: 'Llama Lou & Stew', image: '/assets/characters/llama-lou-stew.png', delay: 0.8 },
    { name: 'Charlie', image: '/assets/characters/charlie-polliwog.png', delay: 0.9 },
  ];

  return (
    <div
      className="min-h-screen flex flex-col items-center px-4 py-6 md:py-8 relative overflow-hidden"
      style={{ backgroundColor: '#87CEEB' }}
    >
      {/* Cartoony floating music notes */}
      {NOTES.map((note, i) => (
        <CartoonNote key={i} note={note} />
      ))}

      {/* Logo */}
      <motion.div
        initial={{ y: -40, opacity: 0, rotate: -5 }}
        animate={{ y: 0, opacity: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="mb-2 z-10"
      >
        <img src="/assets/ui/logo.png" alt="JMA" className="w-20 h-20 md:w-28 md:h-28 object-contain" data-testid="jma-logo" />
      </motion.div>

      {/* Title */}
      <motion.h1
        className="text-5xl md:text-6xl font-black text-center font-display mb-0 z-10"
        style={{ color: 'var(--jma-dark)', textShadow: '3px 3px 0 #FFD54F, 5px 5px 0 rgba(10,37,64,0.15)' }}
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.15, stiffness: 200 }}
        data-testid="game-title"
      >
        Jelly Bells
      </motion.h1>
      <motion.p className="text-sm md:text-base font-bold mb-3 z-10" style={{ color: 'white', textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        Music is FUN!
      </motion.p>

      {/* Character band lineup */}
      <motion.div className="flex items-end justify-center gap-2 md:gap-4 mb-5 md:mb-6 z-10 flex-wrap"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
        {characters.map((char, i) => (
          <motion.div key={char.name}
            initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            transition={{ delay: char.delay, type: 'spring', stiffness: 250 }}
            className="flex flex-col items-center"
          >
            <motion.img src={char.image} alt={char.name}
              className="w-14 h-18 md:w-20 md:h-24 object-contain drop-shadow-lg"
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 1.8 + i * 0.3, ease: 'easeInOut', delay: i * 0.15 }}
              whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0] }}
            />
            <span className="text-[8px] md:text-[10px] font-bold mt-1 px-1.5 py-0.5 rounded-full whitespace-nowrap"
              style={{ color: 'white', backgroundColor: 'var(--jma-dark)' }}>
              {char.name}
            </span>
          </motion.div>
        ))}
      </motion.div>

      {/* Game Mode Cards */}
      <div className="w-full max-w-3xl z-10">
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-3 md:mb-4">
          {gameModes.slice(0, 3).map((mode, index) => (
            <GameModeCard key={mode.id} mode={mode} index={index} navigate={navigate} />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 md:gap-4 max-w-[66%] md:max-w-[67%] mx-auto">
          {gameModes.slice(3).map((mode, index) => (
            <GameModeCard key={mode.id} mode={mode} index={index + 3} navigate={navigate} />
          ))}
        </div>
      </div>
    </div>
  );
}

function GameModeCard({ mode, index, navigate }) {
  return (
    <motion.button
      data-testid={`mode-${mode.id}`}
      className="flex flex-col items-center text-center p-4 md:p-5 rounded-3xl border-4 cursor-pointer"
      style={{ backgroundColor: 'white', borderColor: mode.color, boxShadow: `0 6px 0 0 ${mode.color}` }}
      onClick={() => navigate(mode.path)}
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 + index * 0.07, type: 'spring', stiffness: 300 }}
      whileHover={{ y: -6, boxShadow: `0 10px 0 0 ${mode.color}`, scale: 1.03 }}
      whileTap={{ y: 3, boxShadow: `0 3px 0 0 ${mode.color}`, scale: 0.98 }}
    >
      <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-2 border-3"
        style={{ backgroundColor: mode.color, borderColor: 'var(--jma-dark)' }}>
        <mode.icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
      </div>
      <h2 className="text-sm md:text-base font-bold font-display" style={{ color: 'var(--jma-dark)' }}>{mode.title}</h2>
      <p className="text-[10px] md:text-xs mt-0.5 hidden sm:block" style={{ color: '#8899AA' }}>{mode.description}</p>
    </motion.button>
  );
}

export default HomePage;
