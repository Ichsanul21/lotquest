import { useState } from 'react';
import { Modal } from './Modal';
import { Input } from './Input';
import { Button } from './Button';
import { useNotification } from '../../context/NotificationContext';

interface RecruitFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; email: string; phone: string; referral_code?: string }) => Promise<void>;
}

export function RecruitForm({ open, onClose, onSubmit }: RecruitFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [referral, setReferral] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useNotification();

  const handleSubmit = async () => {
    if (!name.trim()) {
      showToast('error', 'Nama harus diisi');
      return;
    }
    if (!email.trim()) {
      showToast('error', 'Email harus diisi');
      return;
    }
    setLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        referral_code: referral.trim() || undefined,
      });
      showToast('success', 'Rekrutmen berhasil dikirim');
      onClose();
    } catch (e) {
      showToast('error', 'Gagal mengirim rekrutmen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-4 space-y-4">
        <h3 className="text-base font-semibold text-white">Rekrut Agen</h3>
        <Input label="Nama" placeholder="Nama lengkap" value={name} onChange={e => setName(e.target.value)} />
        <Input label="No HP" placeholder="0812-xxxx-xxxx" value={phone} onChange={e => setPhone(e.target.value)} type="tel" />
        <Input label="Email" placeholder="email@example.com" value={email} onChange={e => setEmail(e.target.value)} type="email" />
        <Input label="Kode Referral (opsional)" placeholder="ABCD12" value={referral} onChange={e => setReferral(e.target.value)} />
        <Button className="w-full" loading={loading} onClick={handleSubmit}>Kirim</Button>
      </div>
    </Modal>
  );
}
