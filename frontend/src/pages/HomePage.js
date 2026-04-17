import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Music, Drum, Brain, Layers, Ear } from 'lucide-react';

// Floating music note decoration
function FloatingNote({ emoji, style, delay, duration }) {
  return (
    <motion.div
      className="absolute text-2xl md:text-4xl pointer-events-none select-none opacity-30"
      style={style}
      animate={{
        y: [0, -20, 0],
        rotate: [0, 10, -10, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{ repeat: Infinity, duration: duration || 3, delay: delay || 0, ease: 'easeInOut' }}
    >
      {emoji}
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
    { name: 'Jazzy', image: '/assets/characters/jazzy.png', delay: 0.8 },
    { name: 'Charlie', image: '/assets/characters/charlie-polliwog.png', delay: 0.9 },
  ];

  return (
    <div
      className="min-h-screen flex flex-col items-center px-4 py-6 md:py-8 relative overflow-hidden"
      style={{ background: 'linear-gradient(170deg, #D4F1F9 0%, #FFF3E0 50%, #E8F5E9 100%)' }}
    >
      {/* Floating decorative notes */}
      <FloatingNote emoji="♪" style={{ top: '8%', left: '8%' }} delay={0} duration={3.5} />
      <FloatingNote emoji="♫" style={{ top: '15%', right: '10%' }} delay={0.5} duration={4} />
      <FloatingNote emoji="♪" style={{ top: '60%', left: '5%' }} delay={1} duration={3} />
      <FloatingNote emoji="♫" style={{ top: '70%', right: '6%' }} delay={1.5} duration={3.8} />
      <FloatingNote emoji="♪" style={{ top: '40%', left: '15%' }} delay={0.8} duration={4.2} />
      <FloatingNote emoji="♫" style={{ top: '35%', right: '15%' }} delay={0.3} duration={3.2} />

      {/* Logo */}
      <motion.div
        initial={{ y: -40, opacity: 0, rotate: -5 }}
        animate={{ y: 0, opacity: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="mb-2"
      >
        <img
          src="/assets/ui/logo.png"
          alt="JMA"
          className="w-20 h-20 md:w-28 md:h-28 object-contain"
          data-testid="jma-logo"
        />
      </motion.div>

      {/* Title - big, bouncy, fun */}
      <motion.h1
        className="text-5xl md:text-6xl font-black text-center font-display mb-0"
        style={{
          color: 'var(--jma-dark)',
          textShadow: '3px 3px 0 #FFD54F, 5px 5px 0 rgba(10,37,64,0.15)',
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.15, stiffness: 200 }}
        data-testid="game-title"
      >
        Jelly Bells
      </motion.h1>
      <motion.p
        className="text-sm md:text-base font-bold mb-4"
        style={{ color: 'var(--jma-blue)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Music is FUN!
      </motion.p>

      {/* Character band lineup - bigger, bouncier */}
      <motion.div
        className="flex items-end justify-center gap-3 md:gap-5 mb-5 md:mb-7"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
      >
        {characters.map((char, i) => (
          <motion.div
            key={char.name}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: char.delay, type: 'spring', stiffness: 250 }}
            className="flex flex-col items-center"
          >
            <motion.img
              src={char.image}
              alt={char.name}
              className="w-16 h-20 md:w-24 md:h-28 object-contain drop-shadow-lg"
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 1.8 + i * 0.3, ease: 'easeInOut', delay: i * 0.15 }}
              whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0] }}
            />
            <span
              className="text-[9px] md:text-xs font-bold mt-1 px-2 py-0.5 rounded-full whitespace-nowrap"
              style={{
                color: 'white',
                backgroundColor: 'var(--jma-dark)',
              }}
            >
              {char.name}
            </span>
          </motion.div>
        ))}
      </motion.div>

      {/* Game Mode Cards - chunky, colorful, tactile */}
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
      className="flex flex-col items-center text-center p-4 md:p-5 rounded-3xl border-4 cursor-pointer"
      style={{
        backgroundColor: 'white',
        borderColor: mode.color,
        boxShadow: `0 6px 0 0 ${mode.color}`,
      }}
      onClick={() => navigate(mode.path)}
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 + index * 0.07, type: 'spring', stiffness: 300 }}
      whileHover={{ y: -6, boxShadow: `0 10px 0 0 ${mode.color}`, scale: 1.03 }}
      whileTap={{ y: 3, boxShadow: `0 3px 0 0 ${mode.color}`, scale: 0.98 }}
    >
      <div
        className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-2 border-3"
        style={{ backgroundColor: mode.color, borderColor: 'var(--jma-dark)' }}
      >
        <mode.icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
      </div>
      <h2 className="text-sm md:text-base font-bold font-display" style={{ color: 'var(--jma-dark)' }}>
        {mode.title}
      </h2>
      <p className="text-[10px] md:text-xs mt-0.5 hidden sm:block" style={{ color: '#8899AA' }}>
        {mode.description}
      </p>
    </motion.button>
  );
}

export default HomePage;
