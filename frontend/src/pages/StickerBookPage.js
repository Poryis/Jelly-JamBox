import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, Sparkles, X } from 'lucide-react';
import { STICKERS, STICKER_CATEGORIES } from '../data/stickers';
import useStickers from '../hooks/useStickers';
import { FullscreenButton } from '../components/FullscreenButton';

function StickerCard({ sticker, earnedAt }) {
  const [open, setOpen] = useState(false);
  const isEarned = !!earnedAt;
  return (
    <>
      <motion.button
        data-testid={`sticker-${sticker.id}`}
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative flex flex-col items-center rounded-2xl border-4 p-3 md:p-4 cursor-pointer"
        style={{
          borderColor: isEarned ? sticker.color : '#cbd5e1',
          backgroundColor: isEarned ? `${sticker.color}20` : '#f1f5f9',
          boxShadow: isEarned ? `0 6px 0 0 ${sticker.color}` : '0 4px 0 0 #cbd5e1',
        }}
      >
        <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
          <img
            src={sticker.icon}
            alt={sticker.name}
            draggable={false}
            className="w-full h-full object-contain pointer-events-none"
            style={{
              filter: isEarned ? 'none' : 'grayscale(1) opacity(0.35)',
            }}
          />
        </div>
        <span
          className="text-xs md:text-sm font-black text-center mt-2 leading-tight"
          style={{ color: isEarned ? sticker.color : '#64748b' }}
        >
          {isEarned ? sticker.name : '???'}
        </span>
        {isEarned && (
          <motion.div
            className="absolute -top-2 -right-2 bg-yellow-300 rounded-full w-7 h-7 flex items-center justify-center border-2 border-[var(--jma-dark)] shadow-md"
            initial={{ rotate: -15, scale: 0.8 }}
            animate={{ rotate: [ -15, 15, -15 ], scale: 1 }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Sparkles className="w-3.5 h-3.5 text-[var(--jma-dark)]" />
          </motion.div>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            data-testid="sticker-detail-modal"
          >
            <motion.div
              className="relative bg-white rounded-3xl border-4 max-w-sm w-full p-6 text-center shadow-2xl"
              style={{ borderColor: isEarned ? sticker.color : '#64748b', boxShadow: `0 10px 0 0 ${isEarned ? sticker.color : '#64748b'}` }}
              initial={{ scale: 0.7, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.7, y: 40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-white border-3 border-[var(--jma-dark)] flex items-center justify-center shadow-md"
                aria-label="Close"
              >
                <X className="w-4 h-4" style={{ color: 'var(--jma-dark)' }} />
              </button>
              <img src={sticker.icon} alt={sticker.name} draggable={false}
                className="w-32 h-32 object-contain mx-auto"
                style={{ filter: isEarned ? 'none' : 'grayscale(1) opacity(0.35)' }} />
              <h3 className="text-2xl font-black mt-2" style={{ color: isEarned ? sticker.color : '#64748b' }}>
                {isEarned ? sticker.name : 'Locked'}
              </h3>
              <p className="text-sm mt-2 font-medium" style={{ color: 'var(--jma-dark)' }}>
                {isEarned ? `Earned on ${new Date(earnedAt).toLocaleDateString()}` : sticker.hint}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function StickerBookPage() {
  const navigate = useNavigate();
  const { earned, earnedCount } = useStickers();
  const total = STICKERS.length;

  const grouped = useMemo(() => {
    const map = {};
    STICKER_CATEGORIES.forEach(c => { map[c.id] = []; });
    STICKERS.forEach(s => {
      if (!map[s.category]) map[s.category] = [];
      map[s.category].push(s);
    });
    return map;
  }, []);

  const pct = Math.round((earnedCount / total) * 100);

  return (
    <div className="min-h-screen flex flex-col" data-testid="sticker-book-page"
      style={{ background: 'linear-gradient(135deg, #FFF9E6 0%, #E0F7FA 50%, #FFE4F1 100%)' }}>
      <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b-4 border-[var(--jma-dark)] px-4 py-2 flex items-center gap-3 z-40">
        <button data-testid="sticker-home-btn" onClick={() => navigate('/')}
          className="chunky-btn bg-white px-3 py-1.5 flex items-center gap-2 text-sm font-bold border-[var(--jma-dark)]"
          style={{ color: 'var(--jma-dark)' }}>
          <Home className="w-4 h-4" /> Home
        </button>
        <h1 className="text-xl md:text-2xl font-black font-display flex-1 text-center" style={{ color: 'var(--jma-dark)' }}>
          Sticker Book
        </h1>
        <div className="text-sm font-bold whitespace-nowrap" style={{ color: 'var(--jma-dark)' }}>
          {earnedCount} / {total}
        </div>
      </div>

      <FullscreenButton />

      <main className="flex-1 pt-16 pb-10 px-3 md:px-6 max-w-6xl mx-auto w-full">
        {/* Progress bar */}
        <div className="game-card px-4 py-3 mb-6 mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold" style={{ color: 'var(--jma-dark)' }}>Your Collection</span>
            <span className="text-sm font-black" style={{ color: 'var(--jma-dark)' }}>{pct}%</span>
          </div>
          <div className="h-4 bg-slate-200 rounded-full overflow-hidden border-2 border-[var(--jma-dark)]">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #FFCC00, #4CD964, #4285F4, #AF52DE)' }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>

        {STICKER_CATEGORIES.map(cat => (
          <section key={cat.id} className="mb-8" data-testid={`category-${cat.id}`}>
            <h2 className="text-lg md:text-xl font-black font-display mb-3 px-1" style={{ color: 'var(--jma-dark)' }}>
              {cat.label}
              <span className="ml-2 text-xs font-bold opacity-60">
                ({grouped[cat.id].filter(s => earned[s.id]).length} / {grouped[cat.id].length})
              </span>
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {grouped[cat.id].map(sticker => (
                <StickerCard key={sticker.id} sticker={sticker} earnedAt={earned[sticker.id]?.earnedAt} />
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
