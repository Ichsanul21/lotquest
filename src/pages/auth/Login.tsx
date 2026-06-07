import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useNotification();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true);
    try {
      await login(email, password, remember);
      navigate('/home');
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : t('auth.toast.error_login'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label={t('auth.email')}
        type="email"
        placeholder="agent@lotproperty.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <Input
        label={t('auth.password')}
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        minLength={6}
      />
      <Link to="/forgot-password" className="text-xs text-[#FFE082] text-right hover:underline">
        {t('auth.forgot_password')}
      </Link>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={remember}
          onChange={e => setRemember(e.target.checked)}
          className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 accent-[#FFE082]"
        />
        <span className="text-xs text-zinc-400">{t('auth.remember_me') || 'Ingat saya'}</span>
      </label>
      <Button type="submit" loading={loading} className="w-full mt-2">
        {t('auth.login')}
      </Button>
      <p className="text-sm text-zinc-400 text-center mt-4">
        {t('auth.no_account')}{' '}
        <Link to="/register" className="text-[#FFE082] hover:underline">{t('auth.register')}</Link>
      </p>
    </form>
  );
}
