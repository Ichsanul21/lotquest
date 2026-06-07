import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../../components/ui/Button';
import { Camera, Bell, Sparkles } from 'lucide-react';

export default function Onboarding() {
  const { t } = useLanguage();
  const [step, setStep] = useState(0);
  const [avatar, setAvatar] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const steps = [
    { icon: Camera, title: t('onboarding.step1.title'), desc: t('onboarding.step1.desc') },
    { icon: Bell, title: t('onboarding.step2.title'), desc: t('onboarding.step2.desc') },
    { icon: Sparkles, title: t('onboarding.step3.title'), desc: t('onboarding.step3.desc') },
  ];

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleNext = () => {
    if (step === 0 && !avatar) {
      setStep(1);
      return;
    }
    if (step < steps.length - 1) {
      setStep(s => s + 1);
    } else {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
      navigate('/home');
    }
  };

  const CurrentIcon = steps[step].icon;

  return (
    <div className="min-h-screen bg-[#0B0B0F] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm flex flex-col items-center gap-6 animate-fade-in">
        <div className="w-20 h-20 rounded-2xl gold-gradient flex items-center justify-center shadow-[0_0_30px_rgba(255,224,130,0.2)]">
          <CurrentIcon className="w-10 h-10 text-[#0B0B0F]" />
        </div>

        <div className="flex gap-1.5">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 w-6 rounded-full transition-colors ${i === step ? 'gold-gradient' : 'bg-white/10'}`} />
          ))}
        </div>

        <h2 className="text-xl font-bold text-white text-center">{steps[step].title}</h2>
        <p className="text-sm text-zinc-400 text-center">{steps[step].desc}</p>

        {step === 0 && (
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={() => fileRef.current?.click()}
              className="w-24 h-24 rounded-2xl border-2 border-dashed border-white/20 flex items-center justify-center hover:border-[#FFE082]/50 transition-colors overflow-hidden"
            >
              {avatar ? (
                <img src={avatar} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Camera className="w-8 h-8 text-white/30" />
              )}
            </button>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleAvatarUpload} />
            <p className="text-xs text-zinc-500">{t('onboarding.upload_hint')}</p>
          </div>
        )}

        {step === 1 && (
          <Button variant="secondary" onClick={() => Notification.requestPermission()} className="w-full">
            {t('onboarding.allow_notification')}
          </Button>
        )}

        <div className="flex gap-3 w-full mt-4">
          {step < steps.length - 1 && (
            <Button variant="ghost" onClick={() => navigate('/home')} className="flex-1">
              {t('onboarding.skip')}
            </Button>
          )}
          <Button onClick={handleNext} className="flex-1">
            {step === steps.length - 1 ? t('onboarding.start') : t('onboarding.next')}
          </Button>
        </div>
      </div>
    </div>
  );
}
