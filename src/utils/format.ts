export function formatCurrency(n: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(n);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('id-ID').format(n);
}

export function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(date));
}

export function formatRelativeTime(date: string): string {
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'baru saja';
  if (mins < 60) return `${mins}m lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}j lalu`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}h lalu`;
  return formatDate(date);
}

export function debounce<T extends (...args: unknown[]) => unknown>(fn: T, ms: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export function getTierColor(level: number): string {
  if (level >= 99) return 'rgba(255,224,130,0.7)';
  if (level >= 80) return 'rgba(251,146,60,0.6)';
  if (level >= 60) return 'rgba(251,191,36,0.5)';
  if (level >= 40) return 'rgba(74,222,128,0.4)';
  if (level >= 20) return 'rgba(96,165,250,0.4)';
  return 'rgba(156,163,175,0.4)';
}

export function getTierGlowClass(tier?: string): string {
  switch (tier) {
    case 'LOT Legendary': return 'ring-[3px] ring-[#FFE082] ring-offset-2 ring-offset-[#0B0B0F] shadow-[0_0_20px_rgba(255,224,130,0.4)]';
    case 'Super Elite': return 'ring-[3px] ring-orange-400 ring-offset-2 ring-offset-[#0B0B0F] shadow-[0_0_16px_rgba(251,146,60,0.35)]';
    case 'Elite': return 'ring-[3px] ring-amber-400 ring-offset-2 ring-offset-[#0B0B0F] shadow-[0_0_12px_rgba(251,191,36,0.3)]';
    case 'Senior': return 'ring-[2px] ring-emerald-400 ring-offset-2 ring-offset-[#0B0B0F]';
    case 'Junior': return 'ring-[2px] ring-blue-400 ring-offset-2 ring-offset-[#0B0B0F]';
    default: return '';
  }
}

export function getTierName(level: number): string {
  if (level >= 99) return 'LOT Legendary';
  if (level >= 80) return 'Super Elite';
  if (level >= 60) return 'Elite';
  if (level >= 40) return 'Senior';
  if (level >= 20) return 'Junior';
  return 'Rookie';
}
