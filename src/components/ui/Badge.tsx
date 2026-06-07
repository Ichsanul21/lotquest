import type { BadgeVariant } from '../../types';

interface BadgeProps {
  variant: BadgeVariant;
  label: string;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  Active: 'bg-emerald-500/15 text-emerald-400',
  Cancelled: 'bg-red-500/15 text-red-400',
  Pending: 'bg-yellow-500/15 text-yellow-400',
  Completed: 'bg-blue-500/15 text-blue-400',
  Locked: 'bg-gray-500/15 text-gray-400',
  Converted: 'bg-purple-500/15 text-purple-400',
  New: 'bg-cyan-500/15 text-cyan-400',
  Contacted: 'bg-indigo-500/15 text-indigo-400',
  Lost: 'bg-red-500/15 text-red-400',
  Legendary: 'bg-amber-500/20 text-amber-300',
};

export function Badge({ variant, label, className = '' }: BadgeProps) {
  return (
    <span role="status" className={`status-badge ${variantStyles[variant]} ${className}`}>
      {label}
    </span>
  );
}
