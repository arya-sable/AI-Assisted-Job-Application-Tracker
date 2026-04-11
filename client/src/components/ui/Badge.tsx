import type { ApplicationStatus } from '../../types';

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  Applied: 'bg-blue-100 text-blue-800',
  'Phone Screen': 'bg-yellow-100 text-yellow-800',
  Interview: 'bg-purple-100 text-purple-800',
  Offer: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
};

interface BadgeProps {
  status: ApplicationStatus;
  className?: string;
}

export default function Badge({ status, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status]} ${className}`}>
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
    ? 'bg-primary/10 text-primary'
    : 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors}`}>
      {skill}
    </span>
  );
}
