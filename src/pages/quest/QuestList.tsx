import { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { SearchInput } from '../../components/ui/SearchInput';
import { Modal } from '../../components/ui/Modal';
import { PullToRefresh } from '../../components/ui/PullToRefresh';
import { LevelUpCelebration } from '../../components/ui/LevelUpCelebration';
import { QuestCompleteCelebration } from '../../components/ui/QuestCompleteCelebration';
import { questApi } from '../../api/services';
import type { Quest } from '../../types';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Swords, Clock, Zap, Award, Lock, AlertCircle, CheckCircle } from 'lucide-react';

type Tab = 'Producer' | 'Marketing' | 'Skill' | 'Closing';

const tabs: { key: Tab; label: string }[] = [
  { key: 'Producer', label: 'Producer' },
  { key: 'Marketing', label: 'Marketing' },
  { key: 'Skill', label: 'Skill' },
  { key: 'Closing', label: 'Closing' },
];

const categoryMap: Record<Tab, string> = {
  Producer: 'producer',
  Marketing: 'marketing',
  Skill: 'skill',
  Closing: 'closing',
};

export default function QuestList() {
  const [tab, setTab] = useState<Tab>('Producer');
  const [search, setSearch] = useState('');
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claiming, setClaiming] = useState<number | null>(null);
  const [claimConfirm, setClaimConfirm] = useState<Quest | null>(null);
  const [celebrationQuest, setCelebrationQuest] = useState<Quest | null>(null);
  const [levelUpOpen, setLevelUpOpen] = useState(false);
  const { showToast } = useNotification();
  const { t } = useLanguage();
  const { agent } = useAuth();
  const prevLevelRef = useRef(agent?.level);
  const mountedRef = useRef(true);

  const filtered = quests.filter(q => {
    if (!search) return true;
    const qs = search.toLowerCase();
    return q.title.toLowerCase().includes(qs) || q.description.toLowerCase().includes(qs);
  });

  const isExpired = (q: Quest) => q.ends_at && new Date(q.ends_at) < new Date();
  const getRemaining = (q: Quest) => {
    if (!q.ends_at) return null;
    const diff = new Date(q.ends_at).getTime() - Date.now();
    if (diff <= 0) return null;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${h}j ${m}m`;
  };

  const fetchQuests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await questApi.list({ category: categoryMap[tab] });
      if (!mountedRef.current) return;
      setQuests(res.data);
    } catch (e) {
      if (!mountedRef.current) return;
      setError(t('quest.error.load') || 'Gagal memuat quest');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [tab, t]);

  useEffect(() => {
    mountedRef.current = true;
    fetchQuests();
    return () => { mountedRef.current = false; };
  }, [fetchQuests]);

  const handleClaim = async (id: number, questData: Quest) => {
    setClaiming(id);
    try {
      await questApi.claim(id);
      setCelebrationQuest(questData);
      if (agent && prevLevelRef.current && agent.level > prevLevelRef.current) {
        setLevelUpOpen(true);
      }
      fetchQuests();
    } catch (e) {
      showToast('error', t('quest.toast.error_claim') || 'Gagal mengklaim quest');
    } finally {
      setClaiming(null);
    }
  };

  return (
    <>
      <Header title={t('quest.title') || 'Quest'} showBack />
      <PullToRefresh onRefresh={fetchQuests}>
      <div className="px-4 pt-4 pb-6 space-y-4">
        {/* Claim Commission Panel */}
        <Card className="relative overflow-hidden border-gold-700/30">
          <div className="absolute inset-0 bg-gradient-to-br from-gold-700/10 to-gold-900/5" />
          <div className="absolute top-4 right-4 w-32 h-32 rounded-full border border-gold-700/10" />
          <div className="absolute -bottom-6 -right-6 w-40 h-40 rounded-full border-2 border-gold-700/5" />
          <div className="relative z-10 p-5">
            <h3 className="text-base font-bold text-gold-700 mb-1">
              {t('quest.claim_commission.title') || 'Claim Commission'}
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              {t('quest.claim_commission.description') || 'Submit transaksi untuk claim komisi dan dapatkan XP sesuai tipe transaksi'}
            </p>
            <Button className="w-full mb-4">
              {t('quest.claim_commission.action') || 'CLAIM COMMISSION >'}
            </Button>
            <div className="space-y-2">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
                {t('quest.claim_commission.last_claim') || 'Last Claim'}
              </p>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1">
                {[
                  { name: 'Rumah BSD', status: 'Approved', xp: 10000 },
                  { name: 'Apartemen PIK', status: 'Pending', xp: 5000 },
                ].map(item => (
                  <div key={item.name} className="flex items-center gap-2 shrink-0 bg-white/5 rounded-xl px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-white">{item.name}</p>
                      <p className="text-[9px] text-zinc-500">{item.status}</p>
                    </div>
                    <span className={`text-[10px] font-semibold ${item.status === 'Approved' ? 'text-emerald-400' : 'text-gold-700'}`}>
                      +{item.xp.toLocaleString()} XP
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/5 rounded-xl p-1 overflow-x-auto scrollbar-hide">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${tab === t.key ? 'gold-gradient text-dark-bg' : 'text-zinc-400'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <SearchInput value={search} onChange={setSearch} placeholder={t('quest.search') || 'Cari quest...'} />

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-48 mb-3" />
                <Skeleton className="h-2 w-full mb-2" />
                <Skeleton className="h-8 w-20" />
              </Card>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <Card className="flex items-center gap-3 p-4">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-sm text-zinc-400 flex-1">{error}</p>
            <button onClick={fetchQuests} className="text-xs text-gold-700 shrink-0">{t('common.reload') || 'Muat ulang'}</button>
          </Card>
        )}

        {/* Empty */}
        {!loading && !error && quests.length === 0 && (
          <EmptyState icon={Swords} title={t('quest.empty.title') || 'Belum ada quest'} description={`${t('quest.empty.description') || 'Belum ada quest untuk kategori'} ${tab}`} />
        )}
        {!loading && !error && quests.length > 0 && filtered.length === 0 && (
          <EmptyState icon={Swords} title={t('quest.search_empty.title') || 'Tidak ada hasil'} description={`${t('quest.search_empty.description') || 'Tidak ada quest untuk'} "${search}"`} />
        )}

        {/* Quest List */}
        {!loading && !error && filtered.map(q => {
          const expired = isExpired(q);
          const remaining = getRemaining(q);
          return (
          <Card key={q.id} className={expired ? 'opacity-50' : ''}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white">{q.title}</h3>
                  {(q.status === 'Locked' || expired) && <Lock className="w-3.5 h-3.5 text-zinc-500" />}
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">{q.description}</p>
              </div>
              <Badge
                variant={q.status === 'Completed' ? 'Completed' : q.status === 'Locked' ? 'Locked' : 'Active'}
                label={
                  q.status === 'Active' ? (t('quest.status.active') || 'Berjalan') :
                  q.status === 'Completed' ? (t('quest.status.completed') || 'Selesai') :
                  q.status === 'Locked' ? (t('quest.status.locked') || 'Terkunci') :
                  q.status
                }
              />
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                <Zap className="w-3 h-3 text-gold-700" />
                <span className="text-gold-700 font-semibold">+{q.xp_reward} {t('common.xp') || 'XP'}</span>
              </div>
              {q.badge_reward && (
                <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                  <Award className="w-3 h-3 text-purple-400" />
                  <span className="text-purple-400 font-semibold">{q.badge_reward.name}</span>
                </div>
              )}
              {(remaining || expired) && (
                <div className={`flex items-center gap-1 text-[10px] ml-auto ${expired ? 'text-red-400' : 'text-zinc-500'}`}>
                  <Clock className="w-3 h-3" />
                  <span>{expired ? (t('quest.status.expired') || 'Kadaluarsa') : remaining}</span>
                </div>
              )}
            </div>
            <ProgressBar value={q.progress} max={q.target} />
            <div className="flex justify-between items-center mt-2">
              <span className="text-[10px] text-zinc-500">{q.progress}/{q.target}</span>
              {q.status === 'Completed' ? (
                <span className="text-[10px] text-emerald-400 font-medium">{t('quest.status.completed') || 'Selesai'}</span>
              ) : q.status === 'Locked' || expired ? (
                <span className="text-[10px] text-zinc-500">{expired ? (t('quest.status.expired') || 'Kadaluarsa') : (t('quest.status.locked') || 'Terkunci')}</span>
              ) : q.progress >= q.target ? (
                <Button size="sm" onClick={() => setClaimConfirm(q)}>{t('quest.claim') || 'Klaim'}</Button>
              ) : (
                <span className="text-[10px] text-zinc-500">{t('quest.status.in_progress') || 'Dalam Progres'}</span>
              )}
            </div>
          </Card>
          );
        })}
      </div>
      </PullToRefresh>

      {/* Claim Confirm Modal */}
      {claimConfirm && (
        <Modal open={!!claimConfirm} onClose={() => setClaimConfirm(null)}>
          <div className="p-4 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-base font-semibold text-white">{t('quest.claim_confirm.title') || 'Klaim Quest'}</h3>
            <p className="text-sm text-zinc-400">{claimConfirm.title}</p>
            <div className="flex items-center justify-center gap-2 text-sm">
              <Zap className="w-4 h-4 text-gold-700" />
              <span className="text-gold-700 font-bold">+{claimConfirm.xp_reward} {t('common.xp') || 'XP'}</span>
              {claimConfirm.badge_reward && (
                <><Award className="w-4 h-4 text-purple-400" /><span className="text-purple-400">{claimConfirm.badge_reward.name}</span></>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={() => setClaimConfirm(null)}>{t('quest.claim_confirm.cancel') || 'Batal'}</Button>
              <Button className="flex-1" loading={claiming === claimConfirm.id} onClick={() => {
                const q = claimConfirm;
                setClaimConfirm(null);
                handleClaim(q.id, q);
              }}>{t('quest.claim') || 'Klaim'}</Button>
            </div>
          </div>
        </Modal>
      )}

      {celebrationQuest && (
        <QuestCompleteCelebration
          open={!!celebrationQuest}
          xp={celebrationQuest.xp_reward}
          title={celebrationQuest.title}
          badgeName={celebrationQuest.badge_reward?.name}
          onClose={() => setCelebrationQuest(null)}
        />
      )}

      {levelUpOpen && (
        <LevelUpCelebration
          open={levelUpOpen}
          level={agent?.level || 1}
          tier={agent?.tier || 'Rookie'}
          onClose={() => setLevelUpOpen(false)}
        />
      )}
    </>
  );
}
