import { Avatar } from './Skeleton';
import { Trophy, Medal } from 'lucide-react';

interface PodiumEntry {
  rank: 1 | 2 | 3;
  name: string;
  avatar: string | null;
  subtitle?: string;
  value?: string;
  isCurrentUser?: boolean;
  tier?: string;
}

interface PodiumProps {
  entries: [PodiumEntry, PodiumEntry, PodiumEntry];
}

const rankConfig = {
  1: {
    container: 'h-40',
    avatar: 'lg',
    bg: 'gold-gradient',
    shadow: 'shadow-[0_0_30px_rgba(255,224,130,0.25)]',
    icon: Trophy,
    iconColor: 'text-dark-bg',
    textColor: 'text-gold-700',
    label: 'Juara 1',
  },
  2: {
    container: 'h-32',
    avatar: 'md',
    bg: 'bg-gradient-to-t from-zinc-800 to-zinc-700',
    shadow: '',
    icon: Medal,
    iconColor: 'text-zinc-400',
    textColor: 'text-zinc-300',
    label: 'Juara 2',
  },
  3: {
    container: 'h-28',
    avatar: 'md',
    bg: 'bg-gradient-to-t from-zinc-800 to-zinc-700',
    shadow: '',
    icon: Medal,
    iconColor: 'text-zinc-400',
    textColor: 'text-zinc-300',
    label: 'Juara 3',
  },
};

export function Podium({ entries }: PodiumProps) {
  // Sort by rank for display: center (#1) | left (#2) | right (#3)
  const rank1 = entries.find(e => e.rank === 1) || null;
  const rank2 = entries.find(e => e.rank === 2) || null;
  const rank3 = entries.find(e => e.rank === 3) || null;

  const PodiumBlock = ({ entry }: { entry: PodiumEntry | null }) => {
    if (!entry) return <div className="flex-1" />;
    const cfg = rankConfig[entry.rank];
    const Icon = cfg.icon;

    return (
      <div className="flex-1 flex flex-col items-center">
        {entry.rank === 1 && (
          <div className="relative mb-2">
            <Avatar src={entry.avatar} name={entry.name} size={cfg.avatar as 'lg' | 'md'} tier={entry.tier} />
            <Icon className={`absolute -top-1 -right-1 w-5 h-5 ${cfg.iconColor}`} />
          </div>
        )}
        {entry.rank !== 1 && (
          <Avatar src={entry.avatar} name={entry.name} size={cfg.avatar as 'lg' | 'md'} tier={entry.tier} />
        )}
        <p className={`text-[10px] mt-1 font-semibold truncate max-w-[80px] ${cfg.textColor}`}>
          {entry.name}
        </p>
        <div className={`w-full ${cfg.container} ${cfg.bg} rounded-t-2xl mt-2 flex items-start justify-center pt-4 ${cfg.shadow}`}>
          <div className="text-center">
            {entry.rank === 1 && <Icon className={`w-5 h-5 mx-auto mb-1 ${cfg.iconColor}`} />}
            <span className={`text-lg font-bold ${entry.rank === 1 ? 'text-dark-bg' : cfg.textColor}`}>
              #{entry.rank}
            </span>
            {entry.value && (
              <p className={`text-[10px] font-semibold mt-1 ${entry.rank === 1 ? 'text-dark-bg/70' : 'text-zinc-500'}`}>
                {entry.value}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex items-end gap-3 px-2">
      <PodiumBlock entry={rank2} />
      <PodiumBlock entry={rank1} />
      <PodiumBlock entry={rank3} />
    </div>
  );
}
