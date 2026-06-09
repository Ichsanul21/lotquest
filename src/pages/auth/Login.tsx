import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await login(email, password, remember);
    navigate('/home');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label={t('auth.email')}
        type="email"
        placeholder="agent@lotproperty.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <Input
        label={t('auth.password')}
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <Link to="/forgot-password" className="text-xs text-gold-700 text-right hover:underline">
        {t('auth.forgot_password')}
      </Link>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={remember}
          onChange={e => setRemember(e.target.checked)}
          className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 accent-gold-700"
        />
        <span className="text-xs text-zinc-400">{t('auth.remember_me') || 'Ingat saya'}</span>
      </label>
      <Button type="submit" loading={loading} className="w-full mt-2">
        {t('auth.login')}
      </Button>

      <div className="flex items-center gap-3 my-1">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-xs text-zinc-500">{t('auth.or') || 'or'}</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        className="flex items-center justify-center gap-3 w-full px-4 py-2.5 rounded-xl border border-white/10 bg-transparent hover:bg-white/5 active:scale-[0.97] transition-all duration-200 text-sm text-zinc-300"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        <span>{t('auth.login_with_google') || 'Login with Google'}</span>
      </button>

      <p className="text-sm text-zinc-400 text-center mt-4">
        {t('auth.no_account')}{' '}
        <Link to="/register" className="text-gold-700 hover:underline">{t('auth.register')}</Link>
      </p>
    </form>
  );
}
