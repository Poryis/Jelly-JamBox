import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Play, Music, Brain, Drum } from 'lucide-react';

function HomePage() {
  const navigate = useNavigate();

  const gameModes = [
    {
      id: 'free-play',
      title: 'Free Play',
      description: 'Tap the Jelly Bells and make music!',
      icon: Music,
      color: '#4CD964',
      path: '/free-play'
    },
    {
      id: 'rhythm-game',
      title: 'Rhythm Game',
      description: 'Hit the notes as they fall!',
      icon: Drum,
      color: '#FF3B30',
      path: '/rhythm-game'
    },
    {
      id: 'simon-says',
      title: 'Simon Says',
      description: 'Watch, listen, and repeat!',
      icon: Brain,
      color: '#4285F4',
      path: '/simon-says'
    }
  ];

  return (
    <div className="min-h-screen sunburst-bg flex flex-col items-center justify-center p-4 md:p-8">
      {/* Logo */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="mb-6 md:mb-10"
      >
        <img
          src="/assets/ui/logo.png"
          alt="JMA - Jelly of the Month Club Music Academy"
          className="w-32 h-32 md:w-48 md:h-48 object-contain"
          data-testid="jma-logo"
        />
      </motion.div>

      {/* Title */}
      <motion.h1
        className="text-4xl md:text-6xl font-black text-center mb-2"
        style={{ color: 'var(--jma-dark)', fontFamily: "'Fredoka', cursive" }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
        data-testid="game-title"
      >
        JELLY BELLS
      </motion.h1>
      
      <motion.p
        className="text-lg md:text-xl text-center mb-8 md:mb-12"
        style={{ color: 'var(--jma-dark)', fontFamily: "'Fredoka', cursive" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Music is FUN!
      </motion.p>

      {/* Game Mode Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full max-w-4xl">
        {gameModes.map((mode, index) => (
          <motion.button
            key={mode.id}
            data-testid={`mode-${mode.id}`}
            className="level-card flex flex-col items-center text-center p-6 md:p-8"
            style={{ '--hover-color': mode.color }}
            onClick={() => navigate(mode.path)}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 + index * 0.1, type: 'spring' }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.98 }}
          >
            <div
              className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-4 border-4"
              style={{ backgroundColor: mode.color, borderColor: 'var(--jma-dark)' }}
            >
              <mode.icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
            
            <h2 
              className="text-xl md:text-2xl font-bold mb-2"
              style={{ color: 'var(--jma-dark)', fontFamily: "'Fredoka', cursive" }}
            >
              {mode.title}
            </h2>
            
            <p 
              className="text-sm md:text-base opacity-80"
              style={{ color: 'var(--jma-dark)' }}
            >
              {mode.description}
            </p>
          </motion.button>
        ))}
      </div>

      {/* Characters - Finn Danger and Charlie the Polliwog */}
      <motion.div 
        className="fixed bottom-4 left-4 hidden lg:block"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <motion.img
          src="/assets/characters/finn-danger.png"
          alt="Finn Danger"
          className="w-32 h-auto floating"
          animate={{ y: [0, -15, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        />
      </motion.div>

      <motion.div 
        className="fixed bottom-4 right-4 hidden lg:block"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <motion.img
          src="/assets/characters/charlie-polliwog.png"
          alt="Charlie the Polliwog"
          className="w-32 h-auto floating"
          animate={{ y: [0, -15, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut', delay: 0.5 }}
        />
      </motion.div>
    </div>
  );
}

export default HomePage;
