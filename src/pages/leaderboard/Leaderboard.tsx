import { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { SearchInput } from '../../components/ui/SearchInput';
import { PullToRefresh } from '../../components/ui/PullToRefresh';
import { leaderboardApi } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { formatCompact } from '../../utils/format';
import type { LeaderboardEntry } from '../../types';
import { TrendingUp, Trophy, Medal, AlertCircle, Crown } from 'lucide-react';

export default function Leaderboard() {
  const { agent } = useAuth();
  const { t } = useLanguage();
  const [type, setType] = useState<'XP' | 'Commission'>('Commission');
  const [period, setPeriod] = useState<'Bulanan' | 'All-Time'>('Bulanan');
  const [filterCabang, setFilterCabang] = useState('all');
  const [filterTeam, setFilterTeam] = useState('all');
  const [search, setSearch] = useState('');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: { type?: string; period?: string; branch_id?: number; team_id?: number } = { type: type.toLowerCase(), period: period === 'Bulanan' ? 'monthly' : 'all_time' };
      if (filterCabang !== 'all') params.branch_id = Number(filterCabang);
      if (filterTeam !== 'all') params.team_id = Number(filterTeam);
      const res = await leaderboardApi.list(params);
      if (!mountedRef.current) return;
      setEntries(res.data);
    } catch (e) {
      if (!mountedRef.current) return;
      setError(t('leaderboard.error.load') || 'Gagal memuat leaderboard');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [type, period, filterCabang, filterTeam, t]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    return () => { mountedRef.current = false; };
  }, [fetchData]);

  const filtered = search.trim().length >= 2
    ? entries.filter(e => e.agent.name.toLowerCase().includes(search.toLowerCase()))
    : entries;

  const top3 = filtered.slice(0, 3);
  const rest = filtered.slice(3);

  return (
    <>
      <Header title={t('leaderboard.title') || 'Papan Skor'} />
      <PullToRefresh onRefresh={fetchData}>
      <div className="px-4 pt-4 pb-6 space-y-4">
        {/* Type Tabs */}
        <div className="flex gap-1 bg-white/5 rounded-xl p-1">
          {(['XP', 'Commission'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setType(tab)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${type === tab ? 'gold-gradient text-[#0B0B0F]' : 'text-zinc-400'}`}
            >
              {t(tab === 'XP' ? 'leaderboard.xp' : 'leaderboard.commission') || tab}
            </button>
          ))}
        </div>

        {/* Period Tabs */}
        <div className="flex gap-1 bg-white/5 rounded-xl p-1">
          {(['Bulanan', 'All-Time'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${period === p ? 'gold-gradient text-[#0B0B0F]' : 'text-zinc-400'}`}
            >
              {t(p === 'Bulanan' ? 'leaderboard.bulanan' : 'leaderboard.all_time') || p}
            </button>
          ))}
        </div>

        {/* Cabang / Team Filter */}
        <div className="flex gap-2">
          <select
            className="input-field flex-1 text-xs"
            value={filterCabang}
            onChange={e => setFilterCabang(e.target.value)}
          >
            <option value="all">{t('leaderboard.all_branch') || 'Semua Cabang'}</option>
            <option value="1">Jakarta Pusat</option>
            <option value="2">Jakarta Selatan</option>
            <option value="3">Jakarta Barat</option>
            <option value="4">Jakarta Utara</option>
            <option value="5">Jakarta Timur</option>
            <option value="6">Tangerang</option>
            <option value="7">Bekasi</option>
            <option value="8">Depok</option>
            <option value="9">Bogor</option>
          </select>
          <select
            className="input-field flex-1 text-xs"
            value={filterTeam}
            onChange={e => setFilterTeam(e.target.value)}
          >
            <option value="all">{t('leaderboard.all_team') || 'Semua Team'}</option>
            <option value="1">Alpha</option>
            <option value="2">Beta</option>
            <option value="3">Gamma</option>
            <option value="4">Delta</option>
            <option value="5">Omega</option>
          </select>
        </div>

        <SearchInput
          placeholder={t('leaderboard.search_agent') || 'Cari agent...'}
          value={search}
          onChange={setSearch}
        />

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            <div className="flex items-end gap-3 px-2 h-40">
              {[1, 2, 3].map(i => <Skeleton key={i} className="flex-1 h-full rounded-t-2xl" />)}
            </div>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center gap-3 p-3">
                <Skeleton className="w-6 h-4" />
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="flex-1 h-4" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <Card className="flex items-center gap-3 p-4">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-sm text-zinc-400 flex-1">{error}</p>
            <button onClick={fetchData} className="text-xs text-[#FFE082] shrink-0">{t('common.reload') || 'Muat ulang'}</button>
          </Card>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <EmptyState icon={TrendingUp} title={t('common.no_data') || 'Tidak ada data'} description={search ? (t('leaderboard.no_results') || `Tidak ada hasil untuk "${search}"`) : (t('leaderboard.empty.description') || 'Leaderboard belum tersedia')} />
        )}

        {/* Podium Top 3 */}
        {!loading && !error && top3.length > 0 && (
          <div className="flex items-end gap-3 px-2">
            {[1, 0, 2].map(pos => {
              const entry = top3[pos];
              if (!entry) return null;
              const isFirst = pos === 0;
              const podiumH = isFirst ? 'h-40' : pos === 1 ? 'h-32' : 'h-28';
              const avatarSize = isFirst ? 'w-16 h-16' : 'w-14 h-14';
              return (
                <div key={entry.rank} className="flex-1 flex flex-col items-center">
                  <div className="relative">
                    <div className={`rounded-xl ${isFirst ? 'gold-gradient' : 'bg-white/10'} ${avatarSize} flex items-center justify-center`}>
                      {isFirst ? (
                        <Trophy className="w-8 h-8 text-[#0B0B0F]" />
                      ) : (
                        <Medal className={`w-6 h-6 ${pos === 1 ? 'text-zinc-300' : 'text-orange-400'}`} />
                      )}
                    </div>
                    {isFirst && <Crown className="absolute -top-2 -right-2 w-5 h-5 text-[#FFE082]" />}
                  </div>
                  <p className={`text-[10px] mt-1 truncate max-w-[80px] ${isFirst ? 'text-[#FFE082] font-semibold' : 'text-zinc-400'}`}>{entry.agent.name}</p>
                  <div className={`w-full ${podiumH} rounded-t-2xl mt-2 flex items-start justify-center pt-4 ${isFirst ? 'gold-gradient shadow-[0_0_30px_rgba(255,224,130,0.25)]' : 'bg-gradient-to-t from-zinc-800 to-zinc-700'}`}>
                    <div className="text-center">
                      <span className={`text-lg font-bold ${isFirst ? 'text-[#0B0B0F]' : 'text-zinc-300'}`}>#{entry.rank}</span>
                      <p className={`text-[10px] font-semibold mt-1 ${isFirst ? 'text-[#0B0B0F]/70' : 'text-zinc-500'}`}>
                        Rp {formatCompact(entry.total_commission)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Rank 4+ */}
        {!loading && !error && rest.length > 0 && (
          <div className="space-y-1">
            {rest.map(entry => (
              <div
                key={entry.rank}
                className={`flex items-center justify-between p-3 rounded-xl ${entry.agent.id === agent?.id ? 'bg-[#FFE082]/10 border border-[#FFE082]/20' : 'glass-card'}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 text-center text-sm font-bold ${entry.rank <= 10 ? 'text-zinc-300' : 'text-zinc-500'}`}>#{entry.rank}</span>
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-zinc-400">{entry.agent.name[0]}</span>
                  </div>
                  <div>
                    <span className={`text-sm ${entry.agent.id === agent?.id ? 'text-[#FFE082]' : 'text-white'}`}>
                      {entry.agent.id === agent?.id ? (t('leaderboard.you') || 'Anda') : entry.agent.name}
                    </span>
                  </div>
                </div>
                <span className="text-sm font-semibold text-white">Rp {formatCompact(entry.total_commission)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      </PullToRefresh>
    </>
  );
}
