import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton, Avatar } from '../../components/ui/Skeleton';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { PullToRefresh } from '../../components/ui/PullToRefresh';
import { profileApi, referralApi } from '../../api/services';
import type { HallOfFameEntry, AgentStats } from '../../types';
import {
  Settings, Share2, Copy, Award, TrendingUp,
  LogOut, ChevronRight, AlertCircle, Medal, Check, QrCode
} from 'lucide-react';

export default function Profile() {
  const { agent, logout } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useNotification();
  const { t } = useLanguage();
  const [hofHistory, setHofHistory] = useState<HallOfFameEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLogout, setShowLogout] = useState(false);
  const [copied, setCopied] = useState(false);
  const mountedRef = useRef(true);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [profileRes, hofRes] = await Promise.allSettled([
        profileApi.share(),
        profileApi.hofHistory(),
      ]);
      if (!mountedRef.current) return;
      if (hofRes.status === 'fulfilled') setHofHistory(hofRes.value.data);
    } catch (e) {
      if (!mountedRef.current) return;
      setError(t('profile.loading_error') || 'Gagal memuat data profil');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    mountedRef.current = true;
    fetchProfile();
    return () => { mountedRef.current = false; };
  }, [fetchProfile]);

  const shareCardRef = useRef<HTMLDivElement>(null);
  const [shareLoading, setShareLoading] = useState(false);

  const handleCopy = () => {
    if (agent?.referral_code) {
      navigator.clipboard.writeText(agent.referral_code);
      setCopied(true);
      showToast('success', t('profile.toast.copy_referral') || 'Kode referral disalin!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    setShareLoading(true);
    try {
      const card = shareCardRef.current;
      if (!card) throw new Error('no card');
      card.classList.remove('hidden');
      const canvas = await html2canvas(card, { scale: 2, useCORS: true });
      card.classList.add('hidden');
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `profil-${agent?.username || 'agent'}.png`, { type: 'image/png' });
        if (navigator.share) {
          await navigator.share({
            title: `LOT Quest - ${agent?.name || 'Agent'}`,
            text: t('profile.share.level') || `Cek profil saya di LOT Quest! Level ${agent?.level || 1} - ${agent?.tier || 'Rookie'}`,
            files: [file],
          });
        } else {
          const link = document.createElement('a');
          link.download = file.name;
          link.href = URL.createObjectURL(blob);
          link.click();
          URL.revokeObjectURL(link.href);
          showToast('success', t('profile.toast.download_card') || 'Kartu profil diunduh!');
        }
      });
    } catch {
      showToast('error', t('profile.toast.share_error') || 'Gagal membagikan profil');
    } finally {
      setShareLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <Header title={t('profile.title') || 'Profil'} showNotification rightAction={
        <button className="text-white/50 hover:text-white p-2" onClick={() => navigate('/settings')}>
          <Settings className="w-5 h-5" />
        </button>
      } />

      <PullToRefresh onRefresh={fetchProfile}>
      <div className="px-4 pt-4 pb-6 space-y-5">
        {/* Hero */}
        <Card>
          {loading ? (
            <div className="flex flex-col items-center space-y-2">
              <Skeleton className="w-20 h-20 rounded-xl" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          ) : error ? (
            <div className="flex items-center gap-3 p-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-sm text-zinc-400">{error}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              <Avatar src={agent?.avatar || null} name={agent?.name || 'Agent'} size="xl" level={agent?.level} tier={agent?.tier} />
              <h2 className="text-xl font-bold text-white mt-3">{agent?.name || 'Agent Name'}</h2>
              <p className="text-xs text-zinc-400">@{agent?.username || 'username'}</p>
              <div className="flex items-center gap-2 mt-2">
                <button onClick={() => navigate('/level-guide')} className="text-sm text-gold-700 font-bold hover:underline">Level {agent?.level || 1}</button>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-zinc-400">{agent?.tier || 'Rookie'}</span>
              </div>
              <div className="w-full mt-3">
                <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                  <span>XP</span>
                  <span>{agent?.xp || 0} / {agent?.xp_next_level || 100}</span>
                </div>
                <ProgressBar value={agent?.xp || 0} max={agent?.xp_next_level || 100} />
              </div>
            </div>
          )}
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card p-3 text-center">
            <p className="text-2xl font-extrabold text-gold-700">{agent?.total_properties || 0}</p>
            <p className="text-[10px] text-zinc-400 mt-1">{t('profile.stats.listing') || 'Listing Aktif'}</p>
          </div>
          <div className="glass-card p-3 text-center">
            <p className="text-2xl font-extrabold text-gold-700">Rp {(agent?.total_commission || 0) >= 1000000 ? `${(agent.total_commission / 1000000).toFixed(1)}M` : (agent?.total_commission || 0).toLocaleString()}</p>
            <p className="text-[10px] text-zinc-400 mt-1">{t('profile.stats.commission') || 'Komisi Bulan Ini'}</p>
          </div>
          <div className="glass-card p-3 text-center">
            <p className="text-2xl font-extrabold text-gold-700">{agent?.total_transactions || 0}</p>
            <p className="text-[10px] text-zinc-400 mt-1">{t('profile.stats.quest_done') || 'Quest Selesai'}</p>
          </div>
          <div className="glass-card p-3 text-center">
            <p className="text-2xl font-extrabold text-gold-700">{agent?.badges?.length || 0}</p>
            <p className="text-[10px] text-zinc-400 mt-1">{t('profile.stats.badges') || 'Lencana'}</p>
          </div>
        </div>

        {/* Career Stats */}
        <Card>
          <h3 className="text-sm font-semibold text-white mb-3">{t('profile.career.title') || 'Pencapaian Karir'}</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-xl font-extrabold text-emerald-400">{agent?.total_properties || 0}</p>
              <p className="text-[10px] text-zinc-400 mt-1">{t('profile.career.unit_sold') || 'Unit Terjual'}</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-extrabold text-blue-400">{agent?.total_recruit || 0}</p>
              <p className="text-[10px] text-zinc-400 mt-1">{t('profile.career.total_recruit') || 'Total Recruit'}</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-extrabold text-purple-400">{agent?.training_completed || 0}</p>
              <p className="text-[10px] text-zinc-400 mt-1">{t('profile.career.training') || 'Training'}</p>
            </div>
          </div>
        </Card>

        {/* Featured Badges */}
        <Card>
          <h3 className="text-sm font-semibold text-white mb-3">{t('profile.featured_badges') || 'Lencana Unggulan'}</h3>
          <div className="flex gap-3">
            {Array.from({ length: 3 }).map((_, i) => {
              const b = agent?.featured_badges?.[i];
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${b ? 'bg-gold-200/10 border border-gold-700/20' : 'bg-zinc-800/50 border border-dashed border-zinc-700'}`}>
                    {b ? (
                      <span className="text-2xl">{b.name[0]}</span>
                    ) : (
                      <span className="text-lg text-zinc-600">+</span>
                    )}
                  </div>
                  {b && <span className="text-[10px] text-zinc-400 text-center leading-tight">{b.name}</span>}
                  {!b && <span className="text-[10px] text-zinc-600 text-center">{t('profile.featured_badges_empty') || 'Kosong'}</span>}
                </div>
              );
            })}
          </div>
          {agent?.featured_badges && agent.featured_badges.length < 3 && (
            <button className="w-full mt-3 text-[10px] text-gold-700/60 hover:text-gold-700 text-center" onClick={() => navigate('/badges')}>
              {t('profile.featured_badges_manage') || 'Atur Lencana Unggulan'}
            </button>
          )}
        </Card>

        {/* Referral Code */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-400">{t('profile.referral_code') || 'Kode Referral'}</p>
              <p className="text-base font-bold text-white mt-0.5">LOT-{agent?.referral_code || 'XXXX'}</p>
            </div>
            <div className="flex gap-2">
              <button
                className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20"
                onClick={handleCopy}
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-zinc-400" />}
              </button>
              <button className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20" onClick={handleShare} disabled={shareLoading}>
                <Share2 className={`w-4 h-4 ${shareLoading ? 'text-zinc-600 animate-pulse' : 'text-zinc-400'}`} />
              </button>
            </div>
          </div>
        </Card>

        {/* Info */}
        <Card>
          <div className="space-y-3">
            <div className="flex justify-between text-sm"><span className="text-zinc-400">{t('profile.info.cabang') || 'Cabang'}</span><span className="text-white">{agent?.cabang || '-'}</span></div>
            <div className="flex justify-between text-sm"><span className="text-zinc-400">{t('profile.info.team') || 'Team'}</span><span className="text-white">{agent?.team || '-'}</span></div>
            <div className="flex justify-between text-sm"><span className="text-zinc-400">{t('profile.info.joined') || 'Bergabung'}</span><span className="text-white">{agent?.joined_at ? new Date(agent.joined_at).toLocaleDateString('id-ID') : '-'}</span></div>
            <div className="flex justify-between text-sm"><span className="text-zinc-400">{t('profile.info.rank') || 'Peringkat'}</span><span className="text-white">#{agent?.rank || '-'}</span></div>
          </div>
        </Card>

        {/* Hall of Fame History */}
        {hofHistory.length > 0 && (
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Medal className="w-5 h-5 text-gold-700" />
              <h3 className="text-sm font-semibold text-white">{t('profile.hof_history') || 'Hall of Fame History'}</h3>
            </div>
            <div className="space-y-2">
              {hofHistory.map(h => (
                <div key={h.id} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                  <div>
                    <p className="text-sm text-white">{h.agent.name}</p>
                    <p className="text-[10px] text-zinc-500">Rank #{h.rank} · {h.period}</p>
                  </div>
                  <span className="text-xs text-gold-700 font-semibold">{h.total_commission.toLocaleString()} IDR</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="space-y-2">
          <button className="w-full glass-card p-3 flex items-center justify-between" onClick={() => navigate('/poster')}>
            <div className="flex items-center gap-3"><Share2 className="w-5 h-5 text-gold-700" /><span className="text-sm text-white">{t('profile.action.create_poster') || 'Buat Poster'}</span></div>
            <ChevronRight className="w-4 h-4 text-zinc-500" />
          </button>
          <button className="w-full glass-card p-3 flex items-center justify-between" onClick={() => navigate('/badges')}>
            <div className="flex items-center gap-3"><Award className="w-5 h-5 text-purple-400" /><span className="text-sm text-white">{t('profile.action.my_badges') || 'Lencana Saya'}</span></div>
            <ChevronRight className="w-4 h-4 text-zinc-500" />
          </button>
          <button className="w-full glass-card p-3 flex items-center justify-between" onClick={() => navigate('/activities')}>
            <div className="flex items-center gap-3"><TrendingUp className="w-5 h-5 text-emerald-400" /><span className="text-sm text-white">{t('profile.action.activity_history') || 'Riwayat Aktivitas'}</span></div>
            <ChevronRight className="w-4 h-4 text-zinc-500" />
          </button>
        </div>

        <Button variant="danger" className="w-full" onClick={() => setShowLogout(true)}>
          <LogOut className="w-4 h-4" /> {t('profile.logout') || 'Keluar'}
        </Button>
      </div>
      </PullToRefresh>

      {showLogout && (
        <ConfirmDialog
          open={showLogout}
          onClose={() => setShowLogout(false)}
          title={t('profile.logout_confirm.title') || 'Keluar'}
          description={t('profile.logout_confirm.description') || 'Yakin ingin keluar?'}
          confirmLabel={t('profile.logout_confirm.confirm') || 'Keluar'}
          variant="danger"
          onConfirm={handleLogout}
        />
      )}

      {/* Hidden share card for html2canvas */}
      <div ref={shareCardRef} className="hidden fixed top-0 left-0 w-[400px] h-[700px] bg-gradient-to-b from-gold-700 to-dark-bg p-8 flex flex-col items-center justify-center text-center">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur flex items-center justify-center mb-4">
            <span className="text-4xl font-bold text-white">{agent?.name?.split(' ').map(s => s[0]).join('').slice(0, 2) || 'AG'}</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-1">{agent?.name || 'Agent'}</h2>
          <p className="text-sm text-white/70 mb-1">@{agent?.username || 'username'}</p>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs px-3 py-1 rounded-full bg-white/20 text-white">Level {agent?.level || 1}</span>
            <span className="text-xs px-3 py-1 rounded-full bg-white/20 text-white">{agent?.tier || 'Rookie'}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full max-w-[280px] mb-6">
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-lg font-bold text-white">{agent?.total_properties || 0}</p>
              <p className="text-[10px] text-white/60">{t('profile.share.listing') || 'Listing'}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-lg font-bold text-white">Rp{agent?.total_commission ? (agent.total_commission >= 1000000 ? `${(agent.total_commission / 1000000).toFixed(1)}M` : agent.total_commission.toLocaleString()) : 0}</p>
              <p className="text-[10px] text-white/60">{t('profile.share.commission') || 'Komisi'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10">
            <QrCode className="w-4 h-4 text-white/60" />
            <span className="text-xs text-white/80">LOT-{agent?.referral_code || 'XXXX'}</span>
          </div>
          <p className="text-[10px] text-white/40 mt-4">{t('profile.share.label') || 'LOT Property Agent'}</p>
        </div>
      </div>
    </>
  );
}
