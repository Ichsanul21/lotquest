import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';
import { CheckCircle, Zap, Award } from 'lucide-react';

interface QuestCompleteCelebrationProps {
  open: boolean;
  xp: number;
  title: string;
  badgeName?: string;
  onClose: () => void;
}

export function QuestCompleteCelebration({ open, xp, title, badgeName, onClose }: QuestCompleteCelebrationProps) {
  const [particlesReady, setParticlesReady] = useState(false);

  useEffect(() => {
    if (open) {
      setParticlesReady(true);
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
    setParticlesReady(false);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className="relative z-10 text-center px-6"
            initial={{ scale: 0.3, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.3, opacity: 0 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200 }}
          >
            <motion.div
              className="w-24 h-24 rounded-3xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-6 border-2 border-emerald-400"
              animate={{ scale: [1, 1.15, 1], rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.6 }}
            >
              <CheckCircle className="w-12 h-12 text-emerald-400" />
            </motion.div>
            <motion.h2
              className="text-2xl font-bold text-white mb-1"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Quest Selesai!
            </motion.h2>
            <motion.p
              className="text-sm text-zinc-400 mb-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {title}
            </motion.p>
            <motion.div
              className="flex items-center justify-center gap-3 mb-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20">
                <Zap className="w-5 h-5 text-amber-400" />
                <span className="text-lg font-bold text-amber-400">+{xp} XP</span>
              </div>
              {badgeName && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/20">
                  <Award className="w-5 h-5 text-purple-400" />
                  <span className="text-sm font-medium text-purple-400">{badgeName}</span>
                </div>
              )}
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <Button onClick={onClose}>Lanjut</Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
