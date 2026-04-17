import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Music, Drum, Brain, Layers, Ear } from 'lucide-react';

function HomePage() {
  const navigate = useNavigate();

  const gameModes = [
    { id: 'free-play', title: 'Free Play', description: 'Tap the Jelly Bells!', icon: Music, color: '#4CD964', path: '/free-play' },
    { id: 'rhythm-game', title: 'Rhythm Game', description: 'Hit notes as they fall!', icon: Drum, color: '#FF3B30', path: '/rhythm-game' },
    { id: 'simon-says', title: 'Simon Says', description: 'Watch, listen, repeat!', icon: Brain, color: '#4285F4', path: '/simon-says' },
    { id: 'ear-trainer', title: 'Ear Trainer', description: 'Name that note!', icon: Ear, color: '#FF9500', path: '/ear-trainer' },
    { id: 'loop-studio', title: 'Loop Studio', description: 'Build beats & layers!', icon: Layers, color: '#AF52DE', path: '/loop-studio' },
  ];

  return (
    <div className="min-h-screen sunburst-bg flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Logo */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="mb-3 md:mb-5"
      >
        <img
          src="/assets/ui/logo.png"
          alt="JMA - Jelly of the Month Club Music Academy"
          className="w-24 h-24 md:w-36 md:h-36 object-contain"
          data-testid="jma-logo"
        />
      </motion.div>

      {/* Title */}
      <motion.h1
        className="text-4xl md:text-6xl font-black text-center mb-1 font-display"
        style={{ color: 'var(--jma-dark)' }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
        data-testid="game-title"
      >
        JELLY BELLS
      </motion.h1>
      
      <motion.p
        className="text-base md:text-lg text-center mb-5 md:mb-6 font-display"
        style={{ color: 'var(--jma-dark)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Music is FUN!
      </motion.p>

      {/* Game Mode Cards - responsive grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4 w-full max-w-5xl px-2">
        {gameModes.map((mode, index) => (
          <motion.button
            key={mode.id}
            data-testid={`mode-${mode.id}`}
            className="level-card flex flex-col items-center text-center p-3 md:p-5"
            onClick={() => navigate(mode.path)}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 + index * 0.08, type: 'spring' }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.98 }}
          >
            <div
              className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center mb-2 border-4"
              style={{ backgroundColor: mode.color, borderColor: 'var(--jma-dark)' }}
            >
              <mode.icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </div>
            
            <h2 
              className="text-sm md:text-lg font-bold mb-0.5 font-display"
              style={{ color: 'var(--jma-dark)' }}
            >
              {mode.title}
            </h2>
            
            <p 
              className="text-xs opacity-70 hidden sm:block"
              style={{ color: 'var(--jma-dark)' }}
            >
              {mode.description}
            </p>
          </motion.button>
        ))}
      </div>

      {/* Characters - all four across the bottom */}
      <motion.div 
        className="fixed bottom-2 left-4 hidden lg:block"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <motion.img src="/assets/characters/finn-danger.png" alt="Finn Danger" className="w-24 h-auto"
          animate={{ y: [0, -12, 0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }} />
      </motion.div>

      <motion.div 
        className="fixed bottom-2 left-32 hidden xl:block"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.0 }}
      >
        <motion.img src="/assets/characters/chunk.png" alt="Chunk" className="w-20 h-auto"
          animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut', delay: 0.3 }} />
      </motion.div>

      <motion.div 
        className="fixed bottom-2 right-32 hidden xl:block"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <motion.img src="/assets/characters/jazzy.png" alt="Jazzy" className="w-20 h-auto"
          animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut', delay: 0.6 }} />
      </motion.div>

      <motion.div 
        className="fixed bottom-2 right-4 hidden lg:block"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <motion.img src="/assets/characters/charlie-polliwog.png" alt="Charlie the Polliwog" className="w-24 h-auto"
          animate={{ y: [0, -12, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut', delay: 0.5 }} />
      </motion.div>
    </div>
  );
}

export default HomePage;
