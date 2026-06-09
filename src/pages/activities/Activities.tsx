import { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { PullToRefresh } from '../../components/ui/PullToRefresh';
import { usePagination } from '../../hooks/usePagination';
import { activityApi } from '../../api/services';
import { useLanguage } from '../../context/LanguageContext';
import type { ActivityItem } from '../../types';
import { Clock, Zap, Award, TrendingUp, CheckCircle, Star, AlertCircle } from 'lucide-react';

const activityTypes = [
  { key: null, label: 'Semua' },
  { key: 'quest', label: 'Quest' },
  { key: 'badge', label: 'Badge' },
  { key: 'transaction', label: 'Transaksi' },
  { key: 'level', label: 'Level' },
  { key: 'prospect', label: 'Prospek' },
  { key: 'listing', label: 'Listing' },
];

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  quest: Zap,
  badge: Award,
  transaction: TrendingUp,
  level: Star,
  prospect: CheckCircle,
  listing: Clock,
};

const typeColors: Record<string, string> = {
  quest: 'bg-orange-500/15 text-orange-400',
  badge: 'bg-purple-500/15 text-purple-400',
  transaction: 'bg-emerald-500/15 text-emerald-400',
  level: 'bg-blue-500/15 text-blue-400',
  prospect: 'bg-cyan-500/15 text-cyan-400',
  listing: 'bg-zinc-500/15 text-zinc-400',
};

export default function Activities() {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<string | null>(null);

  const fetchActivities = async (pageNum: number) => {
    const params: Record<string, string | number> = { page: pageNum };
    if (filter) params.type = filter;
    return activityApi.list(params);
  };

  const { data: activities, loading, error, hasMore, loadingMore, refresh, loadMore } = usePagination<ActivityItem>({
    fetchFn: fetchActivities,
  });

  useEffect(() => {
    refresh();
  }, [filter, refresh]);

  return (
    <>
      <Header title={t('activity.title') || 'Aktivitas'} showBack />
      <PullToRefresh onRefresh={refresh}>
      <div className="px-4 pt-4 pb-6 space-y-4">
        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {activityTypes.map(t => (
            <button
              key={t.key ?? 'all'}
              onClick={() => setFilter(t.key)}
              className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${filter === t.key ? 'gold-gradient text-dark-bg' : 'bg-white/10 text-zinc-400'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <Card key={i}>
                <div className="flex gap-3 items-start">
                  <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <Card className="flex items-center gap-3 p-4">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-sm text-zinc-400 flex-1">{error}</p>
            <button onClick={refresh} className="text-xs text-gold-700 shrink-0">{t('common.reload') || 'Muat ulang'}</button>
          </Card>
        )}

        {/* Empty */}
        {!loading && !error && activities.length === 0 && (
          <EmptyState icon={Clock} title={t('activity.empty.title') || 'Belum ada aktivitas'} description={t('activity.empty.description') || 'Aktivitas Anda akan muncul di sini'} />
        )}

        {/* List */}
        {!loading && !error && activities.map((a) => {
          const Icon = typeIcons[a.type] || Clock;
          return (
            <Card key={a.id}>
              <div className="flex gap-3 items-start">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${typeColors[a.type] || 'bg-zinc-500/15 text-zinc-400'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">{a.description}</p>
                  <p className="text-[10px] text-zinc-500 mt-1">{new Date(a.created_at).toLocaleDateString('id-ID')}</p>
                </div>
              </div>
            </Card>
          );
        })}

        {/* Load More */}
        {!loading && hasMore && (
          <Button variant="ghost" className="w-full" onClick={loadMore}>{t('common.load_more') || 'Muat Lainnya'}</Button>
        )}
      </div>
      </PullToRefresh>
    </>
  );
}
