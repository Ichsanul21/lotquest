import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  confirmLabel?: string;
  variant?: 'danger' | 'warning' | 'default';
  loading?: boolean;
}

export function ConfirmDialog({
  open, onClose, onConfirm,
  title = 'Konfirmasi',
  description = 'Apakah Anda yakin?',
  confirmLabel = 'Ya',
  variant = 'default',
  loading = false,
}: ConfirmDialogProps) {
  const variantStyles = {
    danger: { icon: 'bg-red-500/20 text-red-400', button: 'bg-red-600 hover:bg-red-700' },
    warning: { icon: 'bg-amber-500/20 text-amber-400', button: 'bg-amber-600 hover:bg-amber-700' },
    default: { icon: 'bg-[#FFE082]/20 text-[#FFE082]', button: 'gold-gradient text-[#0B0B0F]' },
  };

  const s = variantStyles[variant];

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6 text-center space-y-4">
        <div className={`w-14 h-14 rounded-2xl ${s.icon} flex items-center justify-center mx-auto`}>
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h3 className="text-base font-semibold text-white">{title}</h3>
        <p className="text-sm text-zinc-400">{description}</p>
        <div className="flex gap-3 pt-2">
          <Button variant="ghost" className="flex-1" onClick={onClose}>Batal</Button>
          <Button className={`flex-1 ${variant !== 'default' ? s.button : ''}`} loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
