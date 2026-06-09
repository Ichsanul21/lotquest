import { getTierColor, getTierGlowClass } from '../../utils/format';

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export function Avatar({
  src,
  name,
  size = 'md',
  level,
  tier,
  className = '',
}: {
  src: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  level?: number;
  tier?: string;
  className?: string;
}) {
  const sizes = { sm: 'w-8 h-8', md: 'w-12 h-12', lg: 'w-16 h-16', xl: 'w-20 h-20' };
  const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  const glowClass = tier ? getTierGlowClass(tier) : (level ? `shadow-[0_0_0_3px_${getTierColor(level)}]` : '');

  return (
    <div
      className={`${sizes[size]} rounded-xl overflow-hidden flex-shrink-0 ${glowClass} ${className}`}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-gold-700 to-gold-900 flex items-center justify-center text-dark-bg font-bold text-sm">
          {initials}
        </div>
      )}
    </div>
  );
}


