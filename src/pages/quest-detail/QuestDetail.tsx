import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Skeleton } from '../../components/ui/Skeleton';
import { questApi } from '../../api/services';
import { useNotification } from '../../context/NotificationContext';
import type { Quest } from '../../types';
import { Target, Clock, Award, Zap, CheckCircle, AlertCircle } from 'lucide-react';

export default function QuestDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useNotification();
  const [quest, setQuest] = useState<Quest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    questApi.detail(Number(id))
      .then(setQuest)
      .catch(() => setError('Gagal memuat detail quest'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleClaim = async () => {
    if (!quest) return;
    setClaiming(true);
    try {
      await questApi.claim(quest.id);
      showToast('success', `+${quest.xp_reward} XP berhasil diklaim!`);
      setQuest(prev => prev ? { ...prev, status: 'Completed' } : null);
    } catch {
      showToast('error', 'Gagal mengklaim quest');
    } finally {
      setClaiming(false);
    }
  };

  return (
    <>
      <Header title="Detail Quest" showBack />
      <div className="px-4 pt-4 pb-6">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-48 rounded-2xl" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-20" />
          </div>
        ) : error || !quest ? (
          <Card className="flex flex-col items-center gap-3 p-8 text-center">
            <AlertCircle className="w-8 h-8 text-red-400" />
            <p className="text-sm text-zinc-400">{error || 'Quest tidak ditemukan'}</p>
            <Button variant="ghost" onClick={() => navigate('/quest')}>Kembali</Button>
          </Card>
        ) : (
          <div className="space-y-5">
            {/* Hero */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FFE082]/20 to-zinc-900 p-6">
              <div className="absolute top-4 right-4">
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  quest.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400' :
                  quest.status === 'Locked' ? 'bg-zinc-500/20 text-zinc-400' :
                  'bg-[#FFE082]/20 text-[#FFE082]'
                }`}>
                  {quest.status === 'Completed' ? 'Selesai' : quest.status === 'Locked' ? 'Terkunci' : 'Aktif'}
                </div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FFE082] to-amber-600 flex items-center justify-center mb-4">
                <Target className="w-7 h-7 text-[#0B0B0F]" />
              </div>
              <h2 className="text-xl font-bold text-white mb-1">{quest.title}</h2>
              <p className="text-sm text-zinc-400">{quest.description}</p>
            </div>

            {/* Progress */}
            <Card>
              <h3 className="text-sm font-semibold text-white mb-3">Progress</h3>
              <ProgressBar value={quest.progress} max={quest.target} />
              <p className="text-xs text-zinc-500 mt-2">{quest.progress}/{quest.target} selesai</p>
            </Card>

            {/* Rewards */}
            <Card>
              <h3 className="text-sm font-semibold text-white mb-3">Hadiah</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-transparent">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <div>
                    <p className="text-sm font-medium text-white">{quest.xp_reward} XP</p>
                    <p className="text-[10px] text-zinc-500">Pengalaman</p>
                  </div>
                </div>
                {quest.badge_reward && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-transparent">
                    <Award className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-sm font-medium text-white">{quest.badge_reward.name}</p>
                      <p className="text-[10px] text-zinc-500">Lencana eksklusif</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Time */}
            {quest.ends_at && (
              <Card>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-zinc-400" />
                  <div>
                    <p className="text-sm text-zinc-300">Batas waktu</p>
                    <p className="text-xs text-zinc-500">{new Date(quest.ends_at).toLocaleDateString('id-ID')}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Claim */}
            {quest.status === 'Active' && quest.progress >= quest.target && (
              <Button className="w-full" loading={claiming} onClick={handleClaim}>
                <CheckCircle className="w-4 h-4" /> Klaim Hadiah
              </Button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
