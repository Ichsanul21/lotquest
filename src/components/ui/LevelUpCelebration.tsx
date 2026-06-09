import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';
import { TrendingUp, Crown } from 'lucide-react';

interface LevelUpCelebrationProps {
  open: boolean;
  level: number;
  tier: string;
  onClose: () => void;
}

function Particle({ delay }: { delay: number }) {
  const colors = ['#FFE082', '#FFD54F', '#FFAB00', '#FF6F00', '#FFE082'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const left = Math.random() * 100;
  const size = 4 + Math.random() * 8;

  return (
    <motion.div
      className="absolute rounded-full"
      style={{ left: `${left}%`, width: size, height: size, backgroundColor: color }}
      initial={{ y: '100vh', opacity: 1 }}
      animate={{ y: '-10vh', opacity: 0 }}
      transition={{ duration: 2 + Math.random() * 2, delay, ease: 'easeOut', repeat: Infinity, repeatDelay: Math.random() * 2 }}
    />
  );
}

export function LevelUpCelebration({ open, level, tier, onClose }: LevelUpCelebrationProps) {
  const [particlesReady, setParticlesReady] = useState(false);

  useEffect(() => {
    if (open) {
      setParticlesReady(true);
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
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
          {particlesReady && Array.from({ length: 30 }).map((_, i) => <Particle key={i} delay={i * 0.05} />)}
          <motion.div
            className="relative z-10 text-center px-6"
            initial={{ scale: 0.3, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.3, opacity: 0 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200 }}
          >
            <motion.div
              className="w-24 h-24 rounded-3xl gold-gradient flex items-center justify-center mx-auto mb-6 shadow-[0_0_60px_rgba(255,224,130,0.3)]"
              animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            >
              <TrendingUp className="w-12 h-12 text-dark-bg" />
            </motion.div>
            <motion.h2
              className="text-3xl font-bold text-white mb-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Level Up!
            </motion.h2>
            <motion.div
              className="flex items-center justify-center gap-2 mb-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Crown className="w-6 h-6 text-gold-700" />
              <span className="text-5xl font-bold text-gold-700">{level}</span>
            </motion.div>
            <motion.p
              className="text-sm text-zinc-400"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Selamat! Anda sekarang <span className="text-gold-700 font-semibold">{tier}</span>
            </motion.p>
            <motion.div
              className="mt-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <Button onClick={onClose}>Lanjut</Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
