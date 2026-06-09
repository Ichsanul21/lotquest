import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Avatar } from '../../components/ui/Skeleton';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { PullToRefresh } from '../../components/ui/PullToRefresh';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNotification } from '../../context/NotificationContext';
import { authApi } from '../../api/services';
import { User, Lock, Globe, ChevronRight, LogOut, Copy, Check, Camera } from 'lucide-react';

export default function Settings() {
  const { agent, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [name, setName] = useState(agent?.name || '');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      showToast('error', t('settings.toast.name_required') || 'Nama tidak boleh kosong');
      return;
    }
    setSavingProfile(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      if (phone) formData.append('phone', phone);
      if (avatarFile) formData.append('avatar', avatarFile);
      await authApi.updateProfile(formData as any);
      showToast('success', t('settings.toast.profile_updated') || 'Profil berhasil diperbarui');
      setShowEditProfile(false);
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (e) {
      showToast('error', t('settings.toast.profile_error') || 'Gagal memperbarui profil');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCopyReferral = () => {
    if (agent?.referral_code) {
      navigator.clipboard.writeText(agent.referral_code);
      setCopied(true);
      showToast('success', t('settings.toast.copy_referral') || 'Kode referral disalin!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      showToast('error', t('settings.toast.password_mismatch') || 'Password baru tidak cocok');
      return;
    }
    if (newPassword.length < 6) {
      showToast('error', t('settings.toast.password_short') || 'Password minimal 6 karakter');
      return;
    }
    setSavingPassword(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      showToast('success', t('settings.toast.password_changed') || 'Password berhasil diubah');
      setShowChangePassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e) {
      showToast('error', t('settings.toast.password_error') || 'Gagal mengubah password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <Header title={t('settings.title') || 'Pengaturan'} showBack />
      <PullToRefresh onRefresh={() => Promise.resolve()}>
      <div className="px-4 pt-4 pb-6 space-y-4">
        {/* Account */}
        <Card>
          <h3 className="text-sm font-semibold text-white mb-4">{t('settings.account') || 'Akun'}</h3>
          <button className="w-full flex items-center justify-between py-2" onClick={() => setShowEditProfile(true)}>
            <div className="flex items-center gap-3"><User className="w-4 h-4 text-zinc-400" /><span className="text-sm text-white">{t('settings.edit_profile') || 'Edit Profil'}</span></div>
            <ChevronRight className="w-4 h-4 text-zinc-500" />
          </button>
          <div className="border-t border-white/10 my-2" />
          <button className="w-full flex items-center justify-between py-2" onClick={() => setShowChangePassword(true)}>
            <div className="flex items-center gap-3"><Lock className="w-4 h-4 text-zinc-400" /><span className="text-sm text-white">{t('settings.change_password') || 'Ubah Password'}</span></div>
            <ChevronRight className="w-4 h-4 text-zinc-500" />
          </button>
        </Card>

        {/* Referral Code */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-400">{t('settings.referral_code') || 'Kode Referral'}</p>
              <p className="text-base font-bold text-white mt-0.5">LOT-{agent?.referral_code || 'XXXX'}</p>
            </div>
            <button
              className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20"
              onClick={handleCopyReferral}
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-zinc-400" />}
            </button>
          </div>
        </Card>

        {/* Language */}
        <Card>
          <h3 className="text-sm font-semibold text-white mb-4">{t('settings.preferences') || 'Preferensi'}</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3"><Globe className="w-4 h-4 text-zinc-400" /><span className="text-sm text-white">{t('settings.language') || 'Bahasa / Language'}</span></div>
            <div className="flex gap-2">
              <button
                onClick={() => setLang('id')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${lang === 'id' ? 'gold-gradient text-dark-bg' : 'bg-white/10 text-zinc-400'}`}
              >
                {t('settings.lang_id') || 'Indonesia'}
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${lang === 'en' ? 'gold-gradient text-dark-bg' : 'bg-white/10 text-zinc-400'}`}
              >
                {t('settings.lang_en') || 'English'}
              </button>
            </div>
          </div>
        </Card>

        {/* About */}
        <Card>
          <h3 className="text-sm font-semibold text-white mb-2">{t('settings.about') || 'Tentang'}</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm"><span className="text-zinc-400">{t('settings.about_app') || 'Aplikasi'}</span><span className="text-white">LOT Quest</span></div>
            <div className="flex justify-between text-sm"><span className="text-zinc-400">{t('settings.about_version') || 'Versi'}</span><span className="text-white">1.0.0</span></div>
            <div className="flex justify-between text-sm"><span className="text-zinc-400">{t('settings.about_developer') || 'Developer'}</span><span className="text-white">LOT Property</span></div>
          </div>
        </Card>

        {/* Logout */}
        <Button variant="danger" className="w-full" onClick={() => setShowLogout(true)}>
          <LogOut className="w-4 h-4" /> {t('settings.logout') || 'Keluar'}
        </Button>
      </div>
      </PullToRefresh>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <Modal open={showEditProfile} onClose={() => setShowEditProfile(false)}>
          <div className="p-4 space-y-4">
            <h3 className="text-base font-semibold text-white">{t('settings.edit_profile_modal.title') || 'Edit Profil'}</h3>
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <Avatar src={avatarPreview || agent?.avatar || null} name={agent?.name || 'Agent'} size="xl" level={agent?.level} tier={agent?.tier} />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gold-200 flex items-center justify-center"
                >
                  <Camera className="w-4 h-4 text-dark-bg" />
                </button>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              <span className="text-[10px] text-zinc-500">{t('settings.edit_profile_modal.camera_hint') || 'Tap kamera untuk ganti foto'}</span>
            </div>
            <Input label={t('settings.edit_profile_modal.field_name') || 'Nama'} value={name} onChange={e => setName(e.target.value)} />
            <Input label={t('settings.edit_profile_modal.field_phone') || 'No HP'} value={phone} onChange={e => setPhone(e.target.value)} type="tel" />
            <Button className="w-full" loading={savingProfile} onClick={handleSaveProfile}>{t('settings.edit_profile_modal.save') || 'Simpan'}</Button>
          </div>
        </Modal>
      )}

      {/* Change Password Modal */}
      {showChangePassword && (
        <Modal open={showChangePassword} onClose={() => setShowChangePassword(false)}>
          <div className="p-4 space-y-4">
            <h3 className="text-base font-semibold text-white">{t('settings.change_password_modal.title') || 'Ubah Password'}</h3>
            <Input label={t('settings.change_password_modal.current') || 'Password Saat Ini'} type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
            <Input label={t('settings.change_password_modal.new') || 'Password Baru'} type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            <Input label={t('settings.change_password_modal.confirm') || 'Konfirmasi Password Baru'} type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            <Button className="w-full" loading={savingPassword} onClick={handleChangePassword}>{t('settings.change_password_modal.save') || 'Simpan'}</Button>
          </div>
        </Modal>
      )}

      {/* Logout Confirm */}
      {showLogout && (
        <ConfirmDialog
          open={showLogout}
          onClose={() => setShowLogout(false)}
          title={t('settings.logout_confirm.title') || 'Keluar'}
          description={t('settings.logout_confirm.description') || 'Yakin ingin keluar?'}
          confirmLabel={t('settings.logout_confirm.confirm') || 'Keluar'}
          variant="danger"
          onConfirm={handleLogout}
        />
      )}
    </>
  );
}
