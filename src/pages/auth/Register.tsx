import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    password_confirmation: '',
    cabang: '',
    referral_code: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { showToast } = useNotification();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const updateField = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.password_confirmation) {
      showToast('error', t('auth.error.password_mismatch'));
      return;
    }
    if (form.password.length < 6) {
      showToast('error', t('auth.error.invalid_password'));
      return;
    }
    setLoading(true);
    try {
      await register(form);
      navigate('/onboarding');
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : t('auth.toast.error_register'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input label={t('auth.name')} placeholder="John Doe" value={form.name} onChange={e => updateField('name', e.target.value)} required />
      <Input label={t('auth.username')} placeholder="johndoe" value={form.username} onChange={e => updateField('username', e.target.value)} required />
      <Input label={t('auth.email')} type="email" placeholder="agent@lotproperty.com" value={form.email} onChange={e => updateField('email', e.target.value)} required />
      <Input label={t('profile.phone')} type="tel" placeholder="0812-xxxx-xxxx" value={form.phone || ''} onChange={e => updateField('phone', e.target.value)} />
      <Input label={t('auth.cabang')} placeholder="Jakarta Pusat" value={form.cabang} onChange={e => updateField('cabang', e.target.value)} required />
      <Input label={t('auth.password')} type="password" placeholder="••••••••" value={form.password} onChange={e => updateField('password', e.target.value)} required minLength={6} />
      <Input label={t('auth.confirm_password')} type="password" placeholder="••••••••" value={form.password_confirmation} onChange={e => updateField('password_confirmation', e.target.value)} required minLength={6} />
      <Input label={t('auth.recruit_code')} placeholder="LOT-XXXX" value={form.referral_code} onChange={e => updateField('referral_code', e.target.value)} />
      <Button type="submit" loading={loading} className="w-full mt-2">
        {t('auth.register')}
      </Button>
      <p className="text-sm text-zinc-400 text-center mt-4">
        {t('auth.has_account')}{' '}
        <Link to="/login" className="text-gold-700 hover:underline">{t('auth.login')}</Link>
      </p>
    </form>
  );
}
