import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Home, Users, Handshake, UserPlus, Camera, LogIn, Target, Shield } from 'lucide-react';
import { getTierName } from '../../utils/format';

interface TierData {
  levelRange: string;
  name: string;
  color: string;
  textColor: string;
  minXp: string;
  xpRange: string;
}

const tiers: TierData[] = [
  { levelRange: '1 - 19', name: 'ROOKIE AGENT', color: 'bg-zinc-500', textColor: 'text-zinc-400', minXp: '0 XP', xpRange: '0 - 50.000 XP' },
  { levelRange: '20 - 39', name: 'JUNIOR AGENT', color: 'bg-blue-500', textColor: 'text-blue-400', minXp: '50.000 XP', xpRange: '50.000 - 200.000 XP' },
  { levelRange: '40 - 59', name: 'SENIOR AGENT', color: 'bg-emerald-500', textColor: 'text-emerald-400', minXp: '200.000 XP', xpRange: '200.000 - 800.000 XP' },
  { levelRange: '60 - 79', name: 'ELITE AGENT', color: 'bg-rarity-epic', textColor: 'text-rarity-epic', minXp: '800.000 XP', xpRange: '800.000 - 2.000.000 XP' },
  { levelRange: '80 - 98', name: 'SUPER ELITE AGENT', color: 'bg-orange-500', textColor: 'text-orange-400', minXp: '2.000.000 XP', xpRange: '2.000.000 - 5.000.000 XP' },
  { levelRange: '99', name: 'LOT LEGENDARY', color: 'bg-red-500', textColor: 'text-red-400', minXp: '5.000.000+ XP', xpRange: '5.000.000+ XP' },
];

const xpActivities = [
  { icon: Home, label: 'Listing Property', xp: '+100 XP', desc: 'Saat listing terdistribusi' },
  { icon: Users, label: 'Prospect Berkualitas', xp: '+100 XP', desc: 'Saat prospek aktif' },
  { icon: Handshake, label: 'Unit Tersewa / Terjual', xp: '+300 XP', desc: 'Saat transaksi berhasil' },
  { icon: UserPlus, label: 'Rekrut Agent', xp: '+200 XP', desc: 'Saat merekrut agen baru' },
  { icon: Camera, label: 'Konten Berkualitas', xp: '+300 XP', desc: 'Saat konten disetujui' },
  { icon: LogIn, label: 'Login Harian', xp: '+100 XP', desc: 'Login setiap hari' },
];

export default function LevelGuide() {
  const { agent } = useAuth();
  const { t } = useLanguage();
  const currentLevel = agent?.level || 1;
  const currentTier = getTierName(currentLevel);
  const xp = agent?.xp || 0;
  const xpNext = agent?.xp_next_level || 50000;
  const remainingXp = Math.max(0, xpNext - xp);

  return (
    <>
      <Header title={t('level_guide.title') || 'Panduan Level & XP'} showBack />
      <div className="px-4 pt-4 pb-6 space-y-4">
        {/* Hero Header */}
        <div className="text-center py-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-gold-700 to-gold-900 mb-4 shadow-lg shadow-gold-700/20">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white font-display">
            {t('level_guide.title') || 'LEVELING GUIDE'}
          </h1>
          <p className="text-sm text-zinc-400 mt-2 max-w-xs mx-auto">
            {t('level_guide.description') || 'Tingkatkan Level agen properti Anda untuk membuka lebih banyak peluang, pengakuan, dan reward eksklusif.'}
          </p>
        </div>

        {/* Current Progress Widget */}
        <Card className="p-5 border-gold-700/20">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-700 to-gold-900 flex items-center justify-center shrink-0">
              <span className="text-2xl font-bold text-white">{currentLevel}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-zinc-500 uppercase tracking-wider">{t('level_guide.current_level') || 'Level Saat Ini'}</p>
              <p className="text-lg font-bold text-white">{currentTier}</p>
              <div className="mt-2">
                <ProgressBar value={xp} max={xpNext} />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-zinc-500">{xp.toLocaleString()} XP</span>
                <span className="text-[10px] text-zinc-500">{xpNext.toLocaleString()} XP</span>
              </div>
              <p className="text-[10px] text-gold-700 mt-1">
                {t('level_guide.remaining') || 'Sisa'} {remainingXp.toLocaleString()} XP {t('level_guide.to_next_level') || 'menuju level berikutnya'}
              </p>
            </div>
          </div>
        </Card>

        {/* Tier List */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-white font-display px-1">
            {t('level_guide.career_hierarchy') || 'JENJANG KARIR AGEN'}
          </h2>
          {tiers.map(tier => {
            const isCurrent = getTierName(tiers.indexOf(tier) > 0 ?
              parseInt(tier.levelRange.split(' - ')[0]) : 1) === currentTier || currentTier === tier.name;
            return (
              <div
                key={tier.name}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                  isCurrent ? 'bg-gold-700/10 border border-gold-700/30' : 'bg-white/5 border border-transparent'
                }`}
              >
                <div className={`w-2 h-8 rounded-full ${tier.color} shrink-0`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-500 font-mono">{tier.levelRange}</span>
                    {isCurrent && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gold-700/20 text-gold-700 font-semibold">
                        {t('level_guide.current') || 'Saat Ini'}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm font-bold ${tier.textColor} ${isCurrent ? 'text-gold-700' : ''}`}>
                    {tier.name}
                  </p>
                  <p className="text-[10px] text-zinc-500">
                    {t('level_guide.requires') || 'Membutuhkan'} <span className="text-zinc-400">{tier.minXp}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-zinc-600">{t('level_guide.range') || 'Range'}</p>
                  <p className="text-[10px] text-zinc-400">{tier.xpRange}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* XP Activities */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-white font-display px-1">
            {t('level_guide.xp_sources') || 'CARA MENDAPATKAN XP'}
          </h2>
          <Card>
            <div className="divide-y divide-white/5">
              {xpActivities.map((activity, i) => (
                <div key={i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="w-9 h-9 rounded-xl bg-gold-700/10 flex items-center justify-center shrink-0">
                    <activity.icon className="w-4 h-4 text-gold-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{activity.label}</p>
                    <p className="text-[10px] text-zinc-500">{activity.desc}</p>
                  </div>
                  <span className="text-xs font-bold text-gold-700 shrink-0">{activity.xp}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}