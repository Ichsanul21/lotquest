import { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { SearchInput } from '../../components/ui/SearchInput';
import { PullToRefresh } from '../../components/ui/PullToRefresh';
import { badgeApi } from '../../api/services';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import type { Badge } from '../../types';
import { Award, Lock, AlertCircle, X, Star } from 'lucide-react';

const categories = ['All', 'Achievement', 'Career', 'Event', 'Special'];

const rarityGradients: Record<string, string> = {
  Common: 'from-zinc-500 to-zinc-400',
  Rare: 'from-blue-500 to-blue-400',
  Epic: 'from-purple-500 to-purple-400',
  Legendary: 'from-[#FFE082] via-[#E5A93C] to-[#B8860B]',
};

export default function Badges() {
  const { agent } = useAuth();
  const { showToast } = useNotification();
  const { t } = useLanguage();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Badge | null>(null);
  const [featuredIds, setFeaturedIds] = useState<number[]>(() => (agent?.featured_badges || []).map(b => b.id));
  const [savingFeatured, setSavingFeatured] = useState(false);

  const mountedRef = useRef(true);

  const fetchBadges = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = filter === 'All' ? undefined : { category: filter };
      const res = await badgeApi.list(params);
      if (!mountedRef.current) return;
      setBadges(res.data);
    } catch {
      if (!mountedRef.current) return;
      setError(t('badges.toast.error_load'));
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [filter, t]);

  useEffect(() => {
    mountedRef.current = true;
    fetchBadges();
    if (agent?.featured_badges) setFeaturedIds(agent.featured_badges.map(b => b.id));
    return () => { mountedRef.current = false; };
  }, [fetchBadges, agent?.featured_badges]);

  const filtered = badges.filter(b => {
    if (search) {
      const q = search.toLowerCase();
      if (!b.name.toLowerCase().includes(q) && !b.description.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const isEarned = (b: Badge) => !!b.earned_at;

  const toggleFeatured = async (badgeId: number) => {
    const isFeatured = featuredIds.includes(badgeId);
    let next: number[];
    if (isFeatured) {
      next = featuredIds.filter(id => id !== badgeId);
    } else {
      if (featuredIds.length >= 3) {
        showToast('error', t('badges.toast.error_feature'));
        return;
      }
      next = [...featuredIds, badgeId];
    }
    setSavingFeatured(true);
    try {
      await badgeApi.setFeatured(next);
      setFeaturedIds(next);
      showToast('success', isFeatured ? t('badges.toast.success_unfeature') : t('badges.toast.success_feature'));
    } catch {
      showToast('error', t('badges.toast.error_unfeature'));
    } finally {
      setSavingFeatured(false);
    }
  };

  return (
    <>
      <Header title={t('badges.title')} showBack />
      <PullToRefresh onRefresh={fetchBadges}>
      <div className="px-4 pt-4 pb-6 space-y-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {categories.map(c => {
            const displayName = c === 'All' ? t('badges.all') : t(`badges.category.${c.toLowerCase()}`);
            return (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${filter === c ? 'gold-gradient text-[#0B0B0F]' : 'bg-white/10 text-zinc-400'}`}
              >
                {displayName}
              </button>
            );
          })}
        </div>

        <SearchInput value={search} onChange={setSearch} placeholder={t('badges.search_placeholder')} />

        {loading && (
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton className="w-16 h-16 rounded-2xl" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <Card className="flex items-center gap-3 p-4">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-sm text-zinc-400 flex-1">{error}</p>
            <button onClick={fetchBadges} className="text-xs text-[#FFE082] shrink-0">{t('common.retry')}</button>
          </Card>
        )}

        {!loading && !error && badges.length === 0 && (
          <EmptyState icon={Award} title={t('badges.empty.title')} description={t('badges.empty.description')} />
        )}
        {!loading && !error && badges.length > 0 && filtered.length === 0 && (
          <EmptyState icon={Award} title={t('badges.no_results')} description={t('badges.no_results_desc', { search })} />
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {filtered.map(b => {
              const earned = isEarned(b);
              const gradient = rarityGradients[b.rarity] || rarityGradients.Common;
              return (
                <button
                  key={b.id}
                  onClick={() => setSelected(b)}
                  className="flex flex-col items-center gap-2"
                >
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center ${earned ? '' : 'opacity-30'} shadow-lg transition-transform hover:scale-105`}
                  >
                    {earned ? (
                      <Award className="w-8 h-8 text-white drop-shadow-lg" />
                    ) : (
                      <Lock className="w-6 h-6 text-white/50" />
                    )}
                  </div>
                  <p className={`text-[10px] font-semibold text-center leading-tight ${earned ? 'text-white' : 'text-zinc-500'}`}>{b.name}</p>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${earned ? 'bg-white/10 text-zinc-400' : 'bg-white/5 text-zinc-600'}`}>{b.rarity}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
      </PullToRefresh>

      {selected && (
        <Modal open={!!selected} onClose={() => setSelected(null)}>
          <div className="p-4 text-center">
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4"><X className="w-5 h-5 text-zinc-400" /></button>
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${rarityGradients[selected.rarity] || rarityGradients.Common} flex items-center justify-center mx-auto mb-3 ${isEarned(selected) ? '' : 'opacity-40'}`}>
              {isEarned(selected) ? <Award className="w-10 h-10 text-white" /> : <Lock className="w-8 h-8 text-white/50" />}
            </div>
            <h3 className="text-base font-semibold text-white mb-1">{selected.name}</h3>
            <p className="text-xs text-zinc-400 mb-3">{selected.description}</p>
            <div className="flex justify-center gap-2 mb-4">
              <span className={`text-[10px] px-2 py-1 rounded-full ${isEarned(selected) ? 'bg-emerald-500/15 text-emerald-400' : 'bg-zinc-500/15 text-zinc-400'}`}>
                {isEarned(selected) ? t('badges.earned') : t('badges.locked')}
              </span>
              <span className="text-[10px] px-2 py-1 rounded-full bg-white/10 text-zinc-400">{selected.rarity}</span>
            </div>

            {selected.unlock_condition && (
              <div className="glass-card p-3 mb-4 text-left">
                <p className="text-[10px] text-zinc-500 mb-1">{t('badges.modal.how_to_earn')}</p>
                <p className="text-xs text-white">{selected.unlock_condition}</p>
              </div>
            )}

            {isEarned(selected) && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                loading={savingFeatured}
                onClick={() => toggleFeatured(selected.id)}
              >
                {featuredIds.includes(selected.id) ? (
                  <><Star className="w-4 h-4 mr-1 text-[#FFE082]" /> {t('badges.unfeature')}</>
                ) : (
                  <><Star className="w-4 h-4 mr-1" /> {t('badges.feature')}{featuredIds.length >= 3 ? ` ${t('badges.featured_count', { count: 3 })}` : ''}</>
                )}
              </Button>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
