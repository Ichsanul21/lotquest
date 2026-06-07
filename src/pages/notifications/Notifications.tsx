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
import { Bell, CheckCheck, Trophy, Zap, Award, Gift, Info, AlertCircle } from 'lucide-react';

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

export default function Notifications() {
  const { showToast } = useNotification();
  const { t } = useLanguage();
  const [unreadOnly, setUnreadOnly] = useState(false);
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

  const filtered = unreadOnly ? notifs.filter(n => !n.read) : notifs;
  const hasUnread = notifs.some(n => !n.read);

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

        {/* Filters */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {[t('notification.all') || 'Semua', t('notification.unread') || 'Belum Dibaca'].map(label => (
              <button
                key={label}
                onClick={() => setUnreadOnly(label === (t('notification.unread') || 'Belum Dibaca'))}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${(label === (t('notification.unread') || 'Belum Dibaca')) === unreadOnly ? 'gold-gradient text-[#0B0B0F]' : 'bg-white/10 text-zinc-400'}`}
              >
                {label}
              </button>
            ))}
          </div>
          {hasUnread && (
            <button onClick={handleMarkAllRead} className="text-xs text-[#FFE082] flex items-center gap-1">
              <CheckCheck className="w-3.5 h-3.5" /> {t('notification.mark_all_read') || 'Semua Dibaca'}
            </button>
          )}
        </div>

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
            <button onClick={refresh} className="text-xs text-[#FFE082] shrink-0">{t('common.reload') || 'Muat ulang'}</button>
          </Card>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <EmptyState icon={Bell} title={t('notification.empty.title') || 'Tidak ada notifikasi'} description={unreadOnly ? (t('notification.empty.all_read') || 'Semua notifikasi sudah dibaca') : (t('notification.empty.none') || 'Belum ada notifikasi')} />
        )}

        {/* List */}
        {!loading && !error && filtered.map(n => {
          const Icon = iconMap[n.type] || Info;
          return (
            <Card
              key={n.id}
              className={`${!n.read ? 'border-[#FFE082]/20' : ''}`}
              onClick={() => !n.read && handleMarkRead(n.id)}
            >
              <div className="flex gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorMap[n.type] || 'bg-zinc-500/15 text-zinc-400'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">{n.title}</h3>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-[#FFE082]" />}
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">{n.body}</p>
                  <p className="text-[10px] text-zinc-500 mt-1">{new Date(n.created_at).toLocaleDateString('id-ID')}</p>
                </div>
              </div>
            </Card>
          );
        })}

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
