// Global "You earned a sticker!" toast that listens to useStickers anywhere in the app.
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import useStickers from '../hooks/useStickers';

export default function StickerToast() {
  const { toast, dismissToast } = useStickers();
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          data-testid="sticker-toast"
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 bg-white rounded-2xl border-4 px-4 py-2 cursor-pointer"
          style={{ borderColor: toast.color, boxShadow: `0 6px 0 0 ${toast.color}` }}
          initial={{ y: -60, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -60, opacity: 0, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 320, damping: 22 }}
          onClick={dismissToast}
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 1.4 }}
          >
            <img src={toast.icon} alt={toast.name} className="w-12 h-12 object-contain" draggable={false} />
          </motion.div>
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: toast.color }}>
              <Sparkles className="inline w-3 h-3 mr-1" /> New Sticker!
            </span>
            <span className="text-lg font-black leading-tight" style={{ color: 'var(--jma-dark)' }}>
              {toast.name}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
