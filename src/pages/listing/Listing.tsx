import { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { TabBar } from '../../components/ui/TabBar';
import { SearchInput } from '../../components/ui/SearchInput';
import { PullToRefresh } from '../../components/ui/PullToRefresh';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { listingApi, prospectApi } from '../../api/services';
import type { Prospect, ListingItem } from '../../types';
import { useNotification } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';
import { Plus, MapPin, Bed, Bath, Maximize, UserPlus, Phone, AlertCircle, ArrowRight, Pencil, Trash2 } from 'lucide-react';

const statusFlow: Prospect['status'][] = ['New', 'Contacted', 'Converted', 'Lost'];

export default function Listing() {
  const { t } = useLanguage();
  const [tab, setTab] = useState('listing');
  const [search, setSearch] = useState('');
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [loadingProspects, setLoadingProspects] = useState(true);
  const [errorListings, setErrorListings] = useState<string | null>(null);
  const [errorProspects, setErrorProspects] = useState<string | null>(null);
  const [showAddListing, setShowAddListing] = useState(false);
  const [showAddProspect, setShowAddProspect] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [editListing, setEditListing] = useState<ListingItem | null>(null);
  const [editProspect, setEditProspect] = useState<Prospect | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'listing' | 'prospect'; id: number } | null>(null);
  const { showToast } = useNotification();
  const mountedRef = useRef(true);

  const tabs = [
    { key: 'listing', label: t('listing.tab.my_listing') || 'My Listing' },
    { key: 'prospect', label: t('listing.tab.prospect') || 'Prospek' },
  ];

  const statusOptions = ['All', 'Active', 'Sold', 'Expired'];
  const sortedListings = [...listings]
    .filter(l => statusFilter === 'All' || l.status === statusFilter)
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      if (sortBy === 'oldest') return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      if (sortBy === 'cheapest') return Number(a.price || 0) - Number(b.price || 0);
      if (sortBy === 'expensive') return Number(b.price || 0) - Number(a.price || 0);
      return 0;
    });

  const fetchListings = useCallback(async () => {
    setLoadingListings(true);
    setErrorListings(null);
    try {
      const res = await listingApi.list({ search: search || undefined });
      if (!mountedRef.current) return;
      setListings(res.data);
    } catch (e) {
      if (!mountedRef.current) return;
      setErrorListings(t('listing.error.load_listings') || 'Gagal memuat listing');
    } finally {
      if (mountedRef.current) setLoadingListings(false);
    }
  }, [search, t]);

  const fetchProspects = useCallback(async () => {
    setLoadingProspects(true);
    setErrorProspects(null);
    try {
      const res = await prospectApi.list(search || undefined);
      if (!mountedRef.current) return;
      setProspects(res.data);
    } catch (e) {
      if (!mountedRef.current) return;
      setErrorProspects(t('listing.error.load_prospects') || 'Gagal memuat prospek');
    } finally {
      if (mountedRef.current) setLoadingProspects(false);
    }
  }, [search, t]);

  const loadData = useCallback(async () => {
    await Promise.all([fetchListings(), fetchProspects()]);
  }, [fetchListings, fetchProspects]);

  useEffect(() => {
    mountedRef.current = true;
    fetchListings();
    fetchProspects();
    return () => { mountedRef.current = false; };
  }, [fetchListings, fetchProspects]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'listing') {
        await listingApi.delete(deleteTarget.id);
        showToast('success', t('listing.toast.deleted_listing') || 'Listing berhasil dihapus');
        fetchListings();
      } else {
        await prospectApi.delete(deleteTarget.id);
        showToast('success', t('listing.toast.deleted_prospect') || 'Prospek berhasil dihapus');
        fetchProspects();
      }
    } catch {
      showToast('error', t('listing.toast.error_delete') || 'Gagal menghapus');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleStatusChange = async (id: number, current: Prospect['status']) => {
    const idx = statusFlow.indexOf(current);
    if (idx >= statusFlow.length - 1) return;
    const next = statusFlow[idx + 1];
    try {
      await prospectApi.updateStatus(id, next);
      showToast('success', t('listing.status_changed', { status: next }) || `Status diubah ke ${next}`);
      fetchProspects();
    } catch (e) {
      showToast('error', t('listing.error.update_status') || 'Gagal mengubah status');
    }
  };

  return (
    <>
      <Header title={t('listing.title') || 'Listing'} showSearch />
      <PullToRefresh onRefresh={loadData}>
      <div className="px-4 pt-4 pb-6 space-y-4">
        <TabBar tabs={tabs} activeTab={tab} onTabChange={setTab} />

        <SearchInput
          placeholder={tab === 'listing' ? (t('listing.search_listing') || 'Cari listing...') : (t('listing.search_prospect') || 'Cari prospek...')}
          value={search}
          onChange={setSearch}
        />

        {tab === 'listing' ? (
          <>
            <Button className="w-full" size="lg" onClick={() => setShowAddListing(true)}>
              <Plus className="w-4 h-4" /> {t('listing.add_listing') || 'Tambah Listing'}
            </Button>

            {loadingListings && (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Card key={i}>
                    <div className="flex gap-3">
                      <Skeleton className="w-20 h-20 rounded-xl shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {!loadingListings && errorListings && (
              <Card className="flex items-center gap-3 p-4">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <p className="text-sm text-zinc-400 flex-1">{errorListings}</p>
                <button onClick={fetchListings} className="text-xs text-[#FFE082] shrink-0">{t('common.reload') || 'Muat ulang'}</button>
              </Card>
            )}

            {!loadingListings && !errorListings && (
              <div className="flex gap-2">
                <div className="flex gap-1 overflow-x-auto scrollbar-hide">
                  {statusOptions.map(s => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${statusFilter === s ? 'gold-gradient text-[#0B0B0F]' : 'bg-white/10 text-zinc-400'}`}
                    >
                      {s === 'All' ? (t('listing.filter.all') || 'All') : s === 'Active' ? (t('listing.filter.active') || 'Active') : s === 'Sold' ? (t('listing.filter.sold') || 'Sold') : (t('listing.filter.expired') || 'Expired')}
                    </button>
                  ))}
                </div>
                <select className="input-field text-xs w-auto" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  <option value="newest">{t('listing.sort.newest') || 'Terbaru'}</option>
                  <option value="oldest">{t('listing.sort.oldest') || 'Terlama'}</option>
                  <option value="cheapest">{t('listing.sort.cheapest') || 'Termurah'}</option>
                  <option value="expensive">{t('listing.sort.expensive') || 'Termahal'}</option>
                </select>
              </div>
            )}

            {!loadingListings && !errorListings && listings.length === 0 && (
              <EmptyState icon={MapPin} title={t('listing.empty.title') || 'Belum ada listing'} description={t('listing.empty.description') || 'Listing properti akan muncul di sini'} actionLabel={t('listing.empty.action') || 'Tambah Listing'} onAction={() => setShowAddListing(true)} />
            )}
            {!loadingListings && !errorListings && listings.length > 0 && sortedListings.length === 0 && (
              <EmptyState icon={MapPin} title={t('listing.empty.filtered_title') || 'Tidak ada listing'} description={t('listing.empty.filtered_description', { filter: statusFilter === 'All' ? (t('listing.filter.all') || 'All') : statusFilter === 'Active' ? (t('listing.filter.active') || 'Active') : statusFilter === 'Sold' ? (t('listing.filter.sold') || 'Sold') : (t('listing.filter.expired') || 'Expired') }) || `Tidak ada listing dengan status "${statusFilter}"`} />
            )}

            {!loadingListings && !errorListings && sortedListings.map(l => (
              <Card key={l.id}>
                <div className="flex gap-3">
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-zinc-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h3 className="text-sm font-semibold text-white truncate">{l.title || `${l.owner_name} - ${l.address}`}</h3>
                      <Badge variant={l.status || 'Active'} label={l.status === 'Active' ? (t('listing.filter.active') || 'Active') : l.status === 'Sold' ? (t('listing.filter.sold') || 'Sold') : (t('listing.filter.expired') || 'Expired')} />
                    </div>
                    <p className="text-sm font-bold text-[#FFE082] mt-1">{l.price || '-'}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-zinc-500">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{l.location || l.address || '-'}</span>
                      {l.beds > 0 && <span className="flex items-center gap-1"><Bed className="w-3 h-3" />{l.beds}</span>}
                      {l.baths > 0 && <span className="flex items-center gap-1"><Bath className="w-3 h-3" />{l.baths}</span>}
                      <span className="flex items-center gap-1"><Maximize className="w-3 h-3" />{l.size || '-'}</span>
                    </div>
                    {(l.land_size || l.building_size || l.floor) && (
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-zinc-500">
                        {l.land_size && <span>{t('listing.lt') || 'LT'} {l.land_size}</span>}
                        {l.building_size && <span>{t('listing.lb') || 'LB'} {l.building_size}</span>}
                        {l.floor && <span>{t('listing.floor_label') || 'Lantai'} {l.floor}</span>}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-3 pt-3 border-t border-white/5">
                  <button
                    className="flex items-center gap-1.5 text-[10px] text-zinc-400 hover:text-[#FFE082] px-2 py-1 rounded-lg hover:bg-white/5"
                    onClick={() => setEditListing(l)}
                  >
                    <Pencil className="w-3 h-3" /> {t('listing.action.edit') || 'Edit'}
                  </button>
                  <button
                    className="flex items-center gap-1.5 text-[10px] text-red-400 hover:text-red-300 px-2 py-1 rounded-lg hover:bg-white/5"
                    onClick={() => setDeleteTarget({ type: 'listing', id: l.id })}
                  >
                    <Trash2 className="w-3 h-3" /> {t('listing.action.delete') || 'Hapus'}
                  </button>
                </div>
              </Card>
            ))}
          </>
        ) : (
          <>
            <Button className="w-full" size="lg" onClick={() => setShowAddProspect(true)}>
              <UserPlus className="w-4 h-4" /> {t('listing.add_prospect') || 'Tambah Prospek'}
            </Button>

            {loadingProspects && (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Card key={i}>
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {!loadingProspects && errorProspects && (
              <Card className="flex items-center gap-3 p-4">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <p className="text-sm text-zinc-400 flex-1">{errorProspects}</p>
                <button onClick={fetchProspects} className="text-xs text-[#FFE082] shrink-0">{t('common.reload') || 'Muat ulang'}</button>
              </Card>
            )}

              {!loadingProspects && !errorProspects && prospects.length === 0 && (
                <EmptyState icon={UserPlus} title={t('listing.prospect_empty.title') || 'Belum ada prospek'} description={t('listing.prospect_empty.description') || 'Calon pembeli akan muncul di sini'} actionLabel={t('listing.prospect_empty.action') || 'Tambah Prospek'} onAction={() => setShowAddProspect(true)} />
              )}

            {!loadingProspects && !errorProspects && prospects.map(p => (
              <Card key={p.id}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-[#0B0B0F]">{p.name[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-white">{p.name}</h3>
                      <Badge variant={p.status} label={p.status === 'New' ? (t('listing.status.new') || 'New') : p.status === 'Contacted' ? (t('listing.status.contacted') || 'Contacted') : p.status === 'Converted' ? (t('listing.status.converted') || 'Converted') : (t('listing.status.lost') || 'Lost')} />
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-zinc-500">
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{p.phone}</span>
                      <span>{p.source}</span>
                    </div>
                    {p.notes && <p className="text-[10px] text-zinc-500 mt-1">{p.notes}</p>}
                  </div>
                  <div className="flex flex-col gap-1">
                    {p.status !== 'Lost' && p.status !== 'Converted' && (
                      <Button size="sm" variant="ghost" onClick={() => handleStatusChange(p.id, p.status)}>
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-3 pt-3 border-t border-white/5">
                  <button
                    className="flex items-center gap-1.5 text-[10px] text-zinc-400 hover:text-[#FFE082] px-2 py-1 rounded-lg hover:bg-white/5"
                    onClick={() => setEditProspect(p)}
                  >
                    <Pencil className="w-3 h-3" /> {t('listing.action.edit') || 'Edit'}
                  </button>
                  <button
                    className="flex items-center gap-1.5 text-[10px] text-red-400 hover:text-red-300 px-2 py-1 rounded-lg hover:bg-white/5"
                    onClick={() => setDeleteTarget({ type: 'prospect', id: p.id })}
                  >
                    <Trash2 className="w-3 h-3" /> {t('listing.action.delete') || 'Hapus'}
                  </button>
                </div>
              </Card>
            ))}
          </>
        )}
      </div>
      </PullToRefresh>

      {/* Add/Edit Listing Modal */}
      {(showAddListing || editListing) && (
        <AddListingModal
          initial={editListing}
          onClose={() => { setShowAddListing(false); setEditListing(null); }}
          onSuccess={() => { setShowAddListing(false); setEditListing(null); fetchListings(); }}
        />
      )}

      {/* Add/Edit Prospect Modal */}
      {(showAddProspect || editProspect) && (
        <AddProspectModal
          initial={editProspect}
          onClose={() => { setShowAddProspect(false); setEditProspect(null); }}
          onSuccess={() => { setShowAddProspect(false); setEditProspect(null); fetchProspects(); }}
        />
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <ConfirmDialog
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          title={`${t('listing.delete.title') || 'Hapus'} ${deleteTarget.type === 'listing' ? (t('listing.title') || 'Listing') : (t('listing.tab.prospect') || 'Prospek')}`}
          description={t('listing.delete.description') || 'Yakin ingin menghapus? Tindakan ini tidak bisa dibatalkan.'}
          confirmLabel={t('listing.delete.confirm') || 'Hapus'}
          variant="danger"
          onConfirm={handleDeleteConfirm}
        />
      )}
    </>
  );
}

function AddListingModal({ initial, onClose, onSuccess }: { initial?: ListingItem | null; onClose: () => void; onSuccess: () => void }) {
  const { t } = useLanguage();
  const [ownerName, setOwnerName] = useState(initial?.owner_name || '');
  const [phone, setPhone] = useState(initial?.phone || '');
  const [address, setAddress] = useState(initial?.address || '');
  const [price, setPrice] = useState(initial?.price || '');
  const [type, setType] = useState(initial?.type || 'Jual');
  const [category, setCategory] = useState(initial?.category || 'Rumah');
  const [landSize, setLandSize] = useState(initial?.land_size || '');
  const [buildingSize, setBuildingSize] = useState(initial?.building_size || '');
  const [floor, setFloor] = useState(initial?.floor || '');
  const [notes, setNotes] = useState(initial?.notes || '');
  const [saving, setSaving] = useState(false);
  const { showToast } = useNotification();
  const isEdit = !!initial;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerName.trim()) { showToast('error', t('listing.toast.require_owner') || 'Nama pemilik harus diisi'); return; }
    if (!address.trim()) { showToast('error', t('listing.toast.require_address') || 'Alamat harus diisi'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', ownerName);
      fd.append('phone', phone);
      fd.append('address', address);
      fd.append('price', price);
      fd.append('type', type);
      fd.append('category', category);
      if (landSize) fd.append('land_size', landSize);
      if (buildingSize) fd.append('building_size', buildingSize);
      if (floor) fd.append('floor', floor);
      if (notes) fd.append('notes', notes);
      if (isEdit) {
        await listingApi.update(initial.id, fd);
        showToast('success', t('listing.toast.updated_listing') || 'Listing berhasil diperbarui');
      } else {
        await listingApi.create(fd);
        showToast('success', t('listing.toast.created_listing') || 'Listing berhasil ditambahkan');
      }
      onSuccess();
    } catch {
      showToast('error', isEdit ? (t('listing.toast.error_update_listing') || 'Gagal memperbarui listing') : (t('listing.toast.error_create_listing') || 'Gagal menambah listing'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={true} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="p-4 space-y-4">
          <h3 className="text-base font-semibold text-white">{isEdit ? (t('listing.modal.edit_listing') || 'Edit Listing') : (t('listing.modal.add_listing') || 'Tambah Listing')}</h3>
          <Input label={t('listing.modal.field.owner_name') || 'Nama Pemilik'} placeholder={t('listing.modal.field.owner_name') || 'Nama pemilik properti'} value={ownerName} onChange={e => setOwnerName(e.target.value)} />
          <Input label={t('listing.modal.field.phone') || 'No HP'} placeholder="0812-xxxx-xxxx" value={phone} onChange={e => setPhone(e.target.value)} type="tel" />
          <Input label={t('listing.modal.field.address') || 'Alamat'} placeholder={t('listing.modal.field.address') || 'Alamat lengkap properti'} value={address} onChange={e => setAddress(e.target.value)} />
          <Input label={t('listing.modal.field.price') || 'Harga'} placeholder="Rp ..." value={price} onChange={e => setPrice(e.target.value)} type="number" />
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-zinc-400 mb-1 block">{t('listing.modal.field.type') || 'Jenis'}</label>
              <select className="input-field w-full" value={type} onChange={e => setType(e.target.value)}>
                <option value="Jual">{t('listing.modal.type.sell') || 'Jual'}</option>
                <option value="Sewa">{t('listing.modal.type.rent') || 'Sewa'}</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs text-zinc-400 mb-1 block">{t('listing.modal.field.category') || 'Tipe'}</label>
              <select className="input-field w-full" value={category} onChange={e => setCategory(e.target.value)}>
                <option value="Rumah">{t('listing.modal.category.house') || 'Rumah'}</option>
                <option value="Apartemen">{t('listing.modal.category.apartment') || 'Apartemen'}</option>
                <option value="Ruko">{t('listing.modal.category.shop') || 'Ruko'}</option>
                <option value="Tanah">{t('listing.modal.category.land') || 'Tanah'}</option>
                <option value="Komersial">{t('listing.modal.category.commercial') || 'Komersial'}</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label={t('listing.modal.field.land_size') || 'LT (Luas Tanah)'} placeholder="m²" value={landSize} onChange={e => setLandSize(e.target.value)} />
            <Input label={t('listing.modal.field.building_size') || 'LB (Luas Bangunan)'} placeholder="m²" value={buildingSize} onChange={e => setBuildingSize(e.target.value)} />
          </div>
          <Input label={t('listing.modal.field.floor') || 'Lantai'} placeholder={t('listing.modal.field.floor') || 'Contoh: 2'} value={floor} onChange={e => setFloor(e.target.value)} />
          <Input label={t('listing.modal.field.notes') || 'Keterangan'} placeholder={t('listing.modal.field.notes') || 'Catatan tambahan'} value={notes} onChange={e => setNotes(e.target.value)} />
          <Button className="w-full" loading={saving} type="submit">{isEdit ? (t('listing.modal.save_changes') || 'Simpan Perubahan') : (t('listing.modal.save_listing') || 'Simpan Listing')}</Button>
        </div>
      </form>
    </Modal>
  );
}

function AddProspectModal({ initial, onClose, onSuccess }: { initial?: Prospect | null; onClose: () => void; onSuccess: () => void }) {
  const { t } = useLanguage();
  const [name, setName] = useState(initial?.name || '');
  const [phone, setPhone] = useState(initial?.phone || '');
  const [notes, setNotes] = useState(initial?.notes || '');
  const [source, setSource] = useState(initial?.source || '');
  const [saving, setSaving] = useState(false);
  const { showToast } = useNotification();
  const isEdit = !!initial;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { showToast('error', t('listing.toast.require_name') || 'Nama harus diisi'); return; }
    if (!phone.trim()) { showToast('error', t('listing.toast.require_phone') || 'No HP harus diisi'); return; }
    setSaving(true);
    try {
      if (isEdit) {
        await prospectApi.update(initial.id, { name, phone, source: source || 'Manual', notes });
        showToast('success', t('listing.toast.updated_prospect') || 'Prospek berhasil diperbarui');
      } else {
        await prospectApi.create({ name, phone, status: 'New', source: source || 'Manual', notes });
        showToast('success', t('listing.toast.created_prospect') || 'Prospek berhasil ditambahkan');
      }
      onSuccess();
    } catch {
      showToast('error', isEdit ? (t('listing.toast.error_update_prospect') || 'Gagal memperbarui prospek') : (t('listing.toast.error_create_prospect') || 'Gagal menambah prospek'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={true} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="p-4 space-y-4">
          <h3 className="text-base font-semibold text-white">{isEdit ? (t('listing.modal.edit_prospect') || 'Edit Prospek') : (t('listing.modal.add_prospect') || 'Tambah Prospek')}</h3>
          <Input label={t('listing.prospect_field.name') || 'Nama'} placeholder={t('listing.prospect_field.name') || 'Nama calon pembeli'} value={name} onChange={e => setName(e.target.value)} />
          <Input label={t('listing.prospect_field.phone') || 'No HP'} placeholder="0812-xxxx-xxxx" value={phone} onChange={e => setPhone(e.target.value)} type="tel" />
          <Input label={t('listing.prospect_field.source') || 'Sumber'} placeholder={t('listing.prospect_field.source') || 'Instagram, FB, referral, dll'} value={source} onChange={e => setSource(e.target.value)} />
          <Input label={t('listing.prospect_field.notes') || 'Keterangan'} placeholder={t('listing.prospect_field.notes') || 'Catatan tentang prospek'} value={notes} onChange={e => setNotes(e.target.value)} />
          <Button className="w-full" loading={saving} type="submit">{isEdit ? (t('listing.modal.save_changes') || 'Simpan Perubahan') : (t('listing.modal.save_prospect') || 'Simpan Prospek')}</Button>
        </div>
      </form>
    </Modal>
  );
}
