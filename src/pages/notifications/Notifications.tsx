import { useState } from 'react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { PullToRefresh } from '../../components/ui/PullToRefresh';
import { usePagination } from '../../hooks/usePagination';
import { notificationApi } from '../../api/services';
import { useNotification } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';
import type { Notification } from '../../types';
import { Bell, CheckCheck, Trophy, Zap, Award, Gift, Info, AlertCircle, Users, Building2, Swords } from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  quest: Zap,
  badge: Award,
  level_up: Trophy,
  achievement: Gift,
  system: Info,
  event: Zap,
};

const colorMap: Record<string, string> = {
  quest: 'bg-orange-500/15 text-orange-400',
  badge: 'bg-purple-500/15 text-purple-400',
  level_up: 'bg-emerald-500/15 text-emerald-400',
  achievement: 'bg-blue-500/15 text-blue-400',
  system: 'bg-zinc-500/15 text-zinc-400',
  event: 'bg-amber-500/15 text-amber-400',
};

const categoryTabs = [
  { key: 'all', labelKey: 'notification.all', icon: Bell },
  { key: 'action_required', labelKey: 'notification.action_required', icon: Swords },
  { key: 'achievement', labelKey: 'notification.achievement', icon: Trophy },
  { key: 'community', labelKey: 'notification.community', icon: Users },
  { key: 'company', labelKey: 'notification.company', icon: Building2 },
] as const;

const categoryBgMap: Record<string, string> = {
  action_required: 'bg-red-950/30 border-red-900/30',
  achievement: 'bg-zinc-900/50 border-gold-700/20',
  community: 'bg-purple-950/30 border-purple-900/30',
  company: 'bg-blue-950/30 border-blue-900/30',
};

const categoryLabelMap: Record<string, string> = {
  action_required: 'ACTION REQUIRED',
  achievement: 'ACHIEVEMENT',
  community: 'COMMUNITY ACHIEVEMENT',
  company: 'COMPANY MESSAGE',
};

export default function Notifications() {
  const { showToast } = useNotification();
  const { t } = useLanguage();
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [unreadCount, setUnreadCount] = useState(0);
  const { data: notifs, setData: setNotifs, loading, error, hasMore, loadingMore, refresh, loadMore } = usePagination<Notification>({
    fetchFn: (page) => notificationApi.list(page),
  });

  useState(() => {
    notificationApi.unreadCount().then(res => {
      setUnreadCount(res.count);
    }).catch(() => {});
  });

  const handleMarkRead = async (id: number) => {
    try {
      await notificationApi.markRead(id);
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      showToast('error', t('notification.toast.error_mark'));
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      setNotifs(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      showToast('success', t('notification.toast.success_mark_all'));
    } catch (e) {
      showToast('error', t('notification.toast.error_mark'));
    }
  };

  const filtered = categoryFilter === 'all'
    ? notifs
    : notifs.filter(n => n.category === categoryFilter);

  const hasUnread = notifs.some(n => !n.read);

  const groupedNotifications = categoryFilter === 'all'
    ? categoryTabs.filter(c => c.key !== 'all').map(c => ({
        category: c.key,
        label: categoryLabelMap[c.key],
        items: notifs.filter(n => n.category === c.key),
      })).filter(g => g.items.length > 0)
    : [{ category: categoryFilter, label: categoryLabelMap[categoryFilter] || '', items: filtered }];

  return (
    <>
      <Header title={t('notification.title') || 'Notifikasi'} showBack />
      <PullToRefresh onRefresh={refresh}>
      <div className="px-4 pt-4 pb-6 space-y-4">
        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <div className="flex items-center gap-2 px-1">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <p className="text-xs text-zinc-400">{unreadCount} {t('notification.unread') || 'notifikasi belum dibaca'}</p>
          </div>
        )}

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
          {categoryTabs.map(cat => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.key}
                onClick={() => setCategoryFilter(cat.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                  categoryFilter === cat.key
                    ? 'gold-gradient text-dark-bg'
                    : 'bg-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t(cat.labelKey) || cat.key}
              </button>
            );
          })}
        </div>

        {/* Mark All Read */}
        {hasUnread && categoryFilter === 'all' && (
          <div className="flex justify-end">
            <button onClick={handleMarkAllRead} className="text-xs text-gold-700 flex items-center gap-1">
              <CheckCheck className="w-3.5 h-3.5" /> {t('notification.mark_all_read') || 'Semua Dibaca'}
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <div className="flex gap-3">
                  <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
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
        {!loading && !error && filtered.length === 0 && (
          <EmptyState icon={Bell} title={t('notification.empty.title') || 'Tidak ada notifikasi'} description={t('notification.empty.none') || 'Belum ada notifikasi'} />
        )}

        {/* Grouped List */}
        {!loading && !error && groupedNotifications.map(group => (
          <div key={group.category} className="space-y-2">
            {categoryFilter === 'all' && (
              <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider px-1">
                {group.label}
              </p>
            )}
            {group.items.map(n => {
              const Icon = iconMap[n.type] || Info;
              return (
                <Card
                  key={n.id}
                  className={`${categoryBgMap[n.category] || 'glass-card'} ${!n.read ? 'ring-1 ring-gold-700/20' : ''}`}
                  onClick={() => !n.read && handleMarkRead(n.id)}
                >
                  <div className="flex gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorMap[n.type] || 'bg-zinc-500/15 text-zinc-400'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white">{n.title}</h3>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-gold-200 shrink-0" />}
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">{n.body}</p>
                      <p className="text-[10px] text-zinc-500 mt-1">{new Date(n.created_at).toLocaleDateString('id-ID')}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ))}

        {/* Load More */}
        {!loading && !error && hasMore && (
          <Button className="w-full" variant="ghost" loading={loadingMore} onClick={loadMore}>
            {t('common.load_more') || 'Muat Lainnya'}
          </Button>
        )}
      </div>
      </PullToRefresh>
    </>
  );
}