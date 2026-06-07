import { useState, useEffect } from 'react';
import { Button } from './Button';
import { Download } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === 'accepted') setShowPrompt(false);
    setDeferredPrompt(null);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3 shadow-xl backdrop-blur">
        <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center shrink-0">
          <Download className="w-5 h-5 text-[#0B0B0F]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">{t('pwa.install_title') || 'Install LOT Quest'}</p>
          <p className="text-[10px] text-zinc-400">{t('pwa.install_desc') || 'Add to home screen for quick access'}</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => setShowPrompt(false)}>
            {t('pwa.later') || 'Later'}
          </Button>
          <Button size="sm" onClick={handleInstall}>
            {t('pwa.install') || 'Install'}
          </Button>
        </div>
      </div>
    </div>
  );
}
