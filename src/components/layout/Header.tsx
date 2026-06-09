import { Bell, ChevronLeft, Search, Medal } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showSearch?: boolean;
  showNotification?: boolean;
  rightAction?: React.ReactNode;
  hasUnread?: boolean;
}

export function Header({ title, showBack, showSearch, showNotification, rightAction, hasUnread }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { agent } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-dark-bg/80 backdrop-blur-[12px] border-b border-white/10 px-4 py-3">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          {showBack && (
            <button onClick={() => navigate(-1)} className="text-white/70 hover:text-white p-1 -ml-1" aria-label="Kembali">
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {title ? (
            <h1 className="text-lg font-semibold text-white">{title}</h1>
          ) : (
            <div className="flex items-center gap-2">
              <Medal className="w-5 h-5 text-gold-700" />
              <span className="text-base font-semibold text-white">LOT Quest</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {showSearch && (
            <button className="text-white/50 hover:text-white p-2" onClick={() => navigate('/search')} aria-label="Cari">
              <Search className="w-5 h-5" />
            </button>
          )}
          {showNotification && (
            <button className="text-white/50 hover:text-white p-2 relative" onClick={() => navigate('/notifications')} aria-label="Notifikasi">
              <Bell className="w-5 h-5" />
              {hasUnread && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />}
            </button>
          )}
          {rightAction}
        </div>
      </div>
    </header>
  );
}
