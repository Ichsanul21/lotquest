interface Tab {
  key: string;
  label: string;
}

interface TabBarProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (key: string) => void;
  className?: string;
}

export function TabBar({ tabs, activeTab, onTabChange, className = '' }: TabBarProps) {
  return (
    <div className={`flex gap-1 bg-white/5 rounded-xl p-1 overflow-x-auto scrollbar-hide ${className}`} role="tablist">
      {tabs.map(t => (
        <button
          key={t.key}
          role="tab"
          aria-selected={activeTab === t.key}
          onClick={() => onTabChange(t.key)}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === t.key ? 'gold-gradient text-dark-bg' : 'text-zinc-400 hover:text-white'}`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
