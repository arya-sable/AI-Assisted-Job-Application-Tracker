import type { Application, ApplicationStatus } from '../types';

const FOLLOW_UP_STATUSES: ReadonlySet<ApplicationStatus> = new Set(['Applied', 'Phone Screen']);
const ACTIVE_STATUSES: ReadonlySet<ApplicationStatus> = new Set([
  'Applied',
  'Phone Screen',
  'Interview',
]);

export interface PipelineStats {
  total: number;
  active: number;
  interviews: number;
  offers: number;
  rejected: number;
  responseRate: number;
  offerRate: number;
  followUpsDue: number;
}

export const getDaysSince = (dateIso: string): number => {
  const parsed = new Date(dateIso);
  if (Number.isNaN(parsed.getTime())) return 0;

  const diffMs = Date.now() - parsed.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
};

export const isFollowUpDue = (
  application: Application,
  thresholdDays = 7
): boolean => {
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
  const responded = applications.filter((app) => app.status !== 'Applied').length;

  return {
    total,
    active,
    interviews,
    offers,
    rejected,
    followUpsDue,
    responseRate: total > 0 ? Math.round((responded / total) * 100) : 0,
    offerRate: total > 0 ? Math.round((offers / total) * 100) : 0,
  };
};
