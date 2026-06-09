import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { SearchInput } from '../../components/ui/SearchInput';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { PullToRefresh } from '../../components/ui/PullToRefresh';
import { prospectApi } from '../../api/services';
import { useNotification } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';
import type { Prospect, ProspectActivity } from '../../types';
import { UserPlus, Phone, AlertCircle, ArrowRight, Pencil, Trash2, Users, Clock, CheckCircle, XCircle, MessageCircle, ChevronRight } from 'lucide-react';

const statusColors: Record<string, string> = {
  'New Lead': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  'Follow Up': 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  'Showing': 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  'Akad': 'bg-rarity-epic/15 text-rarity-epic border-rarity-epic/30',
  'Deal': 'bg-gold-700/15 text-gold-700 border-gold-700/30',
  'Lost': 'bg-red-500/15 text-red-400 border-red-500/30',
};

const statusLabels: Record<string, string> = {
  'New Lead': 'New Lead',
  'Follow Up': 'Follow Up',
  'Showing': 'Showing',
  'Akad': 'Akad',
  'Deal': 'Deal',
  'Lost': 'Lost',
};

const pipelineSteps = [
  { key: 'New Lead', icon: Users, desc: 'Lead baru masuk' },
  { key: 'Follow Up', icon: MessageCircle, desc: 'Follow up lanjutan' },
  { key: 'Showing', icon: Clock, desc: 'Jadwal showing' },
  { key: 'Akad', icon: CheckCircle, desc: 'Proses akad' },
  { key: 'Deal', icon: ArrowRight, desc: 'Transaksi sukses' },
];

