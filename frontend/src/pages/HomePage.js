import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Music, Drum, Brain, Layers, Ear } from 'lucide-react';

function HomePage() {
  const navigate = useNavigate();

  const gameModes = [
    { id: 'free-play', title: 'Free Play', description: 'Tap the Jelly Bells!', icon: Music, color: '#4CD964', bg: '#EAFFF0', path: '/free-play' },
    { id: 'rhythm-game', title: 'Rhythm Game', description: 'Hit notes as they fall!', icon: Drum, color: '#FF3B30', bg: '#FFF0EF', path: '/rhythm-game' },
    { id: 'simon-says', title: 'Simon Says', description: 'Watch, listen, repeat!', icon: Brain, color: '#4285F4', bg: '#EEF4FF', path: '/simon-says' },
    { id: 'ear-trainer', title: 'Ear Trainer', description: 'Name that note!', icon: Ear, color: '#FF9500', bg: '#FFF6E8', path: '/ear-trainer' },
    { id: 'loop-studio', title: 'Loop Studio', description: 'Build beats & layers!', icon: Layers, color: '#AF52DE', bg: '#F5EEFF', path: '/loop-studio' },
  ];

  const characters = [
    { name: 'Finn Danger', image: '/assets/characters/finn-danger.png', delay: 0.6 },
    { name: 'Chunk', image: '/assets/characters/chunk.png', delay: 0.7 },
    { name: 'Jazzy', image: '/assets/characters/jazzy.png', delay: 0.8 },
    { name: 'Charlie', image: '/assets/characters/charlie-polliwog.png', delay: 0.9 },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-6 md:py-10 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #E8F8FB 0%, #FFF9F0 100%)' }}
    >
      {/* Header: Logo + Title */}
      <motion.div
        className="flex flex-col items-center mb-4"
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <img
          src="/assets/ui/logo.png"
          alt="JMA"
          className="w-20 h-20 md:w-28 md:h-28 object-contain mb-2"
          data-testid="jma-logo"
        />
        <h1
          className="text-4xl md:text-5xl font-black text-center font-display"
          style={{ color: 'var(--jma-dark)' }}
          data-testid="game-title"
        >
          Jelly Bells
        </h1>
        <p className="text-sm md:text-base mt-1 font-medium" style={{ color: '#6B8299' }}>
          Music is FUN!
        </p>
      </motion.div>

      {/* Character band lineup */}
      <motion.div
        className="flex items-end justify-center gap-2 md:gap-4 mb-6 md:mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {characters.map((char, i) => (
          <motion.div
            key={char.name}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: char.delay, type: 'spring' }}
            className="relative"
          >
            <motion.img
              src={char.image}
              alt={char.name}
              className="w-16 h-20 md:w-20 md:h-24 object-contain"
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 2 + i * 0.3, ease: 'easeInOut', delay: i * 0.2 }}
            />
            <span className="block text-center text-[10px] md:text-xs font-semibold mt-1 whitespace-nowrap" style={{ color: '#6B8299' }}>
              {char.name}
            </span>
          </motion.div>
        ))}
      </motion.div>

      {/* Game Mode Cards - 3 top, 2 bottom centered */}
      <div className="w-full max-w-3xl">
        {/* Top row - 3 cards */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-3 md:mb-4">
          {gameModes.slice(0, 3).map((mode, index) => (
            <GameModeCard key={mode.id} mode={mode} index={index} navigate={navigate} />
          ))}
        </div>
        {/* Bottom row - 2 cards centered */}
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
      className="flex flex-col items-center text-center p-4 md:p-5 rounded-2xl border-4 transition-all"
      style={{
        backgroundColor: mode.bg,
        borderColor: mode.color + '60',
        boxShadow: `0 4px 0 0 ${mode.color}40`,
      }}
      onClick={() => navigate(mode.path)}
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 + index * 0.07, type: 'spring', stiffness: 250 }}
      whileHover={{ y: -4, boxShadow: `0 8px 0 0 ${mode.color}60`, borderColor: mode.color }}
      whileTap={{ y: 2, boxShadow: `0 2px 0 0 ${mode.color}40` }}
    >
      <div
        className="w-11 h-11 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-2"
        style={{ backgroundColor: mode.color }}
      >
        <mode.icon className="w-5 h-5 md:w-7 md:h-7 text-white" />
      </div>
      <h2 className="text-sm md:text-base font-bold font-display" style={{ color: 'var(--jma-dark)' }}>
        {mode.title}
      </h2>
      <p className="text-[10px] md:text-xs mt-0.5 hidden sm:block" style={{ color: '#6B8299' }}>
        {mode.description}
      </p>
    </motion.button>
  );
}

export default HomePage;
