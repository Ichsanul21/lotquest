import { useState } from 'react';
import { Modal } from './Modal';
import { Input } from './Input';
import { Button } from './Button';
import { useNotification } from '../../context/NotificationContext';
import { Hand, UserCheck, FileText } from 'lucide-react';

interface HandoverModalProps {
  open: boolean;
  onClose: () => void;
  propertyName?: string;
  onConfirm: (data: { buyerName: string; buyerPhone: string; notes: string }) => Promise<void>;
}

export function HandoverModal({ open, onClose, propertyName, onConfirm }: HandoverModalProps) {
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useNotification();

  const handleSubmit = async () => {
    if (!buyerName.trim()) {
      showToast('error', 'Nama pembeli harus diisi');
      return;
    }
    setLoading(true);
    try {
      await onConfirm({ buyerName: buyerName.trim(), buyerPhone: buyerPhone.trim(), notes: notes.trim() });
      showToast('success', 'Handover berhasil diproses');
      onClose();
    } catch {
      showToast('error', 'Gagal memproses handover');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <Hand className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Handover Properti</h3>
            {propertyName && <p className="text-xs text-zinc-500">{propertyName}</p>}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <p className="text-xs text-amber-400 flex items-start gap-2">
            <FileText className="w-4 h-4 shrink-0 mt-0.5" />
            Pastikan semua dokumen telah lengkap sebelum melakukan handover
          </p>
        </div>

        <Input label="Nama Pembeli" placeholder="Nama lengkap" value={buyerName} onChange={e => setBuyerName(e.target.value)} />
        <Input label="No HP Pembeli" placeholder="0812-xxxx-xxxx" value={buyerPhone} onChange={e => setBuyerPhone(e.target.value)} type="tel" />
        <Input label="Catatan" placeholder="Dokumen yang diserahkan, dll" value={notes} onChange={e => setNotes(e.target.value)} />

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" className="flex-1" onClick={onClose}>Batal</Button>
          <Button className="flex-1" loading={loading} onClick={handleSubmit}>
            <UserCheck className="w-4 h-4" /> Proses Handover
          </Button>
        </div>
      </div>
    </Modal>
  );
}
