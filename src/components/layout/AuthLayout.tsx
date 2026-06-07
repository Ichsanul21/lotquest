import { Outlet } from 'react-router-dom';
import { ToastContainer } from '../ui/Toast';
import { OfflineDetector } from '../ui/OfflineDetector';
import { PWAInstallPrompt } from '../ui/PWAInstallPrompt';
import { Medal } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-[#0B0B0F] flex flex-col items-center justify-center px-4">
      <OfflineDetector />
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl gold-gradient flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(255,224,130,0.2)]">
            <Medal className="w-8 h-8 text-[#0B0B0F]" />
          </div>
          <h1 className="text-2xl font-bold text-white">LOT Quest</h1>
          <p className="text-sm text-zinc-400 mt-1">Level Up Your Career</p>
        </div>
        <Outlet />
      </div>
      <ToastContainer />
      <PWAInstallPrompt />
    </div>
  );
}
