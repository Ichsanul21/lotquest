import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { SearchInput } from '../../components/ui/SearchInput';
import { useSearch } from '../../hooks/useSearch';
import { questApi, academyApi, prospectApi, leaderboardApi } from '../../api/services';
import type { Quest, AcademyModule, Prospect, LeaderboardEntry } from '../../types';
import { Search, Target, BookOpen, Users, Trophy, ArrowRight, AlertCircle } from 'lucide-react';

type SearchCategory = 'all' | 'quest' | 'academy' | 'prospect' | 'agent';

export default function SearchPage() {
  const navigate = useNavigate();
  const { query, setQuery, debounced } = useSearch(300);
  const [cat, setCat] = useState<SearchCategory>('all');
  const [results, setResults] = useState<{
    quests: Quest[];
    modules: AcademyModule[];
    prospects: Prospect[];
    agents: LeaderboardEntry[];
  }>({ quests: [], modules: [], prospects: [], agents: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!debounced) {
      setResults({ quests: [], modules: [], prospects: [], agents: [] });
      setSearched(false);
      return;
    }
    setLoading(true);
    setError(null);
    setSearched(true);
    Promise.all([
      questApi.list(),
      academyApi.modules(),
      prospectApi.list(),
      leaderboardApi.list({ type: 'Commission', period: 'All-Time' }),
    ]).then(([quests, modules, prospects, agents]) => {
      const q = debounced.toLowerCase();
      setResults({
        quests: (quests.data as Quest[]).filter(x => x.title?.toLowerCase().includes(q)),
        modules: (modules.data as AcademyModule[]).filter(x => x.title?.toLowerCase().includes(q) || x.description?.toLowerCase().includes(q)),
        prospects: (prospects.data as Prospect[]).filter(x => x.name?.toLowerCase().includes(q)),
        agents: (agents.data as LeaderboardEntry[]).filter(x => x.agent.name?.toLowerCase().includes(q)),
      });
    }).catch(() => setError('Gagal memuat data')).finally(() => setLoading(false));
  }, [debounced]);

  const showQuests = cat === 'all' || cat === 'quest';
  const showAcademy = cat === 'all' || cat === 'academy';
  const showProspects = cat === 'all' || cat === 'prospect';
  const showAgents = cat === 'all' || cat === 'agent';

  const categories: { key: SearchCategory; label: string }[] = [
    { key: 'all', label: 'Semua' },
    { key: 'quest', label: 'Quest' },
    { key: 'academy', label: 'Akademi' },
    { key: 'prospect', label: 'Prospek' },
    { key: 'agent', label: 'Agen' },
  ];

  return (
    <>
      <Header title="Cari" showBack />
      <div className="px-4 pt-4 pb-6 space-y-4">
        {/* Search Input */}
        <SearchInput value={query} onChange={setQuery} placeholder="Cari quest, materi, prospek..." />

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {categories.map(c => (
            <button
              key={c.key}
              onClick={() => setCat(c.key)}
              className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${cat === c.key ? 'gold-gradient text-dark-bg' : 'bg-white/10 text-zinc-400'}`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <Card className="flex items-center gap-3 p-4">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-sm text-zinc-400 flex-1">{error}</p>
          </Card>
        )}

        {/* Empty / Results */}
        {!loading && !error && searched && (
          <>
            {results.quests.length === 0 && results.modules.length === 0 && results.prospects.length === 0 && results.agents.length === 0 ? (
              <EmptyState icon={Search} title="Tidak ditemukan" description={`Tidak ada hasil untuk "${debounced}"`} />
            ) : (
              <div className="space-y-5">
                {showQuests && results.quests.length > 0 && (
                  <Section title="Quest" icon={Target}>
                    {results.quests.map(q => (
                      <button key={q.id} onClick={() => navigate(`/quest/${q.id}`)} className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                        <span className="text-sm text-white">{q.title}</span>
                        <ArrowRight className="w-4 h-4 text-zinc-500" />
                      </button>
                    ))}
                  </Section>
                )}
                {showAcademy && results.modules.length > 0 && (
                  <Section title="Akademi" icon={BookOpen}>
                    {results.modules.map(m => (
                      <button key={m.id} onClick={() => navigate('/academy')} className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                        <div className="text-left">
                          <p className="text-sm text-white">{m.title}</p>
                          <p className="text-[10px] text-zinc-500">{m.category}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-zinc-500 shrink-0" />
                      </button>
                    ))}
                  </Section>
                )}
                {showProspects && results.prospects.length > 0 && (
                  <Section title="Prospek" icon={Users}>
                    {results.prospects.map(p => (
                      <button key={p.id} onClick={() => navigate('/listing')} className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                        <div className="text-left">
                          <p className="text-sm text-white">{p.name}</p>
                          <p className="text-[10px] text-zinc-500">{p.phone}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-zinc-500 shrink-0" />
                      </button>
                    ))}
                  </Section>
                )}
                {showAgents && results.agents.length > 0 && (
                  <Section title="Agen" icon={Trophy}>
                    {results.agents.map(a => (
                      <button key={a.agent.id} onClick={() => navigate(`/agent/${a.agent.id}`)} className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                            <span className="text-xs font-bold text-zinc-400">{a.agent.name[0]}</span>
                          </div>
                          <span className="text-sm text-white">{a.agent.name}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-zinc-500 shrink-0" />
                      </button>
                    ))}
                  </Section>
                )}
              </div>
            )}
          </>
        )}

        {/* Initial state */}
        {!loading && !searched && (
          <div className="flex flex-col items-center gap-3 pt-12 text-center">
            <Search className="w-12 h-12 text-zinc-600" />
            <p className="text-sm text-zinc-500">Ketik minimal 2 karakter untuk mencari</p>
          </div>
        )}
      </div>
    </>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-gold-700" />
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}
