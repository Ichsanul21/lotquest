import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useNotification();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      setSent(true);
      showToast('success', t('auth.toast.success_forgot'));
    } catch {
      showToast('error', t('auth.toast.error_forgot'));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-white">{t('auth.check_email') || 'Cek Email Anda'}</h2>
        <p className="text-sm text-zinc-400">{t('auth.toast.success_forgot')} {email}</p>
        <Link to="/login" className="text-sm text-[#FFE082] hover:underline mt-4">{t('auth.back_to_login')}</Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-sm text-zinc-400 mb-2">{t('auth.forgot_desc')}</p>
      <Input label={t('auth.email')} type="email" placeholder="agent@lotproperty.com" value={email} onChange={e => setEmail(e.target.value)} required />
      <Button type="submit" loading={loading} className="w-full mt-2">{t('auth.send_link')}</Button>
      <Link to="/login" className="text-sm text-[#FFE082] text-center hover:underline mt-2">{t('auth.back_to_login')}</Link>
    </form>
  );
}