export default function Prospect() {
  const navigate = useNavigate();
  const { showToast } = useNotification();
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editData, setEditData] = useState<Prospect | null>(null);
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formNextAction, setFormNextAction] = useState('');
  const [formNextDate, setFormNextDate] = useState('');
  const [formNextTime, setFormNextTime] = useState('');
  const [saving, setSaving] = useState(false);
  const [activityLog, setActivityLog] = useState<ProspectActivity[]>([]);
  const mountedRef = useRef(true);

  const filtered = prospects.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.phone.includes(q) || p.notes.toLowerCase().includes(q);
  });

  const fetchProspects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await prospectApi.list(search || undefined);
      if (!mountedRef.current) return;
      setProspects(res.data);
    } catch (e) {
      if (!mountedRef.current) return;
      setError(t('prospect.error.load') || 'Gagal memuat prospek');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [search, t]);

  useEffect(() => {
    mountedRef.current = true;
    fetchProspects();
    return () => { mountedRef.current = false; };
  }, [fetchProspects]);

  const handleStatusChange = async (id: number, current: string) => {
    const flow = ['New Lead', 'Follow Up', 'Showing', 'Akad', 'Deal', 'Lost'];
    const idx = flow.indexOf(current);
    if (idx >= flow.length - 1) return;
    const next = flow[idx + 1];
    try {
      await prospectApi.updateStatus(id, next as Prospect['status']);
      showToast('success', t('prospect.status_changed', { status: next }) || `Status diubah ke ${next}`);
      fetchProspects();
    } catch {
      showToast('error', t('prospect.error.update_status') || 'Gagal mengubah status');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await prospectApi.delete(id);
      showToast('success', t('prospect.toast.deleted') || 'Prospek berhasil dihapus');
      if (selectedProspect?.id === id) setSelectedProspect(null);
      fetchProspects();
    } catch {
      showToast('error', t('prospect.error.delete') || 'Gagal menghapus prospek');
    }
  };

  const handleSelectProspect = (p: Prospect) => {
    setSelectedProspect(p);
    const mockActivities: ProspectActivity[] = [
      { id: 1, prospect_id: p.id, action: 'Lead masuk', from_status: '', to_status: p.status, note: '', created_at: p.created_at },
      { id: 2, prospect_id: p.id, action: 'Update status', from_status: p.status, to_status: p.status, note: 'Follow up terjadwal', created_at: new Date().toISOString() },
    ];
    setActivityLog(mockActivities);
  };

  const handleAddProspect = () => {
    setEditData(null);
    setFormName('');
    setFormPhone('');
    setFormNotes('');
    setFormNextAction('');
    setFormNextDate('');
    setFormNextTime('');
    setShowAddForm(true);
  };

  const handleEditProspect = (p: Prospect) => {
    setEditData(p);
    setFormName(p.name);
    setFormPhone(p.phone);
    setFormNotes(p.notes);
    setFormNextAction(p.next_action || '');
    setFormNextDate(p.next_date || '');
    setFormNextTime(p.next_time || '');
    setShowEditForm(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) { showToast('error', t('prospect.error.require_name') || 'Nama harus diisi'); return; }
    setSaving(true);
    try {
      const data = { name: formName, phone: formPhone, notes: formNotes, next_action: formNextAction, next_date: formNextDate, next_time: formNextTime };
      if (editData) {
        await prospectApi.update(editData.id, data);
        showToast('success', t('prospect.toast.updated') || 'Prospek berhasil diperbarui');
      } else {
        await prospectApi.create({ ...data, status: 'New Lead' as Prospect['status'], source: 'Manual' });
        showToast('success', t('prospect.toast.created') || 'Prospek berhasil ditambahkan');
      }
      setShowAddForm(false);
      setShowEditForm(false);
      fetchProspects();
    } catch {
      showToast('error', t('prospect.error.save') || 'Gagal menyimpan prospek');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Header title={t('prospect.title') || 'Prospek'} showBack />
      <PullToRefresh onRefresh={fetchProspects}>
      <div className="px-4 pt-4 pb-6 space-y-4">
        {/* Status Filter Badges */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
          {(['all', 'New Lead', 'Follow Up', 'Showing', 'Akad', 'Deal', 'Lost'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                statusFilter === s
                  ? s === 'all' ? 'gold-gradient text-dark-bg' : `${statusColors[s]} border`
                  : 'bg-white/10 text-zinc-400'
              }`}
            >
              {s === 'all' ? (t('prospect.all') || 'Semua') : (statusLabels[s] || s)}
              {s !== 'all' && ` (${prospects.filter(p => p.status === s).length})`}
            </button>
          ))}
        </div>

        {/* Search */}
        <SearchInput value={search} onChange={setSearch} placeholder={t('prospect.search') || 'Cari prospek...'} />

        {/* Add Button */}
        <Button className="w-full" size="lg" onClick={handleAddProspect}>
          <UserPlus className="w-4 h-4" /> {t('prospect.add') || 'Tambah Prospek'}
        </Button>

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
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
            <button onClick={fetchProspects} className="text-xs text-gold-700 shrink-0">{t('common.reload') || 'Muat ulang'}</button>
          </Card>
        )}

        {/* Empty */}
        {!loading && !error && prospects.length === 0 && (
          <EmptyState icon={Users} title={t('prospect.empty.title') || 'Belum ada prospek'} description={t('prospect.empty.description') || 'Calon pembeli akan muncul di sini'} actionLabel={t('prospect.add') || 'Tambah Prospek'} onAction={handleAddProspect} />
        )}

        {/* Prospect + Detail Split */}
        {!loading && !error && prospects.length > 0 && (
          <>
            {/* Prospect List */}
            <div className="space-y-2">
              {filtered.map(p => (
                <Card
                  key={p.id}
                  className={`cursor-pointer transition-all ${selectedProspect?.id === p.id ? 'ring-1 ring-gold-700/30' : ''}`}
                  onClick={() => handleSelectProspect(p)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-700 to-gold-900 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-white">{p.name[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white">{p.name}</p>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${statusColors[p.status]}`}>
                          {statusLabels[p.status] || p.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Phone className="w-3 h-3 text-zinc-500" />
                        <span className="text-[10px] text-zinc-400">{p.phone}</span>
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-0.5 truncate">{p.notes}</p>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEditProspect(p); }}
                        className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10"
                      >
                        <Pencil className="w-3.5 h-3.5 text-zinc-400" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                        className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center hover:bg-red-500/20"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Selected Prospect Detail */}
            {selectedProspect && (
              <div className="space-y-3">
                <Card className="p-4 border-gold-700/20">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-white">{selectedProspect.name}</h3>
                    <div className="flex gap-1">
                      {['Follow Up', 'Showing', 'Akad', 'Deal', 'Lost'].map(action => (
                        <button
                          key={action}
                          onClick={() => handleStatusChange(selectedProspect.id, selectedProspect.status)}
                          className={`px-2 py-1 rounded-lg text-[9px] font-medium transition-all ${
                            statusColors[action] || 'bg-white/10 text-zinc-400'
                          }`}
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-zinc-400 mb-3">
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {selectedProspect.phone}</span>
                    <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {selectedProspect.source}</span>
                  </div>
                  <p className="text-xs text-zinc-500 mb-3">{selectedProspect.notes}</p>
                  {activityLog.length > 0 && (
                    <div className="border-t border-white/10 pt-3">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">
                        {t('prospect.activity_log') || 'Activity Log'}
                      </p>
                      <div className="space-y-2">
                        {activityLog.slice(0, 3).map(a => (
                          <div key={a.id} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-gold-700 mt-1.5 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-[10px] text-zinc-400">{a.action}</p>
                              <p className="text-[9px] text-zinc-500">
                                {new Date(a.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>

                {/* Reminder Form */}
                <Card className="p-4">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">
                    {t('prospect.reminder') || 'Atur Reminder'}
                  </p>
                  <div className="flex gap-2">
                    <Input type="date" value={formNextDate} onChange={e => setFormNextDate(e.target.value)} />
                    <Input type="time" value={formNextTime} onChange={e => setFormNextTime(e.target.value)} />
                    <Button size="sm" onClick={() => showToast('success', t('prospect.reminder_set') || 'Reminder tersimpan')}>
                      {t('common.save') || 'Simpan'}
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {/* Pipeline Diagram */}
            <Card className="p-4">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-3">
                {t('prospect.pipeline') || 'Prospect Pipeline'}
              </p>
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide pb-2">
                {pipelineSteps.map((step, i) => {
                  const Icon = step.icon;
                  const isActive = selectedProspect?.status === step.key;
                  const isPast = selectedProspect ? pipelineSteps.findIndex(s => s.key === selectedProspect.status) > i : false;
                  return (
                    <div key={step.key} className="flex items-center gap-1 shrink-0">
                      <div className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all ${
                        isActive ? 'bg-gold-700/15 border border-gold-700/30' : isPast ? 'bg-emerald-500/10' : 'bg-white/5'
                      }`}>
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          isActive ? 'bg-gold-700 text-white' : isPast ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className={`text-[8px] font-medium whitespace-nowrap ${isActive ? 'text-gold-700' : 'text-zinc-500'}`}>
                          {step.key}
                        </span>
                      </div>
                      {i < pipelineSteps.length - 1 && (
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                      )}
                    </div>
                  );
                })}
                {selectedProspect?.status === 'Lost' && (
                  <div className="flex items-center gap-1 shrink-0">
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
                    <div className="flex flex-col items-center gap-1 px-2 py-2 rounded-xl bg-red-500/10 border border-red-500/30">
                      <div className="w-7 h-7 rounded-lg bg-red-500 text-white flex items-center justify-center">
                        <XCircle className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[8px] font-medium text-red-400">Lost</span>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Legend / Guideline */}
            <Card className="p-4">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">
                {t('prospect.legend') || 'Panduan Status'}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { status: 'New Lead', desc: 'Lead baru masuk, belum di follow up' },
                  { status: 'Follow Up', desc: 'Sudah pernah dihubungi, perlu follow up lanjutan' },
                  { status: 'Showing', desc: 'Menjadwalkan kunjungan properti' },
                  { status: 'Akad', desc: 'Proses akad jual-beli berlangsung' },
                  { status: 'Deal', desc: 'Transaksi berhasil disepakati' },
                  { status: 'Lost', desc: 'Tidak jadi / batal' },
                ].map(item => (
                  <div key={item.status} className="flex items-start gap-2 p-2 rounded-lg bg-white/5">
                    <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${statusColors[item.status]?.split(' ')[0] || 'bg-zinc-500'}`} />
                    <div className="min-w-0">
                      <p className="text-[10px] font-medium text-white">{item.status}</p>
                      <p className="text-[8px] text-zinc-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
      </div>
      </PullToRefresh>

      {/* Add/Edit Form Modal */}
      {(showAddForm || showEditForm) && (
        <Modal open={true} onClose={() => { setShowAddForm(false); setShowEditForm(false); }}>
          <form onSubmit={handleSubmitForm}>
            <div className="p-4 space-y-4">
              <h3 className="text-base font-semibold text-white">
                {editData ? (t('prospect.edit') || 'Edit Prospek') : (t('prospect.add') || 'Tambah Prospek')}
              </h3>
              <Input label={t('prospect.field.name') || 'Nama Lengkap'} placeholder="Nama calon pembeli" value={formName} onChange={e => setFormName(e.target.value)} />
              <Input label={t('prospect.field.phone') || 'Nomor HP'} placeholder="0812-xxxx-xxxx" value={formPhone} onChange={e => setFormPhone(e.target.value)} type="tel" />
              <Input label={t('prospect.field.notes') || 'Catatan Kebutuhan'} placeholder="Catatan tentang kebutuhan properti" value={formNotes} onChange={e => setFormNotes(e.target.value)} />
              <Input label={t('prospect.field.next_action') || 'Next Action'} placeholder="Follow up, showing, dll" value={formNextAction} onChange={e => setFormNextAction(e.target.value)} />
              <div className="flex gap-2">
                <Input type="date" label={t('prospect.field.date') || 'Tanggal'} value={formNextDate} onChange={e => setFormNextDate(e.target.value)} />
                <Input type="time" label={t('prospect.field.time') || 'Jam'} value={formNextTime} onChange={e => setFormNextTime(e.target.value)} />
              </div>
              <Button className="w-full" loading={saving} type="submit">
                {editData ? (t('common.save') || 'Simpan') : (t('prospect.save_lead') || 'Simpan Lead')}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}