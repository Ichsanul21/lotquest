import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { PullToRefresh } from '../../components/ui/PullToRefresh';
import { homeApi } from '../../api/services';
import { formatCompact } from '../../utils/format';
import type { HallOfFameEntry } from '../../types';
import { Trophy, Medal, TrendingUp, Star, AlertCircle, Crown, Sparkles, ChevronLeft, ChevronRight, Share2 } from 'lucide-react';

const categories = [
  { key: 'top_commission', labelKey: 'hall_of_fame.categories.top_commission', icon: Trophy },
  { key: 'top_unit', labelKey: 'hall_of_fame.categories.top_unit', icon: Medal },
  { key: 'top_primary', labelKey: 'hall_of_fame.categories.top_primary', icon: Star },
  { key: 'rising_star', labelKey: 'hall_of_fame.categories.rising_star', icon: TrendingUp },
];

const periodOptions = [
  { key: 'monthly', labelKey: 'hall_of_fame.period.monthly' },
  { key: 'all_time', labelKey: 'hall_of_fame.period.all_time' },
] as const;

export default function HallOfFame() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [period, setPeriod] = useState<'monthly' | 'all_time'>('monthly');
  const [entries, setEntries] = useState<HallOfFameEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [catIndex, setCatIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await homeApi.hallOfFame(period);
      if (!mountedRef.current) return;
      setEntries(res.data);
    } catch (e) {
      if (!mountedRef.current) return;
      setError(t('hall_of_fame.error.load') || 'Gagal memuat Hall of Fame');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [period, t]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    return () => { mountedRef.current = false; };
  }, [fetchData]);

  const getCategoryEntries = (cat: string) => {
    if (cat === 'rising_star') return entries.filter(e => e.is_rising_star);
    const catMap: Record<string, string> = {
      top_commission: t('hall_of_fame.top_commission') || 'Top Commission',
      top_unit: t('hall_of_fame.top_unit') || 'Top Unit',
      top_primary: t('hall_of_fame.top_primary') || 'Top Primary',
    };
    return entries.filter(e => !e.is_rising_star).slice(0, 5);
  };

  const catEntries = getCategoryEntries(categories[catIndex].key);
  const Icon = categories[catIndex].icon;

  const scroll = (dir: 'left' | 'right') => {
    const next = dir === 'left' ? catIndex - 1 : catIndex + 1;
    if (next >= 0 && next < categories.length) setCatIndex(next);
  };

  return (
    <>
      <Header title={t('hall_of_fame.title') || 'Hall of Fame'} />
      <PullToRefresh onRefresh={fetchData}>
      <div className="px-4 pt-4 pb-6 space-y-5">
        {/* Period */}
        <div className="flex bg-white/5 rounded-xl p-1">
          {periodOptions.map(p => (
            <button key={p.key} onClick={() => setPeriod(p.key)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${period === p.key ? 'gold-gradient text-dark-bg' : 'text-zinc-400'}`}>
              {t(p.labelKey) || (p.key === 'monthly' ? 'Bulanan' : 'All-Time')}
            </button>
          ))}
        </div>

        {/* Category Carousel */}
        <div className="flex items-center gap-3">
          <button onClick={() => scroll('left')} disabled={catIndex === 0} className="disabled:opacity-30"><ChevronLeft className="w-5 h-5 text-zinc-400" /></button>
          <div className="flex-1 overflow-hidden">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth" ref={scrollRef}>
              {categories.map((cat, ci) => (
                <button
                  key={cat.key}
                  onClick={() => setCatIndex(ci)}
                  className={`snap-center shrink-0 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${catIndex === ci ? 'gold-gradient text-dark-bg' : 'bg-white/10 text-zinc-400'}`}
                >
                  <cat.icon className="w-3.5 h-3.5 inline mr-1.5" />
                  {t(cat.labelKey) || cat.labelKey}
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => scroll('right')} disabled={catIndex === categories.length - 1} className="disabled:opacity-30"><ChevronRight className="w-5 h-5 text-zinc-400" /></button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-40 rounded-2xl" />
            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
        ) : error ? (
          <Card className="flex items-center gap-3 p-4">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-sm text-zinc-400 flex-1">{error}</p>
            <button onClick={fetchData} className="text-xs text-gold-700 shrink-0">{t('common.reload') || 'Muat ulang'}</button>
          </Card>
        ) : catEntries.length === 0 ? (
          <EmptyState icon={Icon} title={t('common.no_data') || 'Belum ada data'} description={`${t('hall_of_fame.empty.description') || 'Belum ada entry untuk kategori'} ${t(categories[catIndex].labelKey) || categories[catIndex].labelKey}`} />
        ) : (
          <>
            {/* Top entry highlight */}
            {catEntries[0] && (
              <Card className="relative overflow-hidden shadow-[0_0_20px_rgba(229,169,60,0.15)]">
                <div className="absolute top-0 right-0 w-40 h-40 gold-gradient opacity-10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="relative flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl gold-gradient flex items-center justify-center shadow-[0_0_20px_rgba(229,169,60,0.3)]">
                    <Crown className="w-8 h-8 text-dark-bg" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-white">{catEntries[0].agent.name}</h3>
                      {catEntries[0].is_admin_pick && <Sparkles className="w-4 h-4 text-gold-700" />}
                    </div>
                    <p className="text-xs text-zinc-400">{t(categories[catIndex].labelKey) || categories[catIndex].labelKey}</p>
                    <p className="text-sm text-gold-700 font-bold mt-1">Rp {formatCompact(catEntries[0].total_commission)}</p>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-2xl font-extrabold text-gold-700">#1</span>
                    <Button size="sm" variant="ghost" onClick={() => navigate(`/poster?achievement=${encodeURIComponent(t(categories[catIndex].labelKey) || categories[catIndex].labelKey)}&rank=${catEntries[0].rank}&name=${encodeURIComponent(catEntries[0].agent.name)}`)}>
                      <Share2 className="w-3 h-3 mr-1" /> {t('hall_of_fame.poster_button') || 'Poster'}
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Rest of entries */}
            <div className="space-y-2">
              {catEntries.slice(1).map(entry => (
                <Card key={entry.id}>
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold ${entry.rank === 1 ? 'gold-gradient text-dark-bg' : 'bg-white/10 text-zinc-400'}`}>
                      #{entry.rank}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-zinc-400">{entry.agent.name[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">{entry.agent.name}</p>
                      <p className="text-[10px] text-zinc-500">Rp {formatCompact(entry.total_commission)}</p>
                    </div>
                    <div className="flex gap-1">
                      {entry.is_rising_star && <TrendingUp className="w-4 h-4 text-orange-400" />}
                      {entry.is_admin_pick && <span className="text-[10px] px-2 py-1 rounded-full bg-gold-200/15 text-gold-700">{t('hall_of_fame.admin_pick') || 'Admin Pick'}</span>}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
      </PullToRefresh>
    </>
  );
}
