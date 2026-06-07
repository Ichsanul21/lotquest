import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Skeleton, Avatar } from '../../components/ui/Skeleton';
import { Header } from '../../components/layout/Header';
import { EmptyState } from '../../components/ui/EmptyState';
import { SearchInput } from '../../components/ui/SearchInput';
import { PullToRefresh } from '../../components/ui/PullToRefresh';
import { motion } from 'framer-motion';
import { homeApi, leaderboardApi } from '../../api/services';
import { formatCompact } from '../../utils/format';
import type { HallOfFameEntry, Quest, LeaderboardEntry, AgentStats } from '../../types';
import {
  TrendingUp, Medal, Zap, Flame, Target, ChevronRight,
  DollarSign, Users, Award, Crown, Sparkles,
  Activity, AlertCircle, Home as HomeIcon
} from 'lucide-react';

function StatCard({ icon: Icon, label, value, accent }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="glass-card p-3 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent || 'bg-white/5'}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-zinc-400">{label}</p>
        <p className="text-sm font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

interface SectionState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

function useSection<T>() {
  return useState<SectionState<T>>({ data: null, loading: true, error: null });
}

function SectionSkeleton() {
  return (
    <div className="glass-card p-4 space-y-3">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { agent } = useAuth();
  const { t } = useLanguage();

  const [hofPeriod, setHofPeriod] = useState<'Bulanan' | 'All-Time'>('Bulanan');
  const [lbType, setLbType] = useState<'xp' | 'commission'>('commission');
  const [lbSearch, setLbSearch] = useState('');
  const [hof, setHof] = useSection<HallOfFameEntry[]>();
  const [eventQuests, setEventQuests] = useSection<Quest[]>();
  const [dailyQuests, setDailyQuests] = useSection<Quest[]>();
  const [leaderboard, setLeaderboard] = useSection<LeaderboardEntry[]>();
  const [progress, setProgress] = useSection<{ level: number; xp: number; xp_next: number; tier: string }>();
  const [stats, setStats] = useSection<AgentStats>();
  const [activities, setActivities] = useSection<{ id: number; type: string; description: string; created_at: string }[]>();
  const mountedRef = useRef(true);

  const fetchAll = useCallback(async () => {
    setHof(prev => ({ ...prev, loading: true, error: null }));
    setEventQuests(prev => ({ ...prev, loading: true, error: null }));
    setDailyQuests(prev => ({ ...prev, loading: true, error: null }));
    setLeaderboard(prev => ({ ...prev, loading: true, error: null }));
    setProgress(prev => ({ ...prev, loading: true, error: null }));
    setStats(prev => ({ ...prev, loading: true, error: null }));
    setActivities(prev => ({ ...prev, loading: true, error: null }));

    if (!mountedRef.current) return;
    const results = await Promise.allSettled([
      homeApi.hallOfFame(hofPeriod === 'All-Time' ? 'all_time' : undefined).then(r => r.data).catch(e => { throw e; }),
      homeApi.eventQuests().then(r => r.data).catch(e => { throw e; }),
      homeApi.dailyQuests().then(r => r.data).catch(e => { throw e; }),
      leaderboardApi.list({ period: 'Bulanan', type: lbType }).then(r => r.data).catch(e => { throw e; }),
      homeApi.myProgress().then(r => r.data).catch(e => { throw e; }),
      homeApi.stats().then(r => r.data).catch(e => { throw e; }),
      homeApi.recentActivity().then(r => r.data).catch(e => { throw e; }),
    ]);

    if (!mountedRef.current) return;
    if (results[0].status === 'fulfilled') setHof({ data: results[0].value, loading: false, error: null });
    else setHof({ data: null, loading: false, error: t('home.error.hof') || 'Gagal memuat Hall of Fame' });

    if (results[1].status === 'fulfilled') setEventQuests({ data: results[1].value, loading: false, error: null });
    else setEventQuests({ data: null, loading: false, error: t('home.error.event_quest') || 'Gagal memuat event quest' });

    if (results[2].status === 'fulfilled') setDailyQuests({ data: results[2].value, loading: false, error: null });
    else setDailyQuests({ data: null, loading: false, error: t('home.error.daily_quest') || 'Gagal memuat quest harian' });

    if (results[3].status === 'fulfilled') setLeaderboard({ data: results[3].value, loading: false, error: null });
    else setLeaderboard({ data: null, loading: false, error: t('home.error.leaderboard') || 'Gagal memuat leaderboard' });

    if (results[4].status === 'fulfilled') setProgress({ data: results[4].value, loading: false, error: null });
    else setProgress({ data: null, loading: false, error: t('home.error.progress') || 'Gagal memuat progress' });

    if (results[5].status === 'fulfilled') setStats({ data: results[5].value, loading: false, error: null });
    else setStats({ data: null, loading: false, error: t('home.error.stats') || 'Gagal memuat statistik' });

    if (results[6].status === 'fulfilled') setActivities({ data: results[6].value, loading: false, error: null });
    else setActivities({ data: null, loading: false, error: t('home.error.activity') || 'Gagal memuat aktivitas' });
  }, [hofPeriod, lbType]);

  useEffect(() => {
    mountedRef.current = true;
    fetchAll();
    return () => { mountedRef.current = false; };
  }, [fetchAll]);

  const hofScrollRef = useRef<HTMLDivElement>(null);

  const lbFiltered = leaderboard.data?.filter(e => {
    if (!lbSearch) return true;
    return e.agent.name.toLowerCase().includes(lbSearch.toLowerCase());
  }) ?? [];

  const currentAgent = agent;

  return (
    <>
      <Header showSearch showNotification />

      <PullToRefresh onRefresh={fetchAll}>
      <motion.div
        className="px-4 pt-4 pb-6 space-y-5"
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
      >
        {/* 1. My Progress / Hero Bar */}
        <motion.div variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}>
          <div className="glass-card p-4 flex items-center gap-4">
            <Avatar src={currentAgent?.avatar || null} name={currentAgent?.name || 'Agent'} size="lg" level={currentAgent?.level} tier={currentAgent?.tier} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-zinc-400">{t('home.greeting')}</p>
              <h2 className="text-lg font-semibold text-white truncate">{currentAgent?.name || 'Agent'}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-[#FFE082] font-semibold">Level {progress.data?.level || currentAgent?.level || 1}</span>
                <span className="text-[10px] text-zinc-500">{progress.data?.tier || currentAgent?.tier || 'Rookie'}</span>
              </div>
              <div className="mt-1.5">
                <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                  <span>XP</span>
                  <span>{(progress.data?.xp ?? currentAgent?.xp ?? 0)} / {(progress.data?.xp_next ?? currentAgent?.xp_next_level ?? 100)}</span>
                </div>
                <ProgressBar value={progress.data?.xp ?? currentAgent?.xp ?? 0} max={progress.data?.xp_next ?? currentAgent?.xp_next_level ?? 100} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* 2. Hall of Fame — 4 kategori horizontal swipe */}
        <motion.div variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Medal className="w-5 h-5 text-[#FFE082]" />
              <h3 className="text-base font-semibold text-white">{t('home.hof')}</h3>
            </div>
            <button onClick={() => navigate('/hall-of-fame')} className="text-xs text-[#FFE082] flex items-center gap-1">
              {t('home.view_all')} <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="flex gap-2 mb-3">
            {(['Bulanan', 'All-Time'] as const).map(p => (
              <button
                key={p}
                onClick={() => setHofPeriod(p)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  hofPeriod === p ? 'bg-[#FFE082] text-[#0B0B0F]' : 'bg-white/10 text-zinc-400'
                }`}
              >
                {p === 'Bulanan' ? (t('common.monthly') || 'Bulanan') : p}
              </button>
            ))}
          </div>

          {hof.loading ? (
            <SectionSkeleton />
          ) : hof.error ? (
            <Card className="flex items-center gap-3 p-4">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <p className="text-sm text-zinc-400 flex-1">{hof.error}</p>
              <button onClick={fetchAll} className="text-xs text-[#FFE082] shrink-0">{t('common.reload') || 'Muat ulang'}</button>
            </Card>
          ) : !hof.data?.length ? (
            <EmptyState icon={Medal} title={t('common.no_data') || 'Belum ada data'} description={t('home.empty.hof') || 'Hall of Fame belum tersedia'} />
          ) : (
            <div ref={hofScrollRef} className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4 pb-1">
              {[
                { key: 'top_commission', label: t('leaderboard.top_commission') || 'Top Commission', filter: (e: HallOfFameEntry) => !e.is_rising_star },
                { key: 'top_unit', label: t('leaderboard.top_unit') || 'Top Unit', filter: (e: HallOfFameEntry) => !e.is_rising_star },
                { key: 'top_primary', label: t('leaderboard.top_primary') || 'Top Primary', filter: (e: HallOfFameEntry) => e.is_admin_pick },
                { key: 'rising_star', label: t('leaderboard.rising_star') || 'Rising Star', filter: (e: HallOfFameEntry) => e.is_rising_star },
              ].map(({ key, label, filter }) => {
                const catEntries = hof.data!.filter(filter);
                const top3 = catEntries.slice(0, 3);
                const rest = catEntries.slice(3, 10);
                if (!top3.length) return null;
                return (
                  <div key={key} className="snap-center shrink-0 w-[280px]">
                    <Card className="relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 gold-gradient opacity-10 rounded-full -translate-y-1/2 translate-x-1/2" />
                      <div className="relative">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-[#FFE082]">{label}</span>
                          {key === 'rising_star' && <Sparkles className="w-4 h-4 text-orange-400" />}
                        </div>
                        {top3.map((entry, ei) => (
                          <div key={entry.id} className={`flex items-center justify-between py-1.5 ${ei > 0 ? 'border-t border-white/5' : ''}`}>
                            <div className="flex items-center gap-2">
                              <span className={`w-5 text-center text-xs font-bold ${ei === 0 ? 'text-[#FFE082]' : ei === 1 ? 'text-zinc-300' : 'text-orange-400'}`}>
                                #{entry.rank}
                              </span>
                              <div>
                                <p className="text-sm font-medium text-white">{entry.agent.name}</p>
                                <p className="text-[10px] text-zinc-500">{formatCompact(entry.total_commission)} {t('common.commission') || 'komisi'}</p>
                              </div>
                            </div>
                            {ei === 0 && <Crown className="w-4 h-4 text-[#FFE082]" />}
                          </div>
                        ))}
                        {/* Peringkat 4-10 vertical list */}
                        {rest.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-white/5 space-y-1">
                            {rest.map(entry => (
                              <div key={entry.id} className="flex items-center justify-between py-1">
                                <div className="flex items-center gap-2">
                                  <span className="w-5 text-center text-[10px] font-medium text-zinc-500">#{entry.rank}</span>
                                  <span className="text-xs text-zinc-300 truncate max-w-[140px]">{entry.agent.name}</span>
                                </div>
                                <span className="text-[10px] text-zinc-500">{formatCompact(entry.total_commission)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* 3. Event Quest Banner */}
        <motion.div variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}>
          {eventQuests.loading ? (
            <SectionSkeleton />
          ) : eventQuests.error ? (
            <Card className="flex items-center gap-3 p-4">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <p className="text-sm text-zinc-400 flex-1">{eventQuests.error}</p>
              <button onClick={fetchAll} className="text-xs text-[#FFE082] shrink-0">{t('common.reload') || 'Muat ulang'}</button>
            </Card>
          ) : !eventQuests.data?.length ? null : (
            <Card>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-orange-400" />
                  <h3 className="text-base font-semibold text-white">{t('home.event_quest')}</h3>
                </div>
              </div>
              <div className="space-y-3">
                {eventQuests.data.map(q => (
                  <div key={q.id} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-white">{q.title}</span>
                        <span className="text-[10px] text-zinc-500">+{q.xp_reward} XP</span>
                      </div>
                      <ProgressBar value={q.progress} max={q.target} className="mb-1" />
                      <div className="flex justify-between text-[10px] text-zinc-500">
                        <span>{q.progress}/{q.target}</span>
                        <span>{q.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </motion.div>

        {/* 4. Daily Quest Summary (max 3) */}
        <motion.div variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}>
          {dailyQuests.loading ? (
            <SectionSkeleton />
          ) : dailyQuests.error ? (
            <Card className="flex items-center gap-3 p-4">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <p className="text-sm text-zinc-400 flex-1">{dailyQuests.error}</p>
              <button onClick={fetchAll} className="text-xs text-[#FFE082] shrink-0">{t('common.reload') || 'Muat ulang'}</button>
            </Card>
          ) : !dailyQuests.data?.length ? null : (
            <Card>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-semibold text-white">{t('home.daily_quest')}</h3>
                </div>
              </div>
              <div className="space-y-3">
                {dailyQuests.data.slice(0, 3).map(q => (
                  <div key={q.id} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-white">{q.title}</span>
                        <span className="text-[10px] text-zinc-500">+{q.xp_reward} XP</span>
                      </div>
                      <ProgressBar value={q.progress} max={q.target} className="mb-1" />
                      <div className="flex justify-between text-[10px] text-zinc-500">
                        <span>{q.progress}/{q.target}</span>
                        <span>{q.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </motion.div>

        {/* 5. Leaderboard Mini + Podium */}
        <motion.div variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}>
          {leaderboard.loading ? (
            <SectionSkeleton />
          ) : leaderboard.error ? (
            <Card className="flex items-center gap-3 p-4">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <p className="text-sm text-zinc-400 flex-1">{leaderboard.error}</p>
              <button onClick={fetchAll} className="text-xs text-[#FFE082] shrink-0">{t('common.reload') || 'Muat ulang'}</button>
            </Card>
          ) : !lbFiltered.length ? (
            <EmptyState icon={TrendingUp} title={t('common.no_data') || 'Belum ada data'} description={t('home.empty.leaderboard') || 'Leaderboard belum tersedia'} />
          ) : (
            <Card>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-semibold text-white">{t('home.leaderboard')}</h3>
                </div>
                <span className="text-xs text-zinc-500">{t('leaderboard.bulanan')}</span>
              </div>
              <div className="flex gap-2 mb-3">
                {(['xp', 'commission'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setLbType(type)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      lbType === type ? 'bg-[#FFE082] text-[#0B0B0F]' : 'bg-white/10 text-zinc-400'
                    }`}
                  >
                    {type === 'xp' ? (t('common.xp') || 'XP') : (t('common.commission') || 'Komisi')}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="mb-3">
                <SearchInput value={lbSearch} onChange={setLbSearch} placeholder={t('leaderboard.search_agent') || 'Cari agent...'} />
              </div>

              {/* Top 3 Podium */}
              <div className="flex items-end justify-center gap-2 mb-4 pt-2">
                {[1, 0, 2].map(pos => {
                  const entry = lbFiltered[pos];
                  if (!entry) return null;
                  const isFirst = pos === 0;
                  const heights = ['h-40', 'h-32', 'h-28'];
                  const avatarSizes = ['w-16 h-16', 'w-14 h-14', 'w-12 h-12'];
                  return (
                    <div key={entry.rank} className={`flex flex-col items-center gap-1 ${heights[pos]} justify-end`}>
                      {isFirst && <Crown className="w-5 h-5 text-[#FFE082]" />}
                      <div className={`rounded-xl ${isFirst ? 'gold-gradient' : 'bg-white/10'} ${avatarSizes[pos]} flex items-center justify-center shadow-[0_0_20px_rgba(229,169,60,0.3)]`}>
                        <span className={`text-lg font-bold ${isFirst ? 'text-[#0B0B0F]' : 'text-zinc-400'}`}>#{entry.rank}</span>
                      </div>
                      <p className="text-xs font-medium text-white truncate max-w-[80px]">{entry.agent.name}</p>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-zinc-400">Lv.{entry.agent.level}</span>
                        <span className="text-[8px] px-1 rounded bg-white/10 text-zinc-500">{entry.agent.tier}</span>
                      </div>
                      <p className="text-[10px] text-[#FFE082] font-semibold">{formatCompact(entry.total_commission)}</p>
                    </div>
                  );
                })}
              </div>

              {/* Rank 4-10 */}
              <div className="space-y-1">
                {lbFiltered.slice(3, 10).map(entry => (
                  <div
                    key={entry.rank}
                    className={`flex items-center justify-between p-2 rounded-xl ${entry.agent.id === currentAgent?.id ? 'bg-[#FFE082]/10 border border-[#FFE082]/20' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-center text-sm font-bold text-zinc-500">#{entry.rank}</span>
                      <span className={`text-sm ${entry.agent.id === currentAgent?.id ? 'text-[#FFE082]' : 'text-white'}`}>
                        {entry.agent.name}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-white">Rp {formatCompact(entry.total_commission)}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </motion.div>

        {/* 6. Stats Grid */}
        <motion.div variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}>
          {stats.loading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
            </div>
          ) : stats.error ? (
            <Card className="flex items-center gap-3 p-4">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <p className="text-sm text-zinc-400 flex-1">{stats.error}</p>
              <button onClick={fetchAll} className="text-xs text-[#FFE082] shrink-0">{t('common.reload') || 'Muat ulang'}</button>
            </Card>
          ) : stats.data ? (
            <div className="grid grid-cols-2 gap-3">
              <StatCard icon={Users} label={t('home.stats.total_prospects') || 'Total Prospek'} value={stats.data.total_prospects.toString()} accent="bg-purple-500/15 text-purple-400" />
              <StatCard icon={Award} label={t('home.stats.recruitment') || 'Rekrutmen'} value={stats.data.converted_prospects.toString()} accent="bg-emerald-500/15 text-emerald-400" />
              <StatCard icon={HomeIcon} label={t('home.stats.training') || 'Training'} value={stats.data.total_listings.toString()} accent="bg-blue-500/15 text-blue-400" />
              <StatCard icon={Flame} label={t('home.stats.day_streak') || 'Day Streak'} value={`${stats.data.day_streak} ${t('common.days') || 'hari'}`} accent="bg-orange-500/15 text-orange-400" />
            </div>
          ) : null}
        </motion.div>

        {/* 7. Recent Activity */}
        <motion.div variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}>
          {activities.loading ? (
            <SectionSkeleton />
          ) : activities.error ? (
            <Card className="flex items-center gap-3 p-4">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <p className="text-sm text-zinc-400 flex-1">{activities.error}</p>
              <button onClick={fetchAll} className="text-xs text-[#FFE082] shrink-0">{t('common.reload') || 'Muat ulang'}</button>
            </Card>
          ) : !activities.data?.length ? (
            <EmptyState icon={Activity} title={t('home.empty.activity') || 'Belum ada aktivitas'} description={t('home.empty.activity_desc') || 'Aktivitas terbaru akan muncul di sini'} />
          ) : (
            <Card>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  <h3 className="text-base font-semibold text-white">{t('home.recent_activity')}</h3>
                </div>
                <button onClick={() => navigate('/activities')} className="text-xs text-[#FFE082] flex items-center gap-1">
                  {t('home.view_all')} <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-2">
                {activities.data.slice(0, 10).map(a => (
                  <div key={a.id} className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      a.type === 'quest' ? 'bg-orange-500/15' :
                      a.type === 'badge' ? 'bg-purple-500/15' :
                      a.type === 'level' ? 'bg-blue-500/15' :
                      a.type === 'transaction' ? 'bg-emerald-500/15' : 'bg-zinc-500/15'
                    }`}>
                      {a.type === 'quest' ? <Target className="w-4 h-4 text-orange-400" /> :
                       a.type === 'badge' ? <Award className="w-4 h-4 text-purple-400" /> :
                       a.type === 'level' ? <TrendingUp className="w-4 h-4 text-blue-400" /> :
                       a.type === 'transaction' ? <DollarSign className="w-4 h-4 text-emerald-400" /> :
                       <Activity className="w-4 h-4 text-zinc-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">{a.description}</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">{a.created_at}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </motion.div>
      </motion.div>
      </PullToRefresh>
    </>
  );
}
