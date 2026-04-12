import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Application, ApplicationPriority } from '../../types';
import { ShadBadge } from '../shadcn/badge';
import { useUpdateApplication } from '../../hooks/useApplications';
import {
  calculateApplicationScore,
  getDaysSince,
  getDaysUntil,
  getUpcomingEvent,
  isFollowUpDue,
  isNextActionDue,
} from '../../utils/applicationMetrics';
import { Sparkles, Clock, Flag, Star, CalendarDays } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  application: Application;
  isDragging?: boolean;
}

const PRIORITY_COLORS: Record<ApplicationPriority, string> = {
  High: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-300',
  Medium: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-300',
  Low: 'border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400',
};

export default function ApplicationCard({ application, isDragging = false }: Props) {
  const navigate = useNavigate();
  const { mutate: updateApplication } = useUpdateApplication();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: application._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const followUpDue = isFollowUpDue(application);
  const nextActionDue = isNextActionDue(application);
  const nextActionDays = getDaysUntil(application.nextActionDate);
  const nextActionLabel = nextActionDays === null
    ? ''
    : nextActionDays < 0
      ? `${Math.abs(nextActionDays)}d late`
      : nextActionDays === 0
        ? 'today'
        : `${nextActionDays}d`;
  const daysInPipeline = getDaysSince(application.dateApplied);
  const dragging = isDragging || isSortableDragging;
  const priority = application.priority ?? 'Medium';
  const score = calculateApplicationScore(application);
  const upcomingEvent = getUpcomingEvent(application);

  const handleFavoriteClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    updateApplication(
      { id: application._id, data: { isFavorite: !application.isFavorite } },
      {
        onSuccess: () => toast.success(application.isFavorite ? 'Removed from shortlist' : 'Added to shortlist'),
        onError: () => toast.error('Could not update shortlist'),
      }
    );
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group rounded-2xl border bg-white p-3 shadow-sm cursor-grab active:cursor-grabbing transition-all card-lift dark:bg-slate-900 dark:border-slate-700/50 animate-card-enter ${
        dragging
          ? 'opacity-40 scale-95 !shadow-none'
          : ''
      }`}
      onClick={() => navigate(`/applications/${application._id}`)}
    >
      {/* Top row: company + follow-up indicator */}
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-xs truncate text-slate-900 dark:text-slate-100" title={application.company}>
            {application.company}
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{application.role}</p>
        </div>
        <button
          type="button"
          onClick={handleFavoriteClick}
          onPointerDown={(event) => event.stopPropagation()}
          className={`shrink-0 rounded-md p-0.5 transition-colors ${
            application.isFavorite
              ? 'text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
              : 'text-slate-300 hover:bg-slate-100 hover:text-yellow-500 dark:text-slate-600 dark:hover:bg-slate-800'
          }`}
          aria-label={application.isFavorite ? 'Remove from shortlist' : 'Add to shortlist'}
          title={application.isFavorite ? 'Remove from shortlist' : 'Add to shortlist'}
        >
          <Star className={`h-3.5 w-3.5 ${application.isFavorite ? 'fill-current' : ''}`} />
        </button>
        {priority === 'High' && (
          <div className="shrink-0">
            <Flag className="h-3.5 w-3.5 text-rose-500" />
          </div>
        )}
        {followUpDue && (
          <div className="shrink-0">
            <Clock className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
          </div>
        )}
      </div>

      {(application.nextAction || application.nextActionDate) && (
        <div className={`mt-2 rounded-lg border px-2 py-1.5 text-[10px] ${
          nextActionDue
            ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/50 dark:bg-amber-900/20 dark:text-amber-300'
            : 'border-slate-100 bg-slate-50 text-slate-500 dark:border-slate-700/60 dark:bg-slate-800/60 dark:text-slate-400'
        }`}>
          <p className="truncate font-semibold">
            {application.nextAction || 'Next action'}
          </p>
          {nextActionLabel && (
            <p className="mt-0.5 font-mono uppercase tracking-widest">
              {nextActionLabel}
            </p>
          )}
        </div>
      )}

      {upcomingEvent && upcomingEvent.label !== (application.nextAction || 'Next action') && (
        <div className="mt-2 flex items-center gap-1.5 rounded-lg border border-teal-100 bg-teal-50 px-2 py-1.5 text-[10px] font-semibold text-teal-700 dark:border-teal-800/40 dark:bg-teal-900/20 dark:text-teal-300">
          <CalendarDays className="h-3 w-3 shrink-0" />
          <span className="truncate">{upcomingEvent.label}</span>
          <span className="ml-auto font-mono uppercase tracking-widest">
            {upcomingEvent.daysUntil < 0
              ? `${Math.abs(upcomingEvent.daysUntil)}d late`
              : upcomingEvent.daysUntil === 0
                ? 'today'
                : `${upcomingEvent.daysUntil}d`}
          </span>
        </div>
      )}

      {/* Bottom row: badge + days */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/50">
        <div className="flex min-w-0 items-center gap-1">
          <ShadBadge variant="outline" className={`rounded-full text-[8px] px-2 uppercase tracking-widest font-bold ${PRIORITY_COLORS[priority]}`}>
            {priority}
          </ShadBadge>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            {score}
          </span>
        </div>
        <span className={`text-xs font-mono font-black ${
          followUpDue ? 'text-amber-500' : 'text-slate-400 dark:text-slate-500'
        }`}>
          {daysInPipeline}d
        </span>
      </div>

      {/* Skills preview */}
      {application.requiredSkills.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {application.requiredSkills.slice(0, 2).map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-semibold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
            >
              {skill}
            </span>
          ))}
          {application.requiredSkills.length > 2 && (
            <span className="text-[9px] text-slate-400 dark:text-slate-500 self-center">
              +{application.requiredSkills.length - 2}
            </span>
          )}
        </div>
      )}

      {/* AI enriched indicator */}
      {application.resumeSuggestions.length > 0 && (
        <div className="flex items-center gap-1 mt-1.5 text-[9px] text-amber-500 font-bold">
          <Sparkles className="h-2.5 w-2.5" />
          AI Enriched
        </div>
      )}
    </div>
  );
}
