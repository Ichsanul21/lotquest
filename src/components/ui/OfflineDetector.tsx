import { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';

export function OfflineDetector() {
  const [offline, setOffline] = useState(!navigator.onLine);
  const { t } = useLanguage();

  useEffect(() => {
    const goOffline = () => setOffline(true);
    const goOnline = () => setOffline(false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-red-500/90 backdrop-blur text-white text-center text-xs py-2 px-4">
      {t('pwa.offline') || 'You are offline. Some features may be unavailable.'}
    </div>
  );
}
