import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { SearchInput } from '../../components/ui/SearchInput';
import { PullToRefresh } from '../../components/ui/PullToRefresh';
import { LevelUpCelebration } from '../../components/ui/LevelUpCelebration';
import { academyApi } from '../../api/services';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import type { AcademyModule } from '../../types';
import { BookOpen, Clock, Zap, Lock, Play, AlertCircle, X, Search } from 'lucide-react';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | null;
  }
}

const categoryKeys = ['Semua', 'Product Knowledge', 'Sales Technique', 'Marketing', 'Market Update', 'Company'];

function getYoutubeEmbed(url?: string) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

export default function Academy() {
  const { t } = useLanguage();
  const [cat, setCat] = useState('Semua');
  const [search, setSearch] = useState('');
  const [modules, setModules] = useState<AcademyModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AcademyModule | null>(null);
  const [marking, setMarking] = useState(false);
  const [levelUpOpen, setLevelUpOpen] = useState(false);
  const { showToast } = useNotification();
  const { agent } = useAuth();
  const prevLevelRef = useRef(agent?.level);
  const playerRef = useRef<any>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const progressTimerRef = useRef<number | null>(null);

  const categoryLabels = useMemo<Record<string, string>>(() => ({
    'Semua': t('academy.categories.all') || 'Semua',
    'Product Knowledge': t('academy.categories.product_knowledge') || 'Product Knowledge',
    'Sales Technique': t('academy.categories.sales_technique') || 'Sales Technique',
    'Marketing': t('academy.categories.marketing') || 'Marketing',
    'Market Update': t('academy.categories.market_update') || 'Market Update',
    'Company': t('academy.categories.company') || 'Company',
  }), [t]);

  // Load YouTube IFrame API once
  useEffect(() => {
    if (window.YT) return;
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const first = document.getElementsByTagName('script')[0];
    first.parentNode?.insertBefore(tag, first);
  }, []);

  // YouTube player + ≥90% auto-complete
  useEffect(() => {
    if (!selected || !selected.youtube_url) return;
    const vid = getYoutubeEmbed(selected.youtube_url);
    if (!vid) return;
    if (selected.completed) return;

    const initPlayer = () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      if (!playerContainerRef.current) return;

      playerRef.current = new window.YT.Player(playerContainerRef.current, {
        videoId: vid,
        playerVars: { autoplay: 1, enablejsapi: 1, rel: 0 },
        events: {
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              const dur = playerRef.current?.getDuration();
              if (!dur || dur === 0) return;
              progressTimerRef.current = window.setInterval(() => {
                try {
                  const cur = playerRef.current?.getCurrentTime();
                  const d = playerRef.current?.getDuration();
                  if (cur == null || !d || d === 0) return;
                  if (cur / d >= 0.9) {
                    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
                    academyApi.updateProgress(selected.id, 100);
                    showToast('success', `${t('academy.toast.xp_prefix') || '+'}${selected.xp_reward} ${t('common.xp') || 'XP'}! ${t('academy.toast.video_complete') || 'Video selesai'}`);
                    setModules(prev => prev.map(m => m.id === selected.id ? { ...m, completed: true } : m));
                    setSelected(null);
                  }
                } catch { /* player not ready */ }
              }, 2000);
            }
            if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) {
              if (progressTimerRef.current) {
                clearInterval(progressTimerRef.current);
                progressTimerRef.current = null;
              }
            }
          },
        },
      });
    };

    if (window.YT?.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = () => {
        initPlayer();
        window.onYouTubeIframeAPIReady = null;
      };
    }

    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [selected]);

  const filtered = useMemo(() => {
    let list = modules;
    if (cat !== 'Semua') list = list.filter(m => m.category === cat);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(m => m.title.toLowerCase().includes(q) || m.description.toLowerCase().includes(q));
    }
    return list;
  }, [modules, cat, search]);

  const handleMarkComplete = async () => {
    if (!selected) return;
    setMarking(true);
    try {
      await academyApi.updateProgress(selected.id, 100);
      showToast('success', `${t('academy.toast.xp_prefix') || '+'}${selected.xp_reward} ${t('common.xp') || 'XP'}! ${t('academy.toast.module_complete') || 'Modul selesai'}`);
      setModules(prev => prev.map(m => m.id === selected.id ? { ...m, completed: true } : m));
      if (agent && prevLevelRef.current && agent.level > prevLevelRef.current) {
        setLevelUpOpen(true);
      }
      setSelected(null);
    } catch {
      showToast('error', t('academy.toast.error_mark') || 'Gagal menandai selesai');
    } finally {
      setMarking(false);
    }
  };

  const mountedRef = useRef(true);

  const fetchModules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = cat === 'Semua' ? undefined : { category: cat };
      const res = await academyApi.modules(params);
      if (!mountedRef.current) return;
      setModules(res.data);
    } catch (e) {
      if (!mountedRef.current) return;
      setError(t('academy.error.load') || 'Gagal memuat modul');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [cat]);

  useEffect(() => {
    mountedRef.current = true;
    fetchModules();
    return () => { mountedRef.current = false; };
  }, [fetchModules]);

  const handlePlay = (m: AcademyModule) => {
    if (!m.locked) setSelected(m);
  };

  return (
    <>
      <Header title={t('academy.title') || 'Akademi'} showSearch />
      <PullToRefresh onRefresh={fetchModules}>
      <div className="px-4 pt-4 pb-6 space-y-4">
        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {categoryKeys.map(c => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${cat === c ? 'gold-gradient text-[#0B0B0F]' : 'bg-white/10 text-zinc-300'}`}
            >
              {categoryLabels[c]}
            </button>
          ))}
        </div>

        {/* Search */}
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={t('academy.search') || 'Cari modul...'}
        />

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <div className="flex items-start gap-3">
                  <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-8 w-full" />
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
            <button onClick={fetchModules} className="text-xs text-[#FFE082] shrink-0">{t('common.reload') || 'Muat ulang'}</button>
          </Card>
        )}

        {/* Empty */}
        {!loading && !error && modules.length === 0 && (
          <EmptyState icon={BookOpen} title={t('academy.empty.title') || 'Belum ada modul'} description={t('academy.empty.description') || 'Belum ada modul untuk kategori ini'} />
        )}


        {/* Module List */}
        {!loading && !error && filtered.length === 0 && (
          <EmptyState icon={Search} title={t('academy.search_empty.title') || 'Tidak ada hasil'} description={`${t('academy.search_empty.title') || 'Tidak ada hasil'} ${t('academy.search_empty.for') || 'untuk'} "${search}". ${t('academy.search_empty.try_other') || 'Coba gunakan kata kunci lain'}`} />
        )}
        {!loading && !error && filtered.map(m => (
          <Card key={m.id}>
            <div className="flex items-start gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${m.completed ? 'bg-emerald-500/15' : m.locked ? 'bg-zinc-800' : 'bg-[#FFE082]/10'}`}>
                {m.locked ? <Lock className="w-5 h-5 text-zinc-500" /> : <BookOpen className={`w-5 h-5 ${m.completed ? 'text-emerald-400' : 'text-[#FFE082]'}`} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-white">{m.title}</h3>
                  {m.completed && <Badge variant="Completed" label={t('academy.completed') || 'Selesai'} />}
                  {m.locked && <Badge variant="Locked" label={t('academy.locked') || 'Terkunci'} />}
                </div>
                <p className="text-xs text-zinc-500">{m.category}</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                    <Zap className="w-3 h-3 text-[#FFE082]" />
                    <span className="text-[#FFE082] font-semibold">+{m.xp_reward} {t('common.xp') || 'XP'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                    <Clock className="w-3 h-3" />
                    <span>{m.duration_minutes} {t('academy.minutes') || 'menit'}</span>
                  </div>
                </div>
                <div className="mt-3">
                  <Button
                    size="sm"
                    variant={m.completed ? 'ghost' : m.locked ? 'ghost' : 'primary'}
                    disabled={m.locked}
                    className="w-full"
                    onClick={() => handlePlay(m)}
                  >
                    {m.completed ? (t('academy.watch_again') || 'Tonton Lagi') : m.locked ? (t('academy.level_requirement') || 'Level 20+') : (t('academy.start') || 'Mulai')}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      </PullToRefresh>

      {/* Video Player Modal */}
      {selected && (
        <Modal open={!!selected} onClose={() => setSelected(null)}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-white">{selected.title}</h3>
              <button onClick={() => setSelected(null)}><X className="w-5 h-5 text-zinc-400" /></button>
            </div>
            <div className="aspect-video bg-zinc-900 rounded-xl overflow-hidden mb-4">
              {getYoutubeEmbed(selected.youtube_url) ? (
                <div ref={playerContainerRef} className="w-full h-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Play className="w-12 h-12 text-[#FFE082] opacity-50" />
                </div>
              )}
            </div>
            <p className="text-xs text-zinc-400 mb-3">{selected.description} · {selected.duration_minutes} {t('academy.minutes') || 'menit'}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500">+{selected.xp_reward} {t('academy.xp_after_complete') || 'XP setelah selesai'}</span>
              <Button size="sm" loading={marking} onClick={handleMarkComplete} disabled={selected.completed}>
                {selected.completed ? (t('academy.completed') || 'Selesai') : (t('academy.mark_complete') || 'Tandai Selesai')}
              </Button>
            </div>
          </div>
        </Modal>
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
