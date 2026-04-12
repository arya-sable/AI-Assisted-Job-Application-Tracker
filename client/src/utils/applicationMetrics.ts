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

const STATUS_SCORE: Record<ApplicationStatus, number> = {
  Applied: 18,
  'Phone Screen': 34,
  Interview: 58,
  Offer: 92,
  Rejected: 4,
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
  shortlisted: number;
  upcomingEvents: number;
  averageScore: number;
}

export interface UpcomingEvent {
  label: string;
  date: string;
  daysUntil: number;
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

export const getUpcomingEvent = (
  application: Application,
  windowDays = 7
): UpcomingEvent | null => {
  if (application.status === 'Rejected') return null;

  const events = [
    { label: 'Interview', date: application.interviewDate },
    { label: 'Deadline', date: application.deadlineDate },
    { label: application.nextAction || 'Next action', date: application.nextActionDate },
  ];

  const upcomingEvents = events
    .map((event) => {
      const daysUntil = getDaysUntil(event.date);
      return daysUntil === null || !event.date
        ? null
        : { label: event.label, date: event.date, daysUntil };
    })
    .filter((event): event is UpcomingEvent => Boolean(event))
    .filter((event) => event.daysUntil <= windowDays)
    .sort((a, b) => a.daysUntil - b.daysUntil);

  return upcomingEvents[0] ?? null;
};

export const hasUpcomingEvent = (application: Application): boolean =>
  getUpcomingEvent(application) !== null;

export const isFollowUpDue = (
  application: Application,
  thresholdDays = 7
): boolean => {
  if (isNextActionDue(application)) return true;
  if (!FOLLOW_UP_STATUSES.has(application.status)) return false;
  return getDaysSince(application.dateApplied) >= thresholdDays;
};

export const calculateApplicationScore = (application: Application): number => {
  const nextActionDays = getDaysUntil(application.nextActionDate);
  const deadlineDays = getDaysUntil(application.deadlineDate);
  const priorityBonus = (PRIORITY_WEIGHT[application.priority ?? 'Medium'] - 1) * 6;
  const contactBonus = application.contactName || application.contactEmail ? 7 : 0;
  const scheduleBonus = application.interviewDate || application.nextActionDate ? 8 : 0;
  const favoriteBonus = application.isFavorite ? 7 : 0;
  const enrichmentBonus =
    application.resumeSuggestions.length > 0 || application.requiredSkills.length > 0 ? 6 : 0;
  const overduePenalty =
    (nextActionDays !== null && nextActionDays < 0 ? 10 : 0) +
    (deadlineDays !== null && deadlineDays < 0 ? 10 : 0);

  const score =
    STATUS_SCORE[application.status] +
    priorityBonus +
    contactBonus +
    scheduleBonus +
    favoriteBonus +
    enrichmentBonus -
    overduePenalty;

  return Math.max(0, Math.min(100, Math.round(score)));
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
  const shortlisted = applications.filter((app) => app.isFavorite).length;
  const upcomingEvents = applications.filter((app) => hasUpcomingEvent(app)).length;
  const scoreSum = applications.reduce((sum, app) => sum + calculateApplicationScore(app), 0);
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
    shortlisted,
    upcomingEvents,
    averageScore: total > 0 ? Math.round(scoreSum / total) : 0,
    responseRate: total > 0 ? Math.round((responded / total) * 100) : 0,
    offerRate: total > 0 ? Math.round((offers / total) * 100) : 0,
  };
};
