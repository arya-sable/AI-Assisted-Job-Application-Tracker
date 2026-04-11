import type { ApplicationStatus } from '../../types';

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  Applied: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  'Phone Screen': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  Interview: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  Offer: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  Rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
};

interface BadgeProps {
  status: ApplicationStatus;
  className?: string;
}

export default function Badge({ status, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${STATUS_COLORS[status]} ${className}`}>
      {status}
    </span>
  );
}

interface SkillBadgeProps {
  skill: string;
  variant?: 'required' | 'nice';
}

export function SkillBadge({ skill, variant = 'required' }: SkillBadgeProps) {
  const colors = variant === 'required'
    ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'
    : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400';
  return (
    <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${colors}`}>
      {skill}
    </span>
  );
}
