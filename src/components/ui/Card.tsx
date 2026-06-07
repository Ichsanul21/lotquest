interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  glow?: boolean;
}

export function Card({ children, className = '', onClick, glow }: CardProps) {
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
      className={`glass-card p-4 ${glow ? 'shadow-[0_0_20px_rgba(229,169,60,0.3),0_0_40px_rgba(229,169,60,0.1)]' : 'shadow-md shadow-black/20'} ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''} transition-all duration-200 ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
