import { Home, Swords, BookOpen, LayoutList, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

const navItems = [
  { path: '/home', icon: Home, labelKey: 'nav.home' },
  { path: '/quest', icon: Swords, labelKey: 'nav.quest' },
  { path: '/academy', icon: BookOpen, labelKey: 'nav.academy' },
  { path: '/listing', icon: LayoutList, labelKey: 'nav.listing' },
  { path: '/profile', icon: User, labelKey: 'nav.profile' },
];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0B0B0F]/90 backdrop-blur-[12px] border-t border-white/10 safe-area-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map(item => {
          const isActive = location.pathname.startsWith(item.path);
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              aria-label={t(item.labelKey)}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center py-2 px-3 min-w-0 transition-colors duration-200 ${isActive ? 'text-[#FFE082]' : 'text-white/40'}`}
            >
              <Icon className="w-5 h-5 mb-0.5" aria-hidden="true" />
              <span className={`text-[10px] font-medium ${isActive ? 'text-[#FFE082]' : 'text-white/40'}`}>
                {t(item.labelKey)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
