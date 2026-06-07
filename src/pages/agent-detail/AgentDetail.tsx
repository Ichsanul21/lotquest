import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { agentApi } from '../../api/services';
import type { Agent } from '../../types';
import { Medal, Trophy, Award, TrendingUp, Home, Copy, Check, AlertCircle, Crown } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

export default function AgentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useNotification();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    if (!id) return;
    setLoading(true);
    agentApi.detail(Number(id))
      .then(res => { if (mountedRef.current) setAgent(res.data); })
      .catch(() => { if (mountedRef.current) setError('Gagal memuat profil agen'); })
      .finally(() => { if (mountedRef.current) setLoading(false); });
    return () => { mountedRef.current = false; };
  }, [id]);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    showToast('success', 'Kode referral disalin');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Header title="Profil Agen" showBack />
      <div className="px-4 pt-4 pb-6 space-y-5">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-48 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
        ) : error || !agent ? (
          <Card className="flex flex-col items-center gap-3 p-8 text-center">
            <AlertCircle className="w-8 h-8 text-red-400" />
            <p className="text-sm text-zinc-400">{error || 'Agen tidak ditemukan'}</p>
            <button onClick={() => navigate(-1)} className="text-xs text-[#FFE082]">Kembali</button>
          </Card>
        ) : (
          <>
            {/* Hero */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-500/20 to-zinc-900 p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FFE082] to-amber-600 flex items-center justify-center">
                  <span className="text-2xl font-bold text-[#0B0B0F]">{agent.name[0]}</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{agent.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={agent.tier === 'LOT Legendary' ? 'Legendary' : 'Active'} label={agent.tier} />
                    <span className="text-xs text-zinc-400">Level {agent.level}</span>
                  </div>
                </div>
                {agent.is_legendary && (
                  <div className="ml-auto">
                    <Crown className="w-6 h-6 text-[#FFE082]" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <MapPinIcon />
                <span>{agent.cabang} · {agent.team}</span>
              </div>

              {agent.referral_code && (
                <div className="mt-4 p-3 rounded-xl bg-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-zinc-500">Kode Referral</p>
                    <p className="text-sm font-mono text-[#FFE082]">{agent.referral_code}</p>
                  </div>
                  <button onClick={() => handleCopy(agent.referral_code)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-zinc-400" />}
                  </button>
                </div>
              )}
            </div>

            {/* Stats */}
            <Card>
              <h3 className="text-sm font-semibold text-white mb-4">Statistik</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Trophy, label: 'Komisi', value: `Rp ${(agent.total_commission / 1_000_000).toFixed(1)}M`, color: 'text-amber-400 bg-amber-500/10' },
                  { icon: Home, label: 'Properti', value: agent.total_properties.toString(), color: 'text-blue-400 bg-blue-500/10' },
                  { icon: TrendingUp, label: 'Transaksi', value: agent.total_transactions.toString(), color: 'text-emerald-400 bg-emerald-500/10' },
                  { icon: Medal, label: 'Peringkat', value: `#${agent.rank}`, color: 'text-purple-400 bg-purple-500/10' },
                ].map(s => (
                  <div key={s.label} className="p-3 rounded-xl bg-white/5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.color} mb-2`}>
                      <s.icon className="w-4 h-4" />
                    </div>
                    <p className="text-[10px] text-zinc-500">{s.label}</p>
                    <p className="text-sm font-semibold text-white">{s.value}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* XP */}
            <Card>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-zinc-400">XP</span>
                <span className="text-sm font-semibold text-white">{agent.xp} / {agent.xp_next_level}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-[#FFE082] to-[#E5A93C]" style={{ width: `${Math.min(100, (agent.xp / agent.xp_next_level) * 100)}%` }} />
              </div>
            </Card>

            {/* Featured Badges */}
            {agent.featured_badges.length > 0 && (
              <Card>
                <h3 className="text-sm font-semibold text-white mb-3">Lencana Unggulan</h3>
                <div className="flex gap-3 flex-wrap">
                  {agent.featured_badges.map(b => (
                    <div key={b.id} className="text-center">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-1 ${
                        b.rarity === 'Legendary' ? 'bg-gradient-to-br from-[#FFE082]/30 to-amber-600/30' :
                        b.rarity === 'Epic' ? 'bg-purple-500/20' :
                        b.rarity === 'Rare' ? 'bg-blue-500/20' : 'bg-white/10'
                      }`}>
                        <Award className={`w-5 h-5 ${
                          b.rarity === 'Legendary' ? 'text-[#FFE082]' :
                          b.rarity === 'Epic' ? 'text-purple-400' :
                          b.rarity === 'Rare' ? 'text-blue-400' : 'text-zinc-400'
                        }`} />
                      </div>
                      <p className="text-[9px] text-zinc-500">{b.name}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg className={className || 'w-3 h-3'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
