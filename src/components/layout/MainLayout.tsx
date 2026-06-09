import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BottomNav } from './BottomNav';
import { ToastContainer } from '../ui/Toast';
import { PWAInstallPrompt } from '../ui/PWAInstallPrompt';
import { OfflineDetector } from '../ui/OfflineDetector';

export function MainLayout() {
  const location = useLocation();

  return (
    <div className="h-screen bg-dark-bg">
      <OfflineDetector />
      <main className="h-full overflow-y-auto pb-20 max-w-lg mx-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.15, ease: 'easeIn' } }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav />
      <ToastContainer />
      <PWAInstallPrompt />
    </div>
  );
}
