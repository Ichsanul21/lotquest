import { useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';
import html2canvas from 'html2canvas';
import { Download, Share2, Award } from 'lucide-react';

export default function Poster() {
  const { agent } = useAuth();
  const { showToast } = useNotification();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const posterRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);

  const achievement = searchParams.get('achievement') || '';
  const hoRank = searchParams.get('rank') || '';
  const hoName = searchParams.get('name') || '';
  const featuredBadge = agent?.featured_badges?.[0];

  const handleDownload = async () => {
    if (!posterRef.current) return;
    setSaving(true);
    try {
      const canvas = await html2canvas(posterRef.current, { scale: 2, useCORS: true });
      const link = document.createElement('a');
      link.download = `poster-${agent?.username || 'agent'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showToast('success', t('poster.toast.downloaded') || 'Poster berhasil diunduh');
    } catch {
      showToast('error', t('poster.toast.error_download') || 'Gagal mengunduh poster');
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    if (!posterRef.current) return;
    setSaving(true);
    try {
      const canvas = await html2canvas(posterRef.current, { scale: 2, useCORS: true });
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], 'poster.png', { type: 'image/png' });
        if (navigator.share) {
          await navigator.share({ title: 'LOT Quest Poster', files: [file] });
        } else {
          await navigator.clipboard.writeText(window.location.href);
          showToast('success', t('poster.toast.link_copied') || 'Link disalin!');
        }
      });
    } catch {
      showToast('error', t('poster.toast.error_share') || 'Gagal membagikan poster');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Header title={t('poster.title') || 'Buat Poster'} showBack />
      <div className="px-4 pt-4 pb-6 space-y-4">
        <Card>
          <p className="text-xs text-zinc-400 text-center mb-4">{t('poster.description') || 'Poster akan menampilkan QR code yang mengarah ke profil Anda'}</p>

          <div ref={posterRef} className="w-full aspect-[9/16] rounded-2xl bg-gradient-to-b from-[#FFE082] to-[#0B0B0F] p-6 flex flex-col items-center text-center overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />

            <div className="relative z-10 flex flex-col items-center justify-between h-full">
              <div className="flex flex-col items-center">
                {achievement && (
                  <div className="mb-3 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur text-xs text-white font-medium">
                    {achievement} {hoRank ? `#${hoRank}` : ''}
                  </div>
                )}

                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mb-4">
                  <span className="text-3xl font-bold text-white">{agent?.name?.split(' ').map(s => s[0]).join('').slice(0, 2) || 'AG'}</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">{hoName || agent?.name || 'Agent'}</h2>
                <p className="text-sm text-white/70 mb-1">{t('poster.agent_label') || 'LOT Property Agent'}</p>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs px-2 py-1 rounded-full bg-white/20 text-white">{t('poster.level') || 'Level'} {agent?.level || '-'}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-white/20 text-white">{agent?.tier || '-'}</span>
                </div>

                {featuredBadge && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 mb-4">
                    <Award className="w-4 h-4 text-[#FFE082]" />
                    <span className="text-[10px] text-white">{featuredBadge.name}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center">
                <div className="text-xs font-bold text-white/80 tracking-widest mb-2">LOT PROPERTY</div>

                <div className="w-32 h-32 bg-white rounded-2xl flex items-center justify-center mb-3">
                  <div className="w-28 h-28 bg-white border-2 border-zinc-200 rounded-xl flex items-center justify-center">
                    <div className="grid grid-cols-5 gap-0.5">
                      {Array.from({ length: 25 }).map((_, i) => (
                        <div key={i} className={`w-4 h-4 ${Math.random() > 0.5 ? 'bg-zinc-900' : 'bg-white'} ${i === 12 ? 'bg-[#FFE082]' : ''}`} />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-white/50">{t('poster.scan_hint') || 'Scan untuk lihat profil'}</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" loading={saving} onClick={handleDownload}>
            <Download className="w-4 h-4" /> {t('poster.download') || 'Unduh'}
          </Button>
          <Button variant="ghost" className="flex-1" onClick={handleShare}>
            <Share2 className="w-4 h-4" /> {t('poster.share') || 'Bagikan'}
          </Button>
        </div>
      </div>
    </>
  );
}
