import type { Application, ApplicationPriority, ApplicationStatus } from '../types';

const FOLLOW_UP_STATUSES: ReadonlySet<ApplicationStatus> = new Set(['Applied', 'Phone Screen']);
const ACTIVE_STATUSES: ReadonlySet<ApplicationStatus> = new Set([
  'Applied',
  'Phone Screen',
  'Interview',
]);
const TERMINAL_STATUSES: ReadonlySet<ApplicationStatus> = new Set(['Offer', 'Rejected']);

export const PRIORITY_WEIGHT: Record<ApplicationPriority, number> = {
  High: 3,
  Medium: 2,
  Low: 1,
};

const DAY_MS = 1000 * 60 * 60 * 24;

const toDateOnlyTime = (dateIso: string): number => {
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(dateIso)
    ? new Date(`${dateIso}T00:00:00`)
    : new Date(dateIso);

  if (Number.isNaN(parsed.getTime())) return Number.NaN;

  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()).getTime();
};

const todayTime = (): number => {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
};

export interface PipelineStats {
  total: number;
  active: number;
  interviews: number;
  offers: number;
  rejected: number;
  responseRate: number;
  offerRate: number;
  followUpsDue: number;
  nextActionsDue: number;
  highPriority: number;
}

export const getDaysSince = (dateIso: string): number => {
  const parsedTime = toDateOnlyTime(dateIso);
  if (Number.isNaN(parsedTime)) return 0;

  const diffMs = todayTime() - parsedTime;
  return Math.max(0, Math.floor(diffMs / DAY_MS));
};

export const getDaysUntil = (dateIso?: string | null): number | null => {
  if (!dateIso) return null;

  const parsedTime = toDateOnlyTime(dateIso);
  if (Number.isNaN(parsedTime)) return null;

  return Math.ceil((parsedTime - todayTime()) / DAY_MS);
};

export const isNextActionDue = (application: Application): boolean => {
  if (TERMINAL_STATUSES.has(application.status)) return false;

  const daysUntil = getDaysUntil(application.nextActionDate);
  return daysUntil !== null && daysUntil <= 0;
};

export const isFollowUpDue = (
  application: Application,
  thresholdDays = 7
): boolean => {
  if (isNextActionDue(application)) return true;
  if (!FOLLOW_UP_STATUSES.has(application.status)) return false;
  return getDaysSince(application.dateApplied) >= thresholdDays;
};

export const calculatePipelineStats = (applications: Application[]): PipelineStats => {
  const total = applications.length;
  const active = applications.filter((app) => ACTIVE_STATUSES.has(app.status)).length;
  const interviews = applications.filter((app) => app.status === 'Interview').length;
  const offers = applications.filter((app) => app.status === 'Offer').length;
  const rejected = applications.filter((app) => app.status === 'Rejected').length;
  const followUpsDue = applications.filter((app) => isFollowUpDue(app)).length;
  const nextActionsDue = applications.filter((app) => isNextActionDue(app)).length;
  const highPriority = applications.filter((app) => app.priority === 'High').length;
  const responded = applications.filter((app) => app.status !== 'Applied').length;

  return {
    total,
    active,
    interviews,
    offers,
    rejected,
    followUpsDue,
    nextActionsDue,
    highPriority,
    responseRate: total > 0 ? Math.round((responded / total) * 100) : 0,
    offerRate: total > 0 ? Math.round((offers / total) * 100) : 0,
  };
};
